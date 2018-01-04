var knex = require('knex')({
  client: 'pg',
  connection: {
    host     : '127.0.0.1',
    database : 'transaction',
    charset  : 'utf8'
  }
});

var bookshelf = require('bookshelf')(knex);

var usertrans = bookshelf.Model.extend({
	tableName: 'usertrans'
});

var details = bookshelf.Model.extend({
  tableName: 'details'
});

var purchasedproducts = bookshelf.Model.extend({
  tableName: 'purchasedproducts'
});

var paymentMethods = bookshelf.Model.extend({
	tableName: 'paymentmethods'
});

/* Updates the row corresponding to the userTransId to status (Completed or Failed) */
module.exports.update = function(userTransId, status, callback) {
    // console.log('userTransId: ', userTransId);
    // get the transaction with this id from UserTrans and edit the status to be Completed/Failed based on status
    new usertrans({
      id: userTransId
    }).save( {status: status}, {patch: true})
    .then(function (model) {
      callback('Success');
    })
    .then(function(error) {
      callback('Failed');
    })
    .catch(function(err) {
      console.log('error on update');
    });
}

module.exports.storeTransaction = function(obj, callback) {
	// console.log('trying to store to Database now');
  
	new usertrans({
	  date: new Date(),
	  userid: obj.userId,
	  paymentmethodid: obj.paymentId,    
	  status: 'pending',
	  grandtotal: obj.cartTotal
	}).save()
  .then(function(newRow) {
    /**************** AFTER USER TRANS IS STORED *****************/
    
    new details({
      usertransid: newRow.id,
      fullname: obj.fullName,
      addressline1: obj.shippingAddress.addressLine1, 
      addressline2: obj.shippingAddress.addressLine2, 
      city: obj.shippingAddress.city,
      state: obj.shippingAddress.state,
      zip: obj.shippingAddress.zip,
      country: obj.shippingAddress.country,
      phone: obj.phone
    }).save()
    .catch(function(err) {
      console.log('error in storing to details table', err);
    }); 


    var productsToInsert = [];

    var itemsProcessed = 0; 
    for (var i = 0; i < obj.products.length; i++) {
        var product = obj.products[i];
        var productObj = {
        usertransid: newRow.id,
        vendorid: product.vendorId,
        vendorname: product.vendorName,
        productid: product.productId,
        productname: product.productName,
        productimgurl: 'MIGHT HAVE TO DELETE',
        isprimeproduct: product.isPrimeProduct,
        productquantity: product.quantity,
        priceperitem: product.price
      };
      
      // //add productObj to database
      // new purchasedproducts(productObj).save(null, {method: 'insert'}).then(function(result) {
      //   itemsProcessed++;
      //   if (itemsProcessed === obj.products.length) {
      //     callback(newRow.id, null);
      //   }
      // }).catch(function(err) {
      //   // callback(null, err);
      //   console.log('error in saving');
      // });

      productsToInsert.push(productObj);
    }


    // batch insert it into PurchasedProducts table. 
    knex.batchInsert('purchasedproducts', productsToInsert)
    .then(function(ids) {
      callback(newRow.id, null);
    })
    .catch(function(err) {
      console.log('error');
    });
  })
  .catch(function(err) {
    //Handle errors
    console.log('error in saving to DATABASE');
    callback(null, err);
  });
}




















// var pg = require('pg');

// var conString = 'pg://localhost:5432/transaction';

// var db = new pg.Client(conString);
// db.connect();

// // db.query(`INSERT INTO usertrans VALUES (DEFAULT, '${req.body.productname}', '${req.body.productprice}', true, '${req.body.productdes}', 
// //     0, true, '${req.body.soldby}', 'Amazon.com')`)
// //     .then();

// // db.query(`INSERT INTO purchasedproducts VALUES (DEFAULT, '${req.body.productname}', '${req.body.productprice}', true, '${req.body.productdes}', 
// //     0, true, '${req.body.soldby}', 'Amazon.com')`)
// //     .then();


// /* Updates the row corresponding to the userTransId to status (Completed or Failed) */
// module.exports.update = function(userTransId, status, callback) {
//     // console.log('userTransId: ', userTransId);
//     // get the transaction with this id from UserTrans and edit the status to be Completed/Failed based on status
//     db.query(`UPDATE usertrans SET status = ${status} WHERE id = ${userTransId}`)
//     .then(function(res) {

//     })
//     .catch(function(err) {

//     });
// }

// module.exports.storeTransaction = function(obj, callback) {
//   // console.log('trying to store to Database now');
//   var date = new Date().toISOString();
//   console.log('name: ', `INSERT INTO usertrans VALUES (DEFAULT, '${date}', ${obj.userId}, ${obj.paymentId}, 'pending', '${obj.fullName}', '${obj.shippingAddress.addressLine1}', '${obj.shippingAddress.addressLine2}', '${obj.shippingAddress.city}', '${obj.shippingAddress.state}', '${obj.shippingAddress.zip}', '${obj.shippingAddress.country}', '${obj.phone}', ${obj.cartTotal})`);
//   db.query(`INSERT INTO usertrans VALUES (DEFAULT, ${date}, ${obj.userId}, ${obj.paymentId}, 'pending', '${obj.fullName}', '${obj.shippingAddress.addressLine1}', '${obj.shippingAddress.addressLine2}', '${obj.shippingAddress.city}', '${obj.shippingAddress.state}', '${obj.shippingAddress.zip}', '${obj.shippingAddress.country}', '${obj.phone}', ${obj.cartTotal})`)
//   .then(function(res) {

//     //insert into the purchasedproducts table
//     // var productsToInsert = [];

//     var itemsProcessed = 0; 
//     for (var i = 0; i < obj.products.length; i++) {
//       var product = obj.products[i];
//       // var productObj = {
//       //   usertransid: res.rows[0].id,
//       //   vendorid: product.vendorId,
//       //   vendorname: product.vendorName,
//       //   productid: product.productId,
//       //   productname: product.productName,
//       //   productimgurl: 'MIGHT HAVE TO DELETE',
//       //   isprimeproduct: product.isPrimeProduct,
//       //   productquantity: product.quantity,
//       //   priceperitem: product.price
//       // }
//       db.query(`INSERT INTO purchasedproducts VALUES (DEFAULT, ${res.rows[0].id}, ${product.vendorId}, '${product.vendorName}', ${product.productId}, '${product.productName}', 'someURL', ${product.isPrimeProduct}, ${product.quantity}, ${product.price})`)
//       .then(function(res) {
//         itemsProcessed++;
//         if (itemsProcessed === obj.products.length) {
//           callback(newRow.id, null);
//         }
//       })
//       .catch(function(err) {
//         console.log('error inserting to database, purchasedproducts');
//       });
//     };
//   })
//   .catch(function(err) {
//     //Handle errors
//     console.log('error in saving to DATABASE');
//     console.log('error hereee: ', err);
//     // callback(null, err);
//   });
// }


