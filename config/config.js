//this file will be responsible for giving the settings 
//as per the mode the app is running in

module.exports = require('./'+(process.env.NODE_ENV || 'development')+'.json');
//the above will load one of the configuration files as per the mode the app is running in