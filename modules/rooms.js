const Room = require("./room")
const db = require("../models")
let rooms = [];
module.exports = {
    list() {
        return rooms;
    },

    json_list(){
      let list = [];

      rooms.forEach((room) => list.push({
          id: list.length + 1,
          uuid: room.uuid,
          title: room.title,
          admin: room._admin?.nickname ,
          created: room.created,
          users_count: room.getUsersCount()
      }));
      return list;
    },

    create(creator, title, uuid, id){
        const room = new Room(creator, title, uuid, id);
        rooms.push( room )
        return room;
    },

    join_me(session,uuid,linkId)
    {
       const room = rooms.find( (room) => room.uuid === uuid ) ;
       console.log(room);
       if( room ) {
           room.join(session,linkId);
           return room;
       }
       else
       {
           return  null;
       }
    },

    join_me_admin(session,uuid)
    {
       const room = rooms.find( (room) => room.uuid === uuid ) ;
       console.log(room);
       if( room ) {
           room.joinAdmin(session);
           session.addRoom(room);
           session.sendStartChannel(room.uuid, room.title, room.publicKey, room.privateKey);
           return room;
       }
       else
       {
           return  null;
       }
    },

    kickUser(uuid, session, nickname) {
        let room = rooms.find((room)=>room.uuid == uuid);
        if( room )
        {
            room.kick(session, nickname, true)
            return { room_id: room.id }
        }
        else
            return  null;
    },

    async rejoin_me(session)
    {
        let roomsSet = await db.RoomUsers.findAll({ where: { user_id: session.user_id }, include: ['room']});
        roomsSet.forEach((roomRow)=>{
            let room = rooms.find((r)=>r.uuid === roomRow.room.uuid);
            if( !room)
            {
                room = this.create(null,roomRow.room.title,roomRow.room.uuid, roomRow.room_id);
            }

            session.sendStartChannel(room.uuid, room.title, room.publicKey, room.privateKey);
            session.addRoom(room);
            room.rejoin_me(session, roomRow.role );
        })
    }


}
