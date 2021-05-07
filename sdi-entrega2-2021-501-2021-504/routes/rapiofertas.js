module.exports = function(app,gestorBD) {
    app.get("/api/offer/otherOfferList", function (req, res) {
        let criterio = { "email" : {$ne: req.session.usuario } };

        gestorBD.obtenerOffers(criterio,function(offers){
            if(offers == null){
                res.status(404);
                res.json({
                   error: "Error al obtener lista de ofertas"
                });
                return;
            }
             else{
                 res.status(200);
                 res.json({
                     ofertas:offers
                 })
            }
        })
    });
}