module.exports = function(app,swig,gestorBD,logger) {

    /**
     * Get que muestra la vista de registro
     */
    app.get("/registrarse", function(req, res) {
        logger.info("Se ha accedido al registro")
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
            logger.error("Campos inválidos en el registro")
            res.redirect("/registrarse?mensaje=No puede dejar campos vacíos");
        }
        else if (req.body.password.length < 8) {
            logger.error("Campos inválidos en el registro")
           res.redirect("/registrarse?mensaje=La contraseña debe tener al menos 8 caracteres");
        }
        else if (req.body.password != req.body.password2) {
            logger.error("Campos inválidos en el registro")
            res.redirect("/registrarse?mensaje=Las contraseñas deben coincidir");
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
            gestorBD.obtenerUsuarios({email:usuario.email},function (users){
                if(users==null){
                    logger.error("Error al obtener usuarios de la BD")
                    res.redirect("/registrarse?mensaje=Ha ocurrido un error"+
                        "&tipoMensaje=alert-danger");
                }
                if(users.length!=0){
                    logger.error("Intento de registro con email repetido")
                    res.redirect("/registrarse?mensaje=Email ya registrado en la pagina"+
                        "&tipoMensaje=alert-danger");
                }else{
                    gestorBD.insertarUsuario(usuario, function(id) {
                        if (id == null){
                            logger.error("Error al insertar usuario")
                            res.redirect("/registrarse?mensaje=Error al registrar usuario"+
                                "&tipoMensaje=alert-danger");
                        } else {

                            req.session.usuario = usuario.email;
                            req.session.rol = usuario.rol;
                            req.session.money = usuario.money;
                            logger.info(req.session.usuario+" registrado con éxito")
                            res.redirect("/");
                        }
                    });
                }
            })

        }



    });

    /**
     * Petición que muestra el login
     */
    app.get("/identificarse", function(req, res) {
        logger.info("Se ha accedido al login")
        let respuesta = swig.renderFile('views/login.html', {});
        res.send(respuesta);
    });

    /**
     * Petición post para el login
     */
    app.post("/identificarse", function(req, res) {
        let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');
        if (req.body.email.length <= 0 || req.body.password.length <= 0 ) {
            logger.error("Campos inválidos en el login")
            res.redirect("/identificarse?mensaje=No puede dejar campos vacíos");
        }
        else {
            let criterio = {
                email : req.body.email,
                password : seguro
            }
            gestorBD.obtenerUsuarios(criterio, function(usuarios) {
                if (usuarios == null || usuarios.length == 0) {
                    logger.error("Error al obtener usuarios")
                    req.session.usuario = null;
                    res.redirect("/identificarse" +
                        "?mensaje=Email o password incorrecto"+
                        "&tipoMensaje=alert-danger ");
                } else {
                    req.session.usuario = usuarios[0].email;
                    req.session.rol = usuarios[0].rol;
                    req.session.money = usuarios[0].money;
                    logger.info(req.session.usuario+" identificado")
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
                logger.error("Error al obtener usuarios")
                res.send("Error al listar usuarios");
            } else {
                let respuesta = swig.renderFile('views/user/list.html',
                    {
                        users : users,
                        rol: req.session.rol,
                        usuario: req.session.usuario
                    });
                logger.info(req.session.usuario+" ha listado los usuarios")
                res.send(respuesta);
            }
        });
    })

    /**
     * Petición post que elimina los usuarios seleccionados en el html
     */
    app.post("/usuario/delete", function(req, res) {
        let usersChecked;
        if (typeof req.body.idChecked !== "string") {
            usersChecked = req.body.idChecked;
        }
        else {
            usersChecked = new Array();
            usersChecked.push(req.body.idChecked);
        }
        let criterio = {email : {"$in" : usersChecked}};

        gestorBD.eliminarUsuarios(criterio,function(users){

            if ( users === null ){
                logger.error("Error al eliminar usuarios");
                res.redirect("/usuario/list?mensaje=Error al eliminar usuarios");
            }
            if ( users.length== 0 ){
                res.redirect("/usuario/list?mensaje=Ningun usuario eliminado");
            } else {
                gestorBD.eliminarOffer(criterio,function (offers) { //Eliminamos las ofertas del usuario
                    if ( offers === null){
                        logger.error("Error al eliminar ofertas");
                        res.redirect("/usuario/list?mensaje=Error al eliminar ofertas de los usuarios");
                    }
                    else{
                        let criterio2={$or:[
                                {propietario : {$in : usersChecked}}
                                            ,{interesado:{$in:usersChecked}}]}

                        gestorBD.eliminarConversacion(criterio2,function (convers) { //Eliminamos las conversaciones del usuario
                            if ( convers === null ){
                                logger.error("Error al eliminar conversaciones");
                                res.redirect("/usuario/list?mensaje=Error al eliminar conversaciones de los usuarios");
                            }
                            else{
                                logger.info(req.session.usuario+" ha eliminado usuarios con ids: "+usersChecked)
                                res.redirect("/usuario/list?mensaje=Usuarios eliminados");
                            }
                        })
                    }
                })

            }

        });
    });

    /**
     * Peticion get para desconectarse
     */
    app.get('/desconectarse', function (req, res) {
        logger.info(req.session+" desconectado");
        req.session.usuario = null;
        req.session.money=null;
        req.session.rol=null;
        res.redirect("/identificarse");
    })
}