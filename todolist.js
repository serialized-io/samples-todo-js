var {AggregateRoot} = require("@serialized/serialized-client")

class TodoListCreated {
  constructor(todoListId, name) {
    this.eventType = 'TodoListCreated';
    this.data = {
      todoListId,
      name
    }
  }
}

class TodoListCompleted {
  constructor(todoListId) {
    this.eventType = 'TodoListCompleted';
    this.data = {
      todoListId,
    }
  }
}

class TodoAdded {
  constructor(todoListId, todoId, text) {
    this.eventType = 'TodoAdded';
    this.data = {
      todoListId, todoId, text,
    };
  }
}

class TodoCompleted {
  constructor(todoListId, todoId, text) {
    this.eventType = 'TodoCompleted';
    this.data = {
      todoListId: todoListId,
      todoId: todoId,
      text: text,
    };
  }
}

class TodoList extends AggregateRoot {

  constructor(todoListId) {
    super(todoListId, 'list')
    if (!todoListId || todoListId.length !== 36) throw "Invalid listId";
    this.todoListId = todoListId;
    this.todos = [];
    this.todosLeft = [];
    this.completed = false
  }

  createList(name) {
    if (!name || name.length < 5) throw "Name must have length >= 5";
    this.saveEvents([new TodoListCreated(this.todoListId, name)])
  }

  addTodo(todoId, text) {
    if (this.completed) throw "List cannot be changed since it has been completed";
    if (text === undefined || text.length < 5) throw "Text must have length > 4";
    var todo = {todoId: todoId, text: text};
    this.saveEvents([new TodoAdded(this.aggregateId, todoId, text)]);
  }

  completeTodo(todoId) {
    if (this.todosLeft.indexOf(todoId) > -1) {
      var events = [new TodoCompleted(this.aggregateId, todoId)];
      if (this.todosLeft.length === 1) {
        events.push(new TodoListCompleted(this.todoListId))
      }
      this.saveEvents(events);
    } else {
      // Don't emit event if already completed
      return []
    }
  }

  handleTodoListCreated(event) {
    this.todoListId = event.data.todoListId;
    this.name = event.data.name
  }

  handleTodoAdded(event) {
    this.todos.unshift({text: event.data.text, todoId: event.data.todoId});
    this.todosLeft.unshift(event.data.todoId)
  }

  handleTodoListCompleted(event) {
    this.completed = true
  }

  handleTodoCompleted(event) {
    // Remove from list
    this.todosLeft = this.todosLeft.filter(function (todoId) {
      return todoId !== event.data.todoId;
    })
  }
}

module.exports = {TodoList, TodoAdded, TodoListCreated, TodoCompleted, TodoListCompleted};
