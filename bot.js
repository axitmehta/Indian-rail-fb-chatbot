'use strict';
var shopifyAPI = require('shopify-node-api');
// Weather Example

const Wit = require('node-wit').Wit;
const log = require('node-wit').log;
const FB = require('./facebook.js');
const Config = require('./const.js');

var braintree = require("braintree");

var gateway = braintree.connect({
    environment: braintree.Environment.Sandbox,
    merchantId: "qbd46hhyx4zy9tg3",
    publicKey: "yhdkxtjmtzw94pwc",
    privateKey: "9dde3a2731ffa406b461f3571544390c"
});

var Shopify = new shopifyAPI({
    shop: 'sabhishek.myshopify.com', // MYSHOP.myshopify.com 
    shopify_api_key: 'b4b2caaa6d6736cdbe99e178a51d8c69', // Your API key 
    access_token: 'ebd1f4d9fde57eef33166572a9db7a51' // Your API password  
});

const firstEntityValue = (entities, entity) => {
    const val = entities && entities[entity] &&
        Array.isArray(entities[entity]) &&
        entities[entity].length > 0 &&
        entities[entity][0].value;
    if (!val) {
        return null;
    }
    return typeof val === 'object' ? val.value : val;
};



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
        sessions[sessionId] = { fbid: fbid, context: {} };
    }
    return sessionId;
};

// Bot actions
const actions = {


    send({ sessionId }, { text }) {
        // Our bot has something to say!
        // Let's retrieve the Facebook user whose session belongs to
        console.log("In send================>", sessionId);
        const recipientId = sessions[sessionId].fbid;
        if (recipientId) {
            console.log("In send================>", text);
            // Yay, we found our recipient!
            // Let's forward our bot response to her.
            // We return a promise to let our bot know when we're done sending
            return fbMessage(recipientId, text)
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


    // say(sessionId, context, message, cb) {
    //     console.log(context);

    //     // Bot testing mode, run cb() and return
    //     if (require.main === module) {
    //         cb();
    //         return;
    //     }

    //     // Our bot has something to say!
    //     // Let's retrieve the Facebook user whose session belongs to from context
    //     // TODO: need to get Facebook user name
    //     const recipientId = context._fbid_;
    //     if (recipientId) {


    //         if (message.quickreplies) { // Wit.ai wants us to include quickreplies, alright!
    //             message.quick_replies = [];

    //             for (var i = 0, len = message.quickreplies.length; i < len; i++) { // Loop through quickreplies
    //                 message.quick_replies.push({ title: message.quickreplies[i], content_type: 'text', payload: 'CUSTOM_TEXT' });
    //             }
    //             delete message.quickreplies;
    //         }
    //         //console.log("========================>message.quickreplies", message.quickreplies)
    //         // Yay, we found our recipient!
    //         // Let's forward our bot response to her.
    //         FB.fbMessage(recipientId, message, (err, data) => {
    //             if (err) {
    //                 console.log(
    //                     'Oops! An error occurred while forwarding the response to',
    //                     recipientId,
    //                     ':',
    //                     err
    //                 );
    //             }

    //             // Let's give the wheel back to our bot
    //             cb();
    //         });
    //     } else {
    //         console.log('Oops! Couldn\'t find user in context:', context);
    //         // Giving the wheel back to our bot
    //         cb();
    //     }
    // },
    // merge(sessionId, context, entities, message, cb) {

    //     // Retrieve the location entity and store it into a context field
    //     const loc = firstEntityValue(entities, 'location');
    //     console.log(loc);
    //     if (loc) {
    //         context.loc = loc; // store it in context
    //     }

    //     cb(context);
    // },

    // products(sessionId, context, cb) {
    //     Shopify.get('/admin/custom_collections.json', function(err, data) {
    //         console.log("+++++++++++++++++++++++++++++++++++++++=========");
    //         console.log(data);
    //     });
    //     Shopify.get('/admin/products.json', function(err, data) {


    //         var products_element = [];
    //         var len = data.products.length;
    //         for (var i = 0; i < len; i++) {
    //             products_element.push({
    //                     "title": data.products[i].title,
    //                     "subtitle": data.products[i].body_html,
    //                     "image_url": data.products[i].image.src,
    //                     "buttons": [{
    //                         "type": "web_url",
    //                         "url": "https://www.shopifystore.com",
    //                         "title": "Product url"
    //                     }, {
    //                         "type": "postback",
    //                         "title": "Buy Now",
    //                         "payload": "Payload for this product",
    //                     }],

    //                 }

    //             );
    //         }
    //         context.products = {
    //             "attachment": {
    //                 "type": "template",
    //                 "payload": {
    //                     "template_type": "generic",
    //                     "elements": products_element
    //                 }
    //             }
    //         };
    //         context.products = JSON.stringify(context.products);

    //         cb(context);
    //     });


    // },
    // addToCart(sessionId, context, cb) {
    //     var post_data = {
    //         "order": {
    //             "line_items": [{
    //                 "variant_id": 30640288652,
    //                 "quantity": 1
    //             }],
    //             "customer": {
    //                 "first_name": "Paul",
    //                 "last_name": "Norman",
    //                 "email": "paul.norman@example.com"
    //             },
    //             "billing_address": {
    //                 "first_name": "John",
    //                 "last_name": "Smith",
    //                 "address1": "123 Fake Street",
    //                 "phone": "555-555-5555",
    //                 "city": "Fakecity",
    //                 "province": "Ontario",
    //                 "country": "Canada",
    //                 "zip": "K2P 1L4"
    //             },
    //             "shipping_address": {
    //                 "first_name": "Jane",
    //                 "last_name": "Smith",
    //                 "address1": "123 Fake Street",
    //                 "phone": "777-777-7777",
    //                 "city": "Fakecity",
    //                 "province": "Ontario",
    //                 "country": "Canada",
    //                 "zip": "K2P 1L4"
    //             },
    //             "email": "jane@example.com",
    //             "transactions": [{
    //                 "kind": "authorization",
    //                 "status": "success",
    //                 "amount": 50.0
    //             }],
    //             "financial_status": "partially_paid"
    //         }
    //     };
    //     Shopify.post('/admin/orders.json', post_data, function(err, data, headers) {
    //         console.log("++++++++++++++++++++++++++");
    //         console.log(data);
    //         cb(context);
    //     });
    // },

    // trackOrder(sessionId, context, cb) {
    //     console.log(context);
    //     cb(context)
    // },
    // error(sessionId, context, error) {
    //     console.log(error.message);
    // },
    // // fetch-weather bot executes
    // ['fetch-weather'](sessionId, context, cb) {
    //     // Here should go the api call, e.g.:
    //     // context.forecast = apiCall(context.loc)
    //     context.forecast = 'sunny';
    //     cb(context);
    // },
};


const getWit = () => {
    return new Wit({
        accessToken: Config.WIT_TOKEN,
        actions,
        logger: new log.Logger(log.INFO)
    });
};


exports.getWit = getWit;

// bot testing mode
// http://stackoverflow.com/questions/6398196
if (require.main === module) {
    console.log("Bot testing mode.");
    const client = getWit();
    client.interactive();
}