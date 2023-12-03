let isResizing = false;

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

const socket = new WebSocket("ws://127.0.0.1:8000/ws/?user_id=3");
const ID = 3;

$("#friends").on("click", () => {
    $("#frnds-list").slideToggle(700);
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