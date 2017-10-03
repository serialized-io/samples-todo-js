class TodoListView {

  constructor(listId, title, todos, completed) {
    this.title = title
    this.listId = listId
    this.todos = todos
    this.completed = completed
  }

  static fromProjection(projection) {
    var todos = []
    if (projection.todos) {
      todos = projection.todos.map(todo => {
        if (todo.status == "COMPLETED") {
          todo.checked = "checked"
        }
        return todo;
      })
    }
    var completed = projection.status == "COMPLETED" ? true : false
    var title = projection.status == "COMPLETED" ? `${projection.name} (completed)` : `${projection.name}`
    return new TodoListView(projection.listId, title, todos, completed)
  }

}

module.exports = TodoListView