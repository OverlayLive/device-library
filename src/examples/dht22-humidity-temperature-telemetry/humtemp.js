//Includes
var sensorLib = require("node-dht-sensor");
var overlayliveDevice = require('../lib/overlaylive-device.js');
var config = require('./device-config.js');

// Vars
var sensor = require('node-dht-sensor');


// 1. Setup the manager
var manager = new overlayliveDevice(config);


// 2. Describe used sensors - load them from array definition
manager.declareSensors([{
  'name': 'Temperature',
  'channel': 'temperature',
  'unit': 'C'
}, {
  'name': 'Humidity',
  'channel': 'humidity',
  'unit': '%'
}])



// 3. Connect to the Overlay.live platform
manager.start().then(function(){
  // Setup sensor watchs here
  setInterval(function() {
    // Custom code here to retreive the sensor value

	sensor.read(22, 4, function(err, temperature, humidity) {
	    if (!err) {
	        console.log('temp: ' + temperature.toFixed(1) + '°C, ' +
	            'humidity: ' + humidity.toFixed(1) + '%'
	        );
	
		// Publish the value to the Overlay.live platform
    		manager.publish('temperature', temperature.toFixed(1));
    		manager.publish('humidity', humidity.toFixed(1));
	    }
	});

  }, 500);
});

