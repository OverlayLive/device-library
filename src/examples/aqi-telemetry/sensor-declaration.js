/**
 * Describe the managed device's sensors
 */
module.exports = [
  {
    channel: 'aqi-s1-time', // [*] The channel the sensor will publish data
    name: 'AQI Time', // [*] The default sensor name
    unit: 'hms', // The sensor type (temperature, voltage, etc)
    type: 'time',
    manufacturer: 'aqicn.org', // The sensor manufacturer
    version: '1.0', // The sensor version
    hardware: '1.0' // Additional hardware informations
  },
  {
    channel: 'aqi-s2-pm25', // [*] The channel the sensor will publish data
    name: 'AQI PM2.5', // [*] The default sensor name
    unit: 'ppm', // The sensor type (temperature, voltage, etc)
    type: 'PM2.5',
    manufacturer: 'aqicn.org', // The sensor manufacturer
    version: '1.0', // The sensor version
    hardware: '1.0' // Additional hardware informations
  },
  {
    channel: 'aqi-s3-pm10', // [*] The channel the sensor will publish data
    name: 'AQI PM10', // [*] The default sensor name
    unit: 'ppm', // The sensor type (temperature, voltage, etc)
    type: 'PM10',
    manufacturer: 'aqicn.org', // The sensor manufacturer
    version: '1.0', // The sensor version
    hardware: '1.0' // Additional hardware informations
  },
  {
    channel: 'aqi-s4-co2', // [*] The channel the sensor will publish data
    name: 'AQI CO2', // [*] The default sensor name
    unit: 'ppm', // The sensor type (temperature, voltage, etc)
    type: 'Carbon Monoxyde',
    manufacturer: 'aqicn.org', // The sensor manufacturer
    version: '1.0', // The sensor version
    hardware: '1.0' // Additional hardware informations
  },
  {
    channel: 'aqi-s5-no2', // [*] The channel the sensor will publish data
    name: 'AQI NO2', // [*] The default sensor name
    unit: 'ppm', // The sensor type (temperature, voltage, etc)
    type: 'Nitrogen Dioxide',
    manufacturer: 'aqicn.org', // The sensor manufacturer
    version: '1.0', // The sensor version
    hardware: '1.0' // Additional hardware informations
  },
  {
    channel: 'aqi-s6-so2', // [*] The channel the sensor will publish data
    name: 'AQI SO2', // [*] The default sensor name
    unit: 'ppm', // The sensor type (temperature, voltage, etc)
    type: 'Sulphur Dioxide',
    manufacturer: 'aqicn.org', // The sensor manufacturer
    version: '1.0', // The sensor version
    hardware: '1.0' // Additional hardware informations
  },
  {
    channel: 'aqi-s7-o3', // [*] The channel the sensor will publish data
    name: 'AQI Ozone', // [*] The default sensor name
    unit: 'ppm', // The sensor type (temperature, voltage, etc)
    type: 'Ozone',
    manufacturer: 'aqicn.org', // The sensor manufacturer
    version: '1.0', // The sensor version
    hardware: '1.0' // Additional hardware informations
  },
  {
    channel: 'aqi-s8-temperature', // [*] The channel the sensor will publish data
    name: 'Temperature', // [*] The default sensor name
    unit: 'C', // The sensor type (temperature, voltage, etc)
    type: 'Temperature',
    manufacturer: 'aqicn.org', // The sensor manufacturer
    version: '1.0', // The sensor version
    hardware: '1.0' // Additional hardware informations
  },
{
    channel: 'aqi-s9-atmpressure', // [*] The channel the sensor will publish data
    name: 'Atmospheric pressure', // [*] The default sensor name
    unit: 'hPa', // The sensor type (temperature, voltage, etc)
    type: 'Pressure',
    manufacturer: 'aqicn.org', // The sensor manufacturer
    version: '1.0', // The sensor version
    hardware: '1.0' // Additional hardware informations
  }
];
