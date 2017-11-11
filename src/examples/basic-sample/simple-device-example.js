var overlayliveDevice = require('../../lib/overlaylive-device.js');
var config = require('./device-config.js');

// 1. Setup the manager
var manager = new overlayliveDevice(config);

// 2. Describe used sensors one by one :
manager.declareSensor({
  'name': 'Temperature',
  'channel': 'channel_temperature',
  'unit': '°C'
});
manager.declareSensor({
  'name': 'Voltage',
  'channel': 'channel_voltage',
  'unit': 'V'
});

// ... or load them from an array definition :
manager.declareSensors([{
  'name': 'Altitude',
  'channel': 'altitude',
  'unit': 'm'
}, {
  'name': 'Speed',
  'channel': 'speed',
  'unit': 'km/h'
}])

// 3. Connect to the Overlay.live platform
manager.start().then(function(){
  // Setup sensor watchs here
  setInterval(function() {
    // Custom code here to retreive the sensor value
    var temperature = getTemperature();

    // Publish the value to the Overlay.live platform
    manager.publish('channel_voltage', temperature);

    console.log('Sending data...');

  }, 500);
});

function getTemperature() {
  var max = 90;
  var min = 50;
  return Math.random() * (max - min) + min;
}