var uuidv4 = require('uuid/v4');

function newEvent(eventType, data) {
  return {
    eventId: uuidv4(),
    eventType: eventType,
    data: data
  }
}

class TodoList {

  constructor() {
    this.todos = [];
    this.todosLeft = [];
    this.completed = false
  }

  static createNew(listId, name) {
    if (!listId || listId.length !== 36) throw "Invalid listId";
    if (!name || name.length < 5) throw "Name must have length >= 5";
    var data = {listId: listId, name: name};
    return [newEvent('TodoListCreatedEvent', data)]
  }

  completeTodo(todoId) {
    if (this.todosLeft.indexOf(todoId) > -1) {
      var todo = {todoId: todoId};
      var events = [newEvent('TodoCompletedEvent', todo)];
      if (this.todosLeft.length === 1) {
        events.push(newEvent('TodoListCompletedEvent'))
      }
      return events
    } else {
      // Don't emit event if already completed
      return []
    }
  }

  addTodo(todoId, text) {
    if (this.completed) throw "List cannot be changed since it has been completed";
    if (text === undefined || text.length < 5) throw "Text must have length > 4";
    var todo = {todoId: todoId, text: text};
    return [newEvent('TodoAddedEvent', todo)]
  }

  'TodoListCreatedEvent'(event) {
    this.name = event.data.name
  }

  'TodoAddedEvent'(event) {
    this.todos.unshift({text: event.data.text, todoId: event.data.todoId});
    this.todosLeft.unshift(event.data.todoId)
  }

  'TodoListCompletedEvent'(event) {
    this.completed = true
  }

  'TodoCompletedEvent'(event) {
    // Remove from list
    this.todosLeft = this.todosLeft.filter(function (todoId) {
      return todoId !== event.data.todoId;
    })
  }

  handleEvent(event) {
    this[event.eventType](event)
  }

  static loadStateFrom(events) {
    var instance = new this.prototype.constructor();
    for (var i = 0, len = events.length; i < len; i++) {
      instance.handleEvent(events[i]);
    }
    return instance
  }
}

module.exports = TodoList;