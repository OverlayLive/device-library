module.exports = {
  sensor : {
    invalidSensor : { channel: 'sensor-channel' },
    fullSensor : {
      channel: 'sensor-channel',
      name: 'Sensor name',
      unit: 'Sensor unit',
      type: 'Sensor type',
      manufacturer: 'Sensor manufacturer',
      version: '1.0',
      hardware: 'Sensor hardware'
    },
    customSensor : { 
      channel: 'sensor-channel',
      name: 'Sensor name',
      unit: 'T',
      customProperty: 'sensor custom property'
    }
  },
  device: {
    deviceId: 'TEST-DEVICE',
    realm: '123456789-1234567891'
  }
}