var {TodoAdded, TodoCompleted, TodoList, TodoListCompleted, TodoListCreated} = require("../todolist");

var uuidv4 = require('uuid/v4');
var assert = require('assert');

var MockAdapter = require('axios-mock-adapter');
var axios = require('axios');
var mock = new MockAdapter(axios);
var {Serialized} = require("@serialized/serialized-client")

describe('TodoList', function () {

  it('should reject todos after it is completed', function () {

    var todoListId = uuidv4();

    let todoId = uuidv4();
    var events = [
      new TodoListCreated(todoListId, 'Xmas Gifts'),
      new TodoAdded(todoListId, todoId, 'A new computer'),
      new TodoCompleted(todoListId, todoId),
      new TodoListCompleted(todoListId),
    ];

    let todoList = new TodoList(uuidv4());
    todoList.fromEvents({events, aggregateVersion: 2});
    assert.throws(
        () => {
          todoList.addTodo(uuidv4(), 'Too late to add more todos..')
        },
        /cannot be changed/
    );

  });

  it('should emit one event when list is new', function () {
    let todoList1 = new TodoList(uuidv4());
    todoList1.createList("Xmas gifts");
    assert.equal(1, todoList1.getUncommittedEvents().length);
  });

  it('should fail if empty list name', function () {
    assert.throws(
        () => {
          let todoList = new TodoList(uuidv4());
          todoList.createList("")
        },
        /Name must have length/
    );
  });

});
