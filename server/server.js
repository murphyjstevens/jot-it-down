require('./config/config');

const express = require('express');
const http = require('http');
const {ObjectID} = require('mongodb');
const path = require('path');
const socketIO = require('socket.io');

const {mongoose} = require('./db/mongoose')
const {Note} = require('./models/note');
const {User} = require('./models/user');

const port = process.env.PORT;
const publicPath = path.join(__dirname, '/../public');

var app = express();
var server = http.createServer(app);
var io = socketIO(server);

app.use(express.static(publicPath));

io.on('connection', (socket) => {
  socket.on('login', (params, callback) => {
    User.findByCredentials(params.email, params.password).then((user) => {
      return user.generateAuthToken();
    }).then((token) => {
      callback(null, token);
    }).catch((err) => {
      //err showing up as undefined
      callback("Email and password combination don't match any records.");
    });
  });

  socket.on('signup', (params, callback) => {
    var user = new User({email: params.email, password: params.password});

    user.save().then(() => {
      return user.generateAuthToken();
    }).then((token) => {
      callback(null, token);
    }).catch((err) => {
      callback(err);
    });
  });

  socket.on('save', (params, callback) => {
    User.findByToken(params.userToken).then((user) => {
      if (params.noteId) {
        return Note.findOneAndUpdate({
          _id: params.noteId,
          _creator: user._id
        },{
          $set: {
            "title": params.title,
            "text": params.text
          }
        }, {});
      } else {
        var note = new Note({
          title: params.title,
          text: params.text,
          _creator: user._id
        });
        return note.save();
      }
    }).then(() => {
      callback();
    }).catch((err) => {
      callback(err);
    });
  });

  socket.on('remove', (params, callback) => {
    User.findByToken(params.userToken).then((user) => {
      return Note.findOneAndRemove({
        _id: params.noteId,
        _creator: user._id
      });
    }).then((note) => {
      callback();
    }).catch((err) => {
      callback(err);
    });
  });

  socket.on('updateNoteList', (params, callback) => {
    User.findByToken(params.userToken).then((user) => {
      return Note.find({_creator: user._id});
    }).then((noteList) => {
      callback(null, noteList);
    }).catch((err) => {
      callback(err);
    });
  });
});

server.listen(port, () => {
  console.log(`Started on port ${port}`);
});

module.exports = {app};
