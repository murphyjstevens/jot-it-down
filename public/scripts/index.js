// Login Modal
var loginModal = document.getElementById('login-modal-id');

jQuery('#login-button-id').click(function() {
  openLoginModal();
});

jQuery('#close').click(function() {
  closeLoginModal();
});

window.onclick = function(event) {
  if (event.target == loginModal) {
    closeLoginModal();
  }
}

function closeLoginModal() {
  // Reset textbox values
  jQuery('#email').val('');
  jQuery('#password').val('');


  jQuery('#email').removeClass('error');
  jQuery('#password').removeClass('error');
  jQuery('#error-message').remove();

  loginModal.style.display = 'none';
}

//Socket IO
var socket = io();
var userToken;
var notes;
var selectedNote;

// Sockets
socket.on('disconnect', function () {
  console.log('Disconnected from server');
  // userToken = null;
});

// Login Form
jQuery('#logout-button-id').click(function() {
  setToken(null);
});

jQuery('#login-submit').click(function (e) {
  e.preventDefault();
  console.log('Login clicked');
  jQuery('#error-message').remove();

  var emailTextbox = jQuery('#email');
  var passwordTextbox = jQuery('#password');

  socket.emit('login', {
    email: emailTextbox.val(),
    password: passwordTextbox.val()
  }, function (err, token) {
    if (err) {
      displayLoginErrors('Email and password combination is invalid.');
      return console.log('Error', err);
    }
    console.log('Token', token);
    setToken(token);
    closeLoginModal();
    updateNoteList();
    if (notes) {
      setSelectedNote(notes[0]);
    }
  });
});

jQuery('#signup-submit').click(function (e) {
  e.preventDefault();
  console.log('Signup clicked');
  jQuery('#error-message').remove();

  var emailTextbox = jQuery('#email');
  var passwordTextbox = jQuery('#password');

  var hasValidatedEmail = validateEmail(emailTextbox);
  var hasValidatedPassword = validatePassword(passwordTextbox);

  if (!hasValidatedEmail || !hasValidatedPassword) {
    var errorParts = [];
    if (!hasValidatedEmail){
      errorParts.push('Email is not valid');
    }
    if (!hasValidatedPassword){
      errorParts.push('Password is not valid, make sure it is 6 characters long and has 1 letter and 1 number');
    }
    displayLoginErrors('Error signing up', errorParts);
    return;
  }

  socket.emit('signup', {
    email: emailTextbox.val(),
    password: passwordTextbox.val()
  }, function (err, token) {
    if (err) {
      displayLoginErrors('Error signing up');
      return console.log('Error', err);
    }
    console.log('Token', token);
    setToken(token);
    closeLoginModal();
  });
});

jQuery('#email').blur(function () {
  var emailTextbox = jQuery('#email');
  validateEmail(emailTextbox);
});

jQuery('#password').blur(function () {
  var passwordTextbox = jQuery('#password');
  validatePassword(passwordTextbox);
});

jQuery('#password').keyup(function(event) {
  if (event.keyCode === 13) {
    jQuery('#login-submit').click();
  }
});

//End Login Form

// Save button
jQuery('#save').click(function () {
  if(!userToken) {
    return openLoginModal();
  }
  var title = jQuery('#title').val();
  var text = jQuery('#note').val();
  socket.emit('save', {
    userToken,
    title,
    text
  }, function (err) {
    if(err){
      return console.log(err);
    }
    console.log(`Added note with title of ${title}`);
    updateNoteList();
  });
});

//Helper functions
function setToken(token){
  userToken = token;
  if (token) {
    jQuery('#login-button-id').addClass('hide');
    jQuery('#logout-button-id').removeClass('hide');
  } else {
    jQuery('#login-button-id').removeClass('hide');
    jQuery('#logout-button-id').addClass('hide');
  }
}

function setSelectedNote(note){
  selectedNote = note;
  if (selectedNote) {
    jQuery('#title').val(selectedNote.title);
    jQuery('#note').val(selectedNote.text);
  } else {
    jQuery('#title').val('');
    jQuery('#note').val('');
  }
}

function openLoginModal() {
  loginModal.style.display = 'block';
}

function updateNoteList() {
  socket.emit('updateNoteList', {userToken}, function (err, noteList) {
    if(err){
      return console.log(err);
    }
    console.log(noteList);
    var ol = jQuery('#note-list');
    ol.empty();

    noteList ? ol.removeClass('hide') : ol.addClass('hide');
    if (noteList) {
      noteList.forEach(function(note){
        var li = jQuery('<li class="note-item"></li>');
        var noteTitle = (note.title ? note.title : 'Untitled');
        var a = jQuery('<a class="note"></a>').text(noteTitle);
        li.append(a);
        ol.append(li);
      });
    }
    notes = noteList;
  });
}

function validateEmail(emailTextbox) {
  if (emailTextbox.val().match(/^.+@.+\..{2,}$/)) {
    emailTextbox.removeClass('error');
    return true;
  } else {
    emailTextbox.addClass('error');
    return false;
  }
}

function validatePassword(passwordTextbox) {
  if (passwordTextbox.val().match(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d$@$!#%*?&]{6,}$/)) {
    passwordTextbox.removeClass('error');
    return true;
  } else {
    passwordTextbox.addClass('error');
    return false;
  }
}

function displayLoginErrors(message, parts) {
  var div = jQuery('<div class="error-message" id="error-message"></div>');

  div.append(jQuery('<h5></h5>').text(message));
  var ul = jQuery('<ul></ul>');
  if(parts) {
    parts.forEach(function(part) {
      ul.append(jQuery('<li></li>').text(part));
    });
  }
  div.append(ul);
  jQuery('#email-field').before(div);
}
