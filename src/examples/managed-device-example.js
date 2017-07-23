var overlayliveDevice = require('../lib/overlaylive-device.js');

// 1. Setup the manager
var manager = new overlayliveDevice();

// 2. Describe used sensors
manager.declareSensor({
  'name': 'Temperature',
  'channel': 'temperature'
});

manager.declareSensor({
  'name': 'Voltage',
  'channel': 'voltage'
});

// 3. Connect to the Overlay.live platform
manager.start().then(function(){
  // Start sensor watchs
  setInterval(function() {
    // Custom code here to retreive the sensor value
    var temperature = getTemperature();
    // Publish the value
    manager.publish('Temperature', temperature);

  }, 500);
});

function getTemperature() {
  var max = 90;
  var min = 50;
  return Math.random() * (max - min) + min;
}