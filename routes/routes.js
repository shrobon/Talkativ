module.exports = function(express,app,passport,config,rooms){
	var router = express.Router();

	router.get('/',function(req,res,next){
		res.render('index',{title:'Welcome to ChatCAT'});
	})

	function securePages(req,res,next){
		if(req.isAuthenticated()){
			//when passport authenticates a user , the isAuthenticated function becomes available 
			//and it is set to true 
			next();
		}else{
			res.redirect('/');
		}
	}



	router.get('/auth/facebook',passport.authenticate('facebook'));
	router.get('/auth/facebook/callback',passport.authenticate('facebook',{
		successRedirect:'/chatrooms',
		failureRedirect:'/'
	}))


	router.get('/chatrooms',securePages,function(req,res,next){
		res.render('chatrooms',{title:'Chatrooms',user:req.user,config:config});
	})


	router.get('/room/:id',securePages,function(req,res,next){
		var room_name = findTitle(req.params.id);
		//the above part was written to get the name of the room that 
		//user wants to enter : title
		res.render('room',{user:req.user, room_number:req.params.id,room_name:room_name,config:config})
	})


	//give room_id and get its name :D 
	function findTitle(room_id){
		var n=0;
		while(n < rooms.length){
			if(rooms[n].room_number== room_id){
				return rooms[n].room_name;
				break;
			}else{
				n++;
				continue;
			}
		}
	}


	router.get('/logout',function(req,res,next){
		req.logout();
		res.redirect('/');
	})



	//routes for demonstrating sessions : no actual use in the app 

	router.get('/setcolor',function(req,res,next){
		req.session.favColor = "Red";
		res.send('Setting favourite color !');
	})

	router.get('/getcolor',function(req,res,next){
		res.send('Favourite Colour: '+ (req.session.favColor===undefined ?('Colour not set'):req.session.favColor));

	})

	app.use('/',router);

}