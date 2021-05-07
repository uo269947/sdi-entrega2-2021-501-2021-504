module.exports = function(app, swig, gestorBD) {

    /**
     * Petición post que controla el añadir una oferta nueva a la aplicación
     */
    app.post("/offer/add", function(req, res) {
        let offer = {
            title : req.body.title,
            description : req.body.description,
            price : req.body.price,
            email: req.session.usuario,
            buyer: null
        }

        gestorBD.insertOffer(offer, function(id){
            if (id == null) {
                res.send("Error al insertar oferta");
            }
            else{
                res.redirect("/offer/myOfferList");
            }
        });

    });

    /**
     * Petición post que muestra el formulario para añddir una oferta
     */
    app.get("/offer/add", function(req, res) {
        let respuesta = swig.renderFile('views/offer/add.html', {rol: req.session.rol,
            usuario: req.session.usuario,
            money: req.session.money});
        res.send(respuesta);

    });

    /**
     * Petición post que elimina la oferta indicada por su identificador
     */
    app.get("/offer/delete/:id", function(req, res) {
        let criterio = {"_id" : gestorBD.mongo.ObjectID(req.params.id) };
        gestorBD.eliminarOffer(criterio,function(offers){
            if ( offers == null ){
                res.send("Error al eliminar oferta");
            } else {
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
                res.send("Error al listar");
            } else {
                let respuesta = swig.renderFile('views/offer/myOfferList.html',
                    {
                        offers : offers,
                        rol: req.session.rol,
                        usuario: req.session.usuario,
                        money: req.session.money

                    });
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
            criterio = { "email" : {$ne: req.session.usuario }, "title" : {$regex : ".*"+req.query.busqueda+".*"}};
        }
        let pg = parseInt(req.query.pg); // Es String !!!
        if ( req.query.pg == null){ // Puede no venir el param
            pg = 1;
        }


        gestorBD.obtenerOffersPageable(criterio,pg,function(offers,total){
            if ( offers == null ){
                res.send("Error al obtener ofertas");
            } else {
                let ultimaPg = total/4;
                if (total % 4 > 0 ){ // Sobran decimales
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
                        offers : offers,
                        paginas: paginas,
                        actual: pg,
                        rol: req.session.rol,
                        usuario: req.session.usuario,
                        money: req.session.money
                    });
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
            if(ofertas==null)
                res.send("Esta oferta no existe");
            let oferta = ofertas[0]

            if(oferta.email == req.session.usuario) //Comprobamos que la oferta no es de él mismo
                res.redirect("/offer/otherOfferList" +
                    "?mensaje=No puedes comprar tu propia oferta" +
                    "&tipoMensaje=alert-danger ");
            if(oferta.buyer != null ) //Comprobamos que no esté comprada
                res.redirect("/offer/otherOfferList" +
                    "?mensaje=Lo siento esta oferta ya está comprda" +
                    "&tipoMensaje=alert-danger ");
            if(parseInt(oferta.price) > req.session.money) //comprobamos si el usuario tiene dinero suficiente
                res.redirect("/offer/otherOfferList" +
                    "?mensaje=No tienes dinero suficiente" +
                    "&tipoMensaje=alert-danger ");
            req.session.money-=oferta.price;
            oferta.comprador=req.session.usuario;
            gestorBD.modificarOferta(criterio,oferta,function (result) { //Modificamos el comprador de la oferta
                if (result == null) {
                    res.redirect("/offer/otherOfferList" +
                        "?mensaje=Error al comprar oferta" +
                        "&tipoMensaje=alert-danger ");
                } else {
                    let usuario = {
                        money:req.session.money
                    }
                    let criterio2 = {"email":req.session.usuario}
                    gestorBD.modificarUsuario(criterio2,usuario,function (result) {
                        if (result == null)
                            res.redirect("/offer/otherOfferList" +
                                "?mensaje=Error al comprar oferta" +
                                "&tipoMensaje=alert-danger ");
                         else
                            res.redirect("/offer/otherOfferList");

                    })
                }
            })

        });

    });
    /**
     * Método get que muestra la vista de ofertas compradas
     */
    app.get("/offer/boughtOfferList",function(req,res) {
        let criterio = {"comprador": req.session.usuario};
        gestorBD.obtenerBoughtOffers(criterio,function (offers) {
            if (offers == null) {
                res.send("Error en la bd");
            }else{
                let respuesta = swig.renderFile('views/offer/boughtOfferList.html',
                    {
                        offers : offers,
                        rol: req.session.rol,
                        usuario: req.session.usuario,
                        money: req.session.money

                    });
                res.send(respuesta);
            }
        })
    });


};