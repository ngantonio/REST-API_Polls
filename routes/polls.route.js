
const express = require('express');
const pollController = require('../controllers/poll.controller');
const authGuard = require('../middlewares/guard');
const poll = express.Router();

poll.get('/polls', pollController.getAllPolls);
poll.get('/polls/active', pollController.getPollsActive);
poll.get('/poll/:pollId/stats', pollController.getPollStats);
poll.get('/poll/:pollId/questions', pollController.getSimpleQuestions);
poll.get('/poll/:pollId/questions/details', pollController.getCompleteQuestions);
poll.post('/poll/new', pollController.newPoll);
poll.post('/poll/:pollId/questions/new', pollController.addQuestion);
poll.put('/poll/:pollId',pollController.updatePoll);
poll.delete('/poll/:pollId', pollController.deletePoll);



module.exports = poll;