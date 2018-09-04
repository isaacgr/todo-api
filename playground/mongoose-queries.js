const { ObjectID } = require("mongodb");
const { mongoose } = require("../server/db/mongoose");
const { Todo } = require("../server/models/todo");
const { User } = require("../server/models/user");

const id = "5b892ae8f6bf375da29123a0";
const userId = "5b8534e5af58ce504566e0b4";

if (!ObjectID.isValid(id)) {
  return console.log("Invalid ID");
}

// Todo.find({
//   _id: id
// }).then(todos => {
//   console.log(todos);
// });

// Todo.findOne({
//   _id: id
// }).then(todo => {
//   console.log(todo);
// });

// Todo.findById(id)
//   .then(todo => {
//     if (!todo) {
//       return console.log("ID not found");
//     }
//     console.log(todo);
//   })
//   .catch(error => {
//     console.log(error);
//   });

User.findById(userId).then(user => {
  if (!user) {
    return console.log("Unable to find user");
  }
  console.log(user);
});
