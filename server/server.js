const express = require("express");
const bodyParser = require("body-parser");
const { ObjectId } = require("mongodb");

const { mongoose } = require("./db/mongoose");
const { Todo } = require("./models/todo");
const { User } = require("./models/user");

const app = express();

app.use(bodyParser.json());

app.post("/todos", (request, response) => {
  const todo = new Todo({ text: request.body.text });
  todo.save().then(
    doc => {
      response.send(doc);
    },
    error => {
      response.status(400).send(error);
    }
  );
});

app.get("/todos", (request, response) => {
  Todo.find().then(
    todos => {
      response.send({ todos });
    },
    error => {
      response.status(400).send(error);
    }
  );
});

app.get("/todos/:id", (request, response) => {
  const params = request.params;
  if (!ObjectId.isValid(params.id)) {
    return response.status(404).send({});
  }
  Todo.findById(params.id)
    .then(todo => {
      if (!todo) {
        return response.status(404).send({});
      }
      response.status(200).send({ todo });
    })
    .catch(error => {
      response.status(400).send({});
    });
});

app.listen(3000, () => {
  console.log("Server started");
});

module.exports = { app };
