'use strict';
const crypto = require('crypto');
// Wit.ai parameters
const WIT_TOKEN = process.env.WIT_TOKEN;
if (!WIT_TOKEN) {
    throw new Error('missing WIT_TOKEN');
}
  
// Messenger API parameters
const FB_PAGE_TOKEN = process.env.FB_PAGE_TOKEN;
const FB_APP_SECRET = process.env.FB_APP_SECRET ;

const FB_VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN;

if (!FB_VERIFY_TOKEN) {
	throw new Error('missing FB_VERIFY_TOKEN');
    // FB_VERIFY_TOKEN = "just_do_it";
}


// crypto.randomBytes(8, (err, buff) => {
//     if (err) throw err;
//     FB_VERIFY_TOKEN = buff.toString('hex');
//     console.log(`/webhook will accept the Verify Token "${FB_VERIFY_TOKEN}"`);
// });


module.exports = {
    WIT_TOKEN: WIT_TOKEN,
    FB_PAGE_TOKEN: FB_PAGE_TOKEN,
    FB_VERIFY_TOKEN: FB_VERIFY_TOKEN,
};