module.exports = function(app, swig, gestorBD) {

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