var {Serialized} = require("@serialized/serialized-client")
var {TodoList} = require('./todolist');

class TodoListClient {

  constructor(serializedClient) {
    this.serializedClient = serializedClient
  }

  static defaultClient() {
    // Setup client to use access key headers from environment variables
    const serializedInstance = Serialized.create({
      accessKey: process.env.SERIALIZED_ACCESS_KEY,
      secretAccessKey: process.env.SERIALIZED_SECRET_ACCESS_KEY
    });

    serializedInstance.axiosClient.interceptors.request.use(r => {

      console.log(r.url);

      return r;
    })

    return new TodoListClient(serializedInstance)
  }

  async updateProjections() {
    await this.createStatsProjection();
    await this.createListsProjection();
  }

  async createStatsProjection() {
    try {
      await this.serializedClient.projections.createOrUpdateDefinition({
        projectionName: 'list-stats',
        feedName: 'list',
        aggregated: true,
        handlers: [
          {
            eventType: "TodoListCreated",
            functions: [{function: "inc", targetSelector: "$.projection.listCount"}]
          },
          {
            eventType: "TodoAdded",
            functions: [{function: "inc", targetSelector: "$.projection.todoCount",}]
          },
        ]
      })
    } catch (e) {
      console.log('Error response: ', e.response.data);
    }
  }

  async createListsProjection() {
    try {
      await this.serializedClient.projections.createOrUpdateDefinition({
        projectionName: 'lists',
        feedName: 'list',
        handlers: [
          {
            eventType: "TodoListCreated",
            functions: [
              {function: "set", eventSelector: "$.event.name", targetSelector: "$.projection.name"},
              {function: "set", eventSelector: "$.metadata.aggregateId", targetSelector: "$.projection.listId"}
            ]
          },
          {
            eventType: "TodoAdded",
            functions: [{function: "push", targetSelector: "$.projection.todos"}]
          },
          {
            eventType: "TodoCompleted",
            functions: [{
              function: "set",
              targetSelector: "$.projection.todos[?].status",
              targetFilter: "[?(@.todoId == $.event.todoId)]",
              rawData: "COMPLETED"
            }]
          },
          {
            eventType: "TodoListCompleted",
            functions: [{
              function: "set",
              targetSelector: "$.projection.status",
              rawData: "COMPLETED"
            }]
          },
        ]
      })
    } catch (e) {
      console.log('Error response: ', e.response.data);
    }

  }

  async createTodoList(todoList) {
    await this.serializedClient.aggregates.create(todoList);
  }

  async saveTodoList(todoList) {
    await this.serializedClient.aggregates.save(todoList, true);
  }

  async loadTodoList(listId) {
    let todoList = new TodoList(listId);
    await this.serializedClient.aggregates.load(todoList)
    return todoList;
  }

  async findListProjections() {
    return (await this.serializedClient.projections.listSingleProjections('lists')).projections;
  }

  async findListStats() {
    return await this.serializedClient.projections.getAggregatedProjection('list-stats')
  }

  async findListProjection(listId) {
    return await this.serializedClient.projections.getSingleProjection('lists', listId)
  }

}

module.exports = TodoListClient;
