module.exports = {
    mongo : null,
    app : null,
    init : function(app, mongo) {
        this.mongo = mongo;
        this.app = app;
    }, insertOffer : function(offer, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                let collection = db.collection('offers');
                collection.insertOne(oferta, function(err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result.ops[0]._id);
                    }
                    db.close();
                });
            }
        });
    },
    obtenerOffers : function(criterio, funcionCallback){
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                let collection = db.collection('offers');
                collection.find(criterio).toArray(function(err, offers) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(offers);
                    }
                    db.close();
                });
            }
        });
    }
};