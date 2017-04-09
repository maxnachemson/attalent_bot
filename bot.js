var Botkit = require('botkit');
var controller = Botkit.slackbot();

var request = require('request');

var options = {
      url: 'https://script.googleusercontent.com/macros/echo?user_content_key=jQ2TC03qiZkWyvx07u8gzYWZiYtUzF5o8tkeG7unQdn2iQlye3fjmIQoIVzFfMcCSQe0qR3yPyNLONDRdDfs9Ww3xagBWEXcOJmA1Yb3SEsKFZqtv3DaNYcMrmhZHmUMWojr9NvTBuBLhyHCd5hHa1ZsYSbt7G4nMhEEDL32U4DxjO7V7yvmJPXJTBuCiTGh3rUPjpYM_V0PJJG7TIaKp1E_BOymz-tQ-8TxUtrLWLSKPKjFjBmpg0EpTpFurEIVpbQEzawfLw93LnxErnS8iQ&lib=MbpKbbfePtAVndrs259dhPT7ROjQYJ8yx'
};

function callback(error, response, body) {
    console.log("Downloading database...");
    if (!error && response.statusCode == 200) {
        info = JSON.parse(body);
    }
    console.log("Database ok");
    return info;
}

//request(options, callback);

    
    

controller.hears(["Hello","Hey","Hi"],["direct_message","direct_mention","mention","ambient"],function(bot,message) {
    bot.reply(message,'Hi there!');
    console.log("Incoming message: "+message.text);
});

controller.hears([/^.{0,}Thank.{0,}$/, /^.{0,}thank.{0,}$/, /^.{0,}thx.{0,}$/],["direct_message","direct_mention","mention","ambient"],function(bot,message) {
    bot.reply(message,'No problems!');
    console.log("Incoming message: "+message.text);
});


controller.hears([/^.{0,}job.{0,}$/], ["direct_message","direct_mention","mention","ambient"], function (bot, message) {
  request(options, callback);
  console.log("Incoming message: "+message.text);
  bot.startConversation(message, function (err, convo) {
    convo.ask('What kind of job are you looking for?', function (response, convo) {
        console.log("Search term: "+response.text);
        theData = info['Blad1'];
        var results = [];
        var toSearch = response.text;

        for(var i=0; i<theData.length; i++) {
          for(key in theData[i]) {
            if(theData[i][key].indexOf(toSearch)!=-1) {
              results.push(theData[i]);
            }
          }
        }
        var resultMessage = {
            "attachments":[]
        };
        //var obj = JSON.parse(jsonStr);
        var row = 0;
        for(var i=0; i<results.length; i++) {
            row++;
            console.log(row+" match");
            newrow = '';
            newrow = { 
                "fallback": "jobs jobs jobs",
                "color":"#36a64f",
                "title": " "+results[i].title+" @"+results[i].company+" ",
                "title_link":"http://google.com"
        };
        resultMessage['attachments'].push(newrow);
        }

        //console.log(resultMessage);

        if (results.length > 0) {
            if (row === 1) {
                var ending = "";
            } else {
                var ending = "s";
            }
            convo.say("I found "+row+" opening"+ending+":");
            convo.say(resultMessage);
        } else {
            console.log("0 match");
            convo.say("Didn't find any jobs");
            convo.ask('Could you narrow it down by choosing a category?', function (response, convo) {
                if (response.text === 'yes') {
                     convo.say("Thanks");
                } else {
                    convo.say("Ok :-(");
                }
                convo.next()
            });

        }

      convo.next() // always call this to keep things flowing (check the readme for more info)
    })
  })
})

var bot = controller.spawn ({
    token:require('./config').token
});

bot.startRTM(function(err, bot, payload) {
    if (err) {
        console.log(err);
        throw new Error('Could not connect to Slack');
    }
});
