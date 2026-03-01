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
-- Table structure for table `estudantes`
--

DROP TABLE IF EXISTS `estudantes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estudantes` (
  `idEstudante` int NOT NULL AUTO_INCREMENT,
  `nomeEstudante` varchar(200) NOT NULL,
  `fotoEstudante` varchar(255) NOT NULL,
  `contactoEstudante` varchar(15) NOT NULL,
  `numEstudante` varchar(8) NOT NULL,
  `senhaEstudante` varchar(255) NOT NULL,
  `idCursos` int NOT NULL,
  PRIMARY KEY (`idEstudante`),
  UNIQUE KEY `contactoEstudante` (`contactoEstudante`),
  UNIQUE KEY `numEstudante` (`numEstudante`),
  KEY `idCursos` (`idCursos`),
  CONSTRAINT `estudantes_ibfk_1` FOREIGN KEY (`idCursos`) REFERENCES `cursos` (`idCursos`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estudantes`
--

LOCK TABLES `estudantes` WRITE;
/*!40000 ALTER TABLE `estudantes` DISABLE KEYS */;
INSERT INTO `estudantes` VALUES (7,'Artur Macumba Paulo','estudante_AM_1769096618797.png','+244 929277043','20250497','$2b$10$5w/syExxg.7N0P9Ky5UpFe9gvuF0AGJx4lAQ2EtdSPw3zLN4DD/vy',2),(8,'Nsimba Paula Suami','estudante_NP_1769096687191.png','+244 937260507','20250602','$2b$10$sQ6hUdqTzG3zPiuk4BxgdetBfWyq1R2QPHlpk0OlVWJlE/9z3eG.m',2),(16,'Maria Pedro','estudante_MP_1769372011472.png','+244 928583366','20251313','$2b$10$Pw7o7bZmmIguDz8rH4Mq3.wjfZ4xbtnOh/RFXOe7QTp1iKKP4oa6C',2);
/*!40000 ALTER TABLE `estudantes` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-26 16:07:48
