const Poll = require('../models/poll.model');
const auth = require('./auth.controller');


function getAllPolls(req, res) {
  Poll.find({}, (err, polls) => {
    if (err)
      return res.status(500).json({
        message: "Error inesperado al realizar la peticion",
        err
      });
    if (!polls)
      return res.status(404).json({
        message: "No hay encuestas disponibles"
      });

    res.status(200).json({
      polls
    });
  });
}

function getPollById(req, res) {

  let pollId = req.params.pollId;
  Poll.findById(pollId, (err, poll) => {

    if (err)
      return res.status(500).json({
        message: "Error inesperado al realizar la peticion",err});
    if (!poll)
      return res.status(404).json({message: `No existe la encuesta bajo el id "${ pollId }"`});

    res.status(200).json({
      poll
    });
  });

}

/*
{
  "created_by": "5b9eb3cc2ca71c1ebec8f848",
  "description": "Esto es una encuesta para probar la funcion post new",
  "questions":[
    {
      "name": "Respuesta 1",
      "options": ["uno","dos", "tres", "cuatro"]
    },
    {
      "name": "Respuesta 2",
      "options": ["cinco","seis","siete"]
    }
  ]
}
*/

function newPoll(req, res) {

  /** Validaciones **/

  if(!req.body.description)
    return res.status(403).json({message: "Se debe proporcionar una descripcion para la encuesta"});
  if(!req.body.questions)
    return res.status(403).json({message: "Se debe proporcionar un arreglo de preguntas valido"});
  if(req.body.questions.length == 0)
    return res.status(403).json({message: "Se debe proporcionar un arreglo de preguntas valido"});
  /******************/


  let poll = new Poll();
  let questionsArray = new Array();

  poll.created_by = "5b9c766d0a8b5b1b08446d18";
  poll.description = req.body.description;

  //Convierte cada pregunta en el formato del modelo.
  for (var i = 0; i < req.body.questions.length; i++)
    questionsArray.push(convertQuestion(req.body.questions[i]));
  
  poll.questions = questionsArray;
  poll.save((err, pollStored) => {
    if (err)
      res.status(500).json({message: "Error al almacenar en la base de datos",err});
    res.status(200).json({
      message: "La encuesta se ha recibido correctamente",
      _id: `${ pollStored._id }`
    });
  });
}


function deletePoll(req, res) {

  let pollId = req.params.pollId;

  Poll.findById(pollId, (err, poll) => {

    if (err) return res.status(500).json({
      message: "Error al localizar encuesta!",err
    });
    if (!poll) return res.status(404).json({
      message: `No existe la encuesta bajo el id "${ pollId }"`
    });

    Poll.deleteOne((err) => {
      res.status(200).json({
        message: "Hecho!"
      });
    });

  });
}

function getPollsActive(req, res) {

  Poll.find({
    'expired_at': {
      $gte: Date.now()
    }
  }, (err, polls) => {
    if (err)
      return res.status(500).json({
        message: "Error inesperado al realizar la peticion",err});
    if (!polls)
      return res.status(404).json({
        message: "No existen encuestas activas actualmente"});

    res.status(200).json({polls});
  });
}

function getPollStats(req, res) {

  pollId = req.params.pollId;
  stats = new Array();

  Poll.findById(pollId, (err, poll) => {

    if (err)
      return res.status(500).json({
        message: "Error inesperado al realizar la peticion",
        err
      });
    if (!poll.questions)
      return res.status(404).json({
        message: "Esta encuesta no tiene preguntas disponibles"
      });

    for (var i = 0; i < poll.questions.length; i++) {
      question = new Object();
      question.question = poll.questions[i].name;
      question.stats = moreVoted(poll.questions[i]);
      stats.push(question);
    }
    res.status(200).json(stats);
  });


}

function getCompleteQuestions(req, res) {

  let pollId = req.params.pollId;

  Poll.findById(pollId, (err, poll) => {

    if (err)
      return res.status(500).json({message: "Error inesperado al realizar la peticion",err});
    if (!poll.questions)
      return res.status(404).json({message: `Esta encuesta no tiene preguntas disponibles`});

    res.status(200).json(poll.questions);
  });

}

/*
retorna un array de la forma:
[
  {
    "name": "Esta usted de acuerdo con bla bla bla",
    "options":["uno","dos","tres"]
  }
]

*/
function getSimpleQuestions(req, res) {

  let pollId = req.params.pollId;
  //retorna un array de objetos
  let simpleQuestions = new Array();

  Poll.findById(pollId, (err, poll) => {
    getPollById
    if (err)
      return res.status(500).json({message: "Error inesperado al realizar la peticion",err});
    if (!poll.questions)
      return res.status(404).json({message: "Esta encuesta no tiene preguntas disponibles"});

    /*Por cada pregunta, creamos un nuevo objeto con dos propiedades
      el nombre de la pregunta y el arreglo de opciones*/
    for (var i = 0; i < poll.questions.length; i++) {
      let questions = new Object();
      questions.name = String;
      questions.options = new Array();
      questions.name = poll.questions[i].name;
      /* recorremos el arreglo de respuestas que nos regresa el modelo
      y añadimos cada una de las opciones al arreglo que enviaremos al usuario*/
      for (var j = 0; j < poll.questions[i].options.length; j++) {
        questions.options.push(poll.questions[i].options[j].option)
      }
      simpleQuestions.push(questions);
    }

    res.status(200).json(simpleQuestions);
  });

}

/*
recibe un json de la forma:
{  
  "name": "Esta usted de acuerdo con bla bla bla",
  "options":["uno","dos","tres"]
}
puede modificarse para que reciba un arreglo de preguntas
*/

function addQuestion(req, res) {

  let pollId = req.params.pollId;

  /* validaciones */
  if(!req.body.name)
    return res.status(403).json({message: "Se debe proporcionar un nombre para la pregunta"});
  if(!req.body.options)
    return res.status(403).json({message: "Se debe proporcionar un arreglo de preguntas valido"});
  if(req.body.options.length == 0)
    return res.status(403).json({message: "Se debe proporcionar un arreglo de preguntas valido"});
  
  let newQuestion = convertQuestion(req.body);

  //buscamos la encuesta para extraer el arreglo de preguntas
  Poll.findById(pollId, (err, poll) => {

    if (err)
      return res.status(500).json({message: "Error inesperado al realizar la peticion",err});
    if (!poll.questions)
      return res.status(404).json({message: "Esta encuesta no tiene preguntas disponibles"});

    let newArray = poll.questions;
    newArray.push(newQuestion);

    //actualizamos solo el array de quest getPollByIdions, añadiendo la nueva pregunta
    Poll.updateOne({_id: pollId}, {$set: {questions: newArray}}, (err, rows) => {

      if (err)
        return res.status(500).json({message: "Error inesperado al realizar la actualización",err});
      res.status(200).json(rows);
    });
  });

}

/***************** PRIVATE *********************/

function moreVoted(array) {

  let m_voted = new Object();
  let answer = String;
  let max = -1000;
  let acum = 0;

  for (var i = 0; i < array.options.length; i++) {
    let rate = array.options[i].rate;
    if (rate > max) {
      max = rate;
      answer = array.options[i].option
    }
    acum = acum + rate;
  }
  if (acum == 0)
    return m_voted.error = "Esta pregunta no ha sido respondida aún"

  m_voted.winner_option = answer;
  m_voted.rate = max;
  m_voted.percent = ((max / acum) * 100).toFixed(2);

  return m_voted;
}

/*
se necesita convertir el json enviado por el usuario de la forma simple:

{  
  "name": "Esta usted de acuerdo con bla bla bla",
  "options":["uno","dos","tres"]
}

en un json valido para el modelo de datos de la forma:

{
  "name": "Esta usted de acuerdo con bla bla bla",
  options":[
    {"option": "uno"},
    {"option": "dos"}    
  ]
}

donde cada elemento del array options, es un objeto
*/

function convertQuestion(body){

  let question = new Object();

  //almacenamos el nombre que viene en el body y creamos un arreglo
  question.name = body.name;
  question.options =  new Array();

  //por cada elemento del array de opciones, se crea un nuevo objeto
  for (var i = 0; i < body.options.length; i++){
    let value = new Object();
    value.option = body.options[i];
    question.options.push(value);
  }
  return question;
}



module.exports = {
  getAllPolls,
  newPoll,
  deletePoll,
  getCompleteQuestions,
  getSimpleQuestions,
  addQuestion,
  getPollById,
  getPollsActive,
  getPollStats
}

/*
Test:

{
  "created_by": "5b9eb3cc2ca71c1ebec8f848",
  "description": "Esto es una encuesta de estadisticas",
  "questions":[
    {
      "name": "Esta usted de acuerdo con bla bla bla",
      "options":[
        {"option": "uno", "rate": 30},
        {"option": "dos", "rate": 20}    
      ]
    },
    {
      "name": "Esta usted de acuerdo con bla bla bla 2",
      "options":[
        {"option": "tres", "rate": 30},
        {"option": "cuatro", "rate": 50},
        {"option": "cinco",  "rate": 100}    
      ]
    }
  ]
}
*/