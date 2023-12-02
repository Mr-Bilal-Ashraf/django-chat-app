$("#sign_in").submit(() => {
    $("#sign_in_error").fadeOut(300);
    let username = $("#username_in").val();
    let password = $("#password_in").val();
    console.log(username, password);
    $("#sign_in_error").fadeIn(300);
    return false;
})

$("#sign_up").submit(() => {
    let username = $("#username_up").val();
    let email = $("#email_up").val();
    let password = $("#password_up").val();
    let repassword = $("#repassword_up").val();

    $("#sign_up_error").fadeOut(300);
    if(password != repassword) {
        console.log('yahoo')
        $("#sign_up_error").text("Password don't match.");
        $("#sign_up_error").fadeIn(300);
        return false;
    }

    return false;
})