const config = require("../config");
const express = require('express');
const db = require('../models');

module.exports = {
    load: ()=> {
        const port = config.express_server_port;
        const app = express();
        const public_dir = __dirname + "/../public";
        console.log( public_dir );
        app.use( express.json() );
        app.use('/', express.static( public_dir ));

        app.post('/reg',async (req,res)=> {
            let nickname = req.body.nickname;
            let login_key = req.body.key;
            if( nickname.match(/^[a-zA-Z0-9]{5,15}$/) ) {
                let user = await db.Users.findOne({where: {nickname: req.body.nickname}});
                if (!user) {

                    db.Users.create({nickname, login_key, admin: (nickname === "admin" ? 1 : 0) })
                    res.json({result: 1});
                } else
                    res.json({result: -1, data: 'Nickname already in use'});
            }
            else
            {
                res.json({result: -1, data: 'Invalid nickname'});
            }

        });

        app.post( '/settings',(req,res)=>{
           res.json({ socket_port: config.websocket_port });
        });


        app.listen(port, () => {
            console.log(`App listening at ${port}`)
        })
    }
}
