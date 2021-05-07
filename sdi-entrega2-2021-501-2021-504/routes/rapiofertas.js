module.exports = function (app, gestorBD) {
    app.get("/api/offer/otherOfferList", function (req, res) {
        let criterio = {"email": {$ne: req.res.usuario}};
        gestorBD.obtenerOffers(criterio, function (offers) {
            if (offers == null) {
                res.status(404);
                res.json({
                    error: "Error al obtener lista de ofertas"
                });
                return;
            } else {
                console.log(offers[0]._id.toString())
                res.status(200);
                res.json({
                    ofertas: offers
                })
            }
        })
    });

    app.post("/api/offer/message/:id", function (req, res) {

        let criterio = {"_id": gestorBD.mongo.ObjectID(req.params.id)}

        gestorBD.obtenerOffers(criterio, function (offer) {
            if (offer == null) {
                res.status(500);
                res.json({
                    error: "se ha producido un error"
                })
            } else {
                let mensaje = {
                    "oferta_id": offer[0]._id,
                    "propietario": offer[0].email,
                    "interesado": req.res.usuario,
                    "texto": req.body.text,
                    "leido": false
                }
                console.log(mensaje);
                gestorBD.insertarMensaje(mensaje, function (id) {
                    if (id == null) {
                        res.status(500);
                        res.json({
                            error: "se ha producido un error"
                        })
                    } else {
                        res.status(201);
                        res.json({
                            mensaje: "mensaje insertado",
                            _id: id
                        })
                    }
                });

            }
        })


    });


}