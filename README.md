# Citibike Texts

Receive a text with the number of bikes in your nearest New York Citibike docks.

To use, copy `.env.example` to `.env` (`$ cp .env.example .env`) and enter your credentials.

- `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` - your account credentials from Twilio (sign up for a free account here if you don't already have one https://www.twilio.com/try-twilio).
- `RECIPIENT_PHONE` - the number to send the SMS from as provisioned by Twilio.
- `SENDER_PHONE` - the number that will receive the SMS. Ensure this is whitelisted to receive texts in your Twilio account.
- `LATITUDE` and `LONGITUDE` - The coordinates from which to seach for bikes. Get your location using https://www.latlong.net/ or similar
- `NUM_STATIONS` - How many nearest stations from whic to report availability. These will be the n nearest stations as the crow flies from the provided latitude and longitude.

To run the script: `$ npm start`.

### Scheduling from Heroku

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

In order for this to be useful, you want to receive an SMS every day before you leave home/work. The easiest and free-est way to do this is using Heroku.

Once you have set up the app, set up your config vars either using the Heroku CLI (e.g. `heroku config:set TWILIO_ACCOUNT_SID=MY_TWILIO_ACCOUNT_SID ...`) or from the Settings tab.

![Vars](/img/vars.png)

From Resources, install the Heroku Scheduler add on and set it to run `npm start` at the desired time.

![Vars](/img/scheduler.png)
