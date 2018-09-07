const expect = require("expect");
const request = require("supertest");
const { ObjectID } = require("mongodb");

const { app } = require("../server");
const { Todo } = require("../models/todo");

const todos = [
  { _id: new ObjectID(), text: "First todo" },
  { _id: new ObjectID(), text: "Second todo" }
];

beforeEach(done => {
  Todo.remove({})
    .then(() => {
      return Todo.insertMany(todos);
    })
    .then(() => {
      done();
    });
});

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
