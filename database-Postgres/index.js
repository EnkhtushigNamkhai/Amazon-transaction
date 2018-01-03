var knex = require('knex')({
  client: 'pg',
  connection: {
    host     : '127.0.0.1',
    database : 'transaction',
    charset  : 'utf8'
  }
});

//might have to make this a noSQL database

var bookshelf = require('bookshelf')(knex);

var usertrans = bookshelf.Model.extend({
	tableName: 'usertrans'
});

var purchasedproducts = bookshelf.Model.extend({
  tableName: 'purchasedproducts'
});

var paymentMethods = bookshelf.Model.extend({
	tableName: 'paymentmethods'
});

/* Updates the row corresponding to the userTransId to status (Completed or Failed) */
module.exports.update = function(userTransId, status, callback) {
    console.log('userTransId: ', userTransId);
    //get the transaction with this id from UserTrans and edit the status to be Completed/Failed based on status
    new usertrans({
      id: userTransId
    }).save( {status: status}, {patch: true})
    .then(function (model) {
      callback('Success');
    })
    .then(function(error) {
      callback('Failed');
    });
}

module.exports.storeTransaction = function(obj, callback) {
	console.log('trying to store to Database now');
  
	new usertrans({
	  date: new Date(),
	  userid: obj.userId,
	  paymentmethodid: obj.paymentId,    
	  status: 'pending',
	  fullname: obj.fullName,
	  addressline1: obj.shippingAddress.addressLine1, 
	  addressline2: obj.shippingAddress.addressLine2, 
	  city: obj.shippingAddress.city,
	  state: obj.shippingAddress.state,
	  zip: obj.shippingAddress.zip,
	  country: obj.shippingAddress.country,
	  phone: obj.phone,
	  grandtotal: obj.cartTotal
	}).save().then(function(newRow) {
    /**************** AFTER USER TRANS IS STORED *****************/
    // callback(newRow.id, null);

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
      
      //add productObj to database
      new purchasedproducts(productObj).save(null, {method: 'insert'}).then(function(result) {
        itemsProcessed++;
        if (itemsProcessed === obj.products.length) {
          callback(newRow.id, null);
        }
      }).catch(function(err) {
        // callback(null, err);
        console.log('error in saving');
      });


      // productsToInsert.push(productObj);
    }


    // // batch insert it into PurchasedProducts table. 
    // knex.batchInsert('purchasedproducts', productsToInsert)
    // .then(function(ids) {
    //     console.log('batch load successful');
    //     callback(newRow.id, null);
    // }).catch(function(err) {
    //   callback(null, err);
    // });

  }).catch(function(err) {
    // Handle errors
    console.log('error in saving to DATABASE');
    console.log(err);
    callback(null, err);
  });
}

