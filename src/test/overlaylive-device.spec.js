var expect = require('expect.js');

var OverlayLiveDevice = require('../lib/overlaylive-device.js');
var testData = require('./test-data.js');

// Shared instance used for the ingest tests
var ingestLib;

// Tests declarations
describe('Test offline functions', function() {
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
  before(function() { ingestLib = new OverlayLiveDevice(); });

  // Executed after each test
  afterEach(function(done) {
    ingestLib.closeUserIngest()
	.then(function() {
      done();
    });
  });
  
  
  it('Should throw an exception because the device is not connected to the user ingest yet', testPublishWhenNotConnectedToIngest);
  it('Should properly close the user ingest connection', testIngestClose);
  it('Should do nothing because the sensor is not defined', testPublishDataOnNotRegisteredSensor);
  it('Should publish data on the channel', testPublishDataOnRegisteredSensor);
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function testReadIngestFromManagedDeviceConfigFile() {
  var lib = new OverlayLiveDevice();
  delete process.env.INGEST; // Ensure the env var is not set
  lib.settings.configFile = '../test/device-config.js';
  lib.settings.mode = 'managed';
  expect(lib.getIngest()).to.be('ingest.epeakgears.com');
}

function testReadApiKeyFromManagedDeviceConfigFile() {
  var lib = new OverlayLiveDevice();
  delete process.env.API_KEY; // Ensure the env var is not set
  lib.settings.configFile = '../test/device-config.js';
  lib.settings.mode = 'managed';
  expect(lib.getApiKey()).to.be('bd9f0e0f743690928c81ad254a0f0fa68e227166');
}	

function testPublishDataOnRegisteredSensor(done) {
  ingestLib.settings.configFile = '../test/device-config.js';
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
  ingestLib.settings.configFile = '../test/device-config.js';
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
  ingestLib.settings.configFile = '../test/device-config.js';
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
  var lib = new OverlayLiveDevice();
  lib.settings.configFile = '../test/device-config.js';
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
  var lib = new OverlayLiveDevice();
  expect(lib.registerDevice).to.throwException('');
}

function testConnectToSystemIngest() {
  var lib = new OverlayLiveDevice();
  lib.settings.configFile = '../test/device-config.js';
  lib.connectToSystemIngest().then(function(session){
    done();
  }).catch(function(readon, details) {
    console.log(details);
    done(new Error('Failed to connect to the system ingest server'));
  });
}

function testSensorRegistered() {
  var lib = new OverlayLiveDevice();
  lib.declareSensor(testData.sensor.fullSensor);
  expect(lib.hasSensor(testData.sensor.fullSensor.channel)).to.be(true);
}

function testSensorNotRegistered() {
  var lib = new OverlayLiveDevice();
  expect(lib.hasSensor('not-registered-sensor')).to.be(false);
}

function testSensorDeclarationLogic() {
  var lib = new OverlayLiveDevice();
  lib.declareSensor(testData.sensor.fullSensor);
  expect(lib.getSensorList()[0]).to.be(testData.sensor.fullSensor);
}

function testSensorArrayDeclaration() {
  var lib = new OverlayLiveDevice();
  var sensors = [
	  testData.sensor.fullSensor,
	  testData.sensor.customSensor
  ];  
  lib.declareSensors(sensors);
}

function testSensorDataStructureRejected() {
  var lib = new OverlayLiveDevice();
  var invalidSensor = testData.sensor.invalidSensor;
  expect(lib.declareSensor.bind(invalidSensor)).to.throwException('Sensor data does not have a proper structure : ' + JSON.stringify(invalidSensor));
}

function testSensorDataStructure() {
  var lib = new OverlayLiveDevice();

  // Check valid sensor
  expect(lib.checkSensorStructure(testData.sensor.fullSensor)).to.be(true);

  // Check invalid sensor
  expect(lib.checkSensorStructure(testData.sensor.invalidSensor)).to.be(false);

  // Check valid sensor with additional properties
  expect(lib.checkSensorStructure(testData.sensor.customSensor)).to.be(true);
}

function testReadDeviceKeyManagedMode() {
  var lib = new OverlayLiveDevice();
  lib.settings.mode = 'managed';
  process.env.RESIN_DEVICE_UUID = 'device-key';
  expect(lib.getDeviceKey()).to.be('device-key');
}

function testReadDeviceKeyManualMode() {
  var lib = new OverlayLiveDevice();
  lib.settings.configFile = '../test/device-config.js';
  expect(lib.getDeviceKey()).to.be('42b034e');
}

function testReadIngestManagedMode() {
  var lib = new OverlayLiveDevice();
  lib.settings.mode = 'managed';
  process.env.INGEST = 'ingest-server';
  expect(lib.getIngest()).to.be('ingest-server');
}

function testReadIngestManualMode() {
  var lib = new OverlayLiveDevice();
  lib.settings.configFile = '../test/device-config.js';
  expect(lib.getIngest()).to.be('ingest.epeakgears.com');	
}

function testReadApiKeyManagedMode() {
  var lib = new OverlayLiveDevice();
  lib.settings.mode = 'managed';
  process.env.API_KEY = 'the-api-key-managed';
  expect(lib.getApiKey()).to.be('the-api-key-managed');
}

function testReadApiKeyManualMode() {
  var lib = new OverlayLiveDevice();
  lib.settings.configFile = '../test/device-config.js';
  expect(lib.getApiKey()).to.be('bd9f0e0f743690928c81ad254a0f0fa68e227166');
}
