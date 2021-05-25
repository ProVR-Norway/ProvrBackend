CREATE DATABASE users;

USE users;

DROP TABLE IF EXISTS User;
CREATE TABLE User (
  userID int(11) NOT NULL AUTO_INCREMENT,
  username varchar(45) NOT NULL,
  userEmail varchar(45) NOT NULL,
  password varchar(32) NOT NULL,
  PRIMARY KEY (userID)
);


LOCK TABLES User WRITE;
INSERT INTO User VALUES (1,'admin123','yahoo@gmail.com','pass123'),(2,'adeeeemin','yahooooo','123'),(3,'adeeedsdsademin','yahoasdasdsadoooo','123'),(4,'olehj','olehj@yahoo.com','123'),(5,'admasdasdsadin','yaasdasddoo','123'),(6,'admsadasasdsssssin','haasdasdasdassssaa','123'),(7,'gggg','aaaa','vvvv'),(8,'gf','ft','jrtgj'),(9,'admsasdsssssin','asdasdasdasd','123'),(10,'adsin','asdasd','123'),(11,'david123','david@gmail.com','root'),(12,'fff','oooo','hhh'),(13,'yyyy','hhgg','oiiif'),(14,'ttt','jj',''),(15,'123','123','123'),(16,'participant','participant@gmail.com','124abc97yhkJYDE@'),(17,'123ef','123@gmail.com','124tfdrghH79@'),(18,'6ggyn','g','hfggffh'),(19,'ji0','gfhy','fhnyh'),(20,'rfff','ffud','hfyig'),(21,'bfg','fhf','1f3fa119a4dbdb2c576de8d9f9c0754e'),(22,'dsavgmj','dgijkJDWSdsnhtg@gmail.com','qrvnji8HRI@fhmjk'),(23,'123abc','testmail@gmail.com','abc'),(24,'1234abcj','1234@gmail.com','1243dwJG@'),(25,'123guh','david@123mail.com','123asfJ'),(26,'admin1234','yahoo@gmail.live','pass123'),(27,'oystein','londalnilsenoystein@gmail.com','123456'),(28,'asasasasas','hello@yahoo.com',''),(29,'TestOnAppEngine','test@gmail.com','Pass123'),(30,'hello222','ccccccc@gmail.com','n7G@*1dd'),(31,'oyyyssssyssys','londalnilsenoystein@gmaili.com','11111'),(32,'admin12345','helloo@yahoo.com','2f23fa3579f3f75175793649115c1b25'),(33,'2222222','Hello@nenett.no','93a039376e3dc14567ce113c6d62215e'),(34,'','heeeeiii@yahoo.com','d41d8cd98f00b204e9800998ecf8427e'),(35,'g','ggg','d41d8cd98f00b204e9800998ecf8427e'),(36,'1','Hsisis@nenett.no','081c6c081967bb5cc68b23b49acb0795');
UNLOCK TABLES;

DROP TABLE IF EXISTS Model;
CREATE TABLE Model (
  modelID int(10) NOT NULL AUTO_INCREMENT,
  uploaded binary(1) NOT NULL,
  dateUploaded date DEFAULT NULL,
  name varchar(45) NOT NULL,
  userID int(10) NOT NULL,
  PRIMARY KEY (modelID),
  KEY fkIdx_26 (userID),
  CONSTRAINT FK_25 FOREIGN KEY (userID) REFERENCES User (userID)
);

DROP TABLE IF EXISTS Server;
CREATE TABLE Server (
  serverID int(10) NOT NULL AUTO_INCREMENT,
  hostIP varchar(45) NOT NULL,
  hostPort int(5) NOT NULL,
  isAllocated bit(1) NOT NULL,
  PRIMARY KEY (serverID)
);

LOCK TABLES Server WRITE;
INSERT INTO Server VALUES (1,'35.204.67.86',7777,0x00);
UNLOCK TABLES;


DROP TABLE IF EXISTS Session;
CREATE TABLE Session (
  sessionID int(10) NOT NULL AUTO_INCREMENT,
  sessionName varchar(45) NOT NULL,
  mapName varchar(45) NOT NULL,
  maxParticipants int(2) NOT NULL,
  serverID int(10) NOT NULL,
  hostUserID int(10) NOT NULL,
  participantCount int(10) NOT NULL,
  PRIMARY KEY (sessionID),
  KEY fkIdx_45 (serverID),
  KEY fkIdx_60 (hostUserID),
  CONSTRAINT FK_44 FOREIGN KEY (serverID) REFERENCES Server (serverID),
  CONSTRAINT FK_59 FOREIGN KEY (hostUserID) REFERENCES User (userID)
);

DROP TABLE IF EXISTS Model;
CREATE TABLE Model (
  modelID int(10) NOT NULL AUTO_INCREMENT,
  uploaded binary(1) NOT NULL,
  dateUploaded date DEFAULT NULL,
  name varchar(45) NOT NULL,
  userID int(10) NOT NULL,
  PRIMARY KEY (modelID),
  KEY fkIdx_26 (userID),
  CONSTRAINT FK_25 FOREIGN KEY (userID) REFERENCES User (userID)
);

LOCK TABLES Model WRITE;
INSERT INTO Model VALUES (1,0x31,'2021-04-30','CesiumMan',1),(2,0x31,'2021-04-28','RiggedFigure',1),(3,0x31,'2021-04-28','RiggedSimple',1),(9,0x31,'2021-04-28','Fox',1),(10,0x31,'2021-04-25','VC',1),(11,0x31,'2021-04-23','DamagedHelmet',1),(12,0x31,'2021-04-23','Duck',1),(13,0x31,'2021-04-23','2CylinderEngine',1),(14,0x31,'2021-04-23','ToyCar',1),(15,0x31,'2021-04-27','BrainStem',1),(16,0x31,'2021-04-25','Fox',26),(17,0x31,'2021-04-25','BoxAnimated',1),(18,0x31,'2021-04-25','VC',27),(19,0x31,'2021-04-25','Fox',27),(20,0x31,'2021-04-25','BrainStem',27),(21,0x31,'2021-04-25','RiggedFigure',27),(22,0x31,'2021-04-25','BoxAnimated',27),(23,0x31,'2021-04-25','RiggedSimple',27),(24,0x31,'2021-04-28','Fox',32),(25,0x31,'2021-04-28','BrainStem',32),(26,0x31,'2021-04-28','RiggedSimple',32),(27,0x31,'2021-04-28','RiggedFigure',32),(28,0x31,'2021-04-28','BoxAnimated',32);
UNLOCK TABLES;

DROP TABLE IF EXISTS Invited_Participant;
CREATE TABLE Invited_Participant (
  userID int(10) NOT NULL,
  sessionID int(10) NOT NULL,
  KEY fkIdx_51 (userID),
  KEY fkIdx_57 (sessionID),
  CONSTRAINT FK_50 FOREIGN KEY (userID) REFERENCES User (userID),
  CONSTRAINT FK_56 FOREIGN KEY (sessionID) REFERENCES Session (sessionID)
);