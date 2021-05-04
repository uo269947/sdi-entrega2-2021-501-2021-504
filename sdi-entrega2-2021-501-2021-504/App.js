//Modulos
let express = require('express');
let app = express();

//Módulo express-session
let expressSession = require('express-session');
app.use(expressSession({
    secret: 'abcdefg',
    resave: true,
    saveUninitialized: true
}));

let bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));

let swig = require('swig');
let crypto = require('crypto');
let mongo = require('mongodb');

let gestorBD = require("./modules/gestorBD.js");
gestorBD.init(app,mongo);


require("./routes/rofertas.js")(app, swig,gestorBD);
require("./routes/rusuarios.js")(app, swig,gestorBD);


app.use(function (err,req,res,next) {
    console.log("Error producido: "+err);//mostramos el error en consola
    if(!res.headersSent){
        res.status(400);
        res.send("Recurso no disponible");
    }

});

//Variables
app.set('port', 8081);
app.set('db','mongodb://admin:admin@cluster0-shard-00-00.urjej.mongodb.net:27017,cluster0-shard-00-01.urjej.mongodb.net:27017,cluster0-shard-00-02.urjej.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-ojwuzg-shard-0&authSource=admin&retryWrites=true&w=majority');
app.set('crypto',crypto);
app.set('clave','abcdefg');

app.listen(app.get('port'), function() {
    console.log("Servidor activo");
})
