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
        if (req.body.email.length <= 0 || req.body.name.length <= 0 || req.body.surname.length <= 0
            || req.body.password.length <= 0 || req.body.password2.length <= 0) {
            res.redirect("/registrarse?mensaje=Debe rellenar todos los campos");
        }
        else if (req.body.password.length < 8) {
            res.redirect("/registrarse?mensaje=La contraseña debe tener al menos 8 caracteres");
        }
        else if (req.body.password != req.body.password2) {
            res.redirect("/registrarse?mensaje=Las contraseñas no coinciden");
        }
        else if (req.body.name.length <= 0 || req.body.email.length <= 0 || req.body.surname.length <= 0 ){
            res.redirect("/registrarse?mensaje=Los campos no pueden estar vacíos");
        }
        else {
            let usuario = {
                email : req.body.email,
                nombre:req.body.name,
                apellidos:req.body.surname,
                password : seguro,
                money: 100,
                rol: "usuario"
            }

            gestorBD.insertarUsuario(usuario, function(id) {
                if (id == null){
                    res.redirect("/registrarse?mensaje=Error al registrar usuario");
                } else {
                    req.session.usuario = usuario.email;
                    req.session.rol = usuario.rol;
                    req.session.money = usuario.money;
                    res.redirect("/");
                }
            });
        }



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
        if (req.body.email.length <= 0 || req.body.password.length <= 0) {
            res.redirect("/identificarse?mensaje=Debe rellenar todos los campos"+
            "&tipoMensaje=alert-danger");
        }
        else{
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
                    res.redirect("/");
                }
            });
        }

    });

    /**
     * Petición get que devuelve una lista de todos los usuarios registrados en el sistema
     */
    app.get('/usuario/list', function (req, res) {
        let criterio = { "email" : {$ne: "admin@email.com" } };
        gestorBD.obtenerUsuarios(criterio,function(users){
            if ( users == null ){
                res.send("Error al listar usuarios");
            } else {
                let respuesta = swig.renderFile('views/user/list.html',
                    {
                        users : users,
                        rol: req.session.rol,
                        usuario: req.session.usuario
                    });
                res.send(respuesta);
            }
        });
    })

    /**
     * Petición post que elimina los usuarios seleccionados en el html
     */
    app.post("/usuario/delete", function(req, res) {
        let criterio = {"email" : {"$in" : req.body.idChecked}};
        gestorBD.eliminarUsuarios(criterio,function(users){
            if ( users === null || users.length <= 0){
                res.redirect("/usuario/list?mensaje=Error al eliminar usuarios");
            } else {
                res.redirect("/usuario/list?mensaje=Usuarios eliminados");
            }
        });
    });

    /**
     * Peticion get para desconectarse
     */
    app.get('/desconectarse', function (req, res) {
        req.session.usuario = null;
        req.session.money=null;
        req.session.rol=null;
        res.redirect("/identificarse");
    })
}