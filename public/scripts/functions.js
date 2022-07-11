const togglePassword = document.getElementById("toggle-password");
const password = document.getElementById("password");

togglePassword.addEventListener("click", () => {

    if (password.type === "password") {
        password.type = "text";
    } else {
        password.type = "password";
    }

});


document.getElementById("randomTextGenerator").addEventListener("click", () => {

    let chars = "abcdefghijklmnopqrstuvwxyz!@#$%^&*()-+ABCDEFGHIJKLMNOP1234567890";
    let pass = "";

    for (let x = 0; x < 18; x++) {
        let i = Math.floor(Math.random() * chars.length);
        pass += chars.charAt(i);
    }

    if (togglePassword.checked == false) {
        togglePassword.checked = !togglePassword.checked;
    }

    password.value = pass;
    password.type = "text";

});

document.getElementById("submit").addEventListener("click", () => {

    document.getElementById("userPass").value = sessionStorage.passwordLocal;

});

if (document.getElementById("date")) {
    document.getElementById("date").value = new Date().toLocaleDateString();
}