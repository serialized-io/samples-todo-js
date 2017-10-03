## Serialized IO Node.js Todo example

An example application showcasing the basic usage of the Event Sourcing API and the Projection API of Serialized IO.

If you want to see the application in action, go to [https://serialized-todo-demo.herokuapp.com/](https://serialized-todo-demo.herokuapp.com/)

- Register for a free account at [https://serialized.io](https://serialized.io) to get your access keys to the API (if you haven't already).

- Clone this repository and make sure you can run the application locally:

```bash
# Install all dependencies
npm install

# Start the server
SERIALIZED_ACCESS_KEY=<YOUR_ACCESS_KEY> \
SERIALIZED_SECRET_ACCESS_KEY=<YOUR_SECRET_ACCESS_KEY> \
npm run start
```

The application should now be accessible at [http://localhost:3000](http://localhost:3000)

- Create the projection definitions that are used to present the data in the application:

This will create a *single* projection for each todo list that is created, making it possible to list all todo lists and also view them in detail.

```bash
curl -i -X POST https://api.serialized.io/projections/definitions \
  --header "Content-Type: application/json" \
  --header "Serialized-Access-Key: <YOUR_KEY_HERE>" \
  --header "Serialized-Secret-Access-Key: <YOUR_KEY_HERE>" \
  --data '
{
  "projectionName": "lists",
  "feedName": "list",
  "handlers": [
    {
      "eventType": "TodoListCreatedEvent",
      "functions": [
        { "function": "set", "eventSelector": "$.event.name", "targetSelector": "$.projection.name" },
        { "function": "set", "eventSelector": "$.aggregateId", "targetSelector": "$.projection.listId" }
      ]
    },
    {
      "eventType": "TodoAddedEvent",
      "functions": [
        { "function": "prepend", "targetSelector": "$.projection.todos" }
      ]
    },
    {
      "eventType": "TodoCompletedEvent",
      "functions": [
        { "function": "merge", "targetSelector": "$.projection.todos[?]", "targetFilter": "[?(@.todoId == $.event.todoId)]", "rawData": {"status" : "COMPLETED"} }
      ]
    },
    {
      "eventType": "TodoListCompletedEvent",
      "functions": [
        { "function": "set", "targetSelector": "$.projection.status", "rawData": "COMPLETED" }
      ]
    }
  ]
}
'
```

#### Todo List statistics projection
This will create an *aggregated* projection that will track statistics **across** all todo lists, demonstrating how you can use projections for different reporting use-cases.

```bash
curl -i -X POST https://api.serialized.io/projections/definitions \
  --header "Content-Type: application/json" \
  --header "Serialized-Access-Key: <YOUR_KEY_HERE>" \
  --header "Serialized-Secret-Access-Key: <YOUR_KEY_HERE>" \
  --data '
{
  "projectionName": "list-stats",
  "feedName": "list",
  "aggregated" : true,
  "handlers": [
    {
      "eventType": "TodoListCreatedEvent",
      "functions": [
        { "function": "inc", "targetSelector": "$.projection.listCount" }
      ]
    },
    {
      "eventType": "TodoAddedEvent",
      "functions": [
        { "function": "inc", "targetSelector": "$.projection.todoCount" }
      ]
    },
    {
      "eventType": "TodoCompletedEvent",
      "functions": [
        { "function": "inc", "targetSelector": "$.projection.completedTodoCount" }
      ]
    }
  ]
}
'
```

### Deploy to Heroku

You can easily deploy this application to your own Heroku account if you want to try it out some more.

You need a Heroku account, then it's as simple as running the following:

```bash
$ heroku login
$ heroku create
$ heroku git:remote -a '<YOUR_APP_NAME>'
$ heroku config:set SERIALIZED_ACCESS_KEY=<YOUR_ACCESS_KEY>
$ heroku config:set SERIALIZED_SECRET_ACCESS_KEY=<YOUR_SECRET_ACCESS_KEY>
$ heroku open
```