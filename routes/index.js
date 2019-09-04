var express = require('express');
var router = express.Router();
var TodoListClient = require('../client');
var client = TodoListClient.defaultClient();
var TodoListView = require('../viewmodel');

router.get('/', function (req, res) {
  return client.findListProjections()
    .then(lists => lists.map(list => TodoListView.fromProjection(list)))
    .then(views => res.render('index', { lists: views }))
});

router.get('/stats', function (req, res) {
  return client.findListStats()
    .then(listStats => res.send(listStats))
});

module.exports = router;
