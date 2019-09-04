var uuidv4 = require('uuid/v4');
var assert = require('assert');
var TodoList = require('../todolist');
var TodoListClient = require('../client');

var MockAdapter = require('axios-mock-adapter');
var axios = require('axios');
var mock = new MockAdapter(axios);

var todoListCreatedEvent = {
  eventType: "TodoListCreatedEvent",
  data: {
    listId: uuidv4(),
    name: "My personal todo list"
  }
};

var buyMilkAddedEvent = {
  eventType: "TodoAddedEvent",
  data: {
    todoId: uuidv4(),
    text: 'Buy milk'
  }
};

var buyMilkCompletedEvent = {
  eventType: "TodoCompletedEvent",
  data: {
    todoId: buyMilkAddedEvent.data.todoId,
  }
};

var todoListCompletedEvent = {
  eventType: "TodoListCompletedEvent",
  data: {
    listId: todoListCreatedEvent.data.listId,
  }
};

var todoListAggregate = {
  aggregateId: todoListCreatedEvent.data.listId,
  aggregateType: "todolist",
  aggregateVersion: 1,
  events: [todoListCreatedEvent]
};

describe('TodoList', function () {

  it('should reject todos after it is completed', function () {
    var events = [
      todoListCreatedEvent,
      buyMilkAddedEvent,
      buyMilkCompletedEvent,
      todoListCompletedEvent
    ];

    var todoList = TodoList.loadStateFrom(events);
    assert.throws(
      () => {
        todoList.addTodo(uuidv4(), 'Too late to add more todos..')
      },
      /cannot be changed/
    );

  });

  it('test client mock', () => {
    var client = new TodoListClient(axios);
    var listId = todoListCreatedEvent.data.listId;

    mock.onGet(`/aggregates/list/${listId}`).reply(200, todoListAggregate);
    mock.onPost(`/aggregates/list/events`).reply(200);

    return client.loadTodoList(listId)
      .then(todoList => todoList.addTodo(uuidv4(), 'Buy bread'))
      .then(events => client.saveListEvents(listId, events))
      .then(response => assert.equal(response, 200))
      .catch(e => {
        throw "Failed to save events"
      })
  });


  it('should emit one event when list is new', function () {
    var events = TodoList.createNew(uuidv4(), "Xmas gifts");
    assert.equal(1, events.length);
  });

  it('should fail if invalid id', function () {
    assert.throws(
      () => {
        TodoList.createNew("", "Xmas gifts")
      },
      /Invalid listId/
    );
  });

  it('should fail if empty list name', function () {
    assert.throws(
      () => {
        TodoList.createNew(uuidv4(), "")
      },
      /Name must have length/
    );
  });

  it('should fail if undefined name', function () {
    assert.throws(
      () => {
        TodoList.createNew(uuidv4())
      },
      /Name must have length/
    );
  });

});