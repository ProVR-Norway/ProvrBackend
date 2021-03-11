-- ****************** SqlDBM: MySQL ******************;
-- ***************************************************;


-- ************************************** `User`

CREATE TABLE `User`
(
 `userID`    int NOT NULL ,
 `userEmail` varchar(45) NOT NULL ,
 `password`  varchar(32) NOT NULL ,

PRIMARY KEY (`userID`, `userEmail`, `password`)
);

-- https://app.sqldbm.com/MySQL/Edit/p156955/