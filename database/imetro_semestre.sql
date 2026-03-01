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
-- Table structure for table `semestre`
--

DROP TABLE IF EXISTS `semestre`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `semestre` (
  `idsemestre` int NOT NULL AUTO_INCREMENT,
  `idcategoriacurso` int NOT NULL,
  `idcurso` int NOT NULL,
  `iddisciplina` int NOT NULL,
  `semestre` enum('1','2') NOT NULL,
  `idanocurricular` int NOT NULL,
  PRIMARY KEY (`idsemestre`),
  KEY `idcategoriacurso` (`idcategoriacurso`),
  KEY `idcurso` (`idcurso`),
  KEY `iddisciplina` (`iddisciplina`),
  KEY `idanocurricular` (`idanocurricular`),
  CONSTRAINT `semestre_ibfk_1` FOREIGN KEY (`idcategoriacurso`) REFERENCES `categoriacurso` (`idcategoriacurso`),
  CONSTRAINT `semestre_ibfk_2` FOREIGN KEY (`idcurso`) REFERENCES `curso` (`idcurso`),
  CONSTRAINT `semestre_ibfk_3` FOREIGN KEY (`iddisciplina`) REFERENCES `disciplina` (`iddisciplina`),
  CONSTRAINT `semestre_ibfk_4` FOREIGN KEY (`idanocurricular`) REFERENCES `anocurricular` (`idanocurricular`)
) ENGINE=InnoDB AUTO_INCREMENT=74 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `semestre`
--

LOCK TABLES `semestre` WRITE;
/*!40000 ALTER TABLE `semestre` DISABLE KEYS */;
INSERT INTO `semestre` VALUES (20,27,33,55,'1',92),(21,27,33,52,'1',92),(22,27,33,56,'1',92),(23,27,33,51,'1',92),(24,27,33,53,'1',92),(25,27,33,50,'1',92),(27,27,33,57,'2',92),(28,27,33,58,'2',92),(29,27,33,62,'2',92),(30,27,33,60,'2',92),(31,27,33,61,'2',92),(32,27,33,59,'2',92),(33,27,33,63,'1',93),(34,27,33,64,'1',93),(35,27,33,65,'1',93),(36,27,33,66,'1',93),(37,27,33,67,'1',93),(38,27,33,68,'1',93),(39,27,33,69,'2',93),(40,27,33,70,'2',93),(41,27,33,71,'2',93),(42,27,33,72,'2',93),(43,27,33,73,'2',93),(44,27,33,74,'2',93),(45,27,33,75,'1',94),(46,27,33,76,'1',94),(47,27,33,77,'1',94),(48,27,33,78,'1',94),(49,27,33,79,'1',94),(50,27,33,80,'1',94),(51,27,33,81,'2',94),(52,27,33,82,'2',94),(53,27,33,83,'2',94),(54,27,33,84,'2',94),(55,27,33,85,'2',94),(56,27,33,86,'2',94),(57,27,33,87,'1',95),(58,27,33,88,'1',95),(59,27,33,89,'1',95),(60,27,33,90,'1',95),(61,27,33,91,'1',95),(62,27,33,92,'1',95),(63,27,33,93,'2',95),(64,27,33,94,'2',95),(65,27,33,95,'2',95),(66,27,33,83,'2',95),(67,27,33,96,'2',95),(68,27,33,100,'1',92),(69,25,24,95,'2',77),(70,27,35,95,'2',82),(71,27,32,95,'2',114);
/*!40000 ALTER TABLE `semestre` ENABLE KEYS */;
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
