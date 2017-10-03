var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var lists = require('./routes/lists');

var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/lists', lists);

// Assert required environment variables are set
if (!process.env.SERIALIZED_ACCESS_KEY) {
  throw "Environment variable SERIALIZED_ACCESS_KEY is not set"
}
if (!process.env.SERIALIZED_SECRET_ACCESS_KEY) {
  throw "Environment variable SERIALIZED_SECRET_ACCESS_KEY is not set"
}

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

function clientErrorHandler(err, req, res, next) {
  if (req.xhr) {
    console.error(err)
    res.status(500).send({ error: 'Something failed!' })
  } else {
    next(err)
  }
}

function errorHandler(err, req, res, next) {
  res.status(err.status)
  res.render('error', { error: err })
}

app.use(clientErrorHandler)
app.use(errorHandler)

module.exports = app;
