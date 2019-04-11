const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');

const authConfig = require('./config/auth');

const { spawn } = require('child_process');

const app = express();
app.set('view engine', 'ejs');
app.set('views', './src/views');

app.use(express.static('./src/public'));

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

app.listen(3000, () => {
    console.log('Server ok')
    console.log('Running script')
    
    const pyProg = spawn('python', ['/home/roger/tcc/monje/monjescript.py']);

});
