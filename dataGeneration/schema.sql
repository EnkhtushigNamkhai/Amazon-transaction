
-- DROP DATABASE transaction;
-- CREATE DATABASE transaction;
-- \c transaction;


-- CREATE TABLE paymentMethods (
--     id integer primary key,
--     userId integer         
-- );

-- CREATE TABLE UserTrans (
--     id serial primary key,
--     date timestamp with time zone,
--     userId integer,
--     paymentMethodId integer,    
--     status varchar(10),
--     fullName text,
--     addressLine1 text,
--     addressLine2 text, 
--     city text,
--     state text,
--     zip VARCHAR(16),
--     country text,
--     phone text,
--     grandTotal money
-- );

-- -- what happens if you made purchased products an array in UserTrans? Will it be faster or slower? 
-- CREATE TABLE PurchasedProducts ( 
-- 	id serial primary key,
--     userTransId integer references UserTrans(id),
--     vendorId integer,
--     vendorName text,
--     productId integer,
--     productName text,
--     productImgUrl text,
--     isPrimeProduct boolean,
--     productQuantity integer,
--     pricePerItem money
-- );

-- copy paymentMethods(id, userId) FROM '/Users/Enkhtushig/HR/hrsf84-thesis/dataGeneration/dataFiles/PaymentMethods.csv' with csv header delimiter ';';

-- copy UserTrans(date, userId, paymentMethodId, status, fullName, addressLine1, addressLine2, city, state, zip, country, phone, grandTotal) FROM '/Users/Enkhtushig/HR/hrsf84-thesis/dataGeneration/dataFiles/UserTrans.csv' with csv header delimiter ';';

-- copy PurchasedProducts(usertransid, vendorid, vendorname, productid, productname, productimgurl, isprimeproduct, productquantity, priceperitem) FROM '/Users/Enkhtushig/HR/hrsf84-thesis/dataGeneration/dataFiles/PurchasedProds.csv' with csv header delimiter ';';


DROP DATABASE transaction;
CREATE DATABASE transaction;
\c transaction;


CREATE TABLE paymentMethods (
    id integer primary key,
    userId integer         
);

CREATE TABLE UserTrans (
    id serial primary key,
    date timestamp with time zone,
    userId integer,
    paymentMethodId integer,    
    status varchar(10),
    grandTotal money
);

CREATE TABLE details (
    id serial primary key, 
    userTransId integer references UserTrans(id),
    fullName varchar(100),
    addressLine1 varchar(50),
    addressLine2 varchar(20), 
    city varchar(30),
    state varchar(20),
    zip VARCHAR(16),
    country varchar(100),
    phone varchar(20)
);

-- what happens if you made purchased products an array in UserTrans? Will it be faster or slower? 
CREATE TABLE PurchasedProducts ( 
    id serial primary key,
    userTransId integer references UserTrans(id),
    vendorId integer,
    vendorName varchar(50),
    productId integer,
    productName varchar(100),
    productImgUrl text,
    isPrimeProduct boolean,
    productQuantity integer,
    pricePerItem money
);

copy paymentMethods(id, userId) FROM '/Users/Enkhtushig/HR/hrsf84-thesis/dataGeneration/dataFiles/PaymentMethods.csv' with csv header delimiter ';';

copy UserTrans(date, userId, paymentMethodId, status, grandTotal) FROM '/Users/Enkhtushig/HR/hrsf84-thesis/dataGeneration/dataFiles/UserTrans.csv' with csv header delimiter ';';

copy details(userTransId, fullName, addressLine1, addressLine2, city, state, zip, country, phone) FROM '/Users/Enkhtushig/HR/hrsf84-thesis/dataGeneration/dataFiles/Details.csv' with csv header delimiter ';';

copy PurchasedProducts(usertransid, vendorid, vendorname, productid, productname, productimgurl, isprimeproduct, productquantity, priceperitem) FROM '/Users/Enkhtushig/HR/hrsf84-thesis/dataGeneration/dataFiles/PurchasedProds.csv' with csv header delimiter ';';
