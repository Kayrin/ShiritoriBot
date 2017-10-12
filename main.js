const Discord = require('discord.js');
const client = new Discord.Client();
const token = 'MzY3OTQ1NjAwNjMwNzg0MDA5.DMCzyA.6AsA59J24ac_X2XuJLqkgO3wgQY';
const prefix = '>'

var request = require('request');

function randomIntFromInterval(min,max)
{
   return Math.floor(Math.random()*(max-min+1)+min);
}



client.on('ready', () => {
  console.log('準備できた');
});


client.on('message', async message => {
  // Here we separate our "command" name, and our "arguments" for the command.
  // e.g. if we have the message "+say Is this the real life?" , we'll get the following:
  // command = say
  // args = ["Is", "this", "the", "real", "life?"]
  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();


  if (message.content === 'ping') {
    message.reply('pong');
  }
  if (command == 's' && args[0] == 'だれですか') {
    message.reply('なのです');
  }

  if (command == 's' && args[0] != 'だれですか') {
    let res = undefined;
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
  }
});

client.login(token);
