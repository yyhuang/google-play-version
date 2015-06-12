'use strict';
var async = require('async'),
    cheerio = require('cheerio'),
    fs = require('fs'),
    https = require('https'),
    list = require('./list');

var result = {};

var url = 'https://play.google.com/store/apps/details?id=';

async.each(list.games, function(game, callback) {
  var string = '';
  https.get(url + game, function(res) {
    res.on('data', function(d) {
      string += d;
    }).on('end', function() {
      console.log('Parsing ' + game);
      var $ = cheerio.load(string);
      var len = $('.details-section-contents').find('div').each(function(i, elem) {
        if ($(this).attr('itemprop') === 'softwareVersion') {
          result[game] = $(this).text().replace(/ /g, '');
          callback();
        }
      });
    });
  }).on('error', function(e) {
    callback(e);
  });
}, function(err) {
  if (err) {
    console.dir(err);
  }

  fs.writeFile('game.json', JSON.stringify(result), function(err) {
    if (err) {
      console.dir(err);
    }
  });
});

