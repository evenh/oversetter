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


var translated = [];
var languages = ['en', 'it', 'fr', 'sv'];
var port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'));

app.get('/send', function(req, res){
  res.sendFile(__dirname + '/public/send.html');
});

http.listen(port, function(){
  console.log('listening on *:' + port);
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

// Define a message handler
io.sockets.on('connection', function (socket) {
  console.log('Got request from ' + socket.conn.request.headers.host);

  socket.on('translateEvent', function (msg) {
    console.log('Received: ', msg.string);

    translateText(msg, function(translatedText){
      translatedText.timestamp = new Date().toISOString();
      translated.push(translatedText);
      socket.broadcast.emit('translateEvent', translatedText);
    });
  });
  // send messages to new clients
  /*translated.forEach(function(msg) {
    console.log('Sending history');
    socket.broadcast.emit('historyEvent');
    socket.send(msg);
  });*/
});
