// Import dependencies
// ----------------------------------------------------------------------------------------------------------------------------------------
var OverlayLiveDevice = require('overlaylive-device-library');  // Overlay.live managed device library v2.1.1 maually
var sensors = require('./sensor-declaration.js');               // Declaration of the sensors used bu this device
var config = require('./device-config.js');

const {PythonShell} = require('python-shell');                  // Required to read through the CircuitPython lib
// ----------------------------------------------------------------------------------------------------------------------------------------


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

    setupSoilHUM();	// call function to read from the sensor through Python.

    // Start sensor watchs here
    var refreshInterval = 1000;

  })
  .fail(function(err) {
  console.log('Error while starting the app :');
  console.log(err);
});


function setupSoilHUM(){
	var options = {
	    pythonPath: 'python3',
	    mode: 'json',
	    pythonOptions: ['-u'],
	    scriptPath: './',
	};
	var Monitor = new PythonShell('moisture.py', options);
	Monitor.on('message', parseDataToOverlayLive);
}

function parseDataToOverlayLive(message){
	console.log(message);

	if(message.Status === undefined){ //only read if there is something to read...

  //loop into properties
	for(var key in message){
    console.log('Publish on channel ' + channel + '...');
    var channel = key;
    var data = message[key];
    publishData(channel, data.toFixed(0)); //publishing readings and removing decimals
	 }
  }
}

function publishData(channel, data){
	manager.publish(channel, data).then(function(){
		console.log('Data sent on channel ' + channel);
		}, function(err) {
			console.log(err);
		});
}
