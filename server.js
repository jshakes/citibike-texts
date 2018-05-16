import dotenv from 'dotenv';
import request from 'request-promise';
import twilio from 'twilio';

dotenv.config();

const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, RECIPIENT_PHONE, SENDER_PHONE, LATITUDE, LONGITUDE, NUM_STATIONS } = process.env;

const stationInfoUrl = 'https://gbfs.citibikenyc.com/gbfs/en/station_information.json';
const stationStatusUrl = 'https://gbfs.citibikenyc.com/gbfs/en/station_status.json';
const client = new twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

const findStations = () => {
  return request(stationInfoUrl)
    .then(json => {
      const { data } = JSON.parse(json);
      // sort the array by proximity to our lat/long
      data.stations.sort((a, b) => {
        const aLat = parseFloat(a.lat);
        const aLong = parseFloat(a.lon);
        const bLat = parseFloat(b.lat);
        const bLong = parseFloat(b.lon);
        const originLat = parseFloat(LATITUDE);
        const originLong = parseFloat(LONGITUDE);
        return getDistance(aLat, aLong, originLat, originLong) > getDistance(bLat, bLong, originLat, originLong) ? 1 : -1;
      });
      // slice the n nearest stations
      const nearest = data.stations.slice(0, NUM_STATIONS);
      // Return them as an object for easier indexing
      return nearest.reduce((obj, current, index) => {
        obj[parseInt(current.station_id)] = current;
        return obj;
      }, {});
    });
}

const queryStations = stations => {
  return request(stationStatusUrl)
    .then(json => {
      const { data, last_updated } = JSON.parse(json);
      const updateTime = new Date(last_updated * 1000);
      // merge the returned data onto our array of stations
      const stationsWithData = data.stations.map(station => {
        const { station_id } = station;
        if (typeof stations[station_id] === 'undefined') {
          return;
        }
        // merge the response data into our station object
        stations[station_id] = Object.assign(stations[station_id], station);
      });
      return {
        stations,
        updateTime,
      };
    });
}

const getMessage = (stations, updateTime) => {
  const ids = Object.keys(stations);
  return ids.reduceRight((str, id, index) => {
    const { name, num_bikes_available } = stations[id];
    return `${str} ${num_bikes_available} bike${num_bikes_available === 1 ? '' : 's'} at ${name}${index ? ',' : '.'}`;
  }, `As of ${updateTime.toLocaleTimeString()} there are`);
};

const sendText = body => {
  return client.messages.create({
    to: RECIPIENT_PHONE,
    from: SENDER_PHONE,
    body,
  })
    .then(message => console.log(`Message sent to ${RECIPIENT_PHONE} from ${SENDER_PHONE} with ID ${message.sid}. Message body: "${body}"`))
    .catch(err => console.error(`Message not sent to ${RECIPIENT_PHONE} from ${SENDER_PHONE}. Error message returned: "${err.message}" (${err.code})`));
};

const getDistance = (lat1, lon1, lat2, lon2) => {
  const radlat1 = Math.PI * lat1 / 180
  const radlat2 = Math.PI * lat2 / 180
  const theta = lon1-lon2
  const radtheta = Math.PI * theta / 180
  const dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  return Math.acos(dist)
};

findStations()
  .then(queryStations)
  .then(({ stations, updateTime }) => sendText(getMessage(stations, updateTime)));
