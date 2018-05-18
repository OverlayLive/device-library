// Import dependencies
// ----------------------------------------------------------------------------------------------------------------------------------------
var request = require('request');                                      // Load lib to read POST response from the API
// ----------------------------------------------------------------------------------------------------------------------------------------

/**
 * Module to read AQI values from the World Air Quality Index. API source http://aqicn.org/api/
 * @param manager The Overlay.live manager
 * @param refreshInterval the refresh interval
 * @param config_waqi the config for the readout
 */
function WAQIReader(manager, refreshInterval, config_waqi) {

  /**
   * Starts reading values.
   */
  this.startReading = function() {
    setInterval(this.read, refreshInterval);
  }

  this.read = function() {

    // Building query URL from the WAQI config file.
    var url = ""+ config_waqi.url + "@" + config_waqi.uid + "/?token=" + config_waqi.token;
    console.log('Querying API URL : '+url);  //debug - to clean up

    // Querying WAQI API for data
    request({
        url: url,
        json: true
    }, function (error, response, body) {
        if (!error && response.statusCode === 200) {

            console.log('--------------');

            if(body.data.hasOwnProperty('time')){
              console.log('time: '+body.data.time.s);
              manager.publish('aqi-s1-time', body.data.time.s);
            }else {
                console.log('temperature offline');
            }

            if(body.data.iaqi.hasOwnProperty('pm25')){
              console.log('PM 2.5: '+body.data.iaqi.pm25.v);
              manager.publish('aqi-s2-pm25', body.data.iaqi.pm25.v);
            }else {
                console.log('pm25 offline');
            }

            if(body.data.iaqi.hasOwnProperty('pm10')){
              console.log('PM 10: '+body.data.iaqi.pm10.v);
              manager.publish('aqi-s3-pm10', body.data.iaqi.pm10.v);
            }else {
                console.log('pm10 offline');
            }

            if(body.data.iaqi.hasOwnProperty('co')){
              console.log('CO2: '+ body.data.iaqi.co.v);
              manager.publish('aqi-s4-co2', body.data.iaqi.co.v);
            }else {
                console.log('co offline');
            }

            if(body.data.iaqi.hasOwnProperty('no2')){
              console.log('NO2: '+ body.data.iaqi.no2.v);
              manager.publish('aqi-s5-no2', body.data.iaqi.no2.v);
            }else {
                console.log('no2 offline');
            }

            if(body.data.iaqi.hasOwnProperty('so2')){
              console.log('SO2: '+ body.data.iaqi.so2.v);
              manager.publish('aqi-s6-so2', body.data.iaqi.so2.v);
            }else {
                console.log('so2 offline');
            }

            if(body.data.iaqi.hasOwnProperty('o3')){
              console.log('O3: '+ body.data.iaqi.o3.v);
              manager.publish('aqi-s7-o3', body.data.iaqi.o3.v);
            }else {
                console.log('o3 offline');
            }

            if(body.data.iaqi.hasOwnProperty('t')){
              console.log('temperature: '+body.data.iaqi.t.v);
              manager.publish('aqi-s8-temperature', body.data.iaqi.t.v);
            }else {
                console.log('temperature offline');
            }

            if(body.data.iaqi.hasOwnProperty('p')){
              console.log('ATM pressure: '+body.data.iaqi.p.v);
              manager.publish('aqi-s9-atmpressure', body.data.iaqi.p.v);
            }else {
                console.log('atm pressure offline');
            }
        }
    })
  }
};

module.exports = WAQIReader;
