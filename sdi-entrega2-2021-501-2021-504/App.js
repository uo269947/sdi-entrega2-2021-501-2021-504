//Modulos
let express = require('express');
let app = express();

let jwt = require('jsonwebtoken');
app.set('jwt',jwt);


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

//routerUsuarioToken
// routerUsuarioToken
let routerUsuarioToken = express.Router();
routerUsuarioToken.use(function(req, res, next) {
    // obtener el token, vía headers (opcionalmente GET y/o POST).
    let token = req.headers['token'] || req.body.token || req.query.token;
    if (token != null) {
        // verificar el token
        jwt.verify(token, 'secreto', function(err, infoToken) {
            if (err || (Date.now()/1000 - infoToken.tiempo) > 240 ){
                res.status(403); // Forbidden
                res.json({
                    acceso : false,
                    error: 'Token invalido o caducado'
                });
                // También podríamos comprobar que intoToken.usuario existe
                return;

            } else {
                // dejamos correr la petición
                res.usuario = infoToken.usuario;
                next();
            }
        });

    } else {
        res.status(403); // Forbidden
        res.json({
            acceso : false,
            mensaje: 'No hay Token'
        });
    }
});

// Aplicar routerUsuarioToken
app.use('/api/offer', routerUsuarioToken);


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

//Router usuario admin
let routerUsuarioNotAdmin = express.Router();
routerUsuarioNotAdmin.use(function (req, res, next) {
    console.log("routerUsuarioNotAdmin");

    if (req.session.rol != "admin")
        next();
    else
        res.redirect("/usuario/list" +
            "?mensaje=Lo siento eres admin " +
            "&tipoMensaje=alert-danger ");

});

//Aplicamos router usuarioAdmin
app.use("/usuario/list", routerUsuarioAdmin);

app.use("/offer/myOfferList", routerUsuarioNotAdmin);
app.use("/offer/boughtOfferList", routerUsuarioNotAdmin);
app.use("/offer/otherOfferList", routerUsuarioNotAdmin);

require("./routes/rofertas.js")(app, swig, gestorBD);
require("./routes/rusuarios.js")(app, swig, gestorBD);
require("./routes/rapiusuarios.js")(app,gestorBD);
require("./routes/rapiofertas.js")(app,gestorBD);

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
    if (req.session.rol == null)
        res.redirect('/identificarse');
    else if (req.session.rol == "usuario")
        res.redirect('/offer/myOfferList');
    else if (req.session.rol == "admin")
        res.redirect('/usuario/list');
})

app.get('/usuario', function (req, res) {
    if (req.session.rol == null)
        res.redirect('/identificarse');
    else
        res.redirect('/inicio');
})

app.listen(app.get('port'), function () {
    console.log("Servidor activo");
})
