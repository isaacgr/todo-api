const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (error, client) => {
  if (error) {
    return console.log('Unable to connect to server');
  }
  console.log('Connected to server');
  const db = client.db('TodoApp');

  // deleteMany
  //   db.collection('Todos').deleteMany({text: 'Eat'}).then((result) => {
  //     console.log(result);
  //   })
  // deleteOne
  //   db.collection('Todos').deleteOne({text: 'Something to do'}).then((result)
  //   => {
  //     console.log(result);
  //   })

  // findOneAndDelete
  db.collection('Todos').findOneAndDelete({completed: false}).then(result => {
    console.log(result);
  });

  // client.close();
});
