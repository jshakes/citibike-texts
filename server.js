import dotenv from 'dotenv';
import request from 'request-promise';
import twilio from 'twilio';

dotenv.config();

const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, RECIPIENT_PHONE, SENDER_PHONE } = process.env;

const url = 'https://gbfs.citibikenyc.com/gbfs/en/station_status.json';
const client = new twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

// array of stations to check, taken from https://gbfs.citibikenyc.com/gbfs/en/station_information.json
const stations = {
  3414: {
    name: 'Bergen/Flatbush',
  },
  3537: {
    name: 'Carlton/Dean',
  }
};

function makeRequest() {
  request(url)
    .then(json => {
      const { data, last_updated } = JSON.parse(json);
      const updateTime = new Date(last_updated * 1000);
      // merge the returned data onto our array of stations
      data.stations.map(station => {
        const { station_id } = station;
        if (typeof stations[station_id] === 'undefined') {
          return;
        }
        // merge the response data into our station object
        stations[station_id] = Object.assign(stations[station_id], station);
      });
      sendText(getMessage(stations, updateTime));
    });
}

const getMessage = (stations, updateTime) => {
  const ids = Object.keys(stations);
  return ids.reduce((str, id, index) => {
    const { name, num_bikes_available } = stations[id];
    const glue = index < ids.length - 1 ? index === ids.length - 2 ? ' and' : ',' : '.';
    return `${str} ${num_bikes_available} bikes at ${name}${glue}`;
  }, `${getGreeting()} As of ${updateTime.toLocaleTimeString()} there are`);
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if(hour < 12) {
    return 'Good morning!';
  }
  else if (hour < 18) {
    return 'Good afternoon!';
  }
  return 'Good evening!';
}

const sendText = body => {
  return client.messages.create({
    to: RECIPIENT_PHONE,
    from: SENDER_PHONE,
    body,
  })
    .then(message => console.log(`Message sent to ${RECIPIENT_PHONE} from ${SENDER_PHONE} with ID ${message.sid}. Message body: "${body}"`))
    .catch(err => console.error(`Message not sent to ${RECIPIENT_PHONE} from ${SENDER_PHONE}. Error message returned: "${err.message}" (${err.code})`));
}

makeRequest();
