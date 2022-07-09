const password = document.getElementById("password");
const togglePassword = document.getElementById("toggle-password");

togglePassword.addEventListener("click", toggleClicked);

function toggleClicked() {  
  if (this.checked) {
    password.type = "text";
  } else {
    password.type = "password";
  }
}

function randomPassword(length) {
  var chars = "abcdefghijklmnopqrstuvwxyz!@#$%^&*()-+<>ABCDEFGHIJKLMNOP1234567890";
  var pass = "";
  for (var x = 0; x < length; x++) {
      var i = Math.floor(Math.random() * chars.length);
      pass += chars.charAt(i);
  }
  myform.password.value = pass;

  if (togglePassword.checked == false) { 
    togglePassword.checked = !togglePassword.checked;
  }
  
  password.type = "text";
}