// Login Modal
var modal = document.getElementById('login-modal-id');
var btn = document.getElementById("login-button-id");
var span = document.getElementsByClassName("close")[0];

btn.onclick = function() {
    modal.style.display = "block";
}

span.onclick = function() {
    modal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

//Socket IO
var socket = io();
var userToken;

jQuery('#login-submit').on('click', function (e) {
  e.preventDefault();
  console.log('Login clicked');

  var emailTextbox = jQuery('[name=email]');
  var passwordTextbox = jQuery('[name=password]')

  socket.emit('login', {
    email: emailTextbox.val(),
    password: passwordTextbox.val()
  }, function (err, token) {
    if (err) {
      return console.log('Error', err);
    }
    console.log('Token', token);
    userToken = token;
    modal.style.display = "none";
  });
});

jQuery('#signup-submit').on('click', function (e) {
  e.preventDefault();
  console.log('Signup clicked');

  var emailTextbox = jQuery('[name=email]');
  var passwordTextbox = jQuery('[name=password]')

  socket.emit('signup', {
    email: emailTextbox.val(),
    password: passwordTextbox.val()
  }, function (err, token) {
    if (err) {
      return console.log('Error', err);
    }
    console.log('Token', token);
    userToken = token;
    modal.style.display = "none";
  });
});

socket.on('disconnect', function () {
  console.log('Disconnected from server');
  userToken = undefined;
});
