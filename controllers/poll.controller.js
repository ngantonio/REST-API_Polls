const Poll = require('../models/poll.model');


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
        message: "Error inesperado al realizar la peticion",
        err
      });
    if (!poll)
      return res.status(404).json({
        message: `No existe la encuesta bajo el id "${ pollId }"`
      });

    res.status(200).json({
      poll
    });
  });

}

function newPoll(req, res) {

  let poll = new Poll();
  poll.created_by = "5b9eb3cc2ca71c1ebec8f848",
    poll.description = req.body.description,
    poll.questions = req.body.questions

  poll.save((err, pollStored) => {

    if (err)
      res.status(500).json({
        message: "Error al almacenar en la base de datos",
        err
      });
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
      message: "Error al localizar encuesta!",
      err
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

function updatePoll(req, res) {

  let pollId = req.params.productId;
  let newPoll = req.body;

  Poll.findByIdAndUpdate(pollId, newPoll, (err, pollUpdated) => {

    if (err)
      return res.status(500).json({
        message: "Error inesperado al realizar la actualización",
        err
      });
    res.status(200).json({
      pollUpdated
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
        message: "Error inesperado al realizar la peticion",
        err
      });
    if (!polls)
      return res.status(404).json({
        message: "No existen encuestas activas actualmente"
      });

    res.status(200).json({
      polls
    });
  });
}

/* la respuesta mas votada, la respueta menos votada y la cantidad de veces que la encuesta fue tomada */

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
      return res.status(500).json({
        message: "Error inesperado al realizar la peticion",
        err
      });
    if (!poll.questions)
      return res.status(404).json({
        message: `Esta encuesta no tiene preguntas disponibles`
      });

    res.status(200).json(poll.questions);
  });

}

function getSimpleQuestions(req, res) {

  let pollId = req.params.pollId;
  let simpleQuestions = new Array();

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
      let questions = new Object();
      questions.name = String;
      questions.answers = new Array();

      questions.name = poll.questions[i].name;
      for (var j = 0; j < poll.questions[i].options.length; j++) {
        let options = new Object();
        options.option = poll.questions[i].options[j].option;
        questions.answers.push(options);
      }
      simpleQuestions.push(questions);
    }

    res.status(200).json(simpleQuestions);
  });

}
//se puede modificar para que reciba un arreglo de questions
function addQuestion(req, res) {

  let pollId = req.params.pollId;
  let newQuestion = req.body;

  //buscamos la encuesta para extraer el arreglo de preguntas
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

    let newArray = poll.questions;
    newArray.push(newQuestion);

    //actualizamos solo el array de questions, añadiendo la nueva pregunta
    Poll.updateOne({
      _id: pollId
    }, {
      $set: {
        questions: newArray
      }
    }, (err, rows) => {

      if (err)
        return res.status(500).json({
          message: "Error inesperado al realizar la actualización",
          err
        });
      res.status(200).json(rows);
    });
  });

}

/* PRIVATE */
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


module.exports = {
  getAllPolls,
  newPoll,
  deletePoll,
  getCompleteQuestions,
  getSimpleQuestions,
  updatePoll,
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