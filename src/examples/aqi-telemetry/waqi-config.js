module.exports = {
  url: 'http://api.waqi.info/feed/',                        // Get you API data for a single location. More info : http://aqicn.org/json-api/doc/
  token: '4bc4b13a1a250e7e4f264972602e574790aae32a',        // Please don't use token key, get your own token for free at http://aqicn.org/api/
  uid: '1599'                                               // UID of the city you want to query
}


// To find the nearest available source (UID) to query, you may use the API as following : https://api.waqi.info/search/?token={YOUR_TOKEN}&keyword=taiwan
