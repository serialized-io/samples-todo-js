var express = require('express');
var router = express.Router();

var TodoListClient = require('../client');
var client = TodoListClient.defaultClient();

var TodoList = require('../todolist');
var TodoListView = require('../viewmodel');

router.get('/:listId', function (req, res) {
  var listId = req.params.listId;
  return client.findListProjection(listId)
    .then(list => TodoListView.fromProjection(list))
    .then(view => res.render('list', view))
});

router.post('/commands/create-list', function (req, res) {
  var listId = req.body.listId;
  var name = req.body.name;
  return Promise.resolve(TodoList.createNew(listId, name))
    .then(events => client.saveListEvents(listId, events))
    .then(response => res.sendStatus(200))
    .catch(error => res.sendStatus(400))
});

router.post('/commands/create-todo', function (req, res) {
  var listId = req.body.listId;
  var todoText = req.body.text;
  var todoId = req.body.todoId;
  return client.loadTodoList(listId)
    .then(todoList => todoList.addTodo(todoId, todoText))
    .then(events => client.saveListEvents(listId, events))
    .then(response => res.sendStatus(200))
    .catch(error => res.status(400).json({error: error}))
});

router.post('/commands/complete-todo', function (req, res) {
  var listId = req.body.listId;
  var todoId = req.body.todoId;
  return client.loadTodoList(listId)
    .then(todoList => todoList.completeTodo(todoId))
    .then(events => client.saveListEvents(listId, events))
    .then(response => res.sendStatus(200))
    .catch(error => res.sendStatus(400))
});

module.exports = router;
