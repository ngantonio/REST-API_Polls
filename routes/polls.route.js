
const express = require('express');
const pollController = require('../controllers/poll.controller');
const authGuard = require('../middlewares/guard');
const poll = express.Router();

/* Todas las encuestas almacenadas*/
poll.get('/polls', pollController.getAllPolls);
/* Todas las encuestas activas, aun no vencidas*/
poll.get('/polls/active', pollController.getPollsActive);
/* dado el Id de una encuesta, regresa un JSON con sus estadisticas*/
poll.get('/poll/:pollId/stats', pollController.getPollStats);
/* dado el Id de una encuesta, regresa un JSON con las preguntas y sus correspondientes opciones de forma resumida */
poll.get('/poll/:pollId/questions', pollController.getSimpleQuestions);
/* dado el Id de una encuesta, regresa un JSON con las preguntas y sus correspondientes opciones de forma completa */
poll.get('/poll/:pollId/questions/details', pollController.getCompleteQuestions);
/* Crea una nueva encuesta */
poll.post('/poll/new', pollController.newPoll);
/* Añade una nueva pregunta, con sus opciones correspondientes a una encuesta.  */
poll.post('/poll/:pollId/questions/new', pollController.addQuestion);
/* Actualiza los datos de una encuesta, dado su Id */
poll.put('/poll/:pollId',pollController.updatePoll);
/* Elimina permanentemente una encuesta */
poll.delete('/poll/:pollId', pollController.deletePoll);


module.exports = poll;