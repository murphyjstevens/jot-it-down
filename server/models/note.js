var mongoose = require('mongoose');

var Note = mongoose.model('Note', {
  title: {
    type: String,
    trim: true
  },
  text: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  _creator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
});

module.exports = {Note};
