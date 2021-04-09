-- ****************** SqlDBM: MySQL ******************;
-- ***************************************************;


-- ************************************** `User`

CREATE TABLE User ( userID int AUTO_INCREMENT, username varchar(45) NOT NULL, userEmail varchar(45) NOT NULL, password varchar(32) NOT NULL, PRIMARY KEY (userID));

-- https://app.sqldbm.com/MySQL/Edit/p156955/