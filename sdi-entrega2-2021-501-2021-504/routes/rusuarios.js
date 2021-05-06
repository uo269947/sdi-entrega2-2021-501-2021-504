module.exports = function(app,swig,gestorBD) {

    /**
     * Get que muestra la vista de registro
     */
    app.get("/registrarse", function(req, res) {
        let respuesta = swig.renderFile('views/registro.html', {});
        res.send(respuesta);
    });

    /**
     * Post que procesa el registro
     */
    app.post('/usuario', function(req, res) {
        let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');
        let usuario = {
            email : req.body.email,
            nombre:req.body.name,
            apellidos:req.body.surname,
            password : seguro,
            money:100,
            rol: "usuario"
        }

        gestorBD.insertarUsuario(usuario, function(id) {
            if (id == null){

                res.redirect("/registrarse?mensaje=Error al registrar usuario");
            } else {
                res.redirect("/identificarse?mensaje=Nuevo usuario registrado");
            }
        });


    });

    /**
     * Petición que muestra el login
     */
    app.get("/identificarse", function(req, res) {
        let respuesta = swig.renderFile('views/login.html', {});
        res.send(respuesta);
    });

    /**
     * Petición post para el login
     */
    app.post("/identificarse", function(req, res) {
        let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');
        let criterio = {
            email : req.body.email,
            password : seguro
        }




        gestorBD.obtenerUsuarios(criterio, function(usuarios) {
            if (usuarios == null || usuarios.length == 0) {
                req.session.usuario = null;
                res.redirect("/identificarse" +
                    "?mensaje=Email o password incorrecto"+
                    "&tipoMensaje=alert-danger ");
            } else {
                req.session.usuario = usuarios[0].email;
                req.session.rol = usuarios[0].rol;
                req.session.money = usuarios[0].money;
                res.redirect("/offer/myOfferList");
            }
        });
    });

    /**
     * Petición get que devuelve una lista de todos los usuarios registrados en el sistema
     */
    app.get('/usuario/list', function (req, res) {
        let criterio = {  };
        gestorBD.obtenerUsuarios(criterio,function(users){
            if ( users == null ){
                res.send(respuesta);
            } else {
                let respuesta = swig.renderFile('views/user/list.html',
                    {
                        users : users
                    });
                res.send(respuesta);
            }
        });
    })
}