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
-- Table structure for table `disciplina`
--

DROP TABLE IF EXISTS `disciplina`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `disciplina` (
  `iddisciplina` int NOT NULL AUTO_INCREMENT,
  `disciplina` varchar(255) NOT NULL,
  `idAdm` int NOT NULL,
  PRIMARY KEY (`iddisciplina`),
  KEY `idAdm` (`idAdm`),
  CONSTRAINT `disciplina_ibfk_1` FOREIGN KEY (`idAdm`) REFERENCES `admimetro` (`idAdm`)
) ENGINE=InnoDB AUTO_INCREMENT=107 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `disciplina`
--

LOCK TABLES `disciplina` WRITE;
/*!40000 ALTER TABLE `disciplina` DISABLE KEYS */;
INSERT INTO `disciplina` VALUES (50,'Comunicação Escrita',1),(51,'Introdução à Ciência da Computação',1),(52,'Metodologia de Investigação Científica',1),(53,'Inglês Técnico',1),(55,'Programação I',1),(56,'Lógica Matemática',1),(57,'Algebra Linear E Geometria Analitica',1),(58,'Analise Matematica II',1),(59,'Sistemas Digitais E Computadores',1),(60,'Fundamentos De Sistemas De Informacao',1),(61,'Programação II',1),(62,'Fisica Computacional',1),(63,'Calculo Numerico Computacional',1),(64,'Arquitectura De Computadores',1),(65,'Matematica Discreta',1),(66,'Programação III',1),(67,'Probabilidade E Estatistica',1),(68,'Base De Dados I',1),(69,'Sistemas Operativos',1),(70,'Programação IV',1),(71,'Engenharia E Analise De Software I',1),(72,'Base De Dados II',1),(73,'Algoritmos E Estrutura De Dados',1),(74,'Redes De Computadores I',1),(75,'Eletrónica',1),(76,'Programação Web I',1),(77,'Data Warehouse e Data Mining',1),(78,'Programação V',1),(79,'Redes de Computadores II',1),(80,'Engenharia e Analise de Software II',1),(81,'Qualidade de Software',1),(82,'Inteligencia Artificial',1),(83,'Computacao Grafica',1),(84,'Programação Web II',1),(85,'Gestao De Projectos Informaticos',1),(86,'Programação de Dispositivos Electronicos',1),(87,'Sistema Distribuidos e Paralelos',1),(88,'Projecto e Administracao de Redes',1),(89,'Seguranca em Computacao',1),(90,'Etica E Deontologia Profissional',1),(91,'Teoria da Computacao e Linguagem',1),(92,'Empreendedorismo',1),(93,'Computacao Movel',1),(94,'Projecto De Sistemas',1),(95,'Trabalho De Conclusao De Curso',1),(96,'Direito e Tecnologia da Informacao',1),(100,'Analise Matematica I',1);
/*!40000 ALTER TABLE `disciplina` ENABLE KEYS */;
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
