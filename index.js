const schatServer = require("./modules/webserver");
const schatSocketServer = require("./modules/socketserver");

const db = require("./models")
db.sequelize.sync({force: true});

schatSocketServer.init();
schatServer.load();


