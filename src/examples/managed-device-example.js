var overlayliveDevice = require('../lib/overlaylive-device.js');

// 1. Setup the manager
var manager = new overlayliveDevice();

// 2. Describe used sensors one by one :
manager.declareSensor({
  'name': 'Temperature',
  'channel': 'temperature',
  'unit': '°C'
});
manager.declareSensor({
  'name': 'Voltage',
  'channel': 'voltage',
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
    manager.publish('temperature', temperature);

  }, 500);
});

function getTemperature() {
  var max = 90;
  var min = 50;
  return Math.random() * (max - min) + min;
}