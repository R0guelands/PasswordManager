document.getElementById("buttonSubmit").addEventListener("click", () => {
    let input = document.getElementById("password");
    let userPassword = input.value;
    sessionStorage.passwordLocal = userPassword;
});