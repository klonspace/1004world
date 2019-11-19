const ChatMessage = require("./models/chatmessage");
const sanitizeHtml = require("sanitize-html");

function sanitizeChat(input) {
    return sanitizeHtml(input, {
        allowedTags: [ 'b', 'i', 'strong']
      });
}

module.exports = function(http) {
    var module ={};
    var io = require('socket.io')(http);
   
    io.on('connection', function (socket) {
        console.log('a user connected');
        socket.on('get all messages', function (msg) {
            ChatMessage.find(function (err, messages) {
                if (err) return console.error(err);
    
                socket.emit('all messages', messages);
            })
        });
    
        socket.on('disconnect', function () {
            console.log('user disconnected');
        });
    });
    
    module.addMessage = function(username, message) {
        console.log(username+" : "+message);
        var newMessage = new ChatMessage({ username: username, msgContent: sanitizeChat(message), timeStamp: Date.now() });
        newMessage.save(function (err, mess) {
            if (err) return console.error(err);
            console.log("added message from :" + mess.username); // 'Silence'
        });
        io.emit('chat message', {
            username: newMessage.username,
            msgContent: newMessage.msgContent,
            timeStamp : newMessage.timeStamp
        });
    }
    return module;
}
