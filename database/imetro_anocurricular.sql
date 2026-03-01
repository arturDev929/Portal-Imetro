-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: imetro
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `anocurricular`
--

DROP TABLE IF EXISTS `anocurricular`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `anocurricular` (
  `idanocurricular` int NOT NULL AUTO_INCREMENT,
  `anocurricular` enum('1','2','3','4','5') NOT NULL,
  `idcurso` int NOT NULL,
  PRIMARY KEY (`idanocurricular`),
  KEY `idcurso` (`idcurso`),
  CONSTRAINT `anocurricular_ibfk_1` FOREIGN KEY (`idcurso`) REFERENCES `curso` (`idcurso`)
) ENGINE=InnoDB AUTO_INCREMENT=134 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `anocurricular`
--

LOCK TABLES `anocurricular` WRITE;
/*!40000 ALTER TABLE `anocurricular` DISABLE KEYS */;
INSERT INTO `anocurricular` VALUES (74,'1',24),(75,'2',24),(76,'3',24),(77,'4',24),(78,'1',35),(79,'2',35),(80,'3',35),(81,'4',35),(82,'5',35),(83,'4',34),(84,'3',34),(85,'2',34),(86,'1',34),(87,'1',30),(88,'2',30),(89,'3',30),(90,'4',30),(91,'5',30),(92,'1',33),(93,'2',33),(94,'3',33),(95,'4',33),(96,'1',29),(97,'2',29),(98,'3',29),(99,'4',29),(100,'1',27),(101,'2',27),(102,'3',27),(103,'4',27),(104,'5',27),(105,'5',26),(106,'4',26),(107,'3',26),(108,'2',26),(109,'1',26),(110,'1',32),(111,'2',32),(112,'3',32),(113,'4',32),(114,'5',32),(115,'5',31),(116,'4',31),(117,'3',31),(118,'2',31),(119,'1',31),(120,'1',23),(121,'2',23),(122,'3',23),(124,'4',25),(125,'3',25),(126,'2',25),(127,'1',25),(128,'1',28),(129,'2',28),(130,'3',28),(131,'4',28);
/*!40000 ALTER TABLE `anocurricular` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-26 16:07:49
