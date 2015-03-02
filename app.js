'use strict';

var dotenv = require('dotenv');
dotenv.load();

var EventEmitter = require('events').EventEmitter;
var events = new EventEmitter();

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bt = require('bing-translate').init({
  client_id: process.env.BING_CLIENT,
  client_secret: process.env.BING_SECRET
});


var languages = ['en', 'it', 'fr', 'fa', 'ru'];
var langCount = languages.length;

var port = process.env.PORT || 3000;

var translateText = function(object, callback){
  var translations = {};

  languages.forEach(function(lang){
    bt.translate(object.string, process.env.DEFAULT_LANGUAGE, lang, function(err, res){
      if(err) console.log(err);
      translations[lang] = res.translated_text;

      langCount--;
      if(langCount === 0){
        events.emit('translateComplete');
      }
    });
  });

  events.on('translateComplete', function(){
    console.log(translations);
    object.translations = translations;
    callback(object);
  });
};

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/send', function(req, res){
  res.sendFile(__dirname + '/public/send.html');
});

io.on('connection', function(socket){
  socket.on('translateEvent', function(translateObject){

    translateText(translateObject, function(o){
      io.emit('translatedObject', o);
    });

  });



});

http.listen(port, function(){
  console.log('listening on *:' + port);
});
