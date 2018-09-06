const { ObjectID } = require("mongodb");
const { mongoose } = require("../server/db/mongoose");
const { Todo } = require("../server/models/todo");
const { User } = require("../server/models/user");

User.remove({}).then(result => {
  console.log(result);
});

// User.findOneAndRemove()
// User.findByIdAndRemove()
