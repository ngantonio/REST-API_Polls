const express = require('express');
const bodyParser = require('body-parser');
const hbs = require('express-handlebars');

const app = express();


/* Middlewares */
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

/***** Rutas y endpoints*****/

/* main routes */
const api = require('./routes/main.route');
app.use('/api', api);

/*polls routes */
const poll = require('./routes/polls.route');
app.use('/api', poll);


/****** vistas ******/
app.get('/login', (req, res)=>{
  res.render('login');
});

app.get('/signUp', (req, res)=>{
  res.render('signup');
});

/****** configuracion el motor de plantillas handlebars ******/
app.engine('.hbs', hbs({
  defaultLayout: 'default',
  extname: '.hbs'
}));
app.set('view engine', '.hbs');


module.exports = app;