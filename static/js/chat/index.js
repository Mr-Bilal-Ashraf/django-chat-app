let isResizing = false;
let ID = null;
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
        ID = data.id;
        $("#user_profile_picture").attr("src", data.avatar);
        $("#user_profile_picture").attr("alt", `${data.username} profile picture`);
        $("#user_name").text(data.username);
        $("#user_title").text("");
    })

const socket = new WebSocket("ws://127.0.0.1:8000/ws/");

$("#conversations").on("click", () => {
    $("#convo-list").slideToggle(700);
})

$("#settings").on("click", () => {
    $("#settings").toggleClass("rotate");
    $("#settings-content").slideToggle(500);

})

socket.addEventListener("message", e => {
    data = JSON.parse(e.data);
    if (data.action == "CHAT") {
        console.log(data)
        sender = data.sender != ID ? 'receive' : 'sent';
        $("#conversation").append(`
            <div class="${sender}-msg msg">
                <img class="user-img" src="/static/imgs/profile_6.webp">
                <div class="msg-content">
                    ${data.message}
                    <div class="time">07:30 pm</div>
                </div>
            </div>
        `);
    }
})


$("#msg_form").submit(e => {
    let msg = $("#msg_text").val();
    $("#msg_text").val('');
    socket.send(JSON.stringify({
        "action": "CHAT",
        "receiver_id": 1,
        "message": msg
    }))
    return false;
})

function load_convo() {
    fetch(`/chat/conversations/?page=${convo_pagination_page}`).
        then(resp => {
            return resp.json()
        }).then(data => {

            if(data.next){
                $('.load_more_btn').fadeIn(300)
                convo_pagination_page++;
            }else{
                $('.load_more_btn').fadeOut(300);
            }

            data.results.forEach(convo => {
                let convo_avtar = (ID != convo.initiator.id) ? convo.initiator.avatar : convo.participant.avatar;
                let convo_title = (ID != convo.initiator.id) ? convo.initiator.username : convo.participant.username;

                $("#convo-list").append(`
                <div class="row convo" id="convo_${convo.id}">
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