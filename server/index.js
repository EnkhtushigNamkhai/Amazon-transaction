/** UNCOMEMMENT IF WANT TO USE APM **/
// var apm = require('elastic-apm-node').start({
// 	appName: 'transaction',
// 	serverUrl: 'http://localhost:8200'
// });
var express = require('express');
var app = express();
/** Uncomment if want to use the queue **/
var aws = require('aws-sdk');
var axios = require('axios');
var bodyParser = require('body-parser');
var pg = require('../database-Postgres/index.js');
var inputs = require('./requestFormat.js');


app.use(bodyParser.json());

// any errors caught by Express can be logged by the agent as well
/** UNCOMEMMENT IF WANT TO USE APM **/
// app.use(apm.middleware.express())

app.listen(8000, function () { 
  console.log('listening on port 8000!') 
});



//calculate how much to charge each vendors based on the product quantity and price to send to the Ghost Service
function getVendors(products) {
	var vendors = [];
	for (var i = 0; i < products.length; i++) {
		var productObj = products[i];
		var total = productObj.price * productObj.quantity;
		var vendorObj = {
			vendorId: productObj.vendorId,
			vendorName: productObj.vendorName,
			depositAmount: total
		}
		vendors.push(vendorObj);
	}
	return vendors;
}


//*********************REQ FROM CLIENT************************************
app.post('/processTrans', function(req, res) {
	// var obj = inputs.processTransTestInput; //change to req.body later
	console.log('calling processTrans hereee');
	var obj = req.body;

	/* Uncomment this if not load testing. */
	obj.products = JSON.parse(obj.products);
	obj.shippingAddress = JSON.parse(obj.shippingAddress);
	obj.billingAddress = JSON.parse(obj.billingAddress);

	var userId = obj.userId;
	var products = obj.products;
	var cartTotal = obj.cartTotal;
	var primeTrialSignUp = obj.primeTrialSignUp;
	var paymentId = obj.paymentId;

  /****** send a post request to Inventory with the products and quantity.*********/
  axios.put('http://localhost:5000/inventory/update', products)
  .then(function (response) {
    console.log('inventory updated');
  })
  .catch(function (error) {
  	console.log('inventory error');
  });


  /****** Insert a new transaction to the DB with status, 'pending' *********/
	pg.storeTransaction(obj, function(userTransId, err) {
		//AFTER TRANS IS STORED SUCCESSFULLY
		if (err) {
			res.send('error...');
		}
		console.log('Stored Trans and the products to their tables');
	  var vendors = getVendors(products);
	  var paymentData = {
	  	userId: userId, 
	  	paymentId: paymentId,
	  	cartTotal: cartTotal,
	  	vendors: vendors
	  };
	  /******************* Telling ghost service to complete the transaction **********************/
	  axios.post('http://localhost:5000/ghost/completeTransaction', paymentData)
	  .then(function (response) {
	  	/********************* Things to do when trans successful *******************************/
	  	res.send("Successful Transaction\n");
	  	if (primeTrialSignUp) {
		  	var date = new Date();  //Wed Dec 20 2017 15:08:02 GMT-0800 (PST) in ISO Format
		    axios.put('/prime/signup', {userId: userId, primeStartDate: date, totalSpentAtTrialStart: cartTotal});
		  }
	  	
		  //on success from ghost service, update the status of the transaction in DB to completed
	  	pg.update(userTransId, 'completed', function(status) {
	  		if (status === 'Failed') {
		 		};
	  	});
	  })
	  .catch(function (error) {
	  	// ******************** Things to do when trans Fails ******************************
			res.send("Error in Transaction\n");
			axios.put('http://localhost:5000/inventory/undo', products)
			.catch(function(error) {
				console.log('inventory could not undo request');
			});
			//on error from ghost service, update the status of the transaction in DB to failed
	  	pg.update(userTransId, 'failed', function(status) {
	  		if (status === 'Failed') {
		 		};
	  	});
	  });
	});  //

});




//**********************REQUEST FROM CLIENT TO UNSUBSCRIBE********************
app.post('/unsubscribe', function(req, res) {
	/********* CHANGE INPUTS.UNBSCRIBETESTINPUT TO REQ.BODY LATER *********/
	var userId = inputs.unsubscribeTestInput.userId; // object with a userId key
  var date = new Date();
  //cancel charging card monthly.
  //if a person already had a free trial and canceled, don't give it to them again.
  axios.put('http://localhost:5000/prime/cancel', {userId: userId, primeTrialEndDate: date})
  .then(function(response) {
  	console.log('canceled the trial');
  	//send client a res saying that the unsubscription was successful
  	res.send("Successful unsubscription\n");
  })
  .catch(function(error) {
  	console.log('error in unsubscribe');
  	res.send("Error in unsubscription\n");
  	//send client a res saying that the unsubscription was not successful
  });
});





//********************REQUEST FROM CLIENT TO SUBSCRIBE, 0 PURCHASES************
app.post('/subscribe', function(req, res) {
	/********* CHANGE INPUTS.SUBSCRIBETESTINPUT TO REQ.BODY LATER *********/
	 
	//if a person already had a free trial and canceled, don't give it to them again.
	//send a response that says, free trial not available.
	userId = inputs.subscribeTestInput.userId;
	var date = new Date();
	//Tell users that a prime trial sign up has occured
  axios.put('http://localhost:5000/prime/signup', {userId: userId, primeStartDate: date, totalSpentAtTrialStart: 0})
  .then(function(response) {
  	console.log('signed the user up for trial');
  	//send client a res saying that the subscription was successful
  	res.send('Successful subscription\n');
  })
  .catch(function(error) {
  	console.log('error in subscribe');
  	res.send('Error in subscription\n');
  	//send the client a res saying that the subscription was not successful
  });
});

/** Things to ask Anthony: 
1. Should I try changing my database to Cassandra? Does Cassandra provide durability? 
2. How does the server handle so many different requests coming to it?
3. Clarify the question. Does 10,000 RPS mean that we want our services to be able to withstand the amount of requests, 
with reasonable amount of latency? What is too slow for a response? 
**/


/** EXAMPLE SQS CODE **/
/*
1. Make a queue
2. Make writing to queue work
3. Test reading from a queue
4. Think about how multiple servers on different machines will read from one queue.
5. Explore batch reading from a queue and batch writes to a queue.

*/


// // Load your AWS credentials and try to instantiate the object.
// aws.config.loadFromPath(__dirname + '/../config.json');

// // Instantiate SQS.
// var sqs = new aws.SQS();

// // Creating a queue.
// //created a queue 
// //{"ResponseMetadata":{"RequestId":"a11c2808-bf4c-5316-bee2-7acad9f15d5f"},"QueueUrl":"https://sqs.us-west-1.amazonaws.com/141095122109/TransactionOutputQueue"}
// app.get('/create', function (req, res) {
//     var params = {
//         QueueName: "TransactionOutputQueue"
//     };

//     sqs.createQueue(params, function(err, data) {
//         if(err) {
//             res.send(err);
//         }
//         else {
//             res.send(data);
//         }
//     });
// });

// var queueUrl = "https://sqs.us-west-1.amazonaws.com/141095122109/TransactionOutputQueue";

// // Sending a message.
// // NOTE: Here we need to populate the queue url you want to send to.
// // That variable is indicated at the top of app.js.
// app.get('/send', function (req, res) {
//     var params = {
//         MessageBody: 'Hello world!',
//         QueueUrl: queueUrl,
//         DelaySeconds: 0
//     };

//     sqs.sendMessage(params, function(err, data) {
//         if(err) {
//             res.send(err);
//         } 
//         else {
//             res.send(data);
//         } 
//     });
// });


// // Receive a message.
// // NOTE: This is a great long polling example. You would want to perform
// // this action on some sort of job server so that you can process these
// // records. In this example I'm just showing you how to make the call.
// // It will then put the message "in flight" and I won't be able to 
// // reach that message again until that visibility timeout is done.
// app.get('/receive', function (req, res) {
//     var params = {
//         QueueUrl: queueUrl,
//         VisibilityTimeout: 600 // 10 min wait time for anyone else to process.
//     };
    
//     sqs.receiveMessage(params, function(err, data) {
//         if(err) {
//             res.send(err);
//         } 
//         else {
//             res.send(data);
//         } 
//     });
// });

// //receipt gets returned after a call to /receive
// var receipt = "AQEBiuDrWp0fNehIykDyELZ1AiWdr9vYveX8VoMCfYnxe7QwRzD9RmF3+hykW6LLXcjpKcD2geGJFPNqhDjBIF5Da4SodTxZQQwctxSzEHOABGud4J8sB8lbThI322pE6uHTuHSU2yLncUgE0DZJ+Gwl5BcdK0JnaTEkaot6UcsE9PJWOkkJFd4x2hL5Rm4UToq5TYtH3RbGKK07YsbIZMTbOX1zsw3enCj8IoQc1/4gkllsdfUu4/Zhf1UVGG5nnaPPR4BhC0QwjYd5zt7xG0/lUa4v3PL9of8YNnFcNFYtPZSvX/71byjN7O0HF5ncZjUgyrkUrRt4e/FOKNhxrCl/XK39jG63qTm+oWcERRGQERPTXaspgXA58iJ0Xo6NTDPZ3EQ+8/OxwPrQbIWyYK76ew==";

// // Deleting a message.
// app.get('/delete', function (req, res) {
//     var params = {
//         QueueUrl: queueUrl,
//         ReceiptHandle: receipt
//     };
    
//     sqs.deleteMessage(params, function(err, data) {
//         if(err) {
//             res.send(err);
//         } 
//         else {
//         	//{"ResponseMetadata":{"RequestId":"9b520915-33d6-5e62-abcd-5bd754214f90"}}
//             res.send(data);
//         } 
//     });
// });



/* FOR LATER WITH STRIPE */
//map each userId to customerId? ("id": "cus_BzBgLmtEOltAtv")
// create 10Million customers
// add to each customer a fake payment method in the source property



