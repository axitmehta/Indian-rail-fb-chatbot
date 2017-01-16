# Wit-Facebook
Wit.ai and Facebook Messenger Integration using IRCTC APIs
## Initial Installation
Fork this repository and clone.

```bash
git clone https://github.com/{forked}/Indian-rail-fb-chatbot.git
cd Indian-rail-fb-chatbot
npm install
 ```

## Configuration
### Wit Setting

Go to https://wit.ai/home and create a wit app for you. Read https://wit.ai/docs/quickstart 
Then, go to the setting in your wit app and get the token id.


Test the bot.js with your WIT_TOKEN, and make sure the bot is working.
```bash
 $WIT_TOKEN=insert_token_here node bot
 ```



### Facebook Page Creation
First you need to make a Facebook Page at https://www.facebook.com/pages/create/?ref_type=pages_browser, since the messenger bot will be connected to your facebook page.

### Facebook App Creation

* Add a new app at https://developers.facebook.com/quickstarts/?platform=web. Name it and click  "Create New Facebook App ID":

![image](https://cloud.githubusercontent.com/assets/901975/14749905/b557bf80-08f4-11e6-8218-2dd8dc7d529c.png)

* Add email, select category, an add web site. (Any URL is OK):

![image](https://cloud.githubusercontent.com/assets/901975/14749960/ef969b94-08f4-11e6-9fa6-3294a47fcf4e.png)

### Facebook Messenger Setting

* From https://developers.facebook.com/apps/, select the created app:

![image](https://cloud.githubusercontent.com/assets/901975/14757262/32399512-0924-11e6-924f-6b52d6303ecf.png)

* Select Messenger and get started:

![image](https://cloud.githubusercontent.com/assets/901975/14750051/6733be3e-08f5-11e6-9da7-a35eb2720298.png)

* Select the page you have created and get the Page Access Token:

![image](https://cloud.githubusercontent.com/assets/901975/14757285/78e65248-0924-11e6-9ffb-e6226a7d434f.png)

### Launch Server in Heroku

* Run heroku create and push to heroku:

```bash
cd Indian-rail-fb-chatbot
heroku create
git push heroku master
```


### Facebook Webhooks Setting

* The final step is to put this server URL in the Facebook app setting. From https://developers.facebook.com/apps/, select your app and messenger. You will see Webhooks:

![image](https://cloud.githubusercontent.com/assets/901975/14750370/0d98de98-08f7-11e6-8c6b-85733dab4fb4.png)

* Select "Setup Webhooks", and you will see callback URL and verify token. For the callback URL put your Hherokuapp URL + "/webhook". For example, my callback URL is https://irctcfbweb.herokuapp.com/webhook.

* Type the Verify Token that you set in the Heruku app setting. If you haven't set, the default value is "rememeber_my_pass".

* Click all items in the Subscription Fields.

![image](https://cloud.githubusercontent.com/assets/901975/14750713/c64e4ee0-08f8-11e6-8745-2ebc746ae367.png)

* Then, you will see the green complete!

![image](https://cloud.githubusercontent.com/assets/901975/14750734/e59c1016-08f8-11e6-9333-fbb7c92dd342.png)

* You may need to select the Facebook Page one more time and get the access token.

![image](https://cloud.githubusercontent.com/assets/901975/14757285/78e65248-0924-11e6-9ffb-e6226a7d434f.png)

* You need to fire this command to activate your messanger.

```bash
curl -X POST "https://graph.facebook.com/v2.6/me/subscribed_apps?access_token=<PAGE_ACCESS_TOKEN>"
```
* You may see:
```bash
{"success":true}
```

* Finally, go to the Facebook page you created/selected, and talk to your bot. Enjoy!

![image](https://cloud.githubusercontent.com/assets/901975/14750786/20ddf0a4-08f9-11e6-9c9c-719d1020e5d8.png)

![image](https://cloud.githubusercontent.com/assets/901975/14751164/2a485e2a-08fb-11e6-9a98-fd79bb0773f7.png)

## Testing

### Jest
 ```bash
 npm test
 ```

### Bot testing
 ```bash
 $WIT_TOKEN=insert_token_here node bot
 ```

### Server testing
First, run the server
```bash
 $WIT_TOKEN=insert_token_here node index
 ```
 In other shell, fire this command:
 ```bash
 $curl -X POST -H "Content-Type: application/json" -d @__tests__/msg.json http://localhost:8445/webhook
```


The USER_ID error is OK, but make sure the bot response well.

## Contribution
We welcome your comments and PRs!
