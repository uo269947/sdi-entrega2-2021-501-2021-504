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
app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static('public'));

let swig = require('swig');
let crypto = require('crypto');
let mongo = require('mongodb');

let gestorBD = require("./modules/gestorBD.js");
gestorBD.init(app, mongo);

// routerUsuarioSession
var routerUsuarioSession = express.Router();
routerUsuarioSession.use(function (req, res, next) {
    console.log("routerUsuarioSession");
    if (req.session.usuario) {
        // dejamos correr la petición
        next();
    } else {
        console.log("va a : " + req.session.destino)
        res.redirect("/identificarse");
    }
});
//Aplicar routerUsuarioSession
app.use("/offer", routerUsuarioSession);

//router UsuarioPropietario
let routerUsuarioPropietario = express.Router();
routerUsuarioPropietario.use(function (req, res, next) {
    console.log("routerUsuarioPropietario");
    let path = require('path');
    let id = path.basename(req.originalUrl);
    gestorBD.obtenerOffers(
        {_id: mongo.ObjectID(id)}, function (offers) {
            if (offers[0].email == req.session.usuario)
                next();
            else
                res.redirect("/offer/myOfferList" +
                    "?mensaje=Esa oferta no es tuya, no puedes eliminarla" +
                    "&tipoMensaje=alert-danger ");
        })
});
//Aplicamos router UsuarioPropietario
app.use("/offer/delete", routerUsuarioPropietario);


//Router usuario admin
let routerUsuarioAdmin = express.Router();
routerUsuarioAdmin.use(function (req, res, next) {
    console.log("routerUsuarioAdmin");

    if (req.session.rol == "admin")
        next();
    else
        res.redirect("/offer/myOfferList" +
            "?mensaje=Lo siento no eres admin ;)" +
            "&tipoMensaje=alert-danger ");

});

//Aplicamos router usuarioAdmin
app.use("/usuario/list", routerUsuarioAdmin);

require("./routes/rofertas.js")(app, swig, gestorBD);
require("./routes/rusuarios.js")(app, swig, gestorBD);


app.use(function (err, req, res, next) {
    console.log("Error producido: " + err);//mostramos el error en consola
    if (!res.headersSent) {
        res.status(400);
        res.send("Recurso no disponible");
    }

});

//Variables
app.set('port', 8081);
app.set('db', 'mongodb://admin:admin@cluster0-shard-00-00.urjej.mongodb.net:27017,cluster0-shard-00-01.urjej.mongodb.net:27017,cluster0-shard-00-02.urjej.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-ojwuzg-shard-0&authSource=admin&retryWrites=true&w=majority');
app.set('crypto', crypto);
app.set('clave', 'abcdefg');

app.get('/', function (req, res) {
    res.redirect('/offer/myOfferList');
})

app.listen(app.get('port'), function () {
    console.log("Servidor activo");
})
