# Citibike Texts

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

A roll-your-own application for sending scheduled SMS messages with the number of bikes in your nearest New York Citibike docks. Requires a [Twilio account](https://www.twilio.com/try-twilio) (a free one works fine).

## Scheduling from Heroku

In order for this to be useful, you'll want to receive an SMS at set times, e.g. before you leave home/work. The easiest and free-est way to do this is using Heroku.

Using the above button, deploy the application and set your config vars.

After deployment, go to Manage App, then from the Resources tab, Heroku Scheduler. Set the Scheduler to run `npm run notify` at the desired time.

## Running locally

Copy `.env.example` to `.env` (`$ cp .env.example .env`) and enter your credentials.

- `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` - your account credentials from Twilio (sign up for a free account here if you don't already have one https://www.twilio.com/try-twilio).
- `RECIPIENT_PHONE` - the number to send the SMS from as provisioned by Twilio. Format is +11235551111
- `SENDER_PHONE` - the number that will receive the SMS. Ensure this is whitelisted to receive texts in your Twilio account. Format is +11235551111
- `LATITUDE` and `LONGITUDE` - The coordinates from which to seach for bikes. Get your location using https://www.latlong.net/ or similar
- `NUM_STATIONS` - How many nearest stations from whic to report availability. These will be the n nearest stations as the crow flies from the provided latitude and longitude.

To run the script: `$ npm run notify`. This will send a one-off text to the provided number.
