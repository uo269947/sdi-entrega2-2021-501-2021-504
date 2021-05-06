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


};