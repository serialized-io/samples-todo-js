var axios = require('axios');
var TodoList = require('./todolist');

class TodoListClient {

  constructor(axios) {
    this.axios = axios
  }

  static defaultClient() {
    // Setup client to use access key headers from environment variables
    var client = axios.create({
      baseURL: 'https://api.serialized.io',
      headers: {
        'Serialized-Access-Key': `${process.env.SERIALIZED_ACCESS_KEY}`,
        'Serialized-Secret-Access-Key': `${process.env.SERIALIZED_SECRET_ACCESS_KEY}`
      }
    });
    return new TodoListClient(client)
  }

  loadTodoList(listId) {
    return this.axios.get(`/aggregates/list/${listId}`)
      .then(response => TodoList.loadStateFrom(response.data.events))
      .catch(error => {
          throw `Failed to load todo list with id ${listId}`
        }
      )
  }

  findListProjections() {
    return this.axios.get('/projections/single/lists/')
      .then(response => {
        return response.data.projections.map(projection => projection.data)
      })
      .catch(error => {
        throw `Failed to load list projections`
      })
  }

  findListStats() {
    return this.axios.get('/projections/aggregated/list-stats')
      .then(response => response.data.data)
      .catch(error => {
        throw `Failed to load list stats for list ${listId}: ${error.status}`
      })
  }

  findListProjection(listId) {
    return this.axios.get(`/projections/single/lists/${listId}`)
      .then(response => response.data.data)
      .catch(error => {
        throw `Failed to load list projection for list ${listId}`
      })
  }

  saveListEvents(aggregateId, events) {
    if (events.length > 0) {
      return this.axios.post('/aggregates/list/' + aggregateId + '/events', {events: events})
        .then(response => response.status)
        .catch(error => {
          throw `Failed to save events for list ${listId}`
        })
    }
  }
}

module.exports = TodoListClient;