const mongoose = require('mongoose');
const User = require('../models/user.model');
const userController = require('../controllers/user.controller');
const tokenService = require('../services/tokenService');

function signUp(req,res) {
  
  const user = new User({

    displayName: req.body.displayName,
    email: req.body.email,
    password: req.body.password
  });

  user.avatar = user.gravatar();

  user.save((err)=>{
    if(err)
      res.status(500).json({message:"Error al crear usuario!", err}); 
    else
      res.status(200).json({message:"Hecho!", user, token: tokenService.createToken(user)}); 
  });
}


function signIn(req,res) {

  // buscamos en la base de datos al usuario que tenga el email enviado:
  User.findOne({email: req.body.email}, (err, user)=>{
    
    if(err)
      return res.status(500).json({message: "Error al iniciar sesion", error});
    if(!user)
      return res.status(404).json({message: "No existe el usuario"});

    //comprobamos si la contraseña es correcta:
    console.log(req.body);
    user.comparePassword(req.body.password, (err, isMatch) =>{     
      if(err) 
        return res.status(500).json({message:`Error al ingresar: ${err}` });
       
      if(!isMatch) 
        return res.status(403).json({message: "Error al iniciar sesion"});
        
      // Si todo ha ido bien, creamos el token y lo guardamos en el request :
      var token = tokenService.createToken(user);
      req.userToken = token;
      // Actualizamos la fecha de inicio de sesion
      userController.updateLastLogin(user._id, Date.now());
      res.status(200).json({message:"Incio de sesion completo", token});
    });
  }).select('_id displayName email +password');
}

module.exports = {
  signIn,
  signUp
}
