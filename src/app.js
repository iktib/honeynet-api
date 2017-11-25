var mongoose = require('mongoose');
var passport = require('passport');
var config = require('./config/database');
var favicon = require('serve-favicon');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var session = require('express-session');
var cors = require('cors');
var fs = require('fs');
var path = require('path');
var morgan = require('morgan');
var logger = morgan('combined');

var index = require('./routes/index');
var users = require('./routes/users');
var honeyTypes = require('./routes/honeyTypes');
var honeyNotes = require('./routes/honeyNotes');
var honeyActivity = require('./routes/honeyActivity');

var fcm = require('./routes/fcm');

var app = express();

app.use(cors());

// app.use(morgan('dev'))

// const logTemplate = ':method on url ":url" with status ":status" -> :response-time ms';
const logTemplate = 'common';

var streamInfo = new fs.createWriteStream(path.join(__dirname, 'info.log'), {
  flags: 'a'
});
var streamError = new fs.createWriteStream(path.join(__dirname, 'errors.log'), {
  flags: 'a'
});

app.use(morgan(
  logTemplate, {
    skip: function (req, res) {
      return res.statusCode < 400;
    },
    stream: streamError
  }
));

app.use(morgan(
  logTemplate, {
    skip: function (req, res) {
      return res.statusCode > 200;
    },
    stream: streamInfo
  }
));

mongoose.Promise = global.Promise;
mongoose.connect(config.database, {
  useMongoClient: true
});

var db = mongoose.connection;

app.use(passport.initialize());

app.get('/', function (req, res) {
  res.status(200).send('all is okay');
  // res.status(400).send('all is bad');
});

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

app.set(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(cookieParser());
app.use(expressValidator());
app.use(express.static(path.join(__dirname, 'public')))

/* Routes */
app.use('/', index);

app.use('/api/users', users);
app.use('/api/honeyTypes', honeyTypes);
app.use('/api/honeyNotes', honeyNotes);
app.use('/api/honeyActivity', honeyActivity);
app.use('/api/fcm', fcm);


app.use(function (err, req, res, next) {
  if (err) {
    res.locals.message = err.message
    res.locals.error = req.app.get('env') === 'development' ? err : {}
    res.status(err.status || 500);
    res.render('error');
  } else {
    res.header("Content-Type", "application/json; charset=utf-8");
    res.status(200);
    // res.writeHeader(200 , {"Content-Type" : "text/html; charset=utf-8"});
  }
})

module.exports = app;

// app.use(bodyParser.json({limit: '50mb'}))