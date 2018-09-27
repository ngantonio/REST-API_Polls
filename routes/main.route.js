const express = require('express');
const authGuard = require('../middlewares/guard');
const authController = require('../controllers/auth.controller');

const api = express.Router();

api.post('/signUp', authController.signUp);
api.post('/signIn', authController.signIn);

api.get('/private',authGuard.isAuth, (req, res)=>{
  res.status(200).json({ messaje:"tienes acceso!"});
});

module.exports = api;

/*

Test Login:
{
  "email": "gabriel@hola.com",
  "displayName": "Gabriel",
  "password": "password"
}
*/
