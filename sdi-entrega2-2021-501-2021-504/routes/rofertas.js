module.exports = function(app, swig, gestorBD) {

    /**
     * Petición post que controla el añadir una oferta nueva a la aplicación
     */
    app.post("/offer/add", function(req, res) {
        let offer = {
            title : req.body.title,
            description : req.body.description,
            price : req.body.price
        }

        gestorBD.insertOffer(offer, function(id){
            if (id == null) {
                res.send("Error al insertar oferta");
            }
        });

    });

    /**
     * Petición post que elimina la oferta indicada por su identificador
     */
    app.post("/offer/delete/:id", function(req, res) {
        let criterio = {"_id" : gestorBD.mongo.ObjectID(req.params.id) };
        gestorBD.eliminarOffer(criterio,function(offers){
            if ( offers == null ){
                res.send(respuesta);
            } else {
                res.redirect("/offer/myOfferList");
            }
        });
    });

    /**
     * Petición get que devuelve una lista de todas las ofertas dadas de alta por el usuario en sesión
     */
    app.get('/offer/myOfferList', function (req, res) {
        let criterio = { "usuario" : req.session.usuario };
        gestorBD.obtenerOffers(criterio,function(offers){
            if ( offers == null ){
                res.send(respuesta);
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