var express = require('express');
var router = express.Router();
var TodoListClient = require('../client');
var client = TodoListClient.defaultClient();
var TodoListView = require('../viewmodel');

router.get('/', async function (req, res) {
  try {
    const lists = await client.findListProjections();
    const views = lists.map(list => TodoListView.fromProjection(list.data));
    res.render('index', {lists: views});
  } catch (error) {
    res.status(400).json({error: error})
  }
});

router.get('/stats', async function (req, res) {
  try {
    let stats = (await client.findListStats()).data;
    res.send(stats);
  } catch (error) {
    res.status(400).json({error: error})
  }
});

module.exports = router;
