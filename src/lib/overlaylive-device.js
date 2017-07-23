var fs = require('fs');
var Q = require('q');
var autobahn = require('autobahn');

/**
 * The Overlay.live device management library.
 */
var OverlayLiveDevice = function() {
  /* Shortcut to the service  */
  var lib = this;

  /* The declared sensors */
  this.sensors = [];

  /* The extensible defualt settings for manual use */
  this.settings = {
    mode: 'manual',
    configFile: 'device-config.js'
  };

  /* The system ingest data */
  this.systemIngest = {};

  /* The user ingest data */
  this.userIngest = {};

  /* The publish calls timestamps */
  this.publishCalls = {};

  /**
   * Setup the manager for the managed mode.
   */
  this.setManagedMode = function() {
    lib.settings.mode = 'managed';
    lib.settings.configFile = '/data/overlaylive-config.json';
  }

  /**
   * Returns the API key of the device depending on the mode.
   */
  this.getApiKey = function() {
    var apiKey = undefined;
    if(lib.settings.mode === 'manual') {
      // Search the API Key inthe configFile
      var deviceConfig = require(lib.settings.configFile);
      apiKey = deviceConfig.apiKey;
    } else {
      // Get API key from the env variable
      apiKey = process.env.API_KEY;
	    //console.log(apiKey === undefined);
      if(apiKey === undefined) {
        // The device is not initialized yet, get this value from the config file
        var deviceConfig = require(lib.settings.configFile);
        apiKey = deviceConfig.apiKey;
      }
    }

    return apiKey;
  }

  /**
   * Returns the user ingest. 
   */
  this.getIngest = function() {
    var ingest = undefined;
    if(lib.settings.mode === 'manual') {
      // Search the ingest server in the configFile
      var deviceConfig = require(lib.settings.configFile);
      ingest = deviceConfig.ingest;
    } else {
      ingest = process.env.INGEST;
      if(ingest === undefined) {
        // ingest device is not initialized yet, get this value from the config file
        var deviceConfig = require(lib.settings.configFile);
        ingest = deviceConfig.ingest;
      }
    }
    return ingest;
  }

  /**
   * Returns the device Key.
   */
  this.getDeviceKey = function() {
    var deviceID = undefined;
    if(lib.settings.mode === 'manual') {
      // Search for the device ID in the configFile
      var deviceConfig = require(lib.settings.configFile);
      deviceID = deviceConfig.deviceKey;
    } else {
      deviceID = process.env.RESIN_DEVICE_UUID;
    }
    return deviceID;
  }

  /**
   * Declares a new sensor to be used by this device.
   */
  this.declareSensor = function(sensorData) {
    // Check data structure
    if(!lib.checkSensorStructure(sensorData)) {
      var msg = 'Sensor data does not have a proper structure : ' + JSON.stringify(sensorData);
      throw msg;
    }

    lib.sensors.push(sensorData);
  }
  
  /**
   * Declares an array of sensors.
   */
  this.declareSensors = function(sensors) {
	if(sensors === undefined || !sensors instanceof Array) {
		throw 'Sensors must be a defined array';
	}
	
	for(var i = 0; i < sensors.length; i++) {
		lib.declareSensor(sensors[i]);
	}
  }

  /**
   * Check that the given sensor channel is registered
   */
  this.hasSensor = function(sensorChannel) {
    var hasSensor = false;
    var i = 0;
    while(!hasSensor && i < lib.sensors.length) {
      if(lib.sensors[i].channel === sensorChannel) {
        hasSensor = true;
      }
      i++;
    }

    return hasSensor;
  }

  /**
   * Checks that the sensorData has all mandatory properties.
   */
  this.checkSensorStructure = function(sensorData) {
    var isOk = true;
    var properties = ['channel', 'name'];
    for(var i = 0; i < properties.length; i++) {
      if(sensorData[properties[i]] === undefined) isOk = false;
    }
    return isOk;
  }

  /**
   * Return the sensor list.
   */
  this.getSensorList = function() {
    return lib.sensors;
  }

  /**
   * Format the sensor list to be used by the Overlay.live platform.
   */
  this.callProcedureListSensors = function() {
    console.log('Asked for sensor list : ' + lib.sensors);
    return {
      sensors: lib.sensors
    }
  }

  /**
   * Connect the device to the system ingest server of the Overlay.live platform.
   */
  this.connectToSystemIngest = function() {
    var def = Q.defer();
	  var ingest = lib.getIngest();
    console.log('Connect to system ingest ' + ingest + '...');
    var connection = new autobahn.Connection({
      max_retries: 0,
      url: 'wss://' + ingest + ':1337/ws',
      realm: 'overlay.live.system' 
    });
    
    connection.onopen = function(session) {
      console.log('Connected to system ingest');
      lib.systemIngest.session = session;
      def.resolve(session);
    };

    connection.onclose = function(reason, details) {
      console.log('Error when connecting to system ingest server: ' + reason);
      console.log(details);
      def.reject(reason);
    }
    
    connection.open();

    return def.promise;
  }

  /**
   * Registers a device on the Overlay.live platform.
   */
  this.registerDevice = function() {
    console.log('Register device...');
    if(lib.systemIngest === undefined || lib.systemIngest.session === undefined) {
      throw 'Not connected to the system ingest';
    }

    var deviceId = lib.getDeviceKey();
    var realm = lib.getApiKey();
    var ingest = lib.getIngest();
    var def = Q.defer();
    var uuid = process.env.RESIN_DEVICE_UUID;
    lib.systemIngest.session.call('declare.device', [deviceId, realm, ingest, uuid], {}, {receive_progress: true}).then(function(answer) {
      def.resolve();
    }).catch(function(err) {
      def.reject(err);
    });

    return def.promise;
  }

  /**
   * Connect the device to the user ingest on the Overlay.live platform.
   */
  this.connectToUserIngest = function() {
    var def = Q.defer();
    var ingest = lib.getIngest();
    var apiKey = lib.getApiKey();
    console.log('Connect to user ingest ' + ingest + ' with API key ' + apiKey + '...');
    var connection = new autobahn.Connection({
      max_retries: 1,
      url: 'wss://' + ingest + ':1337/ws',
      realm: apiKey
    });
    
    connection.onopen = function(session) {
      console.log('Connected to user ingest');

      lib.userIngest.session = session;
      // Register procedures
      var deviceKey = lib.getDeviceKey();
      var uri = deviceKey + '.proc_list_sensors';
      lib.userIngest.session.register(uri, lib.callProcedureListSensors).then(function(registration) {
        console.log('Registered list_sensors procedure');
        lib.userIngest.procedure = registration;
        def.resolve(session);
      }, function(err) {
        if(err.error === 'wamp.error.procedure_already_exists') {
          def.resolve();
        } else {
          def.reject(err);
        }
      });
    };

    connection.onclose = function(reason, details) {
      console.log('Error when connecting to user ingest server: ' + reason);
      console.log(details);
      def.reject(reason, details);
    }
    
    connection.open();

    return def.promise;
  }

  /**
   * Closes the connection to the user ingest.
   */
  this.closeUserIngest = function() {
    //console.log('Closing connection');
    var def = Q.defer();
    if(lib.userIngest.session === undefined) {
      //console.log('Connection already closed');
      def.resolve();
    } else {
      var procedure = lib.userIngest.procedure;
      if(procedure !== undefined && procedure instanceof autobahn.Registration) {
        lib.userIngest.session.unregister(lib.userIngest.procedure).then(function() {
          // console.log('Closed connection and unregistered procedure');
          lib.userIngest.session = undefined;
          lib.userIngest.procedure = undefined;
          def.resolve();
        }, function(err) {
          def.reject(err);
        });
      } else {
        //console.log('Closed connection');
        lib.userIngest.session = undefined;
        lib.userIngest.procedure = undefined;
        def.resolve();
      }
    }
    return def.promise;
  }

  /**
   * Publish data to the user ingest.
   */
  this.publish = function(sensorChannel, value) {
    def = Q.defer();

    if(lib.userIngest === undefined || lib.userIngest.session === undefined) {
      throw 'Not connected to the user ingest';
    }

    var time = new Date().getTime();
    var interval = lib.getPublishInterval();
    if(!lib.hasSensor(sensorChannel)) {
      def.reject('Sensor ' + sensorChannel + ' not declared');
    } else {
      if(lib.publishCalls[sensorChannel] === undefined
        || time > lib.publishCalls[sensorChannel] + interval ) {
          var uri = lib.getDeviceKey() + '.' + sensorChannel;
          lib.userIngest.session.publish(uri, [{ data: value }]);
          def.resolve();
      } else {
        console.log('Skipping this publish until the end of the interval');
        def.reject();
      }
    }

    return def.promise;
  }

  /**
   * Returns the publishing interval.
   */
  this.getPublishInterval = function() {
    return lib.settings.mode === 'managed' ? 200 : 1000; 
  }

  /**
   * Starts the Overlay.live device.
   */
  this.start = function() {
    var def = Q.defer();

    // Connect to system ingest
    lib.connectToSystemIngest()         // Connect to ingest server
    .then(function() {
      return lib.registerDevice();      // Register device
    })
    .then(function() {
      return lib.connectToUserIngest(); // Connect to user ingest
    }) 
    .then(function() {
      def.resolve();
    }).catch(function(err) {
      def.reject(err);
    })

    return def.promise;
  }
}

// ------------------------------------------------------------------------------------------------
module.exports = OverlayLiveDevice;