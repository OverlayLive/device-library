var expect = require('expect.js');
var fs = require('fs');
var autobahn = require('autobahn');

var OverlayLiveDevice = require('../lib/overlaylive-device.js');
var testData = require('./test-data.js');

// Shared instance used for the ingest tests
var ingestLib;

// Tests declarations
describe('Test offline functions', function() {
  before(createManagedDeviceConfigFile);
  after(deleteManagedDeviceConfigFile);

  it('Should read the API key from device config file (manual use)', testReadApiKeyManualMode);
  it('Should read the API key from managed device env var', testReadApiKeyManagedMode);
  it('Should read the API key from the managed device config file', testReadApiKeyFromManagedDeviceConfigFile);
  it('Should read the ingest server from device config file (manual use)', testReadIngestManualMode);
  it('Should read the ingest server from managed device env var', testReadIngestManagedMode);
  it('Should read the ingest server from the managed device config file', testReadIngestFromManagedDeviceConfigFile);
  it('Should read the device key from the device config file (manual use)', testReadDeviceKeyManualMode);
  it('Should read the device key from the managed device en var', testReadDeviceKeyManagedMode);
  it('Should check that the sensor data has a proper strucutre', testSensorDataStructure);
  it('Should throw an error because sensor data has not a proper structure', testSensorDataStructureRejected);
  it('Should declare an array of sensors', testSensorArrayDeclaration);
  it('Should add the sensorData to the stored sensor list', testSensorDeclarationLogic);
  it('Should verify that a sensor is not registered', testSensorNotRegistered);
  it('Should verify that a sensor is registered', testSensorRegistered);
});

describe('Test System ingest', function() {
  it('Should connect to the system ingest', testConnectToSystemIngest);
  it('Should throw exception on register device if not connected to ingest server', testThrowExceptionOnRegistringDeviceWhenNotConnectedToIngest);
  it('Should register the device to the system ingest', testDeviceRegistrationOnSystemIngest);
});

describe('Test user ingest functions', function() {
	
  // Executed once before all tests
  before(function() {
    var config = require('../test/device-config.js');
    ingestLib = new OverlayLiveDevice(config);
  });

  // Executed after each test
  afterEach(function(done) {
    ingestLib.closeConnection()
	.then(function() {
      done();
    });
  });
  
  it('Should throw an exception because the device is not connected to the user ingest yet', testPublishWhenNotConnectedToIngest);
  it('Should properly close the user ingest connection', testIngestClose);
  it('Should do nothing because the sensor is not defined', testPublishDataOnNotRegisteredSensor);
  it('Should publish data on the channel', testPublishDataOnRegisteredSensor);

});

describe('Test Commands', function() {
  beforeEach(function() {
    var config = require('../test/device-config.js');
    ingestLib = new OverlayLiveDevice(config);
  });

  // Executed after each test
  afterEach(function(done) {
    ingestLib.closeConnection()
	  .then(function() {
      done();
    });
  });

  it('Should send a command', testSendValidCommand);
  it('Should return an error when sending undefined command', testSendInvalidCommand);
  it('Should return an error when declaring a command more than once', testMultipleCommandDeclaration);
  it('Should call a command without parameters', testCommandWithoutParams);
  it('should manage the error in the custom command',testCommandWithErrors);
})

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function testCommandWithErrors(done) {
  console.log('');
  console.log('');
  console.log('TEST testCommandWithErrors');

  this.timeout(5000); // Increase timeout because process takes time on the backend
  ingestLib.settings.configFile = '../test/device-config.js';
  ingestLib.settings.mode = 'managed';
  ingestLib.declareCommand('ERR', function() {
    console.log('In command executor WITHOUT_PARAMS');
    callUnknownFunction();
  });

  
  console.log('--------------------');
  console.log('View commands :');
  console.log(ingestLib.customCommands);

  ingestLib.start().then(function() {
      // Connect to the device from the Ingest
      var connection = new autobahn.Connection({
        max_retries: 0,
        url: 'wss://ingest.epeakgears.com:1337/ws',
        realm: 'bd9f0e0f743690928c81ad254a0f0fa68e227166' 
      });
      
      connection.onopen = function(session) {
        console.log('Send command...');
        session.call('COMMAND', ['ERR'])
        .then(function(result) {
          expect(result.status).to.be('KO');
          done();
        }, function(err) {
          console.log(err);
          done(err);
        });
      };
    
      connection.open();
  });
}


function testCommandWithoutParams(done) {
  console.log('');
  console.log('');
  console.log('TEST testCommandWithoutParams');

  this.timeout(5000); // Increase timeout because process takes time on the backend
  ingestLib.settings.configFile = '../test/device-config.js';
  ingestLib.settings.mode = 'managed';
  ingestLib.declareCommand('WITHOUT_PARAMS', function() {
    console.log('In command executor WITHOUT_PARAMS');
    return 'Hello i am working';
  });

  console.log('--------------------');
  console.log('View commands :');
  console.log(ingestLib.customCommands);

  ingestLib.start().then(function() {
      // Connect to the device from the Ingest
      var connection = new autobahn.Connection({
        max_retries: 0,
        url: 'wss://ingest.epeakgears.com:1337/ws',
        realm: 'bd9f0e0f743690928c81ad254a0f0fa68e227166' 
      });
      
      connection.onopen = function(session) {
        console.log('Send command...');
        session.call('COMMAND', ['WITHOUT_PARAMS'])
        .then(function(result) {
          console.log('results:');
          console.log(result);
          expect(result.result).to.be('Hello i am working');
          done();
        }, function(err) {
          console.log(err);
          done(err);
        });
      };
    
      connection.open();
  });
}

function testSendValidCommand(done) {
  console.log('');
  console.log('');
  console.log('TEST testSendValidCommand');

  this.timeout(5000); // Increase timeout because process takes time on the backend
  ingestLib.settings.configFile = '../test/device-config.js';
  ingestLib.settings.mode = 'managed';
  ingestLib.declareCommand('SAY_HELLO', function(params) {
    console.log('In command executor');
    return 'Hello ' + params.name;
  });

  console.log('--------------------');
  console.log('View commands :');
  console.log(ingestLib.customCommands);

  ingestLib.start().then(function() {
      console.log('CONNECTED');
      // Connect to the device from the Ingest
      var connection = new autobahn.Connection({
        max_retries: 0,
        url: 'wss://ingest.epeakgears.com:1337/ws',
        realm: 'bd9f0e0f743690928c81ad254a0f0fa68e227166' 
      });
      
      connection.onopen = function(session) {
        console.log('Send command...');
        session.call('COMMAND', ['SAY_HELLO', {name:'Overlay.live'}])
        .then(function(result) {
          expect(result.result).to.be('Hello Overlay.live');
          done();
        }, function(err) {
          console.log(err);
          done(err);
        });
      };
    
      connection.open();
  });
}

function testSendInvalidCommand(done) {
  console.log('');
  console.log('');
  console.log('TEST testSendInvalidCommand');

  this.timeout(5000); // Increase timeout because process takes time on the backend
  ingestLib.settings.configFile = '../test/device-config.js';
  ingestLib.settings.mode = 'managed';

  console.log('--------------------');
  console.log('View commands :');
  console.log(ingestLib.customCommands);

  ingestLib.start().then(function() {
    // Connect to the device from the Ingest
    var connection = new autobahn.Connection({
      max_retries: 0,
      url: 'wss://ingest.epeakgears.com:1337/ws',
      realm: 'bd9f0e0f743690928c81ad254a0f0fa68e227166' 
    });
    
    connection.onopen = function(session) {
      console.log('Send command...');
      session.call('COMMAND', ['SAY_SOMETHING', {name:'Overlay.live'}])
      .then(function(result) {
        expect(result.status).to.be('KO');
        done();
      }, function(err) {
        console.log(err);
        done(err);
      });
    };

    connection.open();
  });
}

function testMultipleCommandDeclaration() {
  var lib = new OverlayLiveDevice('testSendValidCommand');
  lib.settings.configFile = '../test/device-config.js';
  lib.settings.mode = 'managed';
  lib.declareCommand('SAY_HELLO', function(params) {
    console.log('In command executor');
    return 'Hello ' + params.name;
  });

  function willThrowError() {
    lib.declareCommand('SAY_HELLO', function(params) {
      console.log('In command executor');
      return 'Hello ' + params.name;
    });
  }

  expect(willThrowError).to.throwException('There is already a command named SAY_HELLO declared on the device');
}

function testReadIngestFromManagedDeviceConfigFile() {
  delete process.env.INGEST; // Ensure the env var is not set
  var lib = new OverlayLiveDevice();
  lib.setManagedMode();
  expect(lib.getIngest()).to.be('ingest.epeakgears.com');
}

function testReadApiKeyFromManagedDeviceConfigFile() {
  delete process.env.API_KEY; // Ensure the env var is not set
  var lib = new OverlayLiveDevice();
  lib.setManagedMode();
  expect(lib.getApiKey()).to.be('bd9f0e0f743690928c81ad254a0f0fa68e227166');
}	

function testPublishDataOnRegisteredSensor(done) {
  ingestLib.declareSensor(testData.sensor.fullSensor);

  ingestLib.connectToUserIngest().then(function() {
    ingestLib.publish(testData.sensor.fullSensor.channel, 150)
    .then(function() {
      done();
    }).catch(function(err) {
      done(new Error(err));
    });
  });
}

function testPublishDataOnNotRegisteredSensor(done) {
  ingestLib.connectToUserIngest()
  .then(function() {
    ingestLib.publish(testData.sensor.fullSensor.channel, 150)
    .then(function(){
	    done(new Error('Should throw an exception'));
    })
    .catch(function(err) {
	    done();
    });
  });
}

function testIngestClose(done) {
  ingestLib.connectToUserIngest()
  .then(function() {
    return ingestLib.closeUserIngest();
  })
  .then(function() {
    expect(ingestLib.userIngest.session).to.be(undefined);
    done();
  }).catch(function(err) {
    done(new Error(err));
  })
}

function testPublishWhenNotConnectedToIngest() {
  expect(ingestLib.publish.bind('testSensor', 'test')).to.throwException('Not connected to the user ingest');
}

function testDeviceRegistrationOnSystemIngest(done) {
  this.timeout(5000); // Increase timeout because process takes time on the backend
  var config = require('../test/device-config.js');
  var lib = new OverlayLiveDevice(config);
  lib.connectToSystemIngest()
  .then(function(){
	  console.log('connected to ingest server');
    return lib.registerDevice();
  })
  .then(function() {
    done();
  })
  .fail(function(err) {
    console.log(err);
    done(new Error(err.args[0]));
  });
}

function testThrowExceptionOnRegistringDeviceWhenNotConnectedToIngest() {
  var config = require('../test/device-config.js');
  var lib = new OverlayLiveDevice(config);
  expect(lib.registerDevice).to.throwException('');
}

function testConnectToSystemIngest() {
  var config = require('../test/device-config.js');
  var lib = new OverlayLiveDevice(config);
  lib.connectToSystemIngest().then(function(session){
    done();
  }).catch(function(readon, details) {
    console.log(details);
    done(new Error('Failed to connect to the system ingest server'));
  });
}

function testSensorRegistered() {
  var config = require('../test/device-config.js');
  var lib = new OverlayLiveDevice(config);
  lib.declareSensor(testData.sensor.fullSensor);
  expect(lib.hasSensor(testData.sensor.fullSensor.channel)).to.be(true);
}

function testSensorNotRegistered() {
  var config = require('../test/device-config.js');
  var lib = new OverlayLiveDevice(config);
  expect(lib.hasSensor('not-registered-sensor')).to.be(false);
}

function testSensorDeclarationLogic() {
  var config = require('../test/device-config.js');
  var lib = new OverlayLiveDevice(config);
  lib.declareSensor(testData.sensor.fullSensor);
  expect(lib.getSensorList()[0]).to.be(testData.sensor.fullSensor);
}

function testSensorArrayDeclaration() {
  var config = require('../test/device-config.js');
  var lib = new OverlayLiveDevice(config);
  var sensors = [
	  testData.sensor.fullSensor,
	  testData.sensor.customSensor
  ];  
  lib.declareSensors(sensors);
}

function testSensorDataStructureRejected() {
  var config = require('../test/device-config.js');
  var lib = new OverlayLiveDevice(config);
  var invalidSensor = testData.sensor.invalidSensor;
  expect(lib.declareSensor.bind(invalidSensor)).to.throwException('Sensor data does not have a proper structure : ' + JSON.stringify(invalidSensor));
}

function testSensorDataStructure() {
  var config = require('../test/device-config.js');
  var lib = new OverlayLiveDevice(config);

  // Check valid sensor
  expect(lib.checkSensorStructure(testData.sensor.fullSensor)).to.be(true);

  // Check invalid sensor
  expect(lib.checkSensorStructure(testData.sensor.invalidSensor)).to.be(false);

  // Check valid sensor with additional properties
  expect(lib.checkSensorStructure(testData.sensor.customSensor)).to.be(true);
}

function testReadDeviceKeyManagedMode() {
  var config = require('../test/device-config.js');
  var lib = new OverlayLiveDevice(config);
  lib.setManagedMode();
  process.env.RESIN_DEVICE_UUID = 'device-key';
  expect(lib.getDeviceKey()).to.be('device-key');
}

function testReadDeviceKeyManualMode() {
  var config = require('../test/device-config.js');
  var lib = new OverlayLiveDevice(config);
  expect(lib.getDeviceKey()).to.be('42b034e');
}

function testReadIngestManagedMode() {
  var config = require('../test/device-config.js');
  var lib = new OverlayLiveDevice(config);
  lib.settings.mode = 'managed';
  process.env.INGEST = 'ingest-server';
  expect(lib.getIngest()).to.be('ingest-server');
}

function testReadIngestManualMode() {
  var config = require('../test/device-config.js');
  var lib = new OverlayLiveDevice(config);
  expect(lib.getIngest()).to.be('ingest.epeakgears.com');	
}

function testReadApiKeyManagedMode() {
  var config = require('../test/device-config.js');
  var lib = new OverlayLiveDevice(config);
  lib.settings.mode = 'managed';
  process.env.API_KEY = 'the-api-key-managed';
  expect(lib.getApiKey()).to.be('the-api-key-managed');
}

function testReadApiKeyManualMode() {
  var config = require('../test/device-config.js');
  var lib = new OverlayLiveDevice(config);
  expect(lib.getApiKey()).to.be('bd9f0e0f743690928c81ad254a0f0fa68e227166');
}

function createManagedDeviceConfigFile() {
  var content = {
    apiKey: 'bd9f0e0f743690928c81ad254a0f0fa68e227166',
    ingest: 'ingest.epeakgears.com',
    deviceKey: '42b034e'
  }
  fs.writeFileSync('/data/overlaylive-config.json', JSON.stringify(content));
}

function deleteManagedDeviceConfigFile() {
  fs.unlinkSync('/data/overlaylive-config.json');
}