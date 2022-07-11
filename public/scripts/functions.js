document.getElementById("toggle-password").addEventListener("click", () => {
    
    if (this.checked) {
        password.type = "text";
    } else {
        password.type = "password";
    }

});

document.getElementById("randomTextGenerator").addEventListener("click", () => {

    const password = document.getElementById("password");
    let chars = "abcdefghijklmnopqrstuvwxyz!@#$%^&*()-+<>ABCDEFGHIJKLMNOP1234567890";
    let pass = "";

    for (let x = 0; x < 18; x++) {
        let i = Math.floor(Math.random() * chars.length);
        pass += chars.charAt(i);
    }

    if (togglePassword.checked == false) {
        togglePassword.checked = !togglePassword.checked;
    }

    document.getElementById('password').value = pass;
    password.type = "text";

});

document.getElementById("submit").addEventListener("click", () => {

    document.getElementById("userPass").value = sessionStorage.passwordLocal;

});

var today = new Date();
document.getElementById("todayDate").value = today;