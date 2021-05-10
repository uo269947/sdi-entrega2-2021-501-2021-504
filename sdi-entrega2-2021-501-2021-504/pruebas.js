let express = require('express');
let app = express();
let puerto = 3000;
let mongo = require('mongodb');
let crypto = require('crypto');
let gestorBD = require("./modules/gestorBD.js");
gestorBD.init(app, mongo);
app.set('db', 'mongodb://admin:admin@cluster0-shard-00-00.urjej.mongodb.net:27017,cluster0-shard-00-01.urjej.mongodb.net:27017,cluster0-shard-00-02.urjej.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-ojwuzg-shard-0&authSource=admin&retryWrites=true&w=majority');
app.set('crypto', crypto);
app.set('clave', 'abcdefg');

require("./routes/rapipruebas.js")(app,gestorBD);

app.listen(puerto, function() {
    console.log("Servidor listo "+puerto);
});
