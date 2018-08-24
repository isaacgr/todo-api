const { MongoClient, ObjectID } = require("mongodb");

MongoClient.connect(
  "mongodb://localhost:27017/TodoApp",
  (error, client) => {
    if (error) {
      return console.log("Unable to connect to server");
    }
    console.log("Connected to server");
    const db = client.db("TodoApp");

    db.collection("Users")
      .find({ name: "Isaac" })
      .toArray()
      .then(
        user => {
          console.log(JSON.stringify(user, undefined, 2));
        },
        error => {
          console.log("Unable to fetch todos", error);
        }
      );

    // client.close();
  }
);
