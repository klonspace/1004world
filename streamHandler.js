const StreamModel = require("./models/streamModel");
const sanitizeHtml = require("sanitize-html");

function sanitizeInput(input) {
    return sanitizeHtml(input, {
        allowedTags: []
    });
}

module.exports = function () {
    var User = require('./models/user');
    var module = {};


    module.addStream = async function (params, userId, imageURL) {
        try {

            var streamsOnDay = await StreamModel.find({
                $or: [
                    {
                        $and: [
                            { 'startTime': { $gte: params.streamStart } },
                            { 'endTime': { $lte: params.streamEnd } }
                        ]
                    },
                    {
                        $and: [
                            { 'startTime': { $lte: params.streamStart } },
                            { 'endTime': { $gte: params.streamStart } }
                        ]
                    },
                    {
                        $and: [
                            { 'startTime': { $lte: params.streamEnd } },
                            { 'endTime': { $gte: params.streamEnd } }
                        ]
                    }
                ]
            });
            if (streamsOnDay.length == 0) {
                var newStream = new StreamModel({
                    startTime: params.streamStart,
                    endTime: params.streamEnd,
                    fullName: sanitizeInput(params.streamTitle),
                    description: params.streamDesc,
                    hostID: userId,
                    isLive: false,
                    imageURL: imageURL
                });
                newStream.save(function (err, stream) {
                    if (err) return console.error(err);
                    console.log("added stream called :" + stream.fullName); // 'Silence'
                });
                return "saved"
            }
            else {
                return "conflict"
            }

        } catch (err) {
            console.log(err)
        }


    }

    module.editStream = async function (params, userId, newImage) {
        try {

            var streamsOnDay = await StreamModel.find({
                $and: [
                    {
                        $or: [
                            {
                                $and: [
                                    { 'startTime': { $gte: params.streamStart } },
                                    { 'endTime': { $lte: params.streamEnd } }
                                ]
                            },
                            {
                                $and: [
                                    { 'startTime': { $lte: params.streamStart } },
                                    { 'endTime': { $gte: params.streamStart } }
                                ]
                            },
                            {
                                $and: [
                                    { 'startTime': { $lte: params.streamEnd } },
                                    { 'endTime': { $gte: params.streamEnd } }
                                ]
                            }
                        ]
                    },
                    {
                        "_id": { $ne: params.streamID }
                    }
                ]

            });
            if (streamsOnDay.length == 0) {
                var userStreams = await StreamModel.
                    find({
                        _id: params.streamID
                    });
                userStreams[0].startTime = params.streamStart;
                userStreams[0].endTime = params.streamEnd;
                userStreams[0].fullName = params.streamTitle;
                userStreams[0].description = sanitizeInput(params.streamDesc);

                if(newImage) {
                    userStreams[0].imageURL = newImage; 
                }

                userStreams[0].save(function (err, stream) {
                    if (err) return console.error(err);
                    console.log("edited stream called :" + stream.fullName); // 'Silence'
                });
                return "saved"
            }
            else {
                return "conflict"
            }

        } catch (err) {
            console.log(err)
        }


    }
    module.deleteStream = async function (params, userId) {
        try {

            StreamModel.deleteOne({ _id: params.id }, function (err) {
                console.log(err)
            });
            return "saved"
        } catch (err) {
            console.log(err)
        }


    }

    module.getStreamsOnDay = async function (day) {
        try {
            var streamsOnDay = await StreamModel.
                find().
                where('startTime').gt(day).lt(day + 24 * 60 * 60 * 1000)
                .sort({ startTime: 1 });
            return streamsOnDay;
        } catch (err) {
            console.log(err)
        }
    }

    module.getStreamsFromNow = async function () {
        try {
            var streams = await StreamModel.
                find().
                where('startTime').gt(Date.now())
                .sort({ startTime: 1 });
            var streamsCopied = JSON.parse(JSON.stringify(streams))
            for (var i = 0; i < streamsCopied.length; i++) {
                streamsCopied[i].dateInfo = getDateInfo(streamsCopied[i].startTime, streamsCopied[i].endTime)
            }
            return streamsCopied;
        } catch (err) {
            console.log(err)
        }
    }

    module.getStreamsByUser = async function (userID) {

        try {
            var userStreams = await StreamModel.
                find({
                    hostID: userID
                })
                .sort({ startTime: 1 });
            var userStreamsCopied = JSON.parse(JSON.stringify(userStreams))
            for (var i = 0; i < userStreamsCopied.length; i++) {
                userStreamsCopied[i].dateInfo = getDateInfo(userStreamsCopied[i].startTime, userStreamsCopied[i].endTime)
            }
            return userStreamsCopied;
        } catch (err) {
            console.log(err)
        }


    }

    module.getStreamById = async function (streamID) {

        try {
            var userStreams = await StreamModel.
                find({

                    _id: streamID
                });
            var userStreamsCopied = JSON.parse(JSON.stringify(userStreams))
            for (var i = 0; i < userStreamsCopied.length; i++) {
                userStreamsCopied[i].dateInfo = getDateInfo(userStreamsCopied[i].startTime, userStreamsCopied[i].endTime)
            }

            var userInfo = await User.findById(userStreamsCopied[0].hostID);
            userStreamsCopied[0].hostInfo = userInfo;
            return userStreamsCopied[0];
        } catch (err) {
            console.log(err)
        }


    }

    module.getCurrLiveStream = async function (streamID) {

        try {
            var userStreams = await StreamModel.
                find({
                    $and: [
                        { 'startTime': { $lte: Date.now() } },
                        { 'endTime': { $gte: Date.now() } }
                    ]
                });
            //console.log(userStreams)
            if(userStreams.length) {
                var user = await User.findById(userStreams[0].hostID);
                if (user.userIsLive) {
                    return {
                        stream: userStreams[0],
                        user: user
                    };
                }
                else {
                    return false;
                }
            }
            else {
                return false;
            }
        } catch (err) {
            console.log(err)
        }


    }
    function paddy(num, padlen, padchar) {
        var pad_char = typeof padchar !== 'undefined' ? padchar : '0';
        var pad = new Array(1 + padlen).join(pad_char);
        return (pad + num).slice(-pad.length);
    }
    function getDateInfo(startTime, endTime) {
        var startDate = new Date(startTime)
        var endDate = new Date(endTime)
        var weekday = new Array(7);
        weekday[0] = "Sun";
        weekday[1] = "Mon";
        weekday[2] = "Tue";
        weekday[3] = "Wed";
        weekday[4] = "Thu";
        weekday[5] = "Fri";
        weekday[6] = "Sat";

        var month = new Array(12);
        month[0] = "January";
        month[1] = "February";
        month[2] = "March";
        month[3] = "April";
        month[4] = "May";
        month[5] = "June";
        month[6] = "July";
        month[7] = "August";
        month[8] = "September";
        month[9] = "October";
        month[10] = "November";
        month[11] = "December";

        var dateInfos = {};
        dateInfos.date = weekday[startDate.getDay()] + " " + startDate.getDate() + "." + (startDate.getMonth() + 1) + "." + startDate.getFullYear();
        dateInfos.startTime = paddy(startDate.getHours(), 2) + ":" + paddy(startDate.getMinutes(), 2)
        dateInfos.endTime = paddy(endDate.getHours(), 2) + ":" + paddy(endDate.getMinutes(), 2);
        dateInfos.dateForFlatPickr = startDate.getDate() + "/" + (startDate.getMonth() + 1) + "/" + startDate.getFullYear();
        dateInfos.timeBegin = [paddy(startDate.getHours(), 2), paddy(startDate.getMinutes(), 2)]
        dateInfos.month = month[startDate.getMonth()]
        var duration = endTime - startTime;
        dateInfos.duration = [paddy(Math.floor(duration / (60 * 60 * 1000)), 2), paddy(Math.floor((duration % (60 * 60 * 1000)) / (60 * 1000)), 2)]
        return dateInfos;
    }

    return module;
}
