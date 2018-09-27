
const mongoose = require('mongoose');
//necesaria para hashear contraseñas
const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const schema = mongoose.Schema;

const UserSchema = schema({

  displayName:{
    type: String,
    required:true
  },
  email: {
    type: String,
    unique: true,
    loweracse: true,
    required:true
  },
  avatar:String,
  password: {
    type: String,
    select:false,
    required: true
  },
  signUpDate:{ 
    type: Date, 
    default: Date.now()
  },
  lastLogin:{ 
    type: Date
  }
 
});

/*ejecuta antes de almacenar: 
//necesario para procesar y codificar la contraseña:

No se puede usar arrow function : (next)=>{} en este metodo, 
porque this esta a nivel global, mientras que con arrow, 
this debe de ser es local.*/

UserSchema.pre('save', function(next){
  
  let user =  this; 
  if(!user.isModified('password'))
    return next(err);

  bcrypt.genSalt(10, (err, salt)=>{
    if(err)
      return next(err);

      bcrypt.hash(user.password, salt, null, (err, hashPassw)=>{
        if(err)
          return next();
        //Se almacena la contraseña hasheada
        user.password = hashPassw;
        next();
      })
  });
});


UserSchema.methods.gravatar = function(size){

  if(!size)
    size = 200;

  //si el usuario no ha introducido un email, devuelve un avatar por defecto
  if(!this.email)
    return `https://gravatar.com/avatar/?s=${ size }&d=retro`
  
  //creamos un hash md5 para gravatar, usamos la libreria crypto:
  const md5 = crypto.createHash('md5').update(this.email).digest('hex');
  return `https://gravatar.com/avatar/${md5}?s=${ size }&d=retro`

}

/*Al iniciar sesion, compara si el password enviado
es igual al almacenado en la base de datos

possiblePassword es la contraseña que se envia en el request.
regresa un callback, con el error, o un booleano en isMatch
*/

UserSchema.methods.comparePassword = function(possiblePassword, callbk){
  bcrypt.compare(possiblePassword, this.password, (err, isMatch)=>{ 
    callbk(err, isMatch) 
  });
}


module.exports = mongoose.model('User', UserSchema);