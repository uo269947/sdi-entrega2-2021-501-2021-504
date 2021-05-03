let express = require('express');
let app = express();
app.use(express.static('public'));

let swig = require('swig');
let crypto = require('crypto');
let mongo = require('mongodb');

require("./routes/rofertas.js")(app, swig);

app.set('port', 8081);

app.listen(app.get('port'), function() {
    console.log("Servidor activo");
})
