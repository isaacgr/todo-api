const { User } = require("../models/user");

const authenticate = (request, response, next) => {
  const token = request.header("x-auth");

  User.findByToken(token)
    .then(user => {
      if (!user) {
        return Promise.reject();
      } else {
        request.user = user;
        request.token = token;
        next();
      }
    })
    .catch(error => {
      response.status(401).send();
    });
};

module.exports = { authenticate };
