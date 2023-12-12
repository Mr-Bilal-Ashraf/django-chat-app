let isResizing = false;
let USER = null;
let PARTICIPANT = null;
let CONVO_ID = null;

let convo_pagination_page = 1;

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

const socket = new WebSocket("ws://127.0.0.1:8000/ws/");

$("#conversations").on("click", () => {
    $("#convo-list").slideToggle(700);
})

$("#settings").on("click", () => {
    $("#settings").toggleClass("rotate");
    $("#settings-content").slideToggle(500);

})

function bring_conversation_to_top(convo){
    if (convo[0] !== $("#convo-list div:first")[0]) {
        convo.remove();
        $("#convo-list").prepend(convo);
    }
}

socket.addEventListener("message", e => {
    data = JSON.parse(e.data);
    if (data.action == "CHAT") {
        sender = data.sender != USER.id ? 'receive' : 'sent';
        avatar = data.sender != USER.id ? PARTICIPANT.avatar : USER.avatar;
        $("#conversation").append(`
            <div class="${sender}-msg msg" id="msg-${data.id}">
                <img class="user-img" src="${avatar}">
                <div class="msg-content">
                    ${data.text}
                    <div class="time">${data.msg_time}</div>
                </div>
            </div>
        `);
        var offset = $("#conversation div:last").offset().top;
        $("#conversation").animate({ scrollTop: offset }, 1000);
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

function load_previous_chat(page_num = 1, first = false) {
    fetch(`/chat/conversations/detail/${CONVO_ID}/?page=${page_num}`).
        then(resp => {
            return resp.json()
        }).then(data => {
            if (data.count) {
                data.results.forEach(msg => {
                    sender = msg.sender != USER.id ? 'receive' : 'sent';
                    avatar = msg.sender != USER.id ? PARTICIPANT.avatar : USER.avatar;
                    $("#conversation").prepend(`
                        <div class="${sender}-msg msg" id="msg-${msg.id}">
                            <img class="user-img" src="${avatar}">
                            <div class="msg-content">
                                ${msg.text}
                                <div class="time">${msg.msg_time}</div>
                            </div>
                        </div>
                    `);
                })
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
                
                load_previous_chat(1, true);
                $(`#new_msg_${data.conversation_id}`).hide();
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

                $("#convo-list").append(`
                <div class="row convo" id="convo_${convo.id}" onclick="start_chat(${participant_id}, ${convo.id})">
                    <div class="col-2">
                        <img src="${convo_avtar}">
                    </div>
                    <div class="col-7">
                        <div class="name">
                            ${convo_title}
                        </div>
                        <div class="last-msg">
                            ${convo.last_msg.text}
                        </div>
                    </div>
                    <div class="col-3 text-end">
                        <div class="msg-time">
                            ${convo.last_msg.msg_time}
                        </div>
                        <span class="new-msg" id="new_msg_${convo.id}">
                            
                        </span>
                    </div>
                </div>
                `);
            });
        })
}

setTimeout(load_convo, 1000);