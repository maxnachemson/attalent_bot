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
    console.log("Database OK");
    return info;
}

//request(options, callback);

    
    

controller.hears(["Hello","Hey","Hi","Yo"],["direct_message","direct_mention","mention","ambient"],function(bot,message) {
    bot.reply(message,'Hi there!');
    console.log("Incoming message: "+message.text);
});

controller.hears([/^.{0,}Thank.{0,}$/, /^.{0,}thx.{0,}$/],["direct_message","direct_mention","mention","ambient"],function(bot,message) {
    bot.reply(message,'No problems!');
    console.log("Incoming message: "+message.text);
});

//
// case sensetive
// category list

controller.hears([/^.{0,}job.{0,}$/], ["direct_message","direct_mention","mention","ambient"], function (bot, message) {
  request(options, callback);
  console.log("Incoming message: "+message.text);
  bot.startConversation(message, function (err, convo) {
    convo.ask('What kind of job are you looking for?', function (response, convo) {
        
        theData = info['Blad1'];
        console.log("Total jobs in database: "+theData.length);
        console.log("Search term: "+response.text);
        var results = [];
        toSearch = response.text;
        categoryArr = [];
        //Loop through the data from the database
        for(var i=0; i<theData.length; i++) {
          categoryArr[i] = theData[i].category;
          for(key in theData[i]) {
            if(theData[i][key].includes(toSearch)) {
              results.push(theData[i]);
              break;
            }
          }
        }

        //Filter category array & create message
        var categories = categoryArr.filter(function(item, i, ar){ return ar.indexOf(item) === i; });
        var categoryMsg = "";
        for(var i=0; i<categories.length; i++) {
            categoryMsg += "*"+categories[i]+"*\n";
        }

        //Construct respond message
        var resultMessage = {
            "attachments":[]
        };
        var row = 0;
        for(var i=0; i<results.length; i++) {
            row++;
            console.log(row+" match");
            newrow = '';
            newrow = { 
                "fallback": "jobs jobs jobs",
                "color":"#36a64f",
                "title": " "+results[i].title+" @"+results[i].company+" ",
                "title_link": results[i].link
        };
        resultMessage['attachments'].push(newrow);
        }

        
        //Send respond message
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
            convo.say("I couldn't find any jobs related to _"+toSearch+"_");
            convo.ask('Try narrowing it down by choosing a category: \n'+categoryMsg, function (response, convo) {
                toSearch = response.text;
                categoryArr = [];
                //Loop through the data from the database
                for(var i=0; i<theData.length; i++) {
                  categoryArr[i] = theData[i].category;
                  for(key in theData[i]) {
                    if(theData[i][key].includes(toSearch)) {
                      results.push(theData[i]);
                      break;
                    }
                  }
                }
                //Construct respond message
                var resultMessage = {
                    "attachments":[]
                };
                var row = 0;
                for(var i=0; i<results.length; i++) {
                    row++;
                    console.log(row+" match");
                    newrow = '';
                    newrow = { 
                        "fallback": "jobs jobs jobs",
                        "color":"#36a64f",
                        "title": " "+results[i].title+" @"+results[i].company+" ",
                        "title_link": results[i].link
                };
                resultMessage['attachments'].push(newrow);
                }
                //Send respond message
                if (results.length > 0) {
                    if (row === 1) {
                        var ending = "";
                    } else {
                        var ending = "s";
                    }
                    convo.say("I found "+row+" opening"+ending+":");
                    convo.say(resultMessage);
                }
                convo.next();
            });

        }

      convo.next() // always call this to keep things flowing (check the readme for more info)
    })
  })
})


controller.spawn({
	  token: process.env.SLACK_TOKEN
}).startRTM((err, bot, payload) => {
	if (err) {
	    throw new Error('Could not connect to Slack');
	}
});
