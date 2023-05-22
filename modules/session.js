const db = require('../models')
const rooms = require('./rooms')
const utils = require('../utils')
class Session {

    socket;
    authorized;
    nickname;
    loginkey;
    public_key;
    rooms = {};
    user_id;
    isAlive = true;
    _request_id = 0;
    _ttl = 0;
    _onclose = [];
    _register_cb;
    _hTimerTtl;
    _hTimerPing;
    _isAdmin = false;
    _sessionRegister = null;
    session_started = 0;

    constructor(socket, register_cb) {
        this.socket = socket;
        this.rooms = [];
        console.log(register_cb);
        this._register_cb = register_cb;

        console.log('new session initialized.');

        this.checkAliveThread();

        this._hTimerPing = setInterval( ()=> {
            this.ping()
        }, 5000)

        this.session_started = Date.now();

        socket.onclose = () => {
            console.log('socket closed. session destroyed');
            this.isAlive = false;
            clearInterval(this._hTimerTtl);
            clearInterval(this._hTimerPing)
            this._onclose.forEach((cb) => {
                cb(this)
            })
            for(let uuid in this.rooms )
            {
                let room = this.rooms[uuid];
                room.leave(this);
            }
        }
    }



    updateTimer(){
        this._ttl++;

        if( this._ttl > 30 )
        {
            console.log('TTL timeout. Session = ',this.nickname);
            this.isAlive = false;
            this._onclose.forEach((cb) => {
                cb(this)
            })
            this.socket.close();
        }
    }

    checkAliveThread()
    {
        const thisClass = this;
        this._hTimerTtl = setInterval( () => {
            if ( this.isAlive )
                thisClass.updateTimer.call(thisClass);
        },1000);

    }


    onclose_subscribe(cb){
        this._onclose.push(cb);
    }


    ping() {
        this.sendCommand('ping',{})
    }

    sendCommand(method, params)
    {
        this._request_id++;
        this.socket.send( JSON.stringify({ method, request_id: this._request_id, params }) );
    }

    call_method(method, request_id, params)
    {
        console.log("trying call method ",method+"Action", params);

        const cb = this[method+"Action"];
        if(typeof cb  === 'function') {
            cb.call(this,params).then((res) => {
                const resJson = JSON.stringify({
                        method: method,
                        request_id: request_id,
                        result: 1,
                        data: res
                });
                console.log('res  =',resJson);
                this.socket.send(resJson);
            })
            .catch((error) => {
                    const resJson = JSON.stringify({
                        method: method,
                        request_id: request_id,
                        result: -1,
                        data: error
                    });
                    console.log('res  =',resJson);
                    this.socket.send(resJson);
            })
        }
        else
            this.socket.send( JSON.stringify({
                result: -1,
                method: method,
                request_id: request_id,
                data: 'Unknown method'
            }));
    }


    pongAction( params )
    {
        return new Promise((resolve,reject)=>{
            this.isAlive = true;
            if(this.authorized)
                this._ttl = 0;
            resolve(true);
        })
    }


    sendMessageAction(params)
    {
        return new Promise((resolve,reject)=>{
            const channel_id = params.channel_id;
            if(!this.rooms.hasOwnProperty('c_' + channel_id))
            {
                reject('You did not joined to this channel');
                return;
            }
            console.log(params);

            this.rooms['c_' + channel_id].message(
                { id: Date.now(),
                         label: null, name: this.nickname,
                         stamp: Date.now(),
                         text: [ params.text ]
                 });

        })
    }


    authorizeAction( params )
    {
        return new Promise(async (resolve,reject) => {
            this.nickname = params.nickname ?? null;
            this.loginkey = params.loginKey ?? null;
            this.public_key = params.publicKey ?? null;


            try {
                let user = await db.Users.findOne({where: { nickname: this.nickname, login_key: this.loginkey}})
                if (!user) {
                    reject('Unknown user');
                    return;
                }
                if(user.disabled === 1)
                {
                    reject('Account disabled.');
                    return;
                }

                this.authorized = true
                this.user_id = user.id;

                this._register_cb(this)
                    .then((sess_register)=>{
                        resolve( { role: user.admin })

                        this._sessionRegister = sess_register;

                        setTimeout(()=>{
                            rooms.rejoin_me(this);
                        },500)
                    })
                    .catch(()=>{ reject('You are already logged in.')})


            } catch(err) {
                reject( 'Error: ' + err.toString());
            }
        });
    }

    async isAdmin(){
        if ( !this.authorized)
            return 0;
        let user = await db.Users.findOne({where: { id: this.user_id }})
        return user.admin;
    }

    createRoomAction(params)
    {
        return new Promise(async(resolve,reject) => {
            console.log(this);
            if(!this.authorized)
                reject('This command available only for authorized users.')
            try {
                let room = await db.ChatRoom.create({
                    title: params.title,
                    admin: this.user_id
                })

                await db.RoomUsers.create( {
                    user_id: this.user_id,
                    room_id: room.id,
                    role: 2
                });

                const room_el = rooms.create( this, params.title, room.uuid, room.id )
                this.rooms['c_' + room.uuid ] = room_el;

                resolve( { uuid: room.uuid, title: params.title, public_key: room_el.publicKey, private_key: room_el.privateKey } );
            }
            catch (err)
            {
                reject( 'Error: ' + err.toString());
            }
        });
    }

    createInviteLinkAction( params )
    {
        return new Promise(async (resolve, reject) => {
            const channel_id = params.channel_id;
            if (!this.rooms.hasOwnProperty('c_' + channel_id)) {
                reject('You did not joined to this channel');
                return;
            }
            console.log(params);
            if ( this.rooms['c_' + channel_id].createInviteLink(this) )
            {
                const room = await db.ChatRoom.findOne({where: { uuid: channel_id } })
                const linkText = utils.makeid();
                const inviteLink = db.InviteLinks.create({ room_id: room.id, link: linkText, disabled: 0 })
                resolve( { url: linkText } );
            }
            else
                reject('Not enough access.')
        });
    }

    sendStartChannel(uuid,title,public_key,private_key) {
        this.sendCommand('start_channel', {uuid,title,public_key,private_key});
    }

    addRoom(room) {
        this.rooms['c_' + room.uuid] = room;
    }

    joinByLinkAction(params)
    {
        return new Promise(async (resolve, reject) => {
            if(params.link === undefined) return;
            const link = await db.InviteLinks.findOne({ where: { link: params.link }, include: ['room'] });
            console.log(link);

            if(!link)
            {
                reject('Invalid link');
                return;
            }

            if(link.disabled === 0 && ( link.user_id === this.user_id || link.user_id === -1))
            {

                link.user_id = this.user_id;
                await link.save();

               let res = rooms.join_me(this,link.room.uuid,params.link);
               if(res !== null) {
                   resolve({ uuid: link.room.uuid });
                   this.sendStartChannel(link.room.uuid, link.room.title, res.publicKey, res.privateKey);

                   let ruser = await db.RoomUsers.findOrCreate({where:{
                           user_id: this.user_id,
                           room_id: link.room.id,
                           role: link.role,
                           linkId: params.link
                       }})


                   this.rooms['c_' + res.uuid ] = res;
               }
                else
                    reject('Sorry, link inactive. You cannot use it.');
            }
            else
            {
                reject('Link was disabled')
            }
        });
    }


    setModeratorAction( params ) {
        return new Promise(async (resolve, reject) => {
            const channel_id = params.channel_id;
            if (!this.rooms.hasOwnProperty('c_' + channel_id)) {
                reject('You did not joined to this channel');
                return;
            }
            console.log(params);
            if ( this.rooms['c_' + channel_id].setModerator(this, params.nickname) ) {

                let room = this.rooms['c_' + channel_id];
                let user = await db.Users.findOne({where: { nickname: params.nickname }});
                if( !user )
                    reject('Unknown user');

                let ruser = await db.RoomUsers.findOne({ where:{ user_id: user.id, room_id: room.id }});
                ruser.role = 1;
                await ruser.save();

                resolve(true);
                return;
            }
            else
            {
                reject('You cannot do that!')

            }
        }) ;
    }

    setUserAction( params ) {
        return new Promise(async (resolve, reject) => {
            const channel_id = params.channel_id;
            if (!this.rooms.hasOwnProperty('c_' + channel_id)) {
                reject('You did not joined to this channel');
                return;
            }
            console.log(params);
            if ( this.rooms['c_' + channel_id].setUser(this, params.nickname) ) {

                let room = this.rooms['c_' + channel_id];
                let user = await db.Users.findOne({where: { nickname: params.nickname }});
                if( !user )
                    reject('Unknown user');

                let ruser = await db.RoomUsers.findOne({ where:{ user_id: user.id, room_id: room.id }});
                ruser.role = 0;
                await ruser.save();

                resolve(true);
                return;
            }
            else
            {
                reject('You cannot do that!')

            }
        }) ;
    }


    kickFromChannelAction( params ) {
        return new Promise(async (resolve, reject) => {
            const channel_id = params.uuid;
            const nickname = params.nickname;

            let room = rooms.kickUser(channel_id, this, nickname);
            if( room ) {

                let user = await db.Users.findOne({where: {nickname}})

                if (!user)
                    reject('Unknown user');

                console.log(room);

                await db.InviteLinks.destroy({where: {user_id: user.id, room_id: room.room_id}});
                await db.RoomUsers.destroy({where: {user_id: user.id, room_id: room.room_id}});

                resolve(true);
            }
            else
                reject('Unknown room uuid');
        });
    }

    kickAction( params ) {
        return new Promise(async (resolve, reject) => {
            const channel_id = params.channel_id;
            if (!this.rooms.hasOwnProperty('c_' + channel_id)) {
                reject('You did not joined to this channel');
                return;
            }
            console.log(params);

            let room = this.rooms['c_' + channel_id];
            if (this.rooms['c_' + channel_id].kick(this, params.nickname)) {
                let user = await db.Users.findOne({where:{nickname: params.nickname }})

                if( !user )
                    reject('Unknown user');

                await db.InviteLinks.destroy({where: { user_id: user.id, room_id: room.id }});
                await db.RoomUsers.destroy({ where:{ user_id: user.id, room_id: room.id }});

                resolve(true);
            }
            else
                reject('You cannot do that!')
        });
    }

    setTopicAction( params ) {
        return new Promise(async (resolve, reject) => {
            const channel_id = params.channel_id;
            if (!this.rooms.hasOwnProperty('c_' + channel_id)) {
                reject('You did not joined to this channel');
                return;
            }
            console.log(params);
            if ( this.rooms['c_' + channel_id].topic(this,params.topic) )
            {
                let room = await db.ChatRoom.findOne({where:{ uuid: channel_id }})
                room.title = params.topic;
                await room.save();
                resolve(true);
            }
            else
                reject('You cannot do that!')
        }) ;
    }

    leaveAction( params )
    {
        return new Promise(async (resolve, reject) => {
            const channel_id = params.channel_id;
            if (!this.rooms.hasOwnProperty('c_' + channel_id)) {
                reject('You did not joined to this channel');
                return;
            }
            console.log(params);

            let room = this.rooms['c_' + channel_id];
            let ruser = await db.RoomUsers.findOne({ where:{ user_id: this.user_id, room_id: room.id }});
            await ruser.destroy();

            resolve(true);

            this.sendCommand('stop_channel',{uuid: room.uuid});

        }) ;
    }


    async logout(bForced = false)
    {
        for(let uuid in this.rooms )
        {
            let room = this.rooms[uuid];
            room.logout(this);
        }
        await db.RoomUsers.destroy({ where:{ user_id: this.user_id }});

        if (bForced)
            this.sendCommand('logout', {})

    }

    logoutAction( params )
    {
        return new Promise(async (resolve, reject) => {

            await this.logout();

            resolve(true);

        }) ;
    }

    showUsersAction( params ){
        return new Promise(async (resolve, reject) => {

                if (!await this.isAdmin())
                {
                    reject('You cannot do that.')
                    return;
                }

                const users = await db.Users.findAll();
                let users_online = [];
                const sessions = this._sessionRegister.getSessions();
                sessions.forEach((sess) => {
                    let rooms_list = [];
                    for(let room_id in sess.rooms)
                    {
                        if(sess.rooms.hasOwnProperty(room_id)) {
                            rooms_list.push({
                                uuid: sess.rooms[room_id].uuid,
                                title: sess.rooms[room_id].title,
                                users: sess.rooms[room_id].usersCount()
                            })
                        }
                    }
                    users_online.push( {
                        nickname: sess.nickname,
                        started: sess.session_started,
                        rooms: rooms_list,
                        rooms_count: rooms_list.length
                    } )
                });

                users.map((u) => {u.login_key = null});
                resolve( {   users_online, users } );

        }) ;
    }

    showRoomsAction( params ){
        return new Promise(async (resolve, reject) => {

            if (!await this.isAdmin())
            {
                reject('You cannot do that.')
                return;
            }
            const active_rooms = rooms.json_list()
            resolve({ active_rooms });

        }) ;
    }


    kickFromServerAction( params ){
        return new Promise(async (resolve, reject) => {

            if (!await this.isAdmin())
            {
                reject('You cannot do that.')
                return;
            }

            await this._sessionRegister.killSession( params.nickname );

        }) ;
    }

    banUserAction( params ){
        return new Promise(async (resolve, reject) => {

            if (!await this.isAdmin())
            {
                reject('You cannot do that.')
                return;
            }

            let user = await db.Users.findOne({where: { nickname: params.nickname }})
            user.disabled = 1;
            await user.save();
            resolve( true );

        }) ;
    }

    setUserStateAction( params ){
        return new Promise(async (resolve, reject) => {
            if (!await this.isAdmin() || this.nickname === params.nickname)
            {
                reject('You cannot do that.')
                return;
            }
            let user = await db.Users.findOne({where: { nickname: params.nickname }})
            user.disabled = (params.state === 1 ? 1 : 0);
            await user.save();
            resolve( true );

        }) ;
    }

    setAdminAction( params ){
        return new Promise(async (resolve, reject) => {
            if (!await this.isAdmin())
            {
                reject('You cannot do that.')
                return;
            }
            let user = await db.Users.findOne({where: { nickname: params.nickname }})
            console.log( user );
            user.admin = 1;
            await user.save();
            resolve( true );

        }) ;
    }

    setUserAction( params ){
        return new Promise(async (resolve, reject) => {
            if (!await this.isAdmin() || params.nickname === this.nickname)
            {
                reject('You cannot do that.')
                return;
            }
            let user = await db.Users.findOne({where: { nickname: params.nickname }})
            user.admin = 0;
            await user.save();
            resolve( true );

        }) ;
    }

    joinRoomAction( params ){
        return new Promise(async (resolve, reject) => {
            if (!await this.isAdmin())
            {
                reject('You cannot do that.')
                return;
            }

            let res = rooms.join_me_admin(this,params.uuid);

            if(res !== null) {

                this.sendStartChannel(link.room.uuid, link.room.title, res.publicKey, res.privateKey);
                resolve(true);

                this.rooms['c_' + res.uuid] = res;
            }

        }) ;
    }

}
module.exports = Session;
