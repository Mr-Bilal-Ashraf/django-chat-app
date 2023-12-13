let reg_log = true;
let time_zone_list = {
    'G720': 'Etc/GMT+12',
    'G660': 'Pacific/Niue',
    'G600': 'Pacific/Rarotonga',
    'G540': 'America/Adak',
    'G480': 'America/Anchorage',
    'G420': 'America/Creston',
    'G360': 'America/Denver',
    'G300': 'America/Eirunepe',
    'G240': 'America/Cuiaba',
    'G210': 'America/St_Johns',
    'G180': 'America/Araguaina',
    'G120': 'America/Godthab',
    'G60': 'Atlantic/Cape_Verde',
    'G0': 'Africa/Abidjan',
    'G-60': 'Africa/Casablanca',
    'G-120': 'Africa/Ceuta',
    'G-180': 'Africa/Nairobi',
    'G-210': 'Asia/Tehran',
    'G-240': 'Asia/Tbilisi',
    'G-270': 'Asia/Kabul',
    'G-300': 'Asia/Karachi',
    'G-330': 'Asia/Colombo',
    'G-345': 'Asia/Kathmandu',
    'G-360': 'Asia/Urumqi',
    'G-390': 'Asia/Yangon',
    'G-420': 'Antarctica/Davis',
    'G-480': 'Asia/Brunei',
    'G-540': 'Asia/Yakutsk',
    'G-570': 'Australia/Darwin',
    'G-600': 'Antarctica/DumontDUrville',
    'G-660': 'Antarctica/Macquarie',
    'G-720': 'Asia/Anadyr',
    'G-780': 'Pacific/Apia',
}
let time_zone_offset = new Date().getTimezoneOffset();
let time_zone_place = time_zone_list[`G${time_zone_offset}`];

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
    data.append("time_zone", time_zone_place);
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