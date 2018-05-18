// About this sample code.
// All the data pulled for this example is sourced through the aqicn.org API.
// To use this sample code, please get your own API key over here: http://aqicn.org/data-platform/token/#/
// All credit for the data goes to the World Air Quality Index project (WAQI) as well as the EPA that captured the data locally via sensors and made it accessible
// Here is a complete list of EPAs that may provide data depening of your API querry : http://aqicn.org/sources/
// Note: there is a limite of 1000 queries per minute.
// Thanks!

// Import dependencies
// ----------------------------------------------------------------------------------------------------------------------------------------
var OverlayLiveDevice = require('overlaylive-device-library'); // Overlay.live managed device library v2.1.1 maually
var sensors = require('./sensor-declaration.js');                   // Declaration of the sensors used bu this device
var config = require('./device-config.js');                         // Load the device configuration
var WAQIReader = require('./waqi-reader.js');                       // The I2C reader
var config_waqi = require('./waqi-config.js');                      // Load WAQI API config file
// ----------------------------------------------------------------------------------------------------------------------------------------

var AQI_Token = '4bc4b13a1a250e7e4f264972602e574790aae32a';

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
  var refreshInterval = 1000;

  // WAQI Reader
  var myReader = new WAQIReader(manager, refreshInterval, config_waqi);
  myReader.startReading();
  console.log(' > Started WAQI Reader');
})
.fail(function(err) {
  console.log('Error while starting the app :');
  console.log(err);
});
