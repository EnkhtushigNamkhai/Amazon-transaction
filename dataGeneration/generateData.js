const faker = require('faker');
const fs = require('fs');
// // \l - shows all databases
// // \d - shows all tables


// generatePaymentMethods(); //10s
// generateUserTransData(); //3min
generatePurchasedProds(); // 7 - 8 mins

function getRandomArbitrary(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

//two payment Methods for each user
function generatePaymentMethods() {
 var first = true;
  var writeStream = fs.createWriteStream('./dataFiles/PaymentMethods.csv', {'flags': 'a', 'encoding': null});
  var typeOfPayment = ['Visa', 'Master Card', 'Discover', 'UCB', 'Diners Club', 'UnionPay', 'American Express']
  writeStream.once('open', (fd) => {
    if (first) {
      first = false;
      writeStream.write('id; userId\n');
    }
    count = 1;
    second = false;
    //4000000
    for (var i = 1; i <= 4000000; i++) {
      var paymentId = i;
      var userId = count;
      if (second) {
        second = false;
        count += 1;
      } else {
        second = true;
      }
      // REMEMBER PAYMENTID IS NOT NECCESSARILY  1-..., IT COULD BE RANDOM UNIQUE IDS
      writeStream.write(`${paymentId}; ${userId}\n`);
    }
    writeStream.end();
    console.log('done');
  });
}

//a user makes one transactions
function generateUserTransData() {
  var first = true;
  var writeStream = fs.createWriteStream('./dataFiles/UserTrans.csv', {'flags': 'a', 'encoding': null});

  writeStream.once('open', (fd) => {
    if (first) {
      first = false;
      writeStream.write('date; userId; paymentMethodId; status; fullName; addressLine1; addressLine2; city; state; zip; country; phone; grandTotal\n');
    } 
    var statusArr = ['pending', 'completed', 'failed'];
    count =- 1;
    //2000000
    for (var i = 1; i <= 2000000; i++) {
      if (i % 100000 === 0) {
        console.log(i);
      }
      var userTransId = i; //number from 1 - 2M
      var date = faker.date.past().toISOString();

      var userId = i;
      count = count + 2;
      var paymentMethodId = count; //each user has different paymentIds

      var status = statusArr[Math.floor(Math.random() * 3)];
      var fullName = faker.name.findName();
      var addressLine1 = faker.address.streetAddress();
      var addressLine2 = faker.address.secondaryAddress();
      var city = faker.address.city();
      var state = faker.address.state();
      var zip = faker.address.zipCode();
      var country = faker.address.country();
      var phone = faker.phone.phoneNumberFormat();
      var grandTotal = faker.commerce.price();

      writeStream.write(`${date}; ${userId}; ${paymentMethodId}; ${status}; ${fullName}; ${addressLine1}; ${addressLine2}; ${city}; ${state}; ${zip}; ${country}; ${phone}; ${grandTotal}\n`);
    }

    writeStream.end();
    console.log('done');

  });

}

//2 products for each transaction
function generatePurchasedProds() {
  var first = true;
  var writeStream = fs.createWriteStream('./dataFiles/PurchasedProds.csv', {'flags': 'a', 'encoding': null});

  writeStream.once('open', (fd) => {
    if (first) {
      first = false;
      writeStream.write('userTransId; vendorId; vendorName; productId; productName; productImgUrl; isPrimeProduct; productQuantity; pricePerItem\n');
    } 
    count = 1;
    second = false;
    for (var i = 1; i <= 4000000; i++) {
      if (i % 1000000 === 0) {
        console.log(i);
      }
      var userTransId = count;
      var vendorId = faker.random.number();
      var vendorName = faker.company.companyName();
      var productId = faker.random.number();
      var productName = faker.commerce.productName();
      var productImgUrl = faker.image.imageUrl();
      var isPrimeProduct = faker.random.boolean();
      var productQuantity = getRandomArbitrary(1,5);
      var pricePerItem = faker.commerce.price();

      if (second) {
        second = false;
        count += 1;
      } else {
        second = true;
      }

      writeStream.write(`${userTransId}; ${vendorId}; ${vendorName}; ${productId}; ${productName}; ${productImgUrl}; ${isPrimeProduct}; ${productQuantity}; ${pricePerItem}\n`);
    }
    writeStream.end();
    console.log('done');
  });
}



// copy paymentMethods(id, userId) FROM '/Users/Enkhtushig/HR/hrsf84-thesis/dataGeneration/dataFiles/PaymentMethods.csv' with csv header delimiter ';';

// copy UserTrans(date, userId, paymentMethodId, status, fullName, addressLine1, addressLine2, city, state, zip, country, phone, grandTotal) FROM '/Users/Enkhtushig/HR/hrsf84-thesis/dataGeneration/dataFiles/UserTrans.csv' with csv header delimiter ';';

// copy PurchasedProducts(usertransid, vendorid, vendorname, productid, productname, productimgurl, isprimeproduct, productquantity, priceperitem) FROM '/Users/Enkhtushig/HR/hrsf84-thesis/dataGeneration/dataFiles/PurchasedProds.csv' with csv header delimiter ';';
