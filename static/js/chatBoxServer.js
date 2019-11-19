var socket = io();
document.getElementById('chatBox').addEventListener("submit", function (e) {
    e.preventDefault(); // prevents page reloading
    // var msg = {
    //   user : document.getElementById("u").value,
    //   msgContent : document.getElementById("m").value,
    //   timeStamp : new Date().getTime()
    // };
    // console.log(msg)
    // socket.emit('chat message', JSON.stringify(msg));

    const data = postData('/addChat', { msgContent: document.getElementById("m").value });

    document.getElementById("m").value = "";
    shouldScrollDown = true;
    
});
socket.on('connect', () => {
    socket.emit('get all messages');
});
socket.on('all messages', function (allMsgs) {
    for (var i = 0; i < allMsgs.length; i++) {
        addNewMessage(allMsgs[i])
    }
    scrollToBottom();
});
socket.on('chat message', function (msg) {
    addNewMessage(msg)
    if(shouldScrollDown) scrollToBottom();
});



function addNewMessage(data) {
    var messageElement = document.createElement("li");
    messageElement.innerHTML = "<span class='posterName'>"+data.username + "</span> <span class='msgContent'>" + data.msgContent+"</span>";
    document.getElementById("messages").appendChild(messageElement)
}

function getDateFromStamp(stamp) {

    var date = new Date(stamp);
    var hours = date.getHours();
    var minutes = "0" + date.getMinutes();
    var seconds = "0" + date.getSeconds();

    // Will display time in 10:30:23 format
    return hours + ':' + minutes.substr(-2);
}


async function postData(url = '', data = {}) {
    // Default options are marked with *
    const response = await fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: 'follow', // manual, *follow, error
        referrer: 'no-referrer', // no-referrer, *client
        body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    return await response; // parses JSON response into native JavaScript objects
}
function scrollToBottom() {
    var msgDiv = document.getElementById("messagesContainer");
    msgDiv.scrollTop = msgDiv.scrollHeight;
}
