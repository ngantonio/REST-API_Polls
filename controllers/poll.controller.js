const Poll = require('../models/poll.model');


function getAllPolls(req,res){
  Poll.find({}, (err, polls)=>{
    if(err) 
      return res.status(500).json({message:"Error al realizar la peticion", err});
    if(!polls) 
      return res.status(404).json({message:"No hay encuestas disponibles"});

    res.status(200).json({polls});
  });
}

function newPoll(req, res){

  let poll = new Poll();
  poll.created_by = "5b9eb3cc2ca71c1ebec8f848",
  poll.description = req.body.description,
  poll.questions = req.body.questions

  poll.save((err, pollStored)=>{

    if(err)
      res.status(500).json({message:"Error al almacenar en la base de datos!", err}); 
    res.status(200).json({message:"La encuesta se ha recibido correctamente!", _id: `${ pollStored._id }`});
  });
}


function deletePoll(req, res) {

  let pollId = req.params.pollId;

  Poll.findById(pollId, (err, poll)=>{
    
    if(err) return res.status(500).json({message:"Error al localizar Encuesta!", err});  
    if(!poll) return res.status(404).json({message: `La encuesta bajo el id "${ pollId }" no existe en la base de datos...`});

    Poll.deleteOne((err)=>{
      res.status(200).json({message:"Hecho!"});
    });
    
  });
}

function getPollById(req, res) {

  let pollId = req.params.pollId;
  Poll.findById(pollId, (err, poll)=>{
    
    if(err) 
      return res.status(500).json({message:"Error al realizar la busqueda!", err});  
    if(!poll) 
      return res.status(404).json({message: `No existe la encuesta bajo el id "${ pollId }"`});

    res.status(200).json({poll});
  });
  
}


function getCompleteQuestions(req, res){

  let pollId = req.params.pollId;

  Poll.findById(pollId, (err, poll)=>{
      
    if(err) 
      return res.status(500).json({message:"Error al realizar la busqueda!", err});  
    if(!poll.questions) 
      return res.status(404).json({message: `Esta encuenta, no tiene ninguna pregunta"`});

    res.status(200).json(poll.questions );
  });

}

function getSimpleQuestions(req, res){

  let pollId = req.params.pollId;
  let simpleQuestions = new Array();

  Poll.findById(pollId, (err, poll)=>{
      
    if(err) 
      return res.status(500).json({message:"Error al realizar la busqueda!", err});  
    if(!poll.questions) 
      return res.status(404).json({message: `Esta encuesta, no tiene ninguna pregunta"`});

      for (var i=0; i< poll.questions.length; i++){
        let questions = new Object();
        questions.name = String;
        questions.answers= new Array();
        
        questions.name = poll.questions[i].name;
        for (var j=0; j< poll.questions[i].options.length; j++){
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
function addQuestion(req, res){

  let pollId = req.params.pollId;
  let newQuestion = req.body;

  //buscamos la encuesta para extraer el arreglo de preguntas
  Poll.findById(pollId, (err, poll)=>{
      
    if(err) 
      return res.status(500).json({message:"Error al realizar la busqueda!", err});  
    if(!poll.questions) 
      return res.status(404).json({message: `Esta encuesta, no tiene ninguna pregunta"`});

    let newArray = poll.questions;
    newArray.push(newQuestion);

    //actualizamos solo el array de questions
    Poll.updateOne({ _id: pollId}, { $set: { questions: newArray }},(err, rows)=>{
      
      if(err) 
        return res.status(500).json({message:"Error al actualizar!", err});  
      res.status(200).json(rows);
    });
  });

}

function updatePoll(req,res){

  let pollId = req.params.productId;
  let newPoll = req.body;

    Poll.findByIdAndUpdate(pollId, newPoll, (err, pollUpdated)=>{
      
      if(err) 
        return res.status(500).json({message:"Error al localizar la encuesta!", err});    
      res.status(200).json({pollUpdated});
    });
}
  
function getPollsActive(req,res){

  Poll.find({
    'expired_at': {$gte: Date.now()}
  }, (err, polls)=>{
    if(err) 
      return res.status(500).json({message:"Error al realizar la peticion", err});
    if(!polls) 
      return res.status(404).json({message:"No hay encuestas disponibles"});

    res.status(200).json({polls});
  });
}

/* la respuesta mas votada, la respueta menos votada y la cantidad de veces que la encuesta fue tomada */

function getPollStats(req, res){

  pollId = req.params.pollId;
  stats = new Array();

  Poll.findById(pollId, (err, poll)=>{
      
    if(err) 
      return res.status(500).json({message:"Error al realizar la busqueda!", err});  
    if(!poll.questions) 
      return res.status(404).json({message: `Esta encuenta, no tiene ninguna pregunta"`});

    for (var i=0; i< poll.questions.length; i++){
      question = new Object();
      question.question = poll.questions[i].name;
      question.stats = moreVoted(poll.questions[i]);
      stats.push(question);
    }
    res.status(200).json(stats);
  });

  

}

function moreVoted(array){

  let m_voted = new Object();
  let answer = String;
  //let rate = Number;
  let mayor = -1000;
  let acum = 0;

  //console.log(array.options);

  for (var i=0; i< array.options.length; i++){
    let rate = array.options[i].rate;
    if(rate >mayor){
      mayor = rate;
      answer = array.options[i].option
    }    
    acum = acum + rate;   
  }
  m_voted.winner_option =  answer;
  m_voted.rate = mayor;
  m_voted.percent = (mayor/acum)*100;

  return m_voted;
}

/*
  
function getAllRatesByPoll(req, res){
*/

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