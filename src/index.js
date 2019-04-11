const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');

const authConfig = require('./config/auth');

const { spawn } = require('child_process');

const app = express();
app.set('view engine', 'ejs');
app.set('views', './src/views');

/* configurar o middleware express.static */
app.use(express.static('./src/public'));

// Inclusão dos Middlewares do projeto, que adiciona features para tratar os requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: authConfig.secret,
  resave: true,
  saveUninitialized: true
}))


require('./controllers/index.js')(app);
require('./controllers/auth.js')(app);
require('./controllers/device.js')(app);
require('./controllers/done.js')(app);

/*
app.all('*', function(req, res) {
  	res.redirect('/login')
});
*/

app.listen(3000, () => {
    console.log('Server ok')
    console.log('Running script')
    
    const pyProg = spawn('python', ['/home/roger/tcc/monje/monjescript.py']);

});
