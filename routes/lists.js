const express = require('express');
const router = express.Router();
const TodoListClient = require('../client');
const client = TodoListClient.defaultClient();
const {TodoList} = require('../todolist');
const TodoListView = require('../viewmodel');

router.get('/:listId', async function (req, res) {
  const listId = req.params.listId;
  try {
    let view = TodoListView.fromProjection((await client.findListProjection(listId)).data);
    res.render('list', view);
  } catch (error) {
    res.status(400).json({error: error})
  }
});

router.post('/commands/create-list', async function (req, res) {
  const {listId, name} = req.body
  const todoList = new TodoList(listId);
  todoList.createList(name);
  try {
    await client.createTodoList(todoList);
    res.sendStatus(200);
  } catch (e) {
    res.status(400).json({error: error})
  }
});

router.post('/commands/create-todo', async function (req, res) {
  const {listId, text, todoId} = req.body;
  const todoList = await client.loadTodoList(listId);
  todoList.addTodo(todoId, text);
  try {
    await client.saveTodoList(todoList);
    res.sendStatus(200);
  } catch (error) {
    res.status(400).json({error: error})
  }
});

router.post('/commands/complete-todo', async function (req, res) {
  let listId = req.body.listId;
  let todoText = req.body.text;
  let todoId = req.body.todoId;
  let todoList = await client.loadTodoList(listId);
  todoList.completeTodo(todoId, todoText);
  try {
    await client.saveTodoList(todoList);
    res.sendStatus(200);
  } catch (error) {
    res.status(400).json({error: error})
  }
});

module.exports = router;
