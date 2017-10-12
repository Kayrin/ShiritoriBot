const Discord = require('discord.js');
const client = new Discord.Client();

var request = require('request');

function randomIntFromInterval(min,max)
{
   return Math.floor(Math.random()*(max-min+1)+min);
}



client.on('ready', () => {
  //console.log('準備できた');
});

var res = undefined;
request('http://jisho.org/api/v1/search/words?keyword=%E3%81%8B%E3%81%8F%E3%81%AB%E3%82%93*', function (error, response, body) {
  console.log('error:', error); // Print the error if one occurred
  console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
  //console.log('body:', body); // Print the HTML for the Google homepage.
  res = JSON.parse(body);
  //console.log(res.data);
  var data = res.data;
  var randomIndex = Math.floor(Math.random() * data.length);
  console.log(data[randomIndex]);
});


client.on('message', message => {
  if (message.content === 'ping') {
    message.reply('pong');
  }
  if (message.content.startsWith('!s')) {
    message.reply('なのです');
  }
});

client.login('MzY3OTQ1NjAwNjMwNzg0MDA5.DMCzyA.6AsA59J24ac_X2XuJLqkgO3wgQY');
