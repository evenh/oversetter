'use strict';

$(function(){
  jQuery.timeago.settings.strings = {
    prefixAgo: "for",
    prefixFromNow: "om",
    suffixAgo: "siden",
    suffixFromNow: "",
    seconds: "mindre enn et minutt",
    minute: "ca. et minutt",
    minutes: "%d minutter",
    hour: "ca. en time",
    hours: "ca. %d timer",
    day: "en dag",
    days: "%d dager",
    month: "ca. en måned",
    months: "%d måneder",
    year: "ca. et år",
    years: "%d år"
  };

  var socket = io.connect();

  var p1 = '<div class="panel panel-default translationBox"><div class="panel-heading"><h3 class="panel-title pull-left">';
  var p2 = '</h3><time class="pull-right timeago" datetime="';
  var p3 = '"></time><span class="clearfix"></span></div><div class="panel-body">';
  var p4 = '</div></div>';

  var formatMessage = function(object){
    var msg = p1 + object.string + p2 + object.timestamp + p3;

    for(var lang in object.translations){
      msg += '<div class="media"><div class="media-left"><a href="#"><span class="media-object flag-icon flag-icon-' + lang + '"></span></a></div><div class="media-body"><h4 class="media-heading">' + object.translations[lang] + '</h4></div></div>';
    }

    msg += p4;
    return msg;
  };

  socket.on('connect', function () {
    console.log('Connected to server');
    socket.on('translateEvent', function(message) {
      console.log(message);

      if($("#noTranslations").is(":visible")){
        $("#noTranslations").addClass('animated fadeOutDown');
      }

      $('#translationHolder').prepend(formatMessage(message));
      $(".translationBox").first().addClass('animated bounceInRight');
      jQuery('time.timeago').timeago();
    });

    socket.on('disconnect', function() {
      console.log('Disconnected');
    });
  });

});
