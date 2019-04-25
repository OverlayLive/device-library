/**
 * Describe the managed device's sensors
 */
module.exports = [
  {
    channel: 'moisture', // [*] The channel the sensor will publish data
    name: 'Moisture', // [*] The default sensor name
    unit: 'M', // The sensor type (temperature, voltage, etc)
    type: 'moisture level',
    manufacturer: 'adafruit', // The sensor manufacturer
    version: '1.0', // The sensor version
    hardware: '1.0' // Additional hardware informations
  },
  {
    channel: 'temp', // [*] The channel the sensor will publish data
    name: 'Temperature', // [*] The default sensor name
    unit: 'C', // The sensor type (temperature, voltage, etc)
    type: 'Temperature',
    manufacturer: 'adafruit', // The sensor manufacturer
    version: '1.0', // The sensor version
    hardware: '1.0' // Additional hardware informations
  }
];
