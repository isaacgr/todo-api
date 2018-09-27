require("./config/config.js");

const express = require("express");
const bodyParser = require("body-parser");
const { ObjectId } = require("mongodb");
const _ = require("lodash");
const { mongoose } = require("./db/mongoose");
const { Todo } = require("./models/todo");
const { User } = require("./models/user");
const { authenticate } = require("./middleware/authenticate");
const bcrypt = require("bcryptjs");

const app = express();
const port = process.env.PORT;

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

app.delete("/todos/:id", (request, response) => {
  const params = request.params;
  if (!ObjectId.isValid(params.id)) {
    return response.status(404).send({});
  }
  Todo.findByIdAndRemove(params.id)
    .then(todo => {
      if (!todo) {
        return response.status(404).send({});
      }
      response.status(200).send({ todo });
    })
    .catch(error => {
      return response.status(400).send(error);
    });
});

app.patch("/todos/:id", (request, response) => {
  const params = request.params;
  const body = _.pick(request.body, ["text", "completed"]);
  if (!ObjectId.isValid(params.id)) {
    return response.status(404).send({});
  }
  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }
  Todo.findByIdAndUpdate(
    params.id,
    {
      $set: body
    },
    {
      new: true
    }
  )
    .then(todo => {
      if (!todo) {
        return response.status(404).send({});
      }
      response.send({ todo });
    })
    .catch(error => {
      response.status(400).send({});
    });
});

app.post("/users", (request, response) => {
  const body = _.pick(request.body, ["email", "password"]);
  const user = new User(body);

  user
    .save()
    .then(() => {
      return user.generateAuthToken();
    })
    .then(token => {
      response.header("x-auth", token).send(user);
    })
    .catch(error => {
      response.status(400).send({ error });
    });
});

app.post("/users/login", (request, response) => {
  const body = _.pick(request.body, ["email", "password"]);
  User.findByCredentials(body.email, body.password)
    .then(user => {
      return user.generateAuthToken().then(token => {
        response.header("x-auth", token).send(user);
      });
    })
    .catch(error => {
      response.status(400).send({ error });
    });
});

app.get("/users/me", authenticate, (request, response) => {
  response.send(request.user);
});

app.delete("/users/me/token", authenticate, (request, response) => {
  request.user.removeToken(request.token).then(
    () => {
      response.status(200).send();
    },
    () => {
      response.status(400).send();
    }
  );
});

app.listen(port, () => {
  console.log("Server started");
});

module.exports = { app };
