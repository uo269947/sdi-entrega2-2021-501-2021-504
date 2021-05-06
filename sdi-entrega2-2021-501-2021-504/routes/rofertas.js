module.exports = function(app, swig, gestorBD) {

    /**
     * Petición post que controla el añadir una oferta nueva a la aplicación
     */
    app.post("/offer", function(req, res) {
        let offer = {
            title : req.body.title,
            description : req.body.description,
            price : req.body.price,
            email: req.session.usuario
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
    app.get("/offer", function(req, res) {
        let respuesta = swig.renderFile('views/offer/add.html', {});
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
                        offers : offers
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
        let criterio = { "usuario" : {$ne: req.session.usuario } };
        gestorBD.obtenerOffers(criterio,function(offers){
            if ( offers == null ){
                res.send(respuesta);
            } else {
                let respuesta = swig.renderFile('views/offer/otherOfferList.html',
                    {
                        offers : offers
                    });
                res.send(respuesta);
            }
        });
    })


};