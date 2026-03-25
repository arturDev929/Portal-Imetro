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
-- Table structure for table `estudanteinscricao`
--

DROP TABLE IF EXISTS `estudanteinscricao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estudanteinscricao` (
  `id_estudanteInscricao` int NOT NULL AUTO_INCREMENT,
  `nome_estudanteInscricao` varchar(255) NOT NULL,
  `contacto_estudanteInscricao` varchar(16) NOT NULL,
  `email_estudanteInscricao` varchar(255) NOT NULL,
  `sexo_estudanteInscricao` varchar(25) NOT NULL,
  `periodo_estudanteInscricao` varchar(10) NOT NULL,
  `idcurso` int NOT NULL,
  `documento_estudanteInscricao` varchar(255) NOT NULL,
  `foto_estudanteInscricao` varchar(255) NOT NULL,
  `senha_estudanteInscricao` varchar(255) NOT NULL,
  `bi_estudanteInscricao` varchar(25) NOT NULL,
  `numeroInscricao_estudanteInscricao` varchar(25) NOT NULL,
  `pdf_InscricaoRupe` varchar(255) DEFAULT NULL,
  `pdf_MatriculaRupe` varchar(255) DEFAULT NULL,
  `estado_estdanteInscrito` enum('Aprovado','Reprovado','Admitido','Não Admitido','Pendente') NOT NULL DEFAULT 'Pendente',
  PRIMARY KEY (`id_estudanteInscricao`),
  UNIQUE KEY `contacto_estudanteInscricao` (`contacto_estudanteInscricao`),
  UNIQUE KEY `email_estudanteInscricao` (`email_estudanteInscricao`),
  KEY `idcurso` (`idcurso`),
  CONSTRAINT `estudanteinscricao_ibfk_1` FOREIGN KEY (`idcurso`) REFERENCES `curso` (`idcurso`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estudanteinscricao`
--

LOCK TABLES `estudanteinscricao` WRITE;
/*!40000 ALTER TABLE `estudanteinscricao` DISABLE KEYS */;
INSERT INTO `estudanteinscricao` VALUES (2,'Artur Macumba Paulo','+244 929277043','arturpaulo929@gmail.com','Masculino','Manhã',33,'estudante_2026284708_doc_1773346824606.pdf','estudante_2026284708_foto_1773346824610.jpeg','$2b$10$5LAeJ7EzJB10fEpVE7pRgOo2BztQ29VxLgKsTuNYK5GBNbaViRbJK','008555739LA047','2026284708',NULL,NULL,'Aprovado'),(3,'Nsimba Paula Maniongo Suami','+244 937260507','nsimbapaulas@gmail.com','Feminino','Manhã',33,'estudante_2026378126_doc_1773393048765.pdf','estudante_2026378126_foto_1773393048770.png','$2b$10$M.Q27CslhahDDQI8dCx5be4rfP04FVMMJUw1O4VyB51mGzXRp6YOW','008649051LA049','2026378126',NULL,NULL,'Aprovado');
/*!40000 ALTER TABLE `estudanteinscricao` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-25 22:52:26
