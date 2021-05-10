module.exports = function (app, gestorBD,logger) {
    app.get("/api/offer/otherOfferList", function (req, res) {
        let criterio = {"email": {$ne: req.res.usuario}};
        gestorBD.obtenerOffers(criterio, function (offers) {
            if (offers == null) {
                logger.error("Error al obtener ofertas");
                res.status(404);
                res.json({
                    error: "Error al obtener lista de ofertas"
                });
                return;
            } else {
                logger.info(req.res.usuario+" ha listado las ofertas de otros usuarios");
                res.status(200);
                res.json({
                    ofertas: offers
                })
            }
        })
    });

    /**
     * Método post que envia un mensaje a una conversacion
     */
    app.post("/api/offer/message", function (req, res) {
        //let offerId= gestorBD.mongo.ObjectID(req.params.id);
        //let criterio = {"_id": gestorBD.mongo.ObjectID(req.params.id)}
        let converId = req.body.converId;
        
        let criterio = {"_id": gestorBD.mongo.ObjectID(converId)}
        
       gestorBD.obtenerConversacion(criterio,function(conver){
          if(conver.length == 0) { //La conversacion no existe
              logger.error("Error al obtener conversaciones");
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
                      logger.error("Error al modificar conversaciones");
                      res.status(404);
                      res.json({
                          error: "Error al mandar el mensaje"
                      });
                      return;
                  }
                  else{
                      logger.info(req.res.usuario+" ha enviado un mensaje a la conversacion con id: "+conver[0]._id);
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
                logger.error("Error al obtener ofertas");
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
                    let criterio2 = {"offer_id": gestorBD.mongo.ObjectID(req.params.id), "interesado": req.res.usuario};
                    gestorBD.obtenerConversacion(criterio2, function (conversacion) {


                        if (conversacion.length == 0) { //No existe la conversación
                            logger.info("Creando conversacion entre "+req.res.usuario+" y "+offer.email);
                            let conversacion = {
                                "nombreOferta": offer.title,
                                "propietario": offer.email,
                                "offer_id": offer._id,
                                "interesado": req.res.usuario,
                                "mensajes": []
                            }
                            gestorBD.crearConversacion(conversacion, function (result) {
                                if (result == null) {
                                    logger.error("Error al crear conversacion");
                                    res.status(500);
                                    res.json({
                                        error: "se ha producido un error insertando la conversación"
                                    })
                                } else {
                                    res.status(200);
                                    logger.info(req.res.usuario+" ha creado una conversacion con id: "+result._id);
                                    res.json({
                                        mensajes: result.mensajes,
                                        idConver: result._id
                                    })
                                }
                            })
                        } else { //Si existe la conversación
                            logger.info(req.res.usuario+" ha obtenido una conversación a partir de una oferta con éxito");
                            res.status(200);
                            res.json({
                                mensajes: conversacion[0].mensajes,
                                idConver: conversacion[0]._id
                            })
                        }
                    });


                } else {//El usuario es el propietario
                    logger.error(req.res.usuario+" ha itentado iniciar una conversación siendo propietario");
                   res.status(500)
                    res.send({
                        error:"Siendo propietario de una oferta no puedes mandar mensaje a una oferta por primera vez"
                    });
                }
            }
        });
    });



    /**
     * Método get que obtiene todas las conversaciones
     * de un usuario
     */
    app.get("/api/offer/conver",function (req,res) {
       console.log("si");

        let email = req.res.usuario
        let criterio = {$or:[{"propietario":email},{"interesado":email}]}
        gestorBD.obtenerConversacion(criterio,function (conversaciones) {
            if(conversaciones == null){
                logger.error("Error al obtener conversacion");
                res.status(500);
                res.json({
                    error: "se ha producido un error"
                })
            }
            else{
                logger.info(req.res.usuario+" ha obtenido sus conversaciones con éxito");
                res.status(200)
                res.json({
                    conversaciones:conversaciones
                })
            }
        })
    })

    /**
     * Metodo get que obtiene una conversacion
     */
    app.get("/api/offer/conver/:idConver",function (req,res) {
        let criterio = {"_id": gestorBD.mongo.ObjectID(req.params.idConver)}
        gestorBD.obtenerConversacion(criterio,function (conver) {
            if( conver == null){
                logger.error("Error al obtener conversacion");
                res.status(500);
                res.json({
                    error: "se ha producido un error"
                })
            }
            if(conver.length == 0){
                logger.error("Error al obtener conversacion");
                res.status(500);
                res.json({
                    error: "No existe esa conversación"
                })
            }
            else {
                logger.info(req.res.usuario+" ha obtenido su conversación con éxito");
                res.status(200);
                res.json({
                    conver: conver[0]
                })
            }
        })
    })
    /**
     * Método delete que elimina una conversacion
     * dada su id
     */
    app.delete("/api/offer/conver:id",function (req,res) {
        let email = req.res.usuario;
        let criterio = {"_id": gestorBD.mongo.ObjectID(req.params.id)}
        gestorBD.obtenerConversacion(criterio,function (conver) {
            if( conver == null){
                logger.error("Error al obtener conversacion");
                res.status(500);
                res.json({
                    error: "se ha producido un error"
                })
            }
            if(conver.length == 0){
                logger.error("Error al obtener conversaciones");
                res.status(500);
                res.json({
                    error: "No existe esa conversación"
                })
            }
            if(conver[0].propietario != email && conver[0].interesado != email){
                logger.error(req.res.usuario+" ha itentado eliminar una conversación donde no es participante");
                res.status(500);
                res.json({
                    error: "No perteneces a esa conversación"
                })
            }
            else{
                gestorBD.eliminarConversacion(criterio,function (result) {
                    if ( result == null ){
                        logger.error("Error al eliminar conversacion");
                        res.status(500);
                        res.json({error : "se ha producido un error"})
                    } else {
                        logger.info(req.res.usuario+" ha eliminado una conversación con éxito");
                        res.status(200);
                        res.send(JSON.stringify(result));
                    }
                })
            }
        })
    });


}