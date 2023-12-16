let isResizing = false;
let USER = null;
let PARTICIPANT = null;
let CONVO_ID = null;
let last_msg_day = null;

let host = window.location.hostname;
let port = window.location.port;

let convo_pagination_page = 1;
let chat_pagination_page = 1;

const socket = new WebSocket(`ws://${host}:${port}/ws/`);


function startResize(e) {
    isResizing = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopResize);
}


function handleMouseMove(e) {
    if (isResizing) {
        const sidebar = document.getElementById('left-container');
        sidebar.style.width = e.clientX + 'px';
    }
}


function stopResize() {
    isResizing = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', stopResize);
}


function get_msg_time(date) {
    date = new Date(date);
    let am = null;
    let hour = date.getHours();
    let min = date.getMinutes();
    min = `${min}`.length == 1 ? `0${min}` : min;

    let format = hour % 12;
    if (format >= 0 && hour > 11) {
        hour = format == 0 ? 12 : format;
        am = "PM";
    } else {
        hour = hour == 0 ? 12 : hour;
        am = "AM";
    }

    hour = `${hour}`.length == 1 ? `0${hour}` : hour;
    return `${hour}:${min} ${am}`
}


function get_msg_day(date) {
    date = new Date(date);
    today = new Date();
    if (date.toDateString() == today.toDateString()) {
        return "Today"
    } else if (date.getDate() == (today.getDate() - 1) && date.getMonth() == today.getMonth()) {
        return "Yesterday"
    } else {
        day = date.getDate();
        month = date.toLocaleString('default', { month: 'short' });
        year = date.getFullYear()
        return `${day}-${month}-${year}`
    }
}


function get_convo_msg_time(date) {
    rdate = new Date(date);
    today = new Date();
    if (rdate.toDateString() == today.toDateString()) {
        return get_msg_time(date)
    } else {
        return get_msg_day(date)
    }
}


fetch("/chat/my_user/").
    then(resp => {
        return resp.json()
    }).then(data => {
        if (data.code == "success") {
            USER = data.user;
            $("#user_profile_picture").attr("src", USER.avatar);
            $("#user_profile_picture").attr("alt", `${USER.username} profile picture`);
            $("#user_name").text(USER.username);
            $("#user_title").text("");
        } else {
            location.reload();
        }
    })


$("#conversations").on("click", () => {
    $("#convo-list").slideToggle(700);
})


$("#settings").on("click", () => {
    $("#settings").toggleClass("rotate");
    $("#settings-content").slideToggle(500);

})


function bring_conversation_to_top(convo) {
    if (convo[0] !== $("#convo-list div:first")[0]) {
        convo.remove();
        $("#convo-list").prepend(convo);
    }
}


function add_new_msg_details_to_convo(data) {
    $(`#msg_time_${data.conversation_id}`).text(get_msg_time(data.send_at));
    $(`#last_msg_${data.conversation_id}`).text(data.text.slice(0, 40));
}


function mark_convo_seen() {
    socket.send(JSON.stringify({
        "action": "SEEN",
        "receiver_id": PARTICIPANT.id,
        "conversation_id": CONVO_ID,
    }))
}


function action_chat(data) {
    let convo = $(`#convo_${data.conversation_id}`);

    if (PARTICIPANT && data.conversation_id == CONVO_ID) {
        sender = data.sender != USER.id ? 'receive' : 'sent';
        avatar = data.sender != USER.id ? PARTICIPANT.avatar : USER.avatar;
        $("#conversation").append(`
            <div class="${sender}-msg msg" id="msg-${data.id}">
                <img class="user-img" src="${avatar}">
                <div class="msg-content">
                    ${data.text}
                    <div class="time">
                    ${get_msg_time(data.send_at)}
                    <i class="fa-solid fa-check d-none"></i>
                    </div>
                </div>
            </div>
        `);
        var offset = $("#conversation div:last").offset().top;
        $("#conversation").animate({ scrollTop: offset }, 1000);
        mark_convo_seen();

    } else {

        if (convo.length == 0) {
            $("#convo-list").prepend(`
            <div class="row convo" id="convo_${data.conversation_id}" onclick="start_chat(${data.sender.id}, ${data.conversation_id})">
                <div class="col-2">
                    <img src="${data.sender.avtar}">
                </div>
                <div class="col-7">
                    <div class="name">
                        ${data.sender.username}
                    </div>
                    <div class="last-msg" id="last_msg_${data.conversation_id}">
                        ${data.text}
                    </div>
                </div>
                <div class="col-3 text-end">
                    <div class="msg-time" id="msg_time_${data.conversation_id}">
                        ${get_msg_time(data.send_at)}
                    </div>
                    <span class="new-msg" id="new_msg_${data.conversation_id}">
                        ${data.unseen_count}
                    </span>
                </div>
            </div>
            `);
        }

        $(`#new_msg_${data.conversation_id}`).text(data.unseen_count);
        $(`#new_msg_${data.conversation_id}`).show();

    }
    bring_conversation_to_top(convo);
    add_new_msg_details_to_convo(data);
}


function action_seen(data) {
    if (PARTICIPANT && data.conversation_id == CONVO_ID && data.receiver_id == USER.id) {
        $(".time .fa-check.d-none").addClass('d-inline');
        $(".time .fa-check.d-none").removeClass('d-none');
    }
}


socket.addEventListener("message", e => {
    data = JSON.parse(e.data);
    console.log(data);

    if (data.action == "CHAT") {
        action_chat(data);
    } else if (data.action == "SEEN") {
        action_seen(data);
    }
})


$("#msg_form").on("submit", e => {
    e.preventDefault();
    let msg = $("#msg_text").val();
    $("#msg_text").val('');
    socket.send(JSON.stringify({
        "action": "CHAT",
        "receiver_id": PARTICIPANT.id,
        "conversation_id": CONVO_ID,
        "message": msg
    }))
    return false;
})


function load_previous_chat(first = false) {
    fetch(`/chat/conversations/detail/${CONVO_ID}/?page=${chat_pagination_page++}`).
        then(resp => {
            return resp.json();
        }).then(data => {
            console.log(data)
            if (first && data.count) {
                last_msg_day = get_msg_day(data.results[0].send_at);
            }

            if (!first && data.count && $(`#id_${last_msg_day}`).length) {
                $(`#id_${last_msg_day}`).remove();
            }

            let load_chat_btn = $("#load_chat_btn");
            if (load_chat_btn.length) {
                load_chat_btn.remove();
            }

            if (data.count) {
                data.results.forEach(msg => {
                    let me = msg.sender != USER.id ? false : true;
                    let sender = me ? 'sent' : 'receive';
                    let avatar = me ? USER.avatar : PARTICIPANT.avatar;
                    let msg_day = get_msg_day(msg.send_at);

                    if (msg_day != last_msg_day) {
                        $("#conversation").prepend(`
                            <div class="msg-day" id="id_${last_msg_day}">
                                ${last_msg_day}
                            </div>
                        `);
                        last_msg_day = msg_day;
                    }

                    $("#conversation").prepend(`
                        <div class="${sender}-msg msg" id="msg-${msg.id}">
                            <img class="user-img" src="${avatar}">
                            <div class="msg-content">
                                ${msg.text}
                                <div class="time">
                                ${get_msg_time(msg.send_at)}
                                <i class="fa-solid fa-check ${msg.seen ? 'd-inline' : 'd-none'}"></i>
                                </div>
                            </div>
                        </div>
                    `);

                })

                if (!$(`#id_${last_msg_day}`).length) {
                    $("#conversation").prepend(`
                            <div class="msg-day" id="id_${last_msg_day}">
                                ${last_msg_day}
                            </div>
                        `);
                }

                if (data.next) {
                    $("#conversation").prepend(`
                        <div class="text-center pt-2">
                            <button class="btn btn-primary load_more_btn d-inline" onclick="load_previous_chat()" id="load_chat_btn">
                                load more
                            </button>
                        </div>
                    `);
                }

                if (first) {
                    var offset = $("#conversation div:last").offset().top;
                    $("#conversation").animate({ scrollTop: offset }, 1000);
                }

            } else {
                // remove convo as no convo found
            }
        })
}


function start_chat(participant_id, convo_id) {
    fetch(`/chat/participant/${participant_id}/`).
        then(resp => {
            return resp.json()
        }).then(data => {
            if (data.code == "success") {
                PARTICIPANT = data.user;
                CONVO_ID = convo_id;

                $("#conversation").html("");
                $("#receive-user-img").attr("src", PARTICIPANT.avatar);
                $("#receive-user-name").text(PARTICIPANT.username);
                $(".chat-user").css({ "display": "flex" });
                $("#no-chat-dialouge").hide();
                $(".typing-section").show();

                mark_convo_seen()
                chat_pagination_page = 1;
                load_previous_chat(true);
                $(`#new_msg_${CONVO_ID}`).hide();
            } else if (data.code == "error") {
                $("#no-chat-dialouge").text(data.detail);
            }
        })
}


function load_convo() {
    fetch(`/chat/conversations/?page=${convo_pagination_page}`).
        then(resp => {
            return resp.json()
        }).then(data => {
            console.log(data)
            if (data.next) {
                $('.load_more_btn').fadeIn(300)
                convo_pagination_page++;
            } else {
                $('.load_more_btn').fadeOut(300);
            }

            data.results.forEach(convo => {
                let participant_id = (USER.id != convo.initiator.id) ? convo.initiator.id : convo.participant.id;
                let convo_avtar = (USER.id != convo.initiator.id) ? convo.initiator.avatar : convo.participant.avatar;
                let convo_title = (USER.id != convo.initiator.id) ? convo.initiator.username : convo.participant.username;
                let last_msg_time = convo.last_msg.send_at ? get_convo_msg_time(convo.last_msg.send_at) : "";

                $("#convo-list").append(`
                <div class="row convo" id="convo_${convo.id}" onclick="start_chat(${participant_id}, ${convo.id})">
                    <div class="col-2">
                        <img src="${convo_avtar}">
                    </div>
                    <div class="col-7">
                        <div class="name">
                            ${convo_title}
                        </div>
                        <div class="last-msg" id="last_msg_${convo.id}">
                            ${convo.last_msg.text}
                        </div>
                    </div>
                    <div class="col-3 text-end">
                        <div class="msg-time" id="msg_time_${convo.id}">
                            ${last_msg_time}
                        </div>
                        <span class="new-msg" id="new_msg_${convo.id}" style="display: ${convo.last_msg.unseen_count ? 'inline' : 'none'};">
                            ${convo.last_msg.unseen_count}
                        </span>
                    </div>
                </div>
                `);
            });
        })
}


setTimeout(load_convo, 1000);