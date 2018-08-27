const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (error, client) => {
  if (error) {
    return console.log('Unable to connect to server');
  }
  console.log('Connected to server');
  const db = client.db('TodoApp');

  //   db.collection('Todos')
  //       .findOneAndUpdate({text: 'Eat'}, {$set: {text: 'Eat lunch'}})
  //       .then((result) => {
  //         console.log(result);
  //       })

  db.collection('Users')
      .findOneAndUpdate({name: 'Isaac'}, {$inc: {age: 1}})
      .then(result => {
        console.log(result);
      });

  // client.close();
});
