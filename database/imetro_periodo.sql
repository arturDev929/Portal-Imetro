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
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `periodo`
--

LOCK TABLES `periodo` WRITE;
/*!40000 ALTER TABLE `periodo` DISABLE KEYS */;
INSERT INTO `periodo` VALUES (40,92,27,33,'Manhã','LCC1M','2025-2026'),(41,92,27,33,'Tarde','LCC1T','2025-2026'),(42,92,27,33,'Noite','LCC1N','2025-2026'),(43,93,27,33,'Manhã','LCC2M','2025-2026'),(44,93,27,33,'Tarde','LCC2T','2025-2026'),(45,93,27,33,'Noite','LCC2N','2025-2026'),(46,94,27,33,'Manhã','LCC3M','2025-2026'),(47,94,27,33,'Tarde','LCC3T','2025-2026'),(48,94,27,33,'Noite','LCC3N','2025-2026'),(49,95,27,33,'Manhã','LCC4M','2025-2026'),(50,95,27,33,'Tarde','LCC4T','2025-2026'),(51,95,27,33,'Noite','LCC4N','2025-2026');
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

-- Dump completed on 2026-02-26 16:07:49
