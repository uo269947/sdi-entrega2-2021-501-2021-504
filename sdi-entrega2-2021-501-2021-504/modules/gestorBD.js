module.exports = {
    mongo: null,
    app: null,
    init: function (app, mongo) {
        this.mongo = mongo;
        this.app = app;
    }, insertOffer: function (offer, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                let collection = db.collection('offers');
                collection.insert(offer, function (err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result.ops[0]._id);
                    }
                    db.close();
                });
            }
        });
    }, insertarMensaje: function (message, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                let collection = db.collection('messages');
                collection.insert(message, function (err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result.ops[0]._id);
                    }
                    db.close();
                });
            }
        });
    }, insertarUsuario: function (usuario, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                let collection = db.collection('usuarios');
                collection.insert(usuario, function (err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        console.log(result.ops[0].email);
                        funcionCallback(result.ops[0].email);
                    }
                    db.close();
                });
            }
        });
    },
    obtenerUsuarios: function (criterio, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                let collection = db.collection('usuarios');
                collection.find(criterio).toArray(function (err, users) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(users);
                    }
                    db.close();
                });
            }
        });
    },
    eliminarUsuarios: function (criterio, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                let collection = db.collection('usuarios');
                collection.remove(criterio, function (err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result);
                    }
                    db.close();
                });
            }
        });
    },
    obtenerOffers: function (criterio, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                let collection = db.collection('offers');
                collection.find(criterio).toArray(function (err, offers) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(offers);
                    }
                    db.close();
                });
            }
        });
    },
    obtenerOffersPageable: function (criterio, pg, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                let collection = db.collection('offers');
                collection.count(function (err, count) {
                    collection.find(criterio).skip((pg - 1) * 5).limit(5)
                        .toArray(function (err, offers) {
                            if (err) {
                                funcionCallback(null);
                            } else {
                                funcionCallback(offers, count);
                            }
                            db.close();
                        });
                });

            }
        });

    }, eliminarOffer: function (criterio, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                let collection = db.collection('offers');
                collection.remove(criterio, function (err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result);
                    }
                    db.close();
                });
            }
        });
    }, obtenerBoughtOffers: function (criterio, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                let collection = db.collection('offers');
                collection.find(criterio).toArray(function (err, boughtOffers) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(boughtOffers);
                    }
                    db.close();
                });
            }
        });
    }, obtenerOfertaPorId: function (criterio, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err)
                funcionCallback(null);
            else {
                let collection = db.collection('offers');
                collection.find(criterio).toArray(function (err, offers) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(offers);
                    }
                    db.close();
                });
            }
        });
    }, modificarOferta: function (criterio, oferta, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err)
                funcionCallback(null);
            else {
                let collection = db.collection('offers');
                collection.update(criterio, {$set: oferta}, function (err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result);
                    }
                    db.close();
                });
            }
        });
    }, modificarUsuario: function (criterio, user, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err)
                funcionCallback(null);
            else {
                let collection = db.collection('usuarios');
                collection.update(criterio, {$set: user}, function (err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result);
                    }
                    db.close();
                });
            }
        });
    },  crearConversacion: function(conver,funcionCallback){
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err)
                funcionCallback(null);
            else {
                let collection = db.collection('messages');
                collection.insert(conver, function (err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result.ops[0]);
                    }
                    db.close();
                });
            }
        });
    },obtenerConversacion: function(criterio,funcionCallback){
        this.mongo.MongoClient.connect(this.app.get('db'), function (err, db) {
            if (err)
                funcionCallback(null);
            else {
                let collection =db.collection('messages');
                collection.find(criterio).toArray(function (err, convers) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(convers);
                    }
                    db.close();
                });
            }
        });
    },modificarConversacion: function(criterio,conversacion,funcionCallback){
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                let collection = db.collection('messages');
                collection.update(criterio, {$set: conversacion}, function(err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result);
                    }
                    db.close();
                });
            }
        });
    }, eliminarConversacion : function(criterio, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                let collection = db.collection('messages');
                collection.remove(criterio, function(err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result);
                    }
                    db.close();
                });
            }
        });
    },
};