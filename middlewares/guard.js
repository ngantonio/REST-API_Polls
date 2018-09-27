const tokenService = require('../services/tokenService');

function isAuth(req, res, next) {

  if(!req.headers.authorization)
    return res.status(403).json({message:"No has proporcionado un token"});

  const token = req.headers.authorization.split(" ")[1]; 

  //utilizamos la promesa que regresa el token service
  tokenService.decodeToken(token)
    /*fue exitosa la comprobacion y creamos una neuva propiedad
     en el request llamada user que contiene el token del usuario */
    .then(response =>{
      console.log(response);
      req.userToken = response;
      next();
    })
    .catch(err =>{
      res.status(err.status).json({message: err.message, error:err.error});
    });
}

module.exports = {
  isAuth
}
