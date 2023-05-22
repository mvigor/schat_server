const Session = require("./session")
const sessions = [];
const sessionRegister = {
    register_session: (session) => {
        return new Promise((resolve,reject) => {
            sessions.forEach((sessionElement) => {
                if (sessionElement.nickname === session.nickname && sessionElement.isAlive)
                {
                    reject();
                    return;
                }
            })

            sessions.push( session )
            resolve(sessionRegister);

        });
    },

    create_new: (socket) => {
        return new Session(socket, sessionRegister.register_session)
    },

    killSession: async (nickname) => {
        let session = sessions.find((sess) => sess.nickname === nickname);
        if( session )
        {
                await session.logout(true);
        }
    },

    startSessionWatcher: ()=> {
        setInterval(()=>{
            sessions.forEach((session,index) => {
                if (session.isAlive === false)
                {
                    sessions.splice(index,1)
                }
            });
        }, 5000)
    },

    getSessions: ()=>{
      return sessions;
    }
}

module.exports = sessionRegister;
sessionRegister.startSessionWatcher();
