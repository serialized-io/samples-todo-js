class TodoListView {

  constructor(listId, title, todos, completed) {
    this.title = title;
    this.listId = listId;
    this.todos = todos;
    this.completed = completed;
  }

  static fromProjection(todoListProjection) {
    var todos = [];
    if (todoListProjection.todos) {
      todos = todoListProjection.todos.map(todo => {
        if (todo.status === "COMPLETED") {
          todo.checked = "checked"
        }
        return todo;
      })
    }
    var completed = todoListProjection.status === "COMPLETED";
    var title = todoListProjection.status === "COMPLETED" ? `${todoListProjection.name} (completed)` : `${todoListProjection.name}`;
    return new TodoListView(todoListProjection.listId, title, todos, completed)
  }

}

module.exports = TodoListView;
