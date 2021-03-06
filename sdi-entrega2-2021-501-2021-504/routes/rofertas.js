module.exports = function(app, swig, gestorBD,logger) {
    var previousBusqueda =""
    /**
     * Petición post que controla el añadir una oferta nueva a la aplicación
     */
    app.post("/offer/add", function(req, res) {

        if (req.body.title.length <= 0 || req.body.description.length <= 0 || req.body.price.length <= 0 ) {
            logger.error( "Campos incorrectos en añadir oferta");
            res.redirect("/offer/add?mensaje=No puede dejar campos vacíos"+
            "&tipoMensaje=alert-danger ");
        }
        else if (req.body.price <= 0) {
            logger.error( "Campos incorrectos en añadir oferta");
            res.redirect("/offer/add?mensaje=El precio no puede ser menor o igual a 0"
            +"&tipoMensaje=alert-danger ");
        }


        else {
            if(req.body.destacada == "on"){
                if(req.session.money <20){ //Comprobamos si tiene saldo
                    logger.error( req.session.usuario +" no tiene suficiente dinero para destacar la oferta");
                    res.redirect("/offer/add?mensaje=No tienes dinero suficiente para destacar la oferta"
                        +"&tipoMensaje=alert-danger ");
                }
                else{
                    req.session.money-=20
                    let usuario = {
                        money:req.session.money
                    }
                    let criterio2 = {"email":req.session.usuario}
                    gestorBD.modificarUsuario(criterio2,usuario,function (result) {
                        if (result == null) {
                            logger.error("Error al modficar saldo");

                            res.redirect("/offer/myOfferList" +
                                "?mensaje=Error al modificar saldo" +
                                "&tipoMensaje=alert-danger ");
                        }
                        else{
                            let offer = {
                                title : req.body.title,
                                description : req.body.description,
                                price : req.body.price,
                                email: req.session.usuario,
                                buyer: null,
                                destacada: true
                            }

                            gestorBD.insertOffer(offer, function(id){
                                if (id == null) {
                                    logger.error("Error al crear oferta");
                                    res.send("Error al insertar oferta");
                                }
                                else{
                                    logger.info(req.session.usuario+" ha creado una oferta destacada");
                                    res.redirect("/offer/myOfferList");
                                }
                            });
                        }



                    })
                }
            }
            else{
            let offer = {
                title : req.body.title,
                description : req.body.description,
                price : req.body.price,
                email: req.session.usuario,
                buyer: null,
                destacada: false
            }

            gestorBD.insertOffer(offer, function(id){
                if (id == null) {
                    logger.error("Error al insertar oferta");
                    res.send("Error al insertar oferta");
                }
                else{
                    logger.info(req.session.usuario+" ha creado una oferta normal");
                    res.redirect("/offer/myOfferList");
                }
            });
        }
        }
    });

    /**
     * Petición post que muestra el formulario para añddir una oferta
     */
    app.get("/offer/add", function(req, res) {
        logger.info(req.session.usuario+ "Ha accedido a añadir una oferta");
        let respuesta = swig.renderFile('views/offer/add.html', {rol: req.session.rol,
            usuario: req.session.usuario,
            money: req.session.money});
        res.send(respuesta);

    });

    /**
     * Petición get que elimina la oferta indicada por su identificador
     */
    app.get("/offer/delete/:id", function(req, res) {
        let criterio = {"_id" : gestorBD.mongo.ObjectID(req.params.id) };
        gestorBD.eliminarOffer(criterio,function(offers){
            if ( offers == null ){
                logger.error("Error al eliminar oferta");
                res.send("Error al eliminar oferta");
            } else {
                let criterio2 = {"offer_id" : gestorBD.mongo.ObjectID(req.params.id) };
              gestorBD.eliminarConversacion(criterio2,function (convers) {
                  if(convers==null){
                      logger.error( "Error al eliminar una conversacion");
                      res.send("Error al eliminar las conversaciones de la oferta");
                  }
                  else{
                      logger.info(req.session.usuario+ " ha eliminado una oferta con exito");
                      res.redirect("/offer/myOfferList");
                  }
              })

            }
        });
    });

    /**
     * Petición get que destaca la oferta indicada por su identificador
     */
    app.get("/offer/destacar/:id", function(req, res) {

        req.session.money-=20
        let criterio = {"_id" : gestorBD.mongo.ObjectID(req.params.id) };
        let offer = {"destacada":true};

        gestorBD.modificarOferta(criterio,offer,function(offers){
            if ( offers == null ){
                logger.error( "Error al destacar una oferta");
                res.send("Error al destacar oferta");
            } else {
                logger.info(req.session.usuario+ " ha destacado una oferta con exito");
                res.redirect("/offer/myOfferList");
            }
        });
    });

    /**
     * Petición get que devuelve una lista de todas las ofertas dadas de alta por el usuario en sesión
     */
    app.get('/offer/myOfferList', function (req, res) {
        let criterio = { "email" : req.session.usuario };
        gestorBD.obtenerOffers(criterio,function(offers){
            if ( offers == null ){
                logger.error( "Error al listar ofertas");
                res.send("Error al listar");
            } else {
                let respuesta = swig.renderFile('views/offer/myOfferList.html',
                    {
                        offers : offers,
                        rol: req.session.rol,
                        usuario: req.session.usuario,
                        money: req.session.money

                    });
                logger.info( req.session.usuario+" ha listado sus ofertas propias con éxito");
                res.send(respuesta);
            }
        });
    })

    /**
     * Petición get que devuelve una lista de todas las ofertas dadas de alta por usuarios
     * diferentes al que está en sesión y que se pueden comprar
     */
    app.get('/offer/otherOfferList', function (req, res) {
        let criterio = { "email" : {$ne: req.session.usuario } };

        if (req.query.busqueda != null){
            previousBusqueda=req.query.busqueda
            criterio = { "email" : {$ne: req.session.usuario }, "title" : {$regex : ".*"+req.query.busqueda+".*",$options:"i"}};
        }
        let pg = parseInt(req.query.pg); // Es String !!!
        if ( req.query.pg == null){ // Puede no venir el param
            pg = 1;
        }


        gestorBD.obtenerOffersPageable(criterio,pg,function(offers,total){
            if ( offers == null ){
                logger.error( "Error al listar ofertas");
                res.send("Error al obtener ofertas");
            } else {
                let ultimaPg = total/5;
                if (total % 5 > 0 ){ // Sobran decimales
                    ultimaPg = ultimaPg+1;
                }
                let paginas=[];
                for(let i = pg-2 ; i <= pg+2 ; i++){
                    if ( i > 0 && i <= ultimaPg){
                        paginas.push(i);
                    }
                }
                let respuesta = swig.renderFile('views/offer/otherOfferList.html',
                    {
                        busqueda: previousBusqueda,
                        offers : offers,
                        paginas: paginas,
                        actual: pg,
                        rol: req.session.rol,
                        usuario: req.session.usuario,
                        money: req.session.money
                    });
                logger.info(req.session.usuario+  " ha listado las ofertas de otros con éxito");
                res.send(respuesta);
            }
        });
    })

    /**
     * Petición get que devuelve una lista de todas las ofertas destacadas
     */
    app.get('/offer/destacadas', function (req, res) {
        let criterio = { "email" : {$ne: req.session.usuario },"destacada":true };

        gestorBD.obtenerOffers(criterio,function(offers){
            if ( offers == null ){
                logger.error( "Error al listar ofertas");
                res.send("Error al obtener ofertas");
            } else {

                let respuesta = swig.renderFile('views/offer/offerDestacadas.html',
                    {
                        offers : offers,
                        rol: req.session.rol,
                        usuario: req.session.usuario,
                        money: req.session.money
                    });
                logger.info(req.session.usuario+  " ha listado las ofertas destacadas con éxito");
                res.send(respuesta);
            }
        });
    })


    /**
     * Método get que compra una oferta con a partir de un ID
     */
    app.get("/offer/buy/:id",function(req,res){
        let criterio = {"_id" : gestorBD.mongo.ObjectID(req.params.id) };

        gestorBD.obtenerOfertaPorId(criterio, function(ofertas){
            if(ofertas==null) {
                logger.error("Error al intentar obtener una oferta")
                res.send("Esta oferta no existe");
            }
            let oferta = ofertas[0]

            if(oferta.email == req.session.usuario) { //Comprobamos que la oferta no es de él mismo
                logger.error(req.session.usuario+" ha intentado comprar una oferta propia")
                res.redirect("/offer/otherOfferList" +
                    "?mensaje=No puedes comprar tu propia oferta" +
                    "&tipoMensaje=alert-danger ");
            }
            if(oferta.buyer != null ) { //Comprobamos que no esté comprada
                logger.error(req.session.usuario + " ha intentado comprar una oferta ya comprada")
                res.redirect("/offer/otherOfferList" +
                    "?mensaje=Lo siento esta oferta ya está comprada" +
                    "&tipoMensaje=alert-danger ");
            }
            if(parseInt(oferta.price) > req.session.money) { //comprobamos si el usuario tiene dinero suficiente
                logger.error(req.session.usuario + " ha intentado comprar una oferta y no tiene saldo suficiente")
                res.redirect("/offer/otherOfferList" +
                    "?mensaje=No tienes dinero suficiente" +
                    "&tipoMensaje=alert-danger ");
            }
            else {
                req.session.money-=oferta.price;
                oferta.comprador=req.session.usuario;
                gestorBD.modificarOferta(criterio,oferta,function (result) { //Modificamos el comprador de la oferta
                    if (result == null) {
                        logger.error("Error al intentar modifcar una oferta")
                        res.redirect("/offer/otherOfferList" +
                            "?mensaje=Error al comprar oferta" +
                            "&tipoMensaje=alert-danger ");
                    } else {
                        let usuario = {
                            money:req.session.money
                        }
                        let criterio2 = {"email":req.session.usuario}
                        gestorBD.modificarUsuario(criterio2,usuario,function (result) {
                            if (result == null) {
                                logger.error("Error al intentar modifcar un usuario")
                                res.redirect("/offer/otherOfferList" +
                                    "?mensaje=Error al comprar oferta" +
                                    "&tipoMensaje=alert-danger ");
                            }
                            else {
                                logger.info(req.session.usuario + " ha comprado una oferta con éxito")
                                res.redirect("/offer/otherOfferList");
                            }

                        })
                    }
                })
            }
        });

    });
    /**
     * Método get que muestra la vista de ofertas compradas
     */
    app.get("/offer/boughtOfferList",function(req,res) {
        let criterio = {"comprador": req.session.usuario};
        gestorBD.obtenerBoughtOffers(criterio,function (offers) {
            if (offers == null) {
                logger.error("Error al listar ofertas compradas")
                res.send("Error en la bd");
            }else{
                let respuesta = swig.renderFile('views/offer/boughtOfferList.html',
                    {
                        offers : offers,
                        rol: req.session.rol,
                        usuario: req.session.usuario,
                        money: req.session.money

                    });
                logger.info(req.session.usuario + " ha listado sus ofertas compradas")
                res.send(respuesta);
            }
        })
    });


};