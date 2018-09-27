/* Conexion con la base de datos */

const mongoose = require('mongoose');
const config = require('./config');
const app = require('./app');


/* start mongo*/
mongoose.connect(config.database,{ useNewUrlParser: true })
  .then((db) => {

    console.log("Conexion a la base de datos establecida con exito!");

     //arrancamos el servidor de node
    app.listen(config.port, ()=>{
      console.log(`API REST RUN in http://localhost:${ config.port }`);
    });

  }).catch((err) => {
    console.log("Error al conectar a la base de datos, servidor node no iniciado..",err);
  });

  mongoose.set('useCreateIndex', true);
