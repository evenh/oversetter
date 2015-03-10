'use strict';

var dotenv = require('dotenv');
dotenv.load();

var EventEmitter = require('events').EventEmitter;
var events = new EventEmitter();

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bt = require('bing-translate').init({
  client_id: process.env.BING_CLIENT,
  client_secret: process.env.BING_SECRET
});

// Validation constants
var MESSAGE_MAX_LENGTH = 140;
var PROFANITY_WORDS = ['kuk', 'fitte', 'balle', 'penis', 'vagina', 'pikk', 'dåse', 'idiot', 'suge', 'pupp', 'drit', 'bæsj', 'dust'];

// Translation specific variables
var translated = [];
var languages = ['en', 'it', 'fr', 'sv'];

// Port to run under. Determine from the environment if possible
var port = process.env.PORT || 3000;

// Serve static assets
app.use(express.static(__dirname + '/public'));

app.get('/send', function(req, res){
  res.sendFile(__dirname + '/public/send.html');
});

http.listen(port, function(){
  console.log('Serving translation requests at port ' + port);
});


var translateText = function(object, callback){
  var langCount = languages.length;
  var translations = {};

  languages.forEach(function(lang){
    bt.translate(object.string, process.env.DEFAULT_LANGUAGE, lang, function(err, res){
      if(err) console.log(err);
      translations[lang] = res.translated_text;
      langCount--;

      if(langCount === 0){
        object.translations = translations;
        callback(object);
      }

    });

  });
};

var validateText = function(msg, socket, callback){
  var text = msg.string;
  var failed = false;

  // Validate max length
  if(text.length > MESSAGE_MAX_LENGTH){
    socket.emit('lengthConstraint', 'Meldingen din overstiger 140 tegn');
    failed = true;
  }

  // Check for profanity
  text.toLowerCase().split(' ').forEach(function(w){
    PROFANITY_WORDS.forEach(function(p){
      if(w.indexOf(p) > -1){
        socket.emit('profanityConstraint', 'Meldingen din inneholdet et uønsket ord: ' + p + ' (i ordet "' + w +'").');
        failed = true;
      }
    });

  });

  return failed === true ? callback(false) : callback(msg);
};

// Define a message handler
io.sockets.on('connection', function (socket) {
  console.log('Got request from ' + socket.conn.request.headers.host);

  socket.on('translateEvent', function (msg) {
    console.log('Received: ', msg.string);

    if(!msg.string || msg.string === '' || msg.string.trim() === '') return socket.emit('emptyConstraint', 'Meldingen kan ikke være tom');

    // If validation fails, do not translate
    validateText(msg, socket, function(response){
      if(!response) return console.log('\tMessage failed validation, will not translate');

      translateText(response, function(translatedText){
        translatedText.timestamp = new Date().toISOString();
        translated.push(translatedText);
        socket.broadcast.emit('translateEvent', translatedText);
      });
    });

  });

});
