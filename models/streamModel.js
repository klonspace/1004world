var mongoose = require('mongoose');
var streamSchema = new mongoose.Schema({
    startTime: {
        type: Number,
        required: true,
      },
    endTime: {
        type: Number,
        required: true,
      },
    fullName: {
        type: String,
        required: true,
      },
    description: {
        type: String,
        required: true,
      },
    hostID: {
        type: String,
        required: true,
      },
    isLive: {
      type: Boolean,
      required: true,
    },
    imageURL: {
      type: String,
      required: false
    }
});

var StreamModel = mongoose.model("StreamModel", streamSchema);

module.exports = StreamModel;