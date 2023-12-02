let reg_log = true;

$("#reg-log").on("click", () => {
    if (reg_log) {
        reg_log = false;
        $("#sign_up").show(500);
        $("#sign_in").hide(500);
    } else {
        reg_log = true;
        $("#sign_up").hide(500);
        $("#sign_in").show(500);
    }
})

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function change_profile(event, element, img_id) {
    var ele_id = element.id;

    prf_pic = document.getElementById(img_id);
    var file = document.getElementById(ele_id).files;
    if (file.length > 0) {
        var filereader = new FileReader()
        filereader.onload = function (event) {
            prf_pic.setAttribute("src", event.target.result);
        }
        filereader.readAsDataURL(file[0]);
    }
}

$("#sign_in").submit(() => {
    $("#sign_in_error").fadeOut(300);
    let data = {
        "username": $("#username_in").val(),
        "password": $("#password_in").val()
    };

    fetch("/user/api/signin/", {
        headers: {
            "X-CSRFToken": getCookie("csrftoken"),
            "Content-Type": "application/json"
        },
        method: "post",
        body: JSON.stringify(data)
    }).then(resp => {
        return resp.json()
    }).then(data => {
        if (data.code == "success") {
            location.reload();
        } else if (data.code == "error") {
            $("#sign_in_error").fadeIn(300);
        }
    })
    
    return false;
})

$("#sign_up").submit(() => {
    $("#sign_up_error").hide(100);

    let username = $("#username_up").val();
    let email = $("#email_up").val();
    let password = $("#password_up").val();
    let re_password = $("#repassword_up").val();
    let avatar = $("#avatar").prop("files");

    let data = new FormData()

    data.append("username", username);
    data.append("email", email);
    data.append("password", password);
    data.append("re_password", re_password);
    data.append("avatar", avatar[0]);

    fetch("/user/api/signup/", {
        headers: {
            "X-CSRFToken": getCookie("csrftoken")
        },
        method: "post",
        body: data
    }).then(resp => {
        return resp.json()
    }).then(data => {
        if (data.code == "success") {
            $("#reg-log").click();
            $(':input', '#sign_up')
                .not(':button, :submit, :reset, :hidden')
                .val('');
            $("#avatar").val(null);
            $("#avatar_img").attr('src', '/static/imgs/user/user.png');

            $("#sign_up_success").show(200);
            setTimeout(() => {
                $("#sign_up_success").hide(200);
            }, 10000)

        } else if (data.code == "error") {
            if (data.errors.avatar) {
                $("#sign_up_error").text("Please upload your profile picture");
                $("#sign_up_error").show(300);
                return false;
            }
            if (data.errors.email) {
                $("#sign_up_error").text("Given email already exist");
                $("#sign_up_error").show(300);
                return false;
            }
            if (data.errors.username) {
                $("#sign_up_error").text("Given username aleady exist");
                $("#sign_up_error").show(300);
                return false;
            }
            if (data.errors.password) {
                $("#sign_up_error").text("Password not valid");
                $("#sign_up_error").show(300);
                return false;
            }
            if (data.errors.re_password) {
                $("#sign_up_error").text("Password fields don't match.");
                $("#sign_up_error").show(300);
                return false;
            }
        }
    });

    return false;
})