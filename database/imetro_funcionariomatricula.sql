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
-- Table structure for table `funcionariomatricula`
--

DROP TABLE IF EXISTS `funcionariomatricula`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `funcionariomatricula` (
  `idfuncionariomatricula` int NOT NULL AUTO_INCREMENT,
  `nomefuncionariomatricula` varchar(255) NOT NULL,
  `contactofuncionariomatricula` varchar(15) NOT NULL,
  `nbifuncionariomatricula` varchar(20) NOT NULL,
  `senhafuncionariomatricula` varchar(255) NOT NULL,
  `idAdm` int NOT NULL,
  `cargo` varchar(255) NOT NULL,
  PRIMARY KEY (`idfuncionariomatricula`),
  KEY `idAdm` (`idAdm`),
  CONSTRAINT `funcionariomatricula_ibfk_1` FOREIGN KEY (`idAdm`) REFERENCES `admimetro` (`idAdm`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `funcionariomatricula`
--

LOCK TABLES `funcionariomatricula` WRITE;
/*!40000 ALTER TABLE `funcionariomatricula` DISABLE KEYS */;
INSERT INTO `funcionariomatricula` VALUES (3,'Artur Macumba Paulo','929277043','008555739LA047','$2b$10$xFYkVGvLI30AMKktZM11g.65yktEL1EPAxNzchahSR9ozpNIIe8au',1,'Responsavel por Matricula'),(4,'Nsimba Suami Paula','937260507','008555739LA046','$2b$10$YIQmbwJMsYjD0x1BtC4wMeO7rZK4kne9jcEzhT8Hw9nPvJXci8dxG',1,'Responsavel por Informacoes');
/*!40000 ALTER TABLE `funcionariomatricula` ENABLE KEYS */;
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
