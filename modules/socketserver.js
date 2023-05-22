const config = require("../config");
const ws = require("ws");
const sessions = require("./sessions")
module.exports = {
    init: () => {
        const wss = new ws.WebSocketServer({ port: config.websocket_port });
        wss.on('connection', function connection(ws) {
            if (!ws.hasOwnProperty('session'))
            {
                ws['session'] = sessions.create_new(ws);
            }

            ws.on('message',function incoming(message) {
                try {
                    const data = JSON.parse(message);
                    ws.session.call_method( data.method, data.request_id ?? null, data.params );
                }
                catch (err) {
                    console.log('Socket error:',err);
                    ws.close()
                }
            });

        });
    }
}
