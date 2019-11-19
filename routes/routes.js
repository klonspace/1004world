const pageNames = {
    "addstreams": "1004.ADMIN - Add Stream",
    "adminprofile": "1004.ADMIN - My Profile",
    "editstream": "1004.ADMIN - Edit My Stream",
    "addstream": "1004.ADMIN - Add Stream",
    "golive": "1004.ADMIN - Go Live",
    "streamarchive": "1004.ADMIN - Stream Archive",
    "handleusers": "1004.ADMIN - Manage Users",
    "streams": "1004.ADMIN - My Streams",
    "index": "1004.WORLD",
    "calendar": "1004.WORLD - Calendar",
    "about": "1004.WORLD - About",
    "contact": "1004.WORLD - About",
    "login ": "1004.WORLD - Login",
    "profile": "1004.WORLD - Profile"
}

module.exports = function (upload, chat, stream) {
    var Chat = chat;
    var StreamHandler = stream;
    var md5 = require('md5');
    var express = require('express');
    var router = express.Router();
    var User = require('../models/user');
    var request = require("request")
    var rp = require('request-promise-native');


    function generateStreamKey(userName) {
        var streamName = userName;
        var expiration = 2553638400;
        var hashValue = md5("/live/" + streamName + "-" + expiration + "-purephaseSECRETEdeBREX1TR4D1-0");
        var link = streamName + "?sign=" + expiration + "-" + hashValue;
        return link;
    }






    //GET ROUTE FOR STATIC FILES

    // checks if user is logged in and if user exists
    // passes over user info to next middleware
    function requiresLogin(req, res, next) {
        if (req.session && req.session.userId) {
            User.findById(req.session.userId)
                .exec(function (error, user) {
                    if (error) {
                        return next(error);
                    } else {
                        if (user === null) {
                            var err = new Error('Not authorized! Go back!');
                            err.status = 400;
                            return next(err);
                        } else {
                            req.userInfo = user;
                            return next();
                            //return res.send('<h1>Name: </h1>' + user.username + '<h2>Mail: </h2>' + user.email + '<br><a type="button" href="/logout">Logout</a>')
                        }
                    }
                });
        } else {
            var err = new Error('You must be logged in to view this page.');
            err.status = 401;
            return next(err)
        }
    }
    function requiresHost(req, res, next) {
        console.log()
        if (req.userInfo.role == "host" || req.userInfo.role == "admin") {
            return next();
        } else {
            var err = new Error('You must be a host to view this page.');
            err.status = 401;
            return next(err)
        }
    }
    function requiresAdmin(req, res, next) {
        console.log()
        if (req.userInfo.role == "admin") {
            return next();
        } else {
            var err = new Error('You must be an admin to view this page.');
            err.status = 401;
            return next(err)
        }
    }
    // checks if user is logged in and if user exists
    // passes over user info to next middleware, including if user is not logged
    function checkIfLoggedIn(req, res, next) {
        if (req.session && req.session.userId) {
            User.findById(req.session.userId)
                .exec(function (error, user) {
                    if (error) {
                        return next(error);
                    } else {
                        if (user === null) {
                            req.isLoggedIn = false;
                            return next();
                        } else {
                            req.isLoggedIn = true;
                            req.userInfo = user;
                            return next();
                        }
                    }
                });
        } else {
            req.isLoggedIn = false;
            return next();
        }
    }

    //POST route for creating new user
    router.post('/register', async function (req, res, next) {
        // confirm that user typed same password twice
        if (req.body.password !== req.body.passwordConf) {
            var err = new Error('Passwords do not match.');
            err.status = 400;
            return next(err);
        }

        if (req.body.username.length > 15) {
            var err = new Error('username is too long');
            err.status = 400;
            return next(err);
        }

        if (req.body.email &&
            req.body.username &&
            req.body.password &&
            req.body.passwordConf) {

            var userData = {
                email: req.body.email,
                username: req.body.username,
                password: req.body.password,
                role: "guest",
                passwordChanged: true,
                fullName: "",
                userIsLive : false
            }

            User.create(userData, function (error, user) {
                if (error) {
                    return next(error);
                } else {
                    req.session.userId = user._id;
                    console.log("created user")
                    console.log(user)
                    return res.redirect('/profile');
                }
            });

        } else {
            var err = new Error('All fields required.');
            err.status = 400;
            return next(err);
        }
    })

    router.post('/login', function (req, res, next) {
        if (req.body.username && req.body.password) {
            User.authenticate(req.body.username, req.body.password, function (error, user) {
                if (error || !user) {
                    var err = new Error('Wrong email, username or password.');
                    err.status = 401;
                    return next(error);
                } else {
                    req.session.userId = user._id;
                    return res.redirect('/');
                }
            });
        } else {
            var err = new Error('All fields required.');
            err.status = 400;
            return next(err);
        }
    });


    router.get('/profile', requiresLogin, function (req, res, next) {
        var info = {
            userInfo: req.userInfo
        }
        return res.render("pages/profile", {
            info: info,
            pageTitle: pageNames["login"]
        });
    });

    router.post('/addChat', checkIfLoggedIn, function (req, res, next) {
        console.log(req.body.msgContent)
        console.log(req.isLoggedIn)
        if (req.isLoggedIn) {
            Chat.addMessage(req.userInfo.username, req.body.msgContent);
        }
        else {
            Chat.addMessage("anon", req.body.msgContent);
        }
        return res.send("success");
    });

    router.get('/admin', requiresLogin, requiresHost, function (req, res, next) {
        console.log(req.user)
        var info = {
            userInfo: req.userInfo,
            streamKey: generateStreamKey(req.userInfo.username)
        }
        var currPage = "profile"
        return res.render("pages/admin", {
            info: info,
            currPage: currPage,
            pageTitle: pageNames["adminprofile"]
        });
    });

    router.get('/admin/streams', requiresLogin, requiresHost, async function (req, res, next) {
        var userStreams = await StreamHandler.getStreamsByUser(req.userInfo._id);
        var info = {
            userInfo: req.userInfo,
            streams: userStreams
        }
        var currPage = "streams"
        return res.render("pages/admin", {
            info: info,
            currPage: currPage,
            pageTitle: pageNames[currPage]
        });
    });

    router.get('/admin/golive', requiresLogin, requiresHost, async function (req, res, next) {
        var userStreams = await StreamHandler.getStreamsByUser(req.userInfo._id);
        var info = {
            userInfo: req.userInfo,
            streamKey: generateStreamKey(req.userInfo.username)
        }
        var currPage = "golive"
        return res.render("pages/admin", {
            info: info,
            currPage: currPage,
            pageTitle: pageNames[currPage]
        });
    });

    router.post('/golive', requiresLogin, requiresHost, async function (req, res, next) {
        console.log("yo")
        console.log(req.body)
        var user = await User.findById(req.userInfo._id);
        user.userIsLive = req.body.golive;
        user.save();
        console.log(user)
        return res.json({ "success": "saved" })

    });

    router.post('/editUserInfo', requiresLogin, requiresHost, async function (req, res, next) {
        console.log(req.body)
        var user = await User.findById(req.userInfo._id);
        var testVal
        if (req.body.whichVal == "username") {
            var testUsers = await User.find({
                username: req.body.value
            })
            if (testUsers.length) {
                return res.json({ "success": "That username is already taken" });
            }
        }
        else if (req.body.whichVal == "email") {
            var testUsers = await User.find({
                email: req.body.value
            })
            if (testUsers.length) {
                return res.json({ "success": "That email address is already taken" });
            }
        }
        else if (req.body.whichVal == "password") {
            User.authenticate(req.userInfo.username, req.body.oldPassword, function (error, userauth) {
                if (error || !userauth) {
                    return res.json({ "success": "The current password is wrong" });
                }
            });
            user.password = req.body.value;
            user.passwordChanged = true;
        }
        else {
            user[req.body.whichVal] = req.body.value;
        }

        user.save();
        return res.json({ "success": "saved" })

    });

    router.get('/admin/editstream/:streamid', requiresLogin, requiresHost, async function (req, res, next) {
        var userStream = await StreamHandler.getStreamById(req.params.streamid);
        var info = {
            userInfo: req.userInfo,
            stream: userStream
        }
        var currPage = "editstream"
        return res.render("pages/admin", {
            info: info,
            currPage: currPage,
            pageTitle: pageNames[currPage]
        });
    });

    router.get('/admin/addstream', requiresLogin, requiresHost, function (req, res, next) {
        console.log(req.user)

        var stream = {
            startTime: 0,
            endTime: 0,
            fullName: "",
            description: "",
            hostID: "",
            isLive: false,
            _id: "",
            dateInfo: {
                dateForFlatPickr: "",
                timeBegin: [13, 12],
                duration: [01, 00]
            },
            imageURL: ""
        };
        var info = {
            userInfo: req.userInfo,
            stream: stream
        }
        var currPage = "addstream"
        return res.render("pages/admin", {
            info: info,
            currPage: currPage,
            pageTitle: pageNames[currPage]
        });
    });

    router.get('/admin/handleUsers', requiresLogin, requiresAdmin, async function (req, res, next) {
        var allUsers = await User.find({ "_id": { $ne: req.userInfo._id } });
        var info = {
            userInfo: req.userInfo,
            users: allUsers
        }
        var currPage = "handleusers"
        return res.render("pages/admin", {
            info: info,
            currPage: currPage,
            pageTitle: pageNames[currPage]
        });
    });


    router.get('/admin/streamarchive', requiresLogin, requiresHost, async function (req, res, next) {
        var files = []
        var options = {
            method: 'POST',
            uri: 'http://localhost:1337/getFiles',
            body: {
                user: req.userInfo.username
            },
            json: true // Automatically stringifies the body to JSON
        };
        await rp(options)
            .then(function (parsedBody) {

                files = parsedBody
            })
            console.log(files)
        var info = {
            userInfo: req.userInfo,
            files: files
        }
        var currPage = "streamarchive"
        return res.render("pages/admin", {
            info: info,
            currPage: currPage,
            pageTitle: pageNames[currPage]
        });
    });

    router.post('/editUserPermissions', requiresLogin, requiresAdmin, async function (req, res, next) {

        console.log(req.body)
        for (var i = 0; i < req.body.length; i++) {
            console.log()
            var thisUser = await User.find({ _id: req.body[i].id });
            thisUser[0].role = req.body[i].role;
            thisUser[0].save(function (err, user) {
                if (err) return console.error(err);
                console.log("edited user called :" + user.username); // 'Silence'
            });
            console.log(thisUser[0])
        }
        return res.json({ 'success': 'saved' });

    });

    router.post('/addStream', requiresLogin, requiresHost, upload.any(), async function (req, res, next) {
        var imageURL = "";
        if (req.files.length) {
            imageURL = req.files[0].path.replace('static', '');
        }
        else {
            imageURL = "";
        }


        var log = await StreamHandler.addStream(req.body, req.userInfo._id, imageURL);
        //console.log(log)
        if (log == "saved") return res.json({ 'success': 'saved' });
        else if (log == "conflict") return res.json({ 'success': 'conflict' });

    });



    router.post('/editStream', requiresLogin, requiresHost, upload.any(), async function (req, res, next) {
        var imageURL;
        if (req.files.length) {
            imageURL = req.files[0].path.replace('static', '');
        }
        else {
            imageURL = false;
        }
        var log = await StreamHandler.editStream(req.body, req.userInfo._id, imageURL);
        console.log(log)
        if (log == "saved") return res.json({ 'success': 'saved' });
        else if (log == "conflict") return res.json({ 'success': 'conflict' });

    });

    router.post('/deleteStream', requiresLogin, requiresHost, async function (req, res, next) {
        var log = await StreamHandler.deleteStream(req.body, req.userInfo._id);
        console.log(log)
        if (log == "saved") return res.json({ 'success': 'saved' });
        else if (log == "conflict") return res.json({ 'success': 'conflict' });

    });

    router.post('/getStreamsOnDay', async function (req, res, next) {
        var streamsOnDay = await StreamHandler.getStreamsOnDay(req.body.date)
        //console.log(streamsOnDay)
        return res.json(streamsOnDay);
    });






    //INDEX ROUTES
    router.get('/', checkIfLoggedIn, async function (req, res, next) {
        console.log(req.user)
        var liveStream = await StreamHandler.getCurrLiveStream();
        console.log(liveStream)
        return res.render("pages/index", {
            isLoggedIn: req.isLoggedIn,
            user: req.userInfo,
            streamInfo: liveStream,
            currPage: "index",
            info: {},
            pageTitle: pageNames["index"]
        });
    });


    router.get('/calendar', checkIfLoggedIn, async function (req, res, next) {
        var liveStream = await StreamHandler.getCurrLiveStream();
        var calendarStreams = await StreamHandler.getStreamsFromNow();
        return res.render("pages/index", {
            isLoggedIn: req.isLoggedIn,
            user: req.userInfo,
            streamInfo: liveStream,
            currPage: "calendar",
            info: { streams: calendarStreams },
            pageTitle: pageNames["calendar"]
        });
    });

    router.get('/about', checkIfLoggedIn, async function (req, res, next) {
        var liveStream = await StreamHandler.getCurrLiveStream();
        var calendarStreams = await StreamHandler.getStreamsFromNow();
        return res.render("pages/index", {
            isLoggedIn: req.isLoggedIn,
            user: req.userInfo,
            streamInfo: liveStream,
            currPage: "about",
            info: {},
            pageTitle: pageNames["about"]
        });
    });

    router.get('/contact', checkIfLoggedIn, async function (req, res, next) {
        var liveStream = await StreamHandler.getCurrLiveStream();
        var calendarStreams = await StreamHandler.getStreamsFromNow();
        return res.render("pages/index", {
            isLoggedIn: req.isLoggedIn,
            user: req.userInfo,
            streamInfo: liveStream,
            currPage: "contact",
            info: {},
            pageTitle: pageNames["contact"]
        });
    });

    router.get('/stream/:streamid', checkIfLoggedIn, async function (req, res, next) {
        var liveStream = await StreamHandler.getCurrLiveStream();
        var thisStream = await StreamHandler.getStreamById(req.params.streamid);
        var info = {
            userInfo: req.userInfo,
            stream: thisStream
        }
        var currPage = "stream";
        return res.render("pages/index", {
            isLoggedIn: req.isLoggedIn,
            user: req.userInfo,
            streamInfo: liveStream,
            currPage: "stream",
            info: info,
            pageTitle: pageNames["index"] + " - " + thisStream.fullName

        });
    });

    // GET route for login page
    router.get('/login', function (req, res, next) {
        // return res.sendFile(path.join(__dirname + '/public/index.html'));
        if (req.session && req.session.userId) {
            return res.redirect('/');
        }
        return res.render('pages/loginPage', { currPage: "login" });
    });
    router.get('/register', function (req, res, next) {
        // return res.sendFile(path.join(__dirname + '/public/index.html'));
        if (req.session && req.session.userId) {
            return res.redirect('/');
        }
        return res.render('pages/loginPage', { currPage: "register" });
    });

    // GET for logout logout
    router.get('/logout', function (req, res, next) {
        if (req.session) {
            // delete session object
            req.session.destroy(function (err) {
                if (err) {
                    return next(err);
                } else {
                    return res.redirect('/');
                }
            });
        }
    });

    return router;
}
