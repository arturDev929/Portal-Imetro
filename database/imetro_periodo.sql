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
-- Table structure for table `periodo`
--

DROP TABLE IF EXISTS `periodo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `periodo` (
  `idperiodo` int NOT NULL AUTO_INCREMENT,
  `idanocurricular` int NOT NULL,
  `idcategoriacurso` int NOT NULL,
  `idcurso` int NOT NULL,
  `periodo` varchar(255) NOT NULL,
  `turma` varchar(20) NOT NULL,
  `anoletivo` varchar(255) NOT NULL,
  PRIMARY KEY (`idperiodo`),
  KEY `idanocurricular` (`idanocurricular`),
  KEY `idcategoriacurso` (`idcategoriacurso`),
  KEY `idcurso` (`idcurso`),
  CONSTRAINT `periodo_ibfk_1` FOREIGN KEY (`idanocurricular`) REFERENCES `anocurricular` (`idanocurricular`),
  CONSTRAINT `periodo_ibfk_2` FOREIGN KEY (`idcategoriacurso`) REFERENCES `categoriacurso` (`idcategoriacurso`),
  CONSTRAINT `periodo_ibfk_3` FOREIGN KEY (`idcurso`) REFERENCES `curso` (`idcurso`)
) ENGINE=InnoDB AUTO_INCREMENT=84 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `periodo`
--

LOCK TABLES `periodo` WRITE;
/*!40000 ALTER TABLE `periodo` DISABLE KEYS */;
INSERT INTO `periodo` VALUES (40,92,27,33,'Manhã','LCC1M','2025-2026'),(41,92,27,33,'Tarde','LCC1T','2025-2026'),(42,92,27,33,'Noite','LCC1N','2025-2026'),(43,93,27,33,'Manhã','LCC2M','2025-2026'),(44,93,27,33,'Tarde','LCC2T','2025-2026'),(45,93,27,33,'Noite','LCC2N','2025-2026'),(46,94,27,33,'Manhã','LCC3M','2025-2026'),(47,94,27,33,'Tarde','LCC3T','2025-2026'),(48,94,27,33,'Noite','LCC3N','2025-2026'),(49,95,27,33,'Manhã','LCC4M','2025-2026'),(50,95,27,33,'Tarde','LCC4T','2025-2026'),(51,95,27,33,'Noite','LCC4N','2025-2026'),(53,78,27,35,'Manhã','LEET1M','2025-2026'),(54,78,27,35,'Tarde','LEET1T','2025-2026'),(55,78,27,35,'Noite','LEET1N','2025-2026'),(56,112,27,32,'Manhã','LEET3M','2025-2026'),(57,79,27,35,'Tarde','LEET2T','2025-2026'),(58,79,27,35,'Noite','LEET2N','2025-2026'),(59,80,27,35,'Manhã','LEET3M','2025-2026'),(60,80,27,35,'Tarde','LEET3T','2025-2026'),(61,80,27,35,'Noite','LEET3N','2025-2026'),(62,81,27,35,'Manhã','LEET4M','2025-2026'),(63,81,27,35,'Tarde','LEET4T','2025-2026'),(64,81,27,35,'Noite','LEET4N','2025-2026'),(65,82,27,35,'Manhã','LEET5M','2025-2026'),(66,82,27,35,'Tarde','LEET5T','2025-2026'),(67,82,27,35,'Noite','LEET5N','2025-2026'),(68,110,27,32,'Manhã','LEC1M','2025-2026'),(70,110,27,32,'Tarde','LEC1T','2025-2026'),(71,110,27,32,'Noite','LEC1N','2025-2026'),(72,112,27,32,'Manhã','LEC3M','2025-2026'),(73,111,27,32,'Tarde','LEC2M','2025-2026'),(74,111,27,32,'Noite','LEC2M','2025-2026'),(75,112,27,32,'Noite','LEC2M','2025-2026'),(76,112,27,32,'Tarde','LEC2M','2025-2026'),(77,112,27,32,'Manhã','LEC2M','2025-2026'),(78,113,27,32,'Manhã','LEC4M','2025-2026'),(79,113,27,32,'Tarde','LEC2M','2025-2026'),(80,113,27,32,'Noite','LEC4M','2025-2026'),(81,114,27,32,'Noite','LEC5N','2025-2026'),(82,114,27,32,'Tarde','LEC5T','2025-2026'),(83,114,27,32,'Manhã','LEC5M','2025-2026');
/*!40000 ALTER TABLE `periodo` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-11 20:53:27
