var mongoose = require('mongoose');
const bcrypt = require("bcrypt")
var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    trim: true,
    index: {
      unique: true,
      partialFilterExpression: {
        email: { $type: "string" }
      }
    }
  },
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
  },
  passwordChanged: {
    type: Boolean,
    required: true
  },
  role: {
    type: String,
    required: true,
  },
  fullName: {
    type: String
  },
  userIsLive: {
    type: Boolean,
    required: true
  }
});

//authenticate input against database
UserSchema.statics.authenticate = function (username, password, callback) {
  User.findOne({
    $or: [
      { email: username },
      { username: username }
    ]
  })
    .exec(function (err, user) {
      if (err) {
        return callback(err)
      } else if (!user) {
        var err = new Error('User not found.');
        err.status = 401;
        return callback(err);
      }
      bcrypt.compare(password, user.password, function (err, result) {
        if (result === true) {
          return callback(null, user);
        } else {
          var err = new Error('Wrong password');
          err.status = 401;
          return callback(err);
        }
      })
    });
}

//hashing a password before saving it to the database
UserSchema.pre('save', function (next) {

  var user = this;
  if (user.passwordChanged) {
    bcrypt.hash(user.password, 10, function (err, hash) {
      if (err) {
        return next(err);
      }
      user.password = hash;
      user.passwordChanged = false;
      next();
    })
  }
  else next();

});


var User = mongoose.model('User', UserSchema);
module.exports = User;
