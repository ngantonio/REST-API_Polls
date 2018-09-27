const moment = require('moment'); 
const config = require('../config');
const jwt = require('jsonwebtoken');

function createToken(user){
  //data que viaja en el token
  const payload = {
    sub: user._id,
    name: user.name,
    int: moment().unix(),                  //Token valido a partir de
    exp: moment().add(14, 'days').unix()   //Token expira +15 dias despues de generado. (ver nota 1) 
  }
  //codificamos el token: payload + secret key:
  return jwt.sign({payload}, config.SECRET_TOKEN);

}

//regresa una promesa
function decodeToken(token) {

  return new Promise((resolve, reject)=>{
      //reconstruimos el payload y decodificamos:
      jwt.verify(token, config.SECRET_TOKEN,(error,data) =>{
        if(error)
          reject({status: 403, message:"token invalido", error});
        else{
          //comprobamos si el token es valido (menor-igual a la fecha actual):
          if(data.payload.exp <= moment().unix())
            reject({status: 403, message: "El token enviado ha expirado"});
          else  
            resolve(data.payload.sub);
           //si todo ha ido bien, agregamos el id del payload al objeto del request
        }
      });
  });
}

module.exports = {
  createToken,
  decodeToken
}


/*
notas:
  1. para agregar 15 dias a la fecha actual, es necesario la libreria moment(),
    hacerlo propiamente con el objeto Date de JS, resulta algo complejo.
*/
