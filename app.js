var express = require('express');
var app = express();
var path = require('path');
var cookieParser = require('cookie-parser');
var session =  require('express-session');
var config = require('./config/config.js'); //stores the configuration information
var ConnectMongo = require('connect-mongo')(session); //i did this to hook to mongo and store all my sessions
//connect-mongodb is a mongoDB session store backed by node-mongodb-native.
var mongoose = require('mongoose').connect(config.dbURL);
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
//
var rooms = [];






app.set('views', path.join(__dirname,'views')); //__dirname is the current directory 
app.engine('html',require('hogan-express'));
app.set('view engine','html');
app.use(express.static(path.join(__dirname,'public'))); // ./public
//sessions allow you to persist data vetween multiple pages 
//for this we will be suing the cookie parser middleware
app.use(cookieParser());


//setting the environment specifications 
var env = process.env.NODE_ENV || 'development';
// export NODE_ENV=production ----> do this in terminal to change modes
if( env === 'development'){
	app.use(session({secret:config.sessionSecret,saveUninitialized:true,resave:true}));

}else{
	//app.use(session({secret:'catscanfly',saveUninitialized:true,resave:true})); // so we need a session module too 
	app.use(session({
		secret:config.sessionSecret,
		saveUninitialized:true,
		resave:true,
		store: new ConnectMongo({
			mongooseConnection:mongoose.connections[0],
			stringify:true
		})
	}))
}


app.use(passport.initialize());
app.use(passport.session());

require('./auth/passportAuth.js')(passport,FacebookStrategy,config,mongoose);

/* TEST MONGOOSE CODE

var userSchema = mongoose.Schema({
	username:String,
	password:String,
	fullname:String,
})


//turning the schema into a model now 
var Person = mongoose.model('users',userSchema);
//here the collections is : users

//now storing a record:
var John = new Person({
	username:"JOHN DOE",
	password:"johnwantstologin",
	fulltime:"John Doe"
})
//till now there was no interaction with the db : only happens on the save method
John.save(function(err){
	console.log('Done!');
}) */

//calling the routes module
require('./routes/routes.js')(express,app,passport,config,rooms);







/*app.listen(3000,function(){
	console.log('ChatCAT working on port 3000');
	console.log('Mode: '+ env);
});
*/

//app.listen was removed , we will use the http to use the sockets 
app.set('port',process.env.PORT || 3000);
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

require('./socket/socket.js')(io,rooms);

server.listen(app.get('port'),function(){
	console.log('ChatCAT on port :'+ app.get('port'));
	console.log('Mode: '+ env);;
})
