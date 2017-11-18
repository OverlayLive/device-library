# The Overlay.live Library

## Overlay.live Platform

Overlay.live is a platform to send real-time data across multiple devices and display it as an overlay on a live broadcast stream. for more details about the platform, see [the official Overlay.live website](https://overlay.live).

With the *Overlay.live Library*, you can connect to the Overlyay.live platform to send custom data from your own devices (physical or virtual).

## Getting Started

### Prerequisites

In order to use a custom device, you first need to create an account on the [Overlay.live dashboard](https://my.overlay.live/) and create a manual device. See the [dashboard documentation](https://overlay.live/documentation/device-management/add-manual-device/) for more details on how to do it.


### Installing

To use Overlay.live Library in your project, install it with npm :

```
npm install --save overlaylive-device-library
```

An example of how to use the library is provided in the examples folder. Here are the basics steps to setup your device :

Setup the manager :

```
var overlayliveDevice = require('overlaylive-device-library');
var config = require('device-config.js'); // Load the device configuration
var manager = new overlayliveDevice(config); // Setup the library
```

The ```device-config.js``` file must contain device configuration as shown below. This file can be renamed or moved somewhere else as long as it still contains this structure :

```
module.exports = {
  apiKey: 'YOUR_OVERLAYLIVE_API_KEY',
  ingest: 'ingest.epeakgears.com',
  deviceKey: 'YOUR_CUSTOM_DEVICE_NAME'
}
```

Describe the sensors you will use :

```
manager.declareSensor({
  'name': 'Temperature',
  'channel': 'temperature-channel'
});
manager.declareSensor({
  'name': 'Voltage',
  'channel': 'voltage-channel'
});
```

Start the manager and setup the sensors to publish data on the Overlay.live platform :
```
manager.start().then(function(){
  // Setup sensor watchs here
  setInterval(function() {
    // Custom code here to retreive the sensor value
    var temperature = getTemperature();

    // Publish the value to the Overlay.live platform
    manager.publish('temperature-channel', temperature);

  }, 500);
});
```

To wire a custom function to be called from somewhere else on your device, you have to declare a "command". Here is the syntax :
```
lib.declareCommand('command_name', function() {
  // Your device code goes here
  var computedVar = 'Hello';
  return computedVar;
});
```

In order to call this command remotely, you will have to call the procedure ```COMMAND``` with the given parameters :

 1. The command name
 2. The command parameters (can be anything depending on how you want to manage it in your function)

Here, we are calling the remote command ```say_hello``` with the parameter ```{name:'Overlay.live'}```
```
// autobahn session
session.call('COMMAND', ['say_hello', {name:'Overlay.live'}])
.then(function(result) {
  // OK
}, function(err) {
  // Error
});
```

The result is processed as a promise returning an object with this structure :
```
{
  status: '', // OK if command was executed properly, KO if there was an execution error
  result: '', // The returned value of your command to be usd by the callee
  error: ''   // The error stacktrace if there was some error while running your code
}
```

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/OverlayLive/device-library/tags). 

## Authors

* **Alex Frêne** - *Initial work* - [Drakulo](https://github.com/Drakulo)

See also the list of [contributors](https://github.com/OverlayLive/device-library/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details