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
-- Table structure for table `disc_prof`
--

DROP TABLE IF EXISTS `disc_prof`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `disc_prof` (
  `iddiscprof` int NOT NULL AUTO_INCREMENT,
  `idprofessor` int NOT NULL,
  `iddisciplina` int NOT NULL,
  PRIMARY KEY (`iddiscprof`),
  KEY `idprofessor` (`idprofessor`),
  KEY `iddisciplina` (`iddisciplina`),
  CONSTRAINT `disc_prof_ibfk_1` FOREIGN KEY (`idprofessor`) REFERENCES `professor` (`idprofessor`),
  CONSTRAINT `disc_prof_ibfk_2` FOREIGN KEY (`iddisciplina`) REFERENCES `disciplina` (`iddisciplina`)
) ENGINE=InnoDB AUTO_INCREMENT=152 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `disc_prof`
--

LOCK TABLES `disc_prof` WRITE;
/*!40000 ALTER TABLE `disc_prof` DISABLE KEYS */;
INSERT INTO `disc_prof` VALUES (124,3,73),(125,3,64),(127,3,68),(130,4,68),(131,4,77),(132,12,57),(133,9,93),(134,2,100),(135,2,58),(136,13,58),(137,10,58),(138,4,58),(139,6,73),(140,2,73),(141,10,73),(142,2,63),(143,13,63),(145,11,63),(146,9,63),(147,14,63),(148,2,77),(149,13,77),(150,6,77),(151,14,77);
/*!40000 ALTER TABLE `disc_prof` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-26 16:07:47
