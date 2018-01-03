var express = require('express');
var axios = require('axios');
var bodyParser = require('body-parser')

var app = express();
app.use(bodyParser.json());
app.listen(5000, function () { 
  console.log('Running test server: listening on port 5000!') 
});

/**** TESTING POSTS TO USERS *****/
	//testing if sending a put request to users correctly
	app.put('/prime/signup', function (req, res) {
		console.log('Client: got a request from transaction, user signed up for prime');
		res.end();
	});

	//testing if sending a unsubscribe request to users correctly
	app.put('/prime/cancel', function(req, res) {
		console.log('Client: got a request from transaction, user canceled prime trial');
		res.end();
	});
		

/**** TESTING POSTS TO INVENTORY *****/
	// { userId: 123,
	//   paymentId: 54321,
	//   vendors: 
	//    [ { vendorId: 1, vendorName: 'Enki', depositAmount: 9999990 },
	//      { vendorId: 2, vendorName: 'Someone else', depositAmount: 5 } ],
	//   cartTotal: 100 }
	//testing if sending a put request to inventory correctly
	app.put('/inventory/update', function (req, res) {
		res.send('success');
	});

	var boolean = true;
/**** TESTING POSTS TO THE GHOST SERVICE *****/
	//testing if sending a post request to ghost service correctly
	app.post('/ghost/completeTransaction', function(req, res) {

	/** UNCOMMENT FOR LATER TO TEST BOTH SUCCESS AND FAILURE **/
		// console.log(boolean);
		// if (boolean) {
		// 	res.send('successful');
		// } else {
		// 	res.send('failed');		
		// }
		// boolean = !boolean;
		res.send('successful');
	});

	app.put('/inventory/undo', function(req, res) {
		console.log('undo request to inventory');
		res.send('success undo');
	});


/**** TESTING POSTS TO CLIENT? *****/
//Client stores the  ->
//maps userId to the paymentIds here.
