const { MongoClient, ObjectID } = require("mongodb");

MongoClient.connect(
  "mongodb://localhost:27017/TodoApp",
  (error, client) => {
    if (error) {
      return console.log("Unable to connect to server");
    }
    console.log("Connected to server");
    const db = client.db("TodoApp");

    // db.collection("Todos").insertOne(
    //   {
    //     text: "Something to do",
    //     completed: false
    //   },
    //   (error, result) => {
    //     if (error) {
    //       return console.log("Could not insert data", error);
    //     }
    //     console.log(JSON.stringify(result.ops, undefined, 2));
    //   }
    // );

    // db.collection("Users").insertOne(
    //   {
    //     name: "Isaac",
    //     age: 26,
    //     location: "Hamilton"
    //   },
    //   (error, result) => {
    //     if (error) {
    //       return console.log("Cound not insert data");
    //     }
    //     console.log(JSON.stringify(result.ops, undefined, 2));
    //     console.log(result.ops[0]._id.getTimestamp());
    //   }
    // );

    client.close();
  }
);
