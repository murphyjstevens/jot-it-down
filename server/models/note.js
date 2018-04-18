var mongoose = require('mongoose');

var Note = mongoose.model('Note', {
  title: {
    type: String,
    trim: true
  },
  text: {
    type: String,
    trim: true
  },
  _creator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
});

module.exports = {Note};
