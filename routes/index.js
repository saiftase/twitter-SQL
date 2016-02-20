'use strict';
var express = require('express');
var router = express.Router();
var db = require('../models/');
var myio = require('../utils/myio');
var swig = require('swig');
var path = require('path'); 
var tweetBank = require('../tweetBank');


var User = db.User;
var Tweet = db.Tweet;

module.exports = router; 

  // a reusable function
  function respondWithAllTweets (req, res, next){
    Tweet.findAll({include: [ User ]})
    .then(function(allTheTweets){
      // var results = allTheTweets.map(function(tweet){
      //   return tweet.dataValues;
      // })
      // console.log(results);
      res.render('index', {
      title: 'Twitter.js',
      tweets: allTheTweets,
      showForm: true
      });
    });
    
  }

  // here we basically treet the root view and tweets view as identical
  router.get('/', respondWithAllTweets);
  router.get('/tweets', respondWithAllTweets);

  // single-user page
  router.get('/users/:username', function(req, res, next){
    
    User.findOne( {where: {name: req.params.username}} )
    .then(function(user){
      return Tweet.findAll( { include: [User],
                              where: { userId: user.id}} )
    })
    .then(function(tweetsForUser){

      res.render('index', {
      title: 'Twitter.js',
      tweets: tweetsForUser,
      showForm: true,
      username: req.params.username
      });

    });
  });

  // single-tweet page
  router.get('/tweets/:id', function(req, res, next){
   // Tweet.findOne( {include: [User],
   //                 where: {id: req.params.id} })
    Tweet.findById( req.params.id, {include: [User]})
    .then(function(tweetsWithThatId){
      console.log("Tweets with that ID");
      console.log(tweetsWithThatId);
      res.render('index', {
        title: 'Twitter.js',
        tweets: [tweetsWithThatId] // an array of only one element ;-)
      });
    })
  });

  // create a new tweet
  router.post('/tweets', function(req, res, next){
    
    User.findOne( {where: {name: req.body.name}} )
    .then(function(user){
      if (user){
        console.log('User Exists');
        return Tweet.create({UserId: user.id, tweet: req.body.text})
      } else{
        console.log('User does not Exist!');
        return User.create({ name: req.body.name, pictureUrl: "http://www.fullstackacademy.com/img/team/christian_sakai@2x_nerd.jpg" } )
        .then(function(user){
          var userObj = user.get( {plain: true} );
          return Tweet.create({tweet: req.body.text } )
          .then(function(tweet) { 
            return tweet.setUser(user);
          })
        })
      }
    })
    // .then(function(tweet){
    //   console.log("PASSED TWEET");
    //   console.log(tweet)
    //   return Tweet.findById( tweet.id , {include: [User]})
    // })
    .then(function(tweet){
      //Swig Stuff
      console.log("THIS IS THE TWEET!")
      console.log(tweet);

      var tweetHtml = swig.renderFile(
          path.join(__dirname, '../views/tweet.html'),
          { tweet : tweet },
          function(err, data){
            myio.emit('new_tweet', data);
          });
      res.redirect('/');
    })
  });

  // // replaced this hard-coded route with general static routing in app.js
  // router.get('/stylesheets/style.css', function(req, res, next){
  //   res.sendFile('/stylesheets/style.css', { root: __dirname + '/../public/' });
  // });
