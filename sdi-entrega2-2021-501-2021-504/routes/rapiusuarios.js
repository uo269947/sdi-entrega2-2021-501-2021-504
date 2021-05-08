module.exports = function(app,gestorBD){

    app.post("/api/autenticar/",function (req,res) {

        let seguro = app.get("crypto").createHmac('sha256',app.get('clave'))
            .update(req.body.password).digest('hex');

        let criterio ={
            email:req.body.email,
            password:seguro
        }
        gestorBD.obtenerUsuarios(criterio,function (usuarios) {
            if(usuarios==null || usuarios.length==0){
                res.status(401); //unauthorized
                res.json({
                    autenticado:false
                })
            }else{
                let token = app.get('jwt').sign(
                   {usuario: criterio.email , tiempo: Date.now()/1000},
                   "secreto");
                req.session.usuario = criterio.email;
                req.session.rol=usuarios[0].rol;
                if(req.session.rol == "usuario"){
                    req.session.money=usuarios[0].money;
                }
                res.status(200);
                res.json({
                    autenticado:true,
                    token:token
                })
            }
        })
    });




}