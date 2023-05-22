const nacl = require('tweetnacl');
const naclUtils = require('tweetnacl-util');
class Room {

    _admin;
    _moderators = [];
    _users = [];
    _all = [];
    title;
    uuid;
    id;
    created;
    _sockets = [];
    _history = [];
    privateKey;
    publicKey;

    _acl = {
        admin: ['createInviteLink', 'invite', 'kick', 'setModerator'],
    moderator: ['createInviteLink', 'invite', 'kick'],
      default: ['join','leave', 'message']
    }

    _statuses = {
        admin: 2,
        moderator: 1,
        user: 0
    }


    constructor(admin, title, uuid, id) {
        this._admin = admin;
        this.title = title;
        this.uuid = uuid;
        this.id = id;
        this.created = Date.now();

        console.log('room created id = ',this.id,' uuid = ',this.uuid);

        const keyPair = nacl.box.keyPair();
        this.publicKey = naclUtils.encodeBase64(keyPair.publicKey);
        this.privateKey = naclUtils.encodeBase64(keyPair.secretKey);


        if(admin !== null) {
            this.add_socket(admin.socket)
            this._all.push({nickname: admin.nickname, status: 'admin', public_key: admin.public_key});
        }

        /*
        setInterval( ()=>{
            this.message ( { id: Date.now(), label: null, name: 'admin', sent: false, stamp: Date.now(), text: 'test ok'})
        }, 10000)
            */
        setTimeout( () => {
            this.message({ id: Date.now(), label: 'Chat created. Topic: ' + this.title } )
            this.userList();
        },1000);

    }

    getStatus(nickname)
    {
        const user = this._all.find((e) => e.nickname === nickname);
        return user.status;
    }

    add_socket(socket)
    {
        this._sockets.push( socket );
    }

    sendAll(method,params){
        this._sockets.forEach((socket) => {
            socket.send(JSON.stringify({method:"channel", channel_id: this.uuid, type:method, data: params}))
        })
    }

    message (data) {
        this.sendAll('message',data)
    }

    topic(session,topic)
    {
        this.title = topic;
        if( this.getStatus( session.nickname ) !== "admin" && this.getStatus( session.nickname ) !== "moderator" )
            return;

        this.sendAll('topic',{topic});
    }

    getUsersCount()
    {
        return this._all.length;
    }

    notification(text)
    {
        this.message({ id: Date.now(), label: text } )
    }

    join (session,linkId = null){
        let users = this._all.find((user)=>session.nickname === user.nickname);
        if(users)
            return;

        this._sockets.push(session.socket);
        this._users.push(session);
        this._all.push({nickname: session.nickname, status: 'user', public_key: session.public_key, link: linkId});
        setTimeout(()=>{
            this.notification(session.nickname + ' joined to room.')
            this.userList()
        },1000);
    }

    joinAdmin (session){
        let users = this._all.find((user)=>session.nickname === user.nickname);
        if(users)
            return;

        this._sockets.push(session.socket);
        this._users.push(session);
        this._all.push({nickname: session.nickname, status: 'admin', public_key: session.public_key, link: null});
        setTimeout(()=>{
            this.notification(session.nickname + ' joined to room.')
            this.userList()
        },1000);
    }

    rejoin_me(session,role) {

        let users = this._all.find((user)=>session.nickname === user.nickname);
        if(users)
            return;

        switch (role)
        {
            case 0:
                this._users.push(session);
                this._all.push({nickname: session.nickname, status: 'user', public_key: session.public_key, link: null});
                break;
            case 1:
                this._moderators.push(session);
                this._all.push({nickname: session.nickname, status: 'moderator', public_key: session.public_key, link: null});
                break;
            case 2:
                this._admin = session;
                this._all.push({nickname: session.nickname, status: 'admin', public_key: session.public_key, link: null});
                break;
        }
        this._sockets.push(session.socket);
        setTimeout(()=>{
            this.notification(session.nickname + ' rejoined to room.')
            this.userList()
        },1000);
    }

    _removeSession(session)
    {
        this._all = this._all.filter((el) => session.nickname !== el.nickname );
        this._sockets =  this._sockets.filter((socket) => socket !== session.socket );
    }


    leave (session) {
        this.notification( session.nickname + ' left room.' )
        this._removeSession(session);
        this.userList()
    }

    logout (session) {
        this._removeSession(session);
        this.notification( session.nickname + ' logout from server.' )
        this.userList()
    }

    createInviteLink(session)
    {
        const status = this.getStatus(session.nickname);
        if( status === "admin" || status === "moderator") {
            this.notification( session.nickname + ' created invite link.' )
            return true;
        }
        else
        {
            return false;
        }
    }

    invite (session,nickname){
        this.notification( session.nickname + ' invited ' + nickname +'.')
    }

    findUserSession(nickname)
    {
        let sess_u = this._users.find((u)=>u.nickname !== nickname);
        if(sess_u) return  sess_u;

        let sess_m = this._moderators.find((u)=>u.nickname !== nickname) ?? null;
        if(sess_m) return  sess_m;

        return this._admin;
    }

    kick (session,nickname, bForced = false){
        if (!bForced) {
            if (this.getStatus(session.nickname) === "moderator" && this.getStatus(nickname) === "admin")
                return false;

            if (this.getStatus(session.nickname) === "moderator" && this.getStatus(nickname) === "moderator")
                return false;

            if (this.getStatus(session.nickname) === "user")
                return false;
        }

        this.notification( nickname + ' kicked by ' + session.nickname +'.' )

        const user_session = this.findUserSession(nickname);


        this._users = this._users.filter((u)=>u.nickname !== nickname);
        this._moderators = this._moderators.filter((u)=>u.nickname !== nickname);
        this._admin = this._admin?.nickname === nickname ? null : this._admin;

        this._removeSession(user_session);


        this.userList();
        return true
    }

    setModerator (session, nickname){
        if( this._admin.nickname !== session.nickname )
            return false;

         const moderator = this._users.find((sess) => sess.nickname === nickname);

        this._users = this._users.filter( (sess) => sess.nickname !== nickname);
        this._moderators.push(moderator);

        const user = this._all.find((sess) => sess.nickname === nickname);

        user.status = 'moderator';

        this.notification(session.nickname + ' set moderator ' + nickname +' of this room.' )
        this.userList();

        return true;
    }

    setUser(session, nickname){
        if( this._admin.nickname !== session.nickname )
            return false;

        const moderator = this._moderators.find((sess) => sess.nickname === nickname);
        this._moderators = this._moderators.filter( (sess) => sess.nickname !== nickname);

        this._users.push(moderator);

        const user = this._all.find((sess) => sess.nickname === nickname);

        user.status = 'user';

        this.notification(session.nickname + ' set user ' + nickname +' of this room.' )
        this.userList();

        return true;
    }

    userList () {
        this.sendAll('userlist',this._all.sort((a,b)=>{
            return (this._statuses[b.status] - this._statuses[a.status]);
        }))
    }

    usersCount() {
        return this._all.length;
    }

}

module.exports = Room;
