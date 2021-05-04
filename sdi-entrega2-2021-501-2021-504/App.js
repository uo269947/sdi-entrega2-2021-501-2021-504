let express = require('express');
let app = express();
app.use(express.static('public'));

let swig = require('swig');
let crypto = require('crypto');
let mongo = require('mongodb');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let gestorBD = require("./modules/gestorBD.js");
gestorBD.init(app,mongo);


require("./routes/rofertas.js")(app, swig);

app.set('port', 8081);

app.listen(app.get('port'), function() {
    console.log("Servidor activo");
})
