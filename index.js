'use strict';

// Messenger API integration example
// We assume you have:
// * a Wit.ai bot setup (https://wit.ai/docs/quickstart)
// * a Messenger Platform setup (https://developers.facebook.com/docs/messenger-platform/quickstart)
// You need to `npm install` the following dependencies: body-parser, express, request.
//
const request = require('request');
const bodyParser = require('body-parser');
const express = require('express');
const crypto = require('crypto');
const fetch = require('node-fetch');

const Wit = require('node-wit').Wit;
const log = require('node-wit').log;

// get Bot, const, and Facebook API

//const bot = require('./bot.js');

const Config = require('./const.js');
const FB = require('./facebook.js');

var fs = require("fs");
var https = require('https');
// Setting up our bot


// Webserver parameter
const PORT = process.env.PORT || 8000;


// Wit.ai bot specific code

// This will contain all user sessions.
// Each session has an entry:
// sessionId -> {fbid: facebookUserId, context: sessionState}
const sessions = {};

const findOrCreateSession = (fbid) => {
    let sessionId;
    // Let's see if we already have a session for the user fbid
    Object.keys(sessions).forEach(k => {
        if (sessions[k].fbid === fbid) {
            // Yep, got it!
            sessionId = k;
        }
    });
    if (!sessionId) {
        // No session found for user fbid, let's create a new one
        sessionId = new Date().toISOString();
        sessions[sessionId] = {
            fbid: fbid,
            context: {
                _fbid_: fbid
            }
        }; // set context, _fid_
    }
    return sessionId;
};
// Our bot actions
const actions = {
    send({sessionId}, response) {
        // Our bot has something to say!
        // Let's retrieve the Facebook user whose session belongs to
        
        const recipientId = sessions[sessionId].fbid;
        if (recipientId) {
            if (IsJsonString(response.text)) {
                response.attachment = response.text;
                delete response.text;
            }
            if (typeof response.quickreplies != undefined && response.quickreplies) { // Wit.ai wants us to include quickreplies, alright!
                response.quick_replies = []; // The quick reply object from Wit.ai needs to be renamed.
                for (var i = 0, len = response.quickreplies.length; i < len; i++) { // Loop through quickreplies
                    response.quick_replies.push({ title: response.quickreplies[i], content_type: 'text', payload: 'CUSTOM_WIT_AI_QUICKREPLY_ID' + i });
                }
                delete response.quickreplies;
            }
            console.log("=====================>response", response)
                // Yay, we found our recipient!
                // Let's forward our bot response to her.
                // We return a promise to let our bot know when we're done sending
            return FB.fbMessage(recipientId, response)
                .then(() => null)
                .catch((err) => {
                    console.error(
                        'Oops! An error occurred while forwarding the response to',
                        recipientId,
                        ':',
                        err.stack || err
                    );
                });
        } else {
            console.error('Oops! Couldn\'t find user for session:', sessionId);
            // Giving the wheel back to our bot
            return Promise.resolve()
        }
    },
    getPnrStatus({context, entities}) {

        return new Promise(function(resolve, reject) {

           var pnr= entities.pnr[0].value;
           console.log("PNR============>",pnr);
            request('http://api.railwayapi.com/pnr_status/pnr/1234567890/apikey/7qv3y07t/', function (error, response, body) {
               
               
                if(error) {   
                    context.PnrStatus = "Sorry! something went wrong";
                    return resolve(context);
                }
                if (!error && response.statusCode == 200) {
                      context.PnrStatus = response.train_name;
                    return resolve(context);
                }
               else if (!error && response.statusCode == 410) {
                      context.PnrStatus = "Flushed PNR / PNR not yet generated";
                    return resolve(context);
                }
               else if (!error && response.statusCode == 404) {
                      context.PnrStatus = "Service Down / Source not responding";
                    return resolve(context);
                }

                
            
            });


        });
        

    }
   
};


const wit = Wit({
    accessToken: Config.WIT_TOKEN,
    actions,
    logger: new log.Logger(log.INFO)
});

// Starting our webserver and putting it all together
const app = express();
app.set('port', PORT);

 app.listen(app.get('port'));

app.use(({ method, url }, rsp, next) => {
    rsp.on('finish', () => {
        console.log(`${rsp.statusCode} ${method} ${url}`);
    });
    next();
});
app.use(bodyParser.json());
// Webhook setuptext
app.get('/webhook', (req, res) => {
    if (req.query['hub.mode'] === 'subscribe' &&
        req.query['hub.verify_token'] === Config.FB_VERIFY_TOKEN) {
        res.send(req.query['hub.challenge']);
    } else {
        res.sendStatus(400);
    }
});


// index. Let's say something fun
app.get('/', function(req, res) {
    res.send('"Bot is healthy!."');
});


// Message handler
app.post('/webhook', (req, res) => {
    // Parse the Messenger payload
    // See the Webhook reference
    // https://developers.facebook.com/docs/messenger-platform/webhook-reference
    const data = req.body;

   

    if (data.object === 'page') {

        data.entry.forEach(entry => {
            entry.messaging.forEach(event => {

                if (event.message || event.postback) {

                    if (event.postback) {
                        event.message = {
                            text: event.postback.payload
                        };
                    }

                    // Yay! We got a new message!
                    // We retrieve the Facebook user ID of the sender
                    const sender = event.sender.id;

                    // We retrieve the user's current session, or create one if it doesn't exist
                    // This is needed for our bot to figure out the conversation history
                    const sessionId = findOrCreateSession(sender);

                    // We retrieve the message content
                    const { text, attachments } = event.message;

                    if (attachments) {
                        // We received an attachment
                        // Let's reply with an automatic message
                        fbMessage(sender, { text: 'Sorry I can only process text messages for now.' })
                            .catch(console.error);
                    } else if (text) {
                        // We received a text message

                        // Let's forward the message to the Wit.ai Bot Engine
                        // This will run all actions until our bot has nothing left to do
                        wit.runActions(
                                sessionId, // the user's current session
                                text, // the user's message
                                sessions[sessionId].context // the user's current session state
                            ).then((context) => {
                                // Our bot did everything it has to do.
                                // Now it's waiting for further messages to proceed.
                                console.log('Waiting for next user messages');

                                // Based on the session state, you might want to reset the session.
                                // This depends heavily on the business logic of your bot.
                                // Example:
                                // if (context['done']) {
                                //   delete sessions[sessionId];
                                // }

                                // Updating the user's current session state
                                sessions[sessionId].context = context;
                            })
                            .catch((err) => {
                                console.error('Oops! Got an error from Wit: ', err.stack || err);
                            })
                    }
                } else {
                    console.log('received event', JSON.stringify(event));
                }
            });
        });
    }
    res.sendStatus(200);
});

function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}


/*
 * Verify that the callback came from Facebook. Using the App Secret from
 * the App Dashboard, we can verify the signature that is sent with each
 * callback in the x-hub-signature field, located in the header.
 *
 * https://developers.facebook.com/docs/graph-api/webhooks#setup
 *
 */
function verifyRequestSignature(req, res, buf) {
    var signature = req.headers["x-hub-signature"];

    if (!signature) {
        // For testing, let's log an error. In production, you should throw an
        // error.
        console.error("Couldn't validate the signature.");
    } else {
        var elements = signature.split('=');
        var method = elements[0];
        var signatureHash = elements[1];

        var expectedHash = crypto.createHmac('sha1', Config.FB_APP_SECRET)
            .update(buf)
            .digest('hex');

        if (signatureHash != expectedHash) {
            throw new Error("Couldn't validate the request signature.");
        }
    }
}
