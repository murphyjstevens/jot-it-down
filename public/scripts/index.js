// Login Modal
var modal = document.getElementById('login-modal-id');
var span = document.getElementsByClassName("close")[0];

jQuery('#login-button-id').click(function() {
  modal.style.display = "block";
});

span.onclick = function() {
  closeLoginModal();
}

window.onclick = function(event) {
  if (event.target == modal) {
    closeLoginModal();
  }
}

function closeLoginModal() {
  // Reset textbox values
  jQuery('#email').val('');
  jQuery('#password').val('');

  modal.style.display = 'none';
}

//Socket IO
var socket = io();
var userToken;

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

jQuery('#logout-button-id').click(function() {
  setToken(null);
});

jQuery('#login-submit').click(function (e) {
  e.preventDefault();
  console.log('Login clicked');

  var emailTextbox = jQuery('#email');
  var passwordTextbox = jQuery('#password');

  socket.emit('login', {
    email: emailTextbox.val(),
    password: passwordTextbox.val()
  }, function (err, token) {
    if (err) {
      displayLoginErrors('Error logging in');
      return console.log('Error', err);
    }
    console.log('Token', token);
    setToken(token);
    closeLoginModal();
  });
});

jQuery('#signup-submit').click(function (e) {
  e.preventDefault();
  console.log('Signup clicked');

  var emailTextbox = jQuery('#email');
  var passwordTextbox = jQuery('#password');

  var hasValidatedEmail = validateEmail(emailTextbox);
  var hasValidatedPassword = validatePassword(passwordTextbox);

  if (!hasValidatedEmail || !hasValidatedPassword) {
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

socket.on('disconnect', function () {
  console.log('Disconnected from server');
  // userToken = null;
});

jQuery('#email').blur(function () {
  var emailTextbox = jQuery('#email');
  validateEmail(emailTextbox);
});

jQuery('#password').blur(function () {
  var passwordTextbox = jQuery('#password');
  validatePassword(passwordTextbox);
});

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

jQuery("#password").keyup(function(event) {
  if (event.keyCode === 13) {
    jQuery("#login-submit").click();
  }
});

function displayLoginErrors(message, parts) {
  var div = jQuery('<div class="error-message"></div>');

  div.append(jQuery('<h5></h5>').text(message));
  div.append(jQuery('<ul></ul>'));
  if(parts) {
    parts.forEach(function(part) {
      div.append(jQuery('<li></li>').text(part));
    });
  }
  jQuery('#email-field').before(div);
}
