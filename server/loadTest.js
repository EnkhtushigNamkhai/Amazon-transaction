'use strict';
const faker = require('faker');

module.exports = {
  generateRandomData
};

function getRandomArbitrary(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function generateRandomData(userContext, events, done) {
  // generate data with Faker:
  var userId = getRandomArbitrary(1, 2000000);
  var fullName = faker.name.findName();
  var phone = faker.fake("{{phone.phoneNumberFormat}}");

  var products = [{
    productId: faker.random.number(),
    productName: faker.commerce.productName(),
    price: faker.commerce.price(),
    vendorId: faker.random.number(),
    vendorName: faker.company.companyName(),
    quantity: getRandomArbitrary(1,5),
    isPrimeProduct: faker.fake("{{random.boolean}}")
  }, 
  {
    productId: faker.random.number(),
    productName: faker.commerce.productName(),
    price: faker.commerce.price(),
    vendorId: faker.random.number(),
    vendorName: faker.company.companyName(),
    quantity: getRandomArbitrary(1,5),
    isPrimeProduct: faker.fake("{{random.boolean}}")
  }, 
  {
    productId: faker.random.number(),
    productName: faker.commerce.productName(),
    price: faker.commerce.price(),
    vendorId: faker.random.number(),
    vendorName: faker.company.companyName(),
    quantity: getRandomArbitrary(1,5),
    isPrimeProduct: faker.fake("{{random.boolean}}")
  },
  {
    productId: faker.random.number(),
    productName: faker.commerce.productName(),
    price: faker.commerce.price(),
    vendorId: faker.random.number(),
    vendorName: faker.company.companyName(),
    quantity: getRandomArbitrary(1,5),
    isPrimeProduct: faker.fake("{{random.boolean}}")
  },
  {
    productId: faker.random.number(),
    productName: faker.commerce.productName(),
    price: faker.commerce.price(),
    vendorId: faker.random.number(),
    vendorName: faker.company.companyName(),
    quantity: getRandomArbitrary(1,5),
    isPrimeProduct: faker.fake("{{random.boolean}}")
  }];

  var paymentId = getRandomArbitrary(1, 4000000); //has to exist
  var cartTotal = faker.commerce.price();
  var primeTrialSignUp = faker.fake("{{random.boolean}}");

  var addressLine1 = faker.fake("{{address.streetAddress}}");
  var addressLine2 = faker.fake("{{address.secondaryAddress}}");
  var city = faker.fake("{{address.city}}");
  var state = faker.fake("{{address.state}}");
  var zip = faker.fake("{{address.zipCode}}");
  var country = faker.fake("{{address.country}}");

  var shippingAddress = {
    addressLine1: addressLine1,
    addressLine2: addressLine2,
    city: city,
    state: state,
    zip: zip,
    country: country
  };

  var billingAddress = {
    addressLine1: addressLine1,
    addressLine2: addressLine2,
    city: city,
    state: state,
    zip: zip,
    country: country
  };

  // add variables to virtual user's context:
  userContext.vars.userId = userId;
  userContext.vars.fullName = fullName;
  userContext.vars.phone = phone;
  userContext.vars.products = products;
  userContext.vars.paymentId = paymentId;
  userContext.vars.cartTotal = cartTotal;
  userContext.vars.primeTrialSignUp = primeTrialSignUp;
  userContext.vars.shippingAddress = shippingAddress;
  userContext.vars.billingAddress = billingAddress;

  // continue with executing the scenario:
  return done();
}




