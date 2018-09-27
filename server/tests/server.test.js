const expect = require("expect");
const request = require("supertest");
const { ObjectID } = require("mongodb");

const { app } = require("../server");
const { Todo } = require("../models/todo");
const { todos, populateTodos, users, populateUsers } = require("./seed/seed");
const { User } = require("../models/user");

beforeEach(populateUsers);
beforeEach(populateTodos);

describe("POST /todos", () => {
  it("should create a new todo", done => {
    const text = "Test todo text";
    request(app)
      .post("/todos")
      .send({ text })
      .expect(200)
      .expect(response => {
        expect(response.body.text).toBe(text);
      })
      .end((error, response) => {
        if (error) {
          done(error);
        }
        Todo.find({ text })
          .then(todos => {
            expect(todos.length).toBe(1);
            expect(todos[0].text).toBe(text);
            done();
          })
          .catch(error => console.log(error));
      });
  });

  it("should not create todo with invalid body data", done => {
    request(app)
      .post("/todos")
      .send({})
      .expect(400)
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        Todo.find()
          .then(todos => {
            expect(todos.length).toBe(2);
            done();
          })
          .catch(error => {
            console.log(error);
          });
      });
  });
});

describe("GET /todos", () => {
  it("should get all todos", done => {
    request(app)
      .get("/todos")
      .expect(200)
      .expect(response => {
        expect(response.body.todos.length).toBe(2);
      })
      .end(done);
  });
});

describe("GET /todos/:id", () => {
  it("should return todo doc", done => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect(response => {
        expect(response.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
  });

  it("should return 404 if todo not found", done => {
    const id = new ObjectID();
    request(app)
      .get(`/todos/${id}`)
      .expect(404)
      .end(done);
  });

  it("should return 404 for invalid id", done => {
    request(app)
      .get("/todos/123")
      .expect(404)
      .end(done);
  });
});

describe("DELETE /todos/:id", () => {
  it("should remove a todo", done => {
    var id = todos[1]._id.toHexString();
    request(app)
      .delete(`/todos/${id}`)
      .expect(200)
      .expect(response => {
        expect(response.body.todo._id).toBe(id);
      })
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        Todo.findById(id)
          .then(todo => {
            expect(todo).toBeFalsy();
            done();
          })
          .catch(error => {
            console.log(error);
          });
      });
  });

  it("should return 404 if todo not found", done => {
    const id = new ObjectID();
    request(app)
      .delete(`/todos/${id}`)
      .expect(404)
      .end(done);
  });

  it("should return 404 for invalid id", done => {
    request(app)
      .delete("/todos/123")
      .expect(404)
      .end(done);
  });
});

describe("PATCH /todos/:id", () => {
  it("should update the todo", done => {
    const id = todos[0]._id;
    request(app)
      .patch(`/todos/${id}`)
      .send({ text: "updated text", completed: true })
      .expect(200)
      .expect(response => {
        expect(response.body.todo.text).toBe("updated text");
        expect(response.body.todo.completed).toBe(true);
        expect(typeof response.body.todo.completedAt).toBe("number");
      })
      .end(done);
  });

  it("should clear compledAt when todo is not completed", done => {
    const id = todos[1]._id;
    request(app)
      .patch(`/todos/${id}`)
      .send({ text: "second text", completed: false })
      .expect(200)
      .expect(response => {
        expect(response.body.todo.text).toBe("second text");
        expect(response.body.todo.completed).toBe(false);
        expect(response.body.todo.completedAt).toBeFalsy();
      })
      .end(done);
  });
});

describe("GET /users/me", () => {
  it("should return user if authenticated", done => {
    request(app)
      .get("/users/me")
      .set("x-auth", users[0].tokens[0].token)
      .expect(200)
      .expect(response => {
        expect(response.body._id).toBe(users[0]._id.toHexString());
        expect(response.body.email).toBe(users[0].email);
      })
      .end(done);
  });
  it("should return a 401 if not authenticated", done => {
    request(app)
      .get("/users/me")
      .expect(401)
      .expect(response => {
        expect(response.body).toEqual({});
      })
      .end(done);
  });
});

describe("POST /users", () => {
  it("should create a user", done => {
    const email = "example@example.com";
    const password = "123abc!";
    request(app)
      .post("/users")
      .send({ email, password })
      .expect(200)
      .expect(response => {
        expect(response.headers["x-auth"]).toBeTruthy();
        expect(response.body._id).toBeTruthy();
        expect(response.body.email).toBe(email);
      })
      .end(error => {
        if (error) {
          return done(error);
        }
        User.findOne({ email })
          .then(user => {
            expect(user).toBeTruthy();
            expect(user.password).not.toBe(password);
            done();
          })
          .catch(error => {
            done(error);
          });
      });
  });
  it("should return errors if request invalid", done => {
    const email = "isaac";
    const password = "a";
    request(app)
      .post("/users")
      .send({ email, password })
      .expect(400)
      .end(done);
  });
  it("should not create user if email is in use", done => {
    const email = users[0].email;
    const password = "12345ab";
    request(app)
      .post("/users")
      .send({ email, password })
      .expect(400)
      .end(done);
  });
});

describe("POST /users/login", () => {
  it("should return a new auth token for a valid user", done => {
    const email = users[1].email;
    const password = users[1].password;
    request(app)
      .post("/users/login")
      .send({ email, password })
      .expect(200)
      .expect(response => {
        expect(response.headers["x-auth"]).toBeTruthy();
      })
      .end((error, response) => {
        if (error) {
          return done();
        }
        User.findById(users[1]._id)
          .then(user => {
            expect(user.tokens[0]).toMatchObject({
              _id: user.tokens[0]._id,
              access: "auth",
              token: response.headers["x-auth"]
            });
            done();
          })
          .catch(error => {
            done(error);
          });
      });
  });
  it("should return a 400 for an invalid user", done => {
    const email = users[1].email;
    const password = users[1].password + "1";
    request(app)
      .post("/users/login")
      .send({ email, password })
      .expect(400)
      .expect(response => {
        expect(response.headers["x-auth"]).toBeFalsy();
      })
      .end((error, response) => {
        if (error) {
          return done();
        }
        User.findById(users[1]._id)
          .then(user => {
            expect(user.tokens.length).toBe(0);
            done();
          })
          .catch(error => {
            done(error);
          });
      });
  });
});

describe("DELETE /usrs/me/token", () => {
  it("should remove auth token on logout", done => {
    request(app)
      .delete("/users/me/token")
      .set("x-auth", users[0].tokens[0].token)
      .expect(200)
      .expect(() => {
        User.findById(users[0]._id).then(user => {
          expect(user.tokens.length).toBe(0);
        });
      })
      .end(done);
  });
});
