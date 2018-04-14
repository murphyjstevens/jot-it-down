require('./config/config');

const bodyParser = require('body-parser');
const express = require('express');
const http = require('http');
const _ = require('lodash');
const {ObjectID} = require('mongodb');
const path = require('path');
const socketIO = require('socket.io');

const {authenticate} = require('./middleware/authenticate');
const {mongoose} = require('./db/mongoose')
const {Todo} = require('./models/todo');
const {User} = require('./models/user');

const port = process.env.PORT;
const publicPath = path.join(__dirname, '/../public');

var app = express();
var server = http.createServer(app);
var io = socketIO(server);

app.use(bodyParser.json());
app.use(express.static(publicPath));

io.on('connection', (socket) => {
  socket.on('login', (params, callback) => {
    User.findByCredentials(params.email, params.password).then((user) => {
      return user.generateAuthToken();
    }).then((token) => {
      console.log('token', token);
      callback(null, token);
    }).catch((err) => {
      callback(err);
    });
  });

  socket.on('signup', (params, callback) => {
    var user = new User({email: params.email, password: params.password});
    console.log(`User created with email "${user.email}" and password "${user.password}"`);

    user.save().then(() => {
      return user.generateAuthToken();
    }).then((token) => {
      console.log('token', token);
      callback(null, token);
    }).catch((err) => {
      callback(err);
    });
  });
});

// app.post('/todos', authenticate, (req, res) => {
//   var todo = new Todo({
//     text: req.body.text,
//     _creator: req.user._id
//   });
//
//   todo.save().then((doc) => {
//     res.send(doc);
//   }, (e) => {
//     res.status(400).send(e);
//   });
// });
//
// app.get('/todos', authenticate, (req, res) => {
//   Todo.find({
//     _creator: req.user._id
//   }).then((todos) => {
//     res.send({todos});
//   }, (e) => {
//     res.status(400).send(e);
//   });
// });
//
// app.get('/todos/:id', authenticate, (req, res) => {
//   var id = req.params.id;
//   if (!ObjectID.isValid(id)) {
//     return res.status(404).send();
//   }
//
//   Todo.findOne({
//     _id: id,
//     _creator: req.user._id
//   }).then((todo) => {
//     if (!todo) {
//       return res.status(404).send();
//     }
//     res.send({todo});
//   }, (e) => {
//     res.status(400).send();
//   });
// });
//
// app.delete('/todos/:id', authenticate, (req, res) => {
//   var id = req.params.id;
//   if (!ObjectID.isValid(id)) {
//     return res.status(404).send();
//   }
//
//   Todo.findOneAndRemove({
//     _id: id,
//     _creator: req.user._id
//   }).then((todo) => {
//     if (!todo) {
//       return res.status(404).send();
//     }
//     return res.send({todo});
//   }, (e) => {
//     res.status(400).send();
//   });
// });
//
// app.patch('/todos/:id', authenticate, (req, res) => {
//   var id = req.params.id;
//   var body = _.pick(req.body, ['text', 'completed']);
//
//   if (!ObjectID.isValid(id)) {
//     return res.status(404).send();
//   }
//
//   if (_.isBoolean(body.completed) && body.completed) {
//     body.completedAt = new Date().getTime();
//   } else {
//     body.completed = false;
//     body.completedAt = null;
//   }
//
//   Todo.findOneAndUpdate({
//     _id: id,
//     _creator: req.user._id
//   }, {$set: body}, {new: true}).then((todo) => {
//     if (!todo) {
//       return res.status(404).send();
//     }
//
//     res.send({todo});
//   }).catch((e) => {
//     res.status(400).send();
//   });
// });
//
// app.post('/users', (req, res) => {
//   var body = _.pick(req.body, ['email', 'password']);
//   var user = new User(body);
//
//   user.save().then(() => {
//     return user.generateAuthToken();
//   }).then((token) => {
//     res.header('x-auth', token).send(user);
//   }).catch((e) => {
//     res.status(400).send(e);
//   });
// });
//
// app.get('/users/me', authenticate, (req, res) => {
//   res.send(req.user);
// });
//
// app.post('/users/login', (req, res) => {
//   var body = _.pick(req.body, ['email', 'password']);
//
//   User.findByCredentials(body.email, body.password).then((user) => {
//     return user.generateAuthToken().then((token) => {
//       res.header('x-auth', token).send(user);
//     });
//   }).catch((e) => {
//     res.status(400).send();
//   });
// });
//
// app.delete('/users/me/token', authenticate, (req, res) => {
//   req.user.removeToken(req.token).then(() => {
//     res.status(200).send();
//   }, (e) => {
//     res.status(400).send();
//   });
// });

server.listen(port, () => {
  console.log(`Started on port ${port}`);
});

module.exports = {app};
