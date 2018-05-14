var fs = require('fs');
var Q = require('q');
var async = require('async');
var autobahn = require('autobahn');
var path = require('path');

/**
 * The Overlay.live device management library.
 * @param userSettings the user defined device settings
 */
var OverlayLiveDevice = function(userSettings) {
  /* Shortcut to the service  */
  var lib = this;
  
  /* The declared sensors */
  this.sensors = [];

  /* The extensible default settings for manual use */
  this.settings = {
    mode: 'manual',
    apiKey: userSettings ? userSettings.apiKey : '',
    ingest: userSettings ? userSettings.ingest : '',
    deviceKey: userSettings ? userSettings.deviceKey : '',
  };

  /* The system ingest data */
  this.systemIngest = {};

  /* The user ingest data */
  this.userIngest = {};

  /* The publish calls timestamps */
  this.publishCalls = {};

  /* The defined commands on this device */
  this.customCommands = {};

  /**
   * Setup the manager for the managed mode.
   */
  this.setManagedMode = function() {
    lib.settings.mode = 'managed';

    var config = require('/data/overlaylive-config.json');
    lib.settings.apiKey = config.apiKey;
    lib.settings.ingest = config.ingest;
    lib.settings.deviceKey = config.deviceKey;
    console.log(config);
  }

  /**
   * Returns the API key of the device depending on the mode.
   */
  this.getApiKey = function() {
    var apiKey = undefined;
    if(lib.settings.mode === 'manual') {
      // Search the API Key in the settings
      apiKey = this.settings.apiKey;
    } else {
      // Get API key from the env variable
      apiKey = process.env.API_KEY;
	    //console.log(apiKey === undefined);
      if(apiKey === undefined) {
        // The device is not initialized yet, get this value from the settings
        apiKey = this.settings.apiKey;
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
      // Search the ingest server in the settings
      ingest = this.settings.ingest;
    } else {
      ingest = process.env.INGEST;
      if(ingest === undefined) {
        // ingest device is not initialized yet, get this value from the settings
        ingest = this.settings.ingest;
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
      // Search for the device ID in the settings
      deviceID = this.settings.deviceKey;
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
    var properties = ['channel', 'name', 'unit'];
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
    console.log('Asked for sensor list : ');
    console.log(lib.sensors);
    console.log(lib.customCommands);

    // Transform the custom commands object into an array
    var commands = [];
    for(key in lib.customCommands) {
      commands.push(key);
    }

    return {
      sensors: lib.sensors,
      commands: commands
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
    var def = Q.defer();
    if(lib.settings.mode === 'managed') {
      console.log('Register device...');
      if(lib.systemIngest === undefined || lib.systemIngest.session === undefined) {
        throw 'Not connected to the system ingest';
      }
      var deviceId = lib.getDeviceKey();
      var realm = lib.getApiKey();
      var ingest = lib.getIngest();
      var uuid = process.env.RESIN_DEVICE_UUID;
      lib.systemIngest.session.call('declare.device', [deviceId, realm, ingest, uuid], {}, {receive_progress: true}).then(function(answer) {
        def.resolve();
      }).catch(function(err) {
        def.reject(err);
      });
    } else {
      console.log('Manual Device, no registration');
      def.resolve();
    }

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
      var procedures = ['procedure', 'commandProcedure'];
      async.map(procedures, function(procedure, callback) {
        lib.unregisterProcedure(procedure)
        .then(function() {
          callback(null, procedure);
        }).fail(function(err) {
          callback(err, procedure);
        });
      }, function(err, result) {
        lib.userIngest.session = undefined;
        if(err) {
          def.reject(err);
        } else {
          def.resolve();
        }
      });
    }
    return def.promise;
  }

  /**
   * Unregisters a procedure (internal use).
   */
  this.unregisterProcedure = function(procedure) {
    var def = Q.defer();

    console.log('Unregister procedure ' + procedure + '...');
    var proc = lib.userIngest[procedure];
    if(proc !== undefined && proc instanceof autobahn.Registration) {
      lib.userIngest.session.unregister(proc).then(function() {
        console.log('Unregistered procedure ' + procedure);
        lib.userIngest[procedure] = undefined;
        def.resolve();
      }, function(err) {
        def.reject(err);
      });
    } else {
      lib.userIngest[procedure] = undefined;
      def.resolve();
    }

    return def.promise;
  }

  /**
   * Publish data to the user ingest.
   */
  this.publish = function(sensorChannel, value) {
    var def = Q.defer();

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
   * Add the definition of a device command.
   */
  this.declareCommand = function(name, command) {
    if(lib.customCommands[name] !== undefined)
    {
      throw 'There is already a command named ' + name + ' declared on the device';
    }
    lib.customCommands[name] = command;
  }

  /**
   * Setups system Commands and user defined commands
   */
  this.setupCommands = function() {
    var def = Q.defer();

    lib.userIngest.session.register('COMMAND', function(args, kwargs, details) {
      var command = args[0];
      var params = args[1];
      var commandExecutor;

      console.log('Call COMMAND ' + command);
      //console.log('Commands available');
      //console.log(lib.customCommands);
      for(var comm in lib.customCommands) {
        console.log('test : ' + command + " === " + comm);
        if(command === comm) {
          commandExecutor = lib.customCommands[comm];
        }
      }

      if(commandExecutor === undefined) {
        return {
          status: 'KO',
          message: 'No command ' + command + ' declared on this device'
        };
      } else {
        try {
          var result = commandExecutor(params);
          return {
            status: 'OK',
            result: result
          }
        } catch(e) {
          return {
            status: 'KO',
            message : 'Error in custom command',
            error: e.stack
          }
        }
      }

    })
    .then(function(registration) {
      console.log('Registered COMMAND procedure');
      lib.userIngest.commandProcedure = registration;
      def.resolve();
    }, function(err) {
      if(err.error === 'wamp.error.procedure_already_exists') {
        console.log('>> ERROR : wamp.error.procedure_already_exists');
        def.reject(err);
      } else {
        def.reject(err);
      }
    });
    
    return def.promise;
  }

  /**
   * Closes the connecion to the ingests
   */
  this.closeConnection = function() {
    var def = Q.defer();

    lib.closeUserIngest()
    .then(function() {
      def.resolve();
    }).fail(function(){
      def.reject(err);
    });

    return def.promise;
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
      return lib.setupCommands();       // Setup Commands
    })
    .then(function() {
      console.log('Now connected!');
      def.resolve();
    }).catch(function(err) {
      def.reject(err);
    })

    return def.promise;
  }
}

// ------------------------------------------------------------------------------------------------
module.exports = OverlayLiveDevice;