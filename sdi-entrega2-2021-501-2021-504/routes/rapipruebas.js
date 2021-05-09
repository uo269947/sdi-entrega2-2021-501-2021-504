module.exports = function (app, gestorBD) {

    /**
     * Método get que deja la base de datos preparada para las pruebas
     */
    app.get("/api/pruebas", function (req, res) {
        eliminarUsuarios(req,res);


    });

    function eliminarUsuarios(req,res) {
        //Limpiamos los usuarios excepto admin
        let criterio = {"rol": "usuario"}
        gestorBD.eliminarUsuarios(criterio, function (result) {
            if (result == null) {
                res.status(500); //unauthorized
                res.json({
                    error: "Error al eliminar usuarios"
                })
            } else {
                eliminarConversaciones(req,res);
            }
        });
    }

    function eliminarConversaciones(req,res) {
        gestorBD.eliminarConversacion({}, function (result) { //Eliminamos todas las conversaciones
            if (result == null) {
                res.status(500); //unauthorized
                res.json({
                    error: "Error al eliminar conversaciones"
                })
            } else {
                eliminarConversaciones(req,res);
            }
        });
    }

    function eliminarConversaciones(req,res){
        gestorBD.eliminarConversacion({},function (result) {
            if (result == null) {
                res.status(500); //unauthorized
                res.json({
                    error: "Error al eliminar ofertas"
                })
            } else {
                eliminarOfertas(req,res)
            }
        })
    }

    function eliminarOfertas(req,res){
        gestorBD.eliminarOffer({},function (result) {
            if (result == null) {
                res.status(500); //unauthorized
                res.json({
                    error: "Error al eliminar ofertas"
                })
            } else {
                cargarDatos(req,res)
            }
        })
    }

    function cargarDatos(req,res){
        crearUsuarios(req,res);

    }

    function crearUsuarios(req,res){
        let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update("12345678").digest('hex');

        let usuarios =[
            {
                email : "prueba@prueba.com",
                nombre:"prueba",
                apellidos:"prueba",
                password : seguro,
                money: 100,
                rol: "usuario"
            },
            {
                email : "prueba2@prueba.com",
                nombre:"prueba2",
                apellidos:"prueba2",
                password : seguro,
                money: 100,
                rol: "usuario"
            },
            {
                email : "prueba3@prueba.com",
                nombre:"prueba3",
                apellidos:"prueba3",
                password : seguro,
                money: 19,
                rol: "usuario"
            },
        ]
        gestorBD.insertarUsuario(usuarios,function (result) {
            if (result == null) {
                res.status(500); //unauthorized
                res.json({
                    error: "Error al eliminar ofertas"
                })
            } else {
                cargarOfertas(req,res)
            }
        })
    }

    function cargarOfertas(req,res){
        var ofertas=[
            {
                title : "oferta1",
                description : "descripcion1",
                price :30,
                email: "prueba@prueba.com",
                buyer: null,
                destacada: true
            },{
                title : "oferta2",
                description : "descripcion2",
                price :40,
                email: "prueba2@prueba.com",
                buyer: null,
                destacada: false
            },{
                title : "oferta3",
                description : "descripcion3",
                price :30,
                email: "prueba3@prueba.com",
                buyer: null,
                destacada: false
            }
            ]
        gestorBD.insertOffer(ofertas,function (result) {
            if (result == null) {
                res.status(500); //unauthorized
                res.json({
                    error: "Error al eliminar ofertas"
                })
            } else {
                res.status(200);
                res.json({
                    mensaje:"Todos los datos borrados e insertados",
                    nOfertas: 3,
                    nUsuarios: 3
                })
            }
        })
    }
}