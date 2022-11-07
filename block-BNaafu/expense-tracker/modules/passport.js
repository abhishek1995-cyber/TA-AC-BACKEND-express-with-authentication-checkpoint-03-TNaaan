var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var GitHubStrategy = require('passport-github').Strategy;


var User = require('../models/user')

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/oauth2/redirect/google"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile, "PROFILE")
    var profileData = {
        firstname: profile.displayName,
        email: profile._json.email
    }
    User.findOne({email: profile._json.email}, (err, user) => {
        if(err) return cb(err)
        if(!user){
            User.create(profileData, (err, createdUser) => {
                if(err) return cb(err);
                return cb(null, createdUser)
            })
        }
        cb(null, user)
    })
  }
));

passport.use(new GitHubStrategy({
    clientID: process.env.GIT_CLIENT_ID,
    clientSecret: process.env.GIT_CLIENT_SECRET,
    callbackURL: "/auth/github/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    // console.log(profile, "PROFILE")
    var profileData = {
        firstname: profile.displayName,
        username: profile.username,
        email: profile._json.email,
        photo: profile._json.avatar_url
    }

    User.findOne({email: profile._json.email}, (err, user) => {
        if(err) return cb(err)
        if(!user){
            User.create(profileData, (err, createdUser) => {
                if(err) return cb(err);
                return cb(null, createdUser)
            })
        }
        cb(null, user)
    })
  }
  ));

passport.serializeUser((user, done)=>{
    done(null, user.id);
})

passport.deserializeUser(function(id,done){
    User.findById(id,'name username email',(err,user)=>{
        done(err,user)
    })
})