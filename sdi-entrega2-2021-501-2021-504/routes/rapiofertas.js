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
                console.log(offers[0]._id.toString());
                res.status(200);
                res.json({
                    ofertas: offers
                })
            }
        })
    });

    app.post("/api/offer/message/:converId", function (req, res) {
        //let offerId= gestorBD.mongo.ObjectID(req.params.id);
        //let criterio = {"_id": gestorBD.mongo.ObjectID(req.params.id)}
        let converId = req.params.converId;
        
        let criterio = {"_id": gestorBD.mongo.ObjectID(converId)}
        
       gestorBD.obtenerConversacion(criterio,function(conver){
          if(conver.length == 0) { //La conversacion no existe
              res.status(404);
              res.json({
                  error: "La conversacion no existe"
              });
              return;
          
          }
          else{
              let mensaje = {
                  "autor": req.res.usuario,
                  "texto": req.body.text,
                  "fecha": Date.now(),
                  "leido": false
              }
              conver[0].mensajes.push(mensaje);
              gestorBD.modificarConversacion(criterio,conver[0],function (result) { //Añadimos a mongo la conversacion con los mensajes
                  if(result==null){
                      res.status(404);
                      res.json({
                          error: "Error al mandar el mensaje"
                      });
                      return;
                  }
                  else{
                      res.status(200);
                      res.json({
                          mensajes: conver[0].mensajes
                      })
                  }
              })
          }
       });
       



    });


    /**
     * Devuelve los mensajes de una conversación a partir de un id de oferta
     * y si no existe la crea
     */
    app.get("/api/offer/message/:id", function (req, res) {
        //let email = req.res.usuario;
        let criterio = {"_id": gestorBD.mongo.ObjectID(req.params.id)}
        gestorBD.obtenerOffers(criterio, function (offers) { //Obtengo  la oferta
            if (offers == null) {
                res.status(500);
                res.json({
                    error: "se ha producido un error"
                })
            }
            if (offers.length == 0) {
                res.status(500);
                res.json({
                    error: "Esta oferta no existe"
                })
            }
            else {
                let offer = offers[0];
                if (offer.email != req.res.usuario) { //El usuario no es el propietario
                    let criterio = {"offer_id": offer._id, "interesado": req.res.email};
                    gestorBD.obtenerConversacion(criterio, function (conversacion) {


                        if (conversacion.length == 0) { //No existe la conversación
                            let conversacion = {
                                "propietario": offer.email,
                                "offer_id": offer._id,
                                "interesado": req.res.usuario,
                                "mensajes": []
                            }
                            gestorBD.crearConversacion(conversacion, function (result) {
                                if (result == null) {
                                    res.status(500);
                                    res.json({
                                        error: "se ha producido un error insertando la conversación"
                                    })
                                } else {
                                    res.status(200);
                                    res.json({
                                        mensajes: result.mensajes
                                    })
                                }
                            })
                        } else { //Si existe la conversación
                            res.status(200);
                            res.json({
                                mensajes: conversacion[0].mensajes
                            })
                        }
                    });


                } else {//El usuario es el propietario
                    let interesado = req.body.interesado;
                    let criterio3 = {
                        "offer_id": gestorBD.mongo.ObjectID(req.params.id),
                        "propietario": req.res.usuario,
                        "interesado": interesado
                    };
                    gestorBD.obtenerConversacion(criterio3, function (conversacion) {
                        if (conversacion.length == 0) {
                            res.status(500)
                            res.json({
                                error: "Esta conversacion no existe"
                            })
                        } else {
                            res.status(200)
                            res.json({
                                mensajes: conversacion[0].mensajes
                            });
                        }
                    });
                }
            }
        });
    });


}