// Import dependencies
// ----------------------------------------------------------------------------------------------------------------------------------------
var OverlayLiveDevice = require('../../lib/overlaylive-device.js'); // Overlay.live managed device library v2.1.1 maually
var sensors = require('./sensor-declaration.js');                   // Declaration of the sensors used bu this device
var config = require('./device-config.js');                         // Load the device configuration
var request = require("request");                                   // Load lib to ready POST from the API
var myParser = require("body-parser");
// ----------------------------------------------------------------------------------------------------------------------------------------

var AQI_Token = '4bc4b13a1a250e7e4f264972602e574790aae32a';

// 1. Setup the manager
// 1. Setup the manager
console.log('Initialize manager...');
var manager = new OverlayLiveDevice(config); // Setup the library
console.log('Manager initialized');

// 2. Describe sensors
console.log('Declare sensors...');
manager.declareSensors(sensors);
console.log(manager.getSensorList().length + ' sensors declared');

// 3. Connect to the Overlay.live platform
manager.start()
.then(function(){
  console.log('Start sensor readers...');
  // Start sensor watchs here
  var refreshInterval = 500;

  setInterval(function() {
    console.log("Loooop");

    var url = "http://api.waqi.info/feed/@" +
        "1599" +
        "/?token=4bc4b13a1a250e7e4f264972602e574790aae32a"

        console.log('URL : '+url);

    request({
        url: url,
        json: true
    }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            //console.log(body) // Print the json response

            console.log('--------------');

            console.log('time: '+body.data.time.s);
            manager.publish('aqi-s1-time', body.data.time.s);

            console.log('PM 2.5: '+body.data.iaqi.pm25.v);
            manager.publish('aqi-s2-pm25', body.data.iaqi.pm25.v);

            console.log('PM 10: '+body.data.iaqi.pm10.v);
            manager.publish('aqi-s3-pm10', body.data.iaqi.pm10.v);

            console.log('CO2: '+ body.data.iaqi.co.v);
            manager.publish('aqi-s4-co2', body.data.iaqi.co.v);

            console.log('NO2: '+ body.data.iaqi.no2.v);
            manager.publish('aqi-s5-no2', body.data.iaqi.no2.v);

            console.log('SO2: '+ body.data.iaqi.so2.v);
            manager.publish('aqi-s6-so2', body.data.iaqi.so2.v);

            console.log('O3: '+ body.data.iaqi.o3.v);
            manager.publish('aqi-s7-o3', body.data.iaqi.o3.v);

            console.log('temperature: '+body.data.iaqi.t.v);
            manager.publish('aqi-s8-temperature', body.data.iaqi.t.v);

            console.log('ATM pressure: '+body.data.iaqi.p.v);
            manager.publish('aqi-s9-atmpressure', body.data.iaqi.p.v);
        }
    })



  }, 1000);
})
.fail(function(err) {
  console.log('Error while starting the app :');
  console.log(err);
});
