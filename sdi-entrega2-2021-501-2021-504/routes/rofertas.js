module.exports = function(app, swig) {
    app.get("/offer/add", function(req, res) {
        let respuesta = swig.renderFile('public/offer/add.html', {
        });
        res.send(respuesta);
    });
};