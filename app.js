// getting-started.js
var mongoose = require('mongoose');
var uriUtil = require('mongodb-uri');
const express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
const app = express();
var http = require('http').createServer(app);
var MongoStore = require('connect-mongo')(session);

const multer = require('multer');

// SET STORAGE
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'static/uploads')
    },
    filename: function (req, file, cb) {
        console.log(file)
        cb(null, file.fieldname + '-' + Date.now()+"."+file.originalname.split(".").slice(-1)[0] )
    }
})

var upload = multer({ storage: storage })





// listen on port 3000
http.listen(3000, function () {
    console.log('Express app listening on port 80');
});


const Chat = require("./chat")(http);
const StreamHandler = require("./streamHandler")();

//LOCAL
var dbURL = "mongodb://localhost/1004world";
var mongooseUri = uriUtil.formatMongoose(dbURL);
mongoose.connect(mongooseUri, { useNewUrlParser: true });


//PRODUCTION
// var dbURL2 = "mongodb://node20651-env-4152192.jcloud.ik-server.com:27017/1004world"

// mongoose.connect(dbURL2, {
//     "auth": { "authSource": "admin" },
//     "user": "admin",
//     "pass": "SVQban18581"
// });

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("connection worked")
});

app.set('view engine', 'ejs');

app.use(session({
    secret: 'brexeetisdabezt',
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({
        mongooseConnection: db
    })
}));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// serve static files from template

app.use(express.static(__dirname + '/static'));

// include routes
var routes = require('./routes/routes')(upload, Chat, StreamHandler);
app.use('/', routes);

// error handler
// define as the last app.use callback
app.use(function (err, req, res, next) {
    res.status(err.status || 500);

    res.render("pages/error", {
        error: err.message
    })
});

