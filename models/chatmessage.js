var mongoose = require('mongoose');
var chatSchema = new mongoose.Schema({
    username: String,
    msgContent: String,
    timeStamp: Number
});

var ChatMessage = mongoose.model('ChatMessage', chatSchema);

module.exports = ChatMessage;