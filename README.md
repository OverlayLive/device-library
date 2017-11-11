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
  'channel': 'temperature'
});
manager.declareSensor({
  'name': 'Voltage',
  'channel': 'voltage'
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
    manager.publish('Temperature', temperature);

  }, 500);
});
```

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/OverlayLive/device-library/tags). 

## Authors

* **Alex Frêne** - *Initial work* - [Drakulo](https://github.com/Drakulo)

See also the list of [contributors](https://github.com/OverlayLive/device-library/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details