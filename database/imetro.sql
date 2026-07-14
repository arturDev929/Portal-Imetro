-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: imetro2
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
-- Table structure for table `admin_user`
--

DROP TABLE IF EXISTS `admin_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_user` (
  `id_user` varchar(255) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `data_criacao` date DEFAULT (curtime()),
  `data_atualizacao` date DEFAULT (curtime()),
  PRIMARY KEY (`id_user`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_user`
--

LOCK TABLES `admin_user` WRITE;
/*!40000 ALTER TABLE `admin_user` DISABLE KEYS */;
INSERT INTO `admin_user` VALUES ('abcabcabcabcabc','Artur Paulo','arturpaulo929@gmail.com','$2b$10$5w/syExxg.7N0P9Ky5UpFe9gvuF0AGJx4lAQ2EtdSPw3zLN4DD/vy','2026-05-27','2026-05-27');
/*!40000 ALTER TABLE `admin_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `anocurricular`
--

DROP TABLE IF EXISTS `anocurricular`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `anocurricular` (
  `id_anocurricular` varchar(255) NOT NULL,
  `ano` varchar(255) NOT NULL,
  `status` enum('Ativo','Desativado') DEFAULT 'Ativo',
  `id_user` varchar(255) NOT NULL,
  `id_curso` varchar(255) NOT NULL,
  `data_criacao` date DEFAULT (curtime()),
  `data_atualizacao` date DEFAULT (curtime()),
  PRIMARY KEY (`id_anocurricular`),
  KEY `id_user` (`id_user`),
  KEY `id_curso` (`id_curso`),
  CONSTRAINT `anocurricular_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `admin_user` (`id_user`),
  CONSTRAINT `anocurricular_ibfk_2` FOREIGN KEY (`id_curso`) REFERENCES `curso` (`id_curso`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `anocurricular`
--

LOCK TABLES `anocurricular` WRITE;
/*!40000 ALTER TABLE `anocurricular` DISABLE KEYS */;
INSERT INTO `anocurricular` VALUES ('1e56f36a-f42a-412b-b127-df5970f9b04a','2','Ativo','abcabcabcabcabc','2d04cad5-e822-4a1c-b9a5-8a515bd49543','2026-07-06','2026-07-06'),('3b18a0b6-d9e4-494e-be33-796f9c56f702','1','Ativo','abcabcabcabcabc','2d04cad5-e822-4a1c-b9a5-8a515bd49543','2026-07-06','2026-07-06'),('40eb93f6-b7d4-4a1f-a977-bc72c3cd5a17','1','Ativo','abcabcabcabcabc','348f8725-bd77-477c-bb53-5f2c036f0e61','2026-07-06','2026-07-06'),('6026ad61-2c5d-45e0-bccc-0e444ec9c3c8','4','Ativo','abcabcabcabcabc','1d4cf6ff-0b21-4d78-889b-4aa63eb461e6','2026-07-04','2026-07-04'),('7be3baf9-4213-41f5-885a-f622bf07b06d','1','Ativo','abcabcabcabcabc','1d4cf6ff-0b21-4d78-889b-4aa63eb461e6','2026-07-04','2026-07-04'),('836dfa92-5f69-4ba2-b0c4-0629b5a4fa02','5','Ativo','abcabcabcabcabc','2d04cad5-e822-4a1c-b9a5-8a515bd49543','2026-07-06','2026-07-06'),('8b9cb83d-eb7a-4c98-b932-57f8cd4d9a07','4','Ativo','abcabcabcabcabc','2d04cad5-e822-4a1c-b9a5-8a515bd49543','2026-07-06','2026-07-06'),('cc790682-428f-4501-b77b-8efd2ca73c57','3','Ativo','abcabcabcabcabc','1d4cf6ff-0b21-4d78-889b-4aa63eb461e6','2026-07-04','2026-07-04'),('de19dc7f-ca70-4f94-9b42-4fd46f923f8a','2','Ativo','abcabcabcabcabc','1d4cf6ff-0b21-4d78-889b-4aa63eb461e6','2026-07-04','2026-07-04'),('e0cd01b5-79b6-464c-8b4a-0c026fc3e276','3','Ativo','abcabcabcabcabc','2d04cad5-e822-4a1c-b9a5-8a515bd49543','2026-07-06','2026-07-06');
/*!40000 ALTER TABLE `anocurricular` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `anoletivo`
--

DROP TABLE IF EXISTS `anoletivo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `anoletivo` (
  `id_anoletivo` varchar(255) NOT NULL,
  `ano` varchar(255) NOT NULL,
  `status` enum('Ativo','Desativado') DEFAULT 'Ativo',
  `id_user` varchar(255) NOT NULL,
  `id_periodo` varchar(255) NOT NULL,
  `data_criacao` date DEFAULT (curtime()),
  `data_atualizacao` date DEFAULT (curtime()),
  `status_inscricao` enum('Aberto','Fechado') DEFAULT 'Aberto',
  PRIMARY KEY (`id_anoletivo`),
  KEY `id_user` (`id_user`),
  KEY `id_periodo` (`id_periodo`),
  CONSTRAINT `anoletivo_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `admin_user` (`id_user`),
  CONSTRAINT `anoletivo_ibfk_2` FOREIGN KEY (`id_periodo`) REFERENCES `periodo` (`id_periodo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `anoletivo`
--

LOCK TABLES `anoletivo` WRITE;
/*!40000 ALTER TABLE `anoletivo` DISABLE KEYS */;
INSERT INTO `anoletivo` VALUES ('2e079200-55aa-47ce-96c7-9892771cdb73','2025-2026','Ativo','abcabcabcabcabc','50feb6c1-c636-48e4-98ea-f47552c82d78','2026-07-06','2026-07-08','Fechado'),('337a24f4-955b-49ed-9c0e-3ea64cab649e','2025-2026','Ativo','abcabcabcabcabc','63127c9f-652f-4947-8734-f42ddd3238d7','2026-07-04','2026-07-08','Aberto'),('78ac20f7-9d9b-4979-8079-57f018ca0c9a','2025-2026','Ativo','abcabcabcabcabc','ea65d533-a8e5-4922-ba86-ca419659cf5f','2026-07-06','2026-07-08','Fechado'),('88378ded-e10d-4368-8730-25bb26042773','2025-2026','Ativo','abcabcabcabcabc','906f612e-8443-4e71-a610-70da0a305e06','2026-07-04','2026-07-08','Aberto'),('b517b3ca-33d7-47a3-8177-e8f0a45de52d','2025-2026','Ativo','abcabcabcabcabc','0cac0f28-6401-4af3-9c54-f0bd02e560a3','2026-07-07','2026-07-12','Fechado'),('baeed9d1-2667-4340-8ae1-50a6a3f2aeb3','2025-2027','Ativo','abcabcabcabcabc','278a423d-fe92-49d7-a2f2-8d596fc30f2f','2026-07-07','2026-07-08','Fechado'),('c1bcb888-c117-4c0e-99b6-bff3fece1367','2025-2026','Ativo','abcabcabcabcabc','278a423d-fe92-49d7-a2f2-8d596fc30f2f','2026-07-06','2026-07-08','Fechado'),('cd8a8b37-ea7a-4970-aac6-ef4252e7f38b','2025-2026','Desativado','abcabcabcabcabc','69187159-558b-42c6-bbc9-3a8a691fc4d6','2026-07-04','2026-07-08','Fechado'),('e8ea5c1f-542c-4ddd-ae03-bb92b949e736','2026-2027','Ativo','abcabcabcabcabc','69187159-558b-42c6-bbc9-3a8a691fc4d6','2026-07-04','2026-07-06','Aberto');
/*!40000 ALTER TABLE `anoletivo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cargo`
--

DROP TABLE IF EXISTS `cargo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cargo` (
  `id_cargo` varchar(255) NOT NULL,
  `cargo` varchar(255) NOT NULL,
  `status` enum('Ativo','Desativado') DEFAULT 'Ativo',
  `id_user` varchar(255) NOT NULL,
  `data_atualizacao` date DEFAULT (curtime()),
  `data_criacao` date DEFAULT (curtime()),
  PRIMARY KEY (`id_cargo`),
  KEY `id_user` (`id_user`),
  CONSTRAINT `cargo_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `admin_user` (`id_user`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cargo`
--

LOCK TABLES `cargo` WRITE;
/*!40000 ALTER TABLE `cargo` DISABLE KEYS */;
INSERT INTO `cargo` VALUES ('550e8400-e29b-41d4-a716-446655440000550e8400-e29b-41d4-a716-446655440000','Coordenador de Admissões e Matrículas','Ativo','abcabcabcabcabc','2026-06-07','2026-06-07'),('6ba7b810-9dad-11d1-80b4-00c04fd430c86ba7b810-9dad-11d1-80b4-00c04fd430c8','Assistente Administrativo','Ativo','abcabcabcabcabc','2026-06-07','2026-06-07'),('a3bb189e-8bf9-3888-9912-ace4e6543842a3bb189e-8bf9-3888-9912-ace4e6543842','Oficial de Cartões e Identificações','Ativo','abcabcabcabcabc','2026-06-07','2026-06-07'),('f47ac10b-58cc-4372-a567-0e02b2c3d479f47ac10b-58cc-4372-a567-0e02b2c3d479','Tesoureiro','Ativo','abcabcabcabcabc','2026-06-07','2026-06-07');
/*!40000 ALTER TABLE `cargo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categoria`
--

DROP TABLE IF EXISTS `categoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categoria` (
  `id_categoria` varchar(255) NOT NULL,
  `categoria` varchar(255) NOT NULL,
  `status` enum('Ativo','Desativado') DEFAULT 'Ativo',
  `id_user` varchar(255) NOT NULL,
  `data_criacao` date DEFAULT (curtime()),
  `data_atualizacao` date DEFAULT (curtime()),
  PRIMARY KEY (`id_categoria`),
  KEY `id_user` (`id_user`),
  CONSTRAINT `categoria_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `admin_user` (`id_user`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categoria`
--

LOCK TABLES `categoria` WRITE;
/*!40000 ALTER TABLE `categoria` DISABLE KEYS */;
INSERT INTO `categoria` VALUES ('9ad4a13d-4698-4935-9ee0-16c7130d4c1a','Departamento de Ciências Humanas, Educação e Artes','Ativo','abcabcabcabcabc','2026-06-28','2026-06-28'),('aac30154-38ac-4026-ad36-9572f606bedd','Departamento de Ciências Económicas e Gestão','Ativo','abcabcabcabcabc','2026-06-28','2026-06-28'),('d6dc1eb3-188f-4f02-b7de-943770214c2a','Departamento de Ciências Tecnológicas e Engenharia','Ativo','abcabcabcabcabc','2026-06-28','2026-06-28');
/*!40000 ALTER TABLE `categoria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contrato`
--

DROP TABLE IF EXISTS `contrato`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contrato` (
  `id_contrato` varchar(255) NOT NULL,
  `contrato` varchar(255) NOT NULL,
  `status` enum('Ativo','Desativado') DEFAULT 'Ativo',
  `id_user` varchar(255) NOT NULL,
  `data_criacao` date DEFAULT (curtime()),
  `data_atualizacao` date DEFAULT (curtime()),
  PRIMARY KEY (`id_contrato`),
  KEY `id_user` (`id_user`),
  CONSTRAINT `contrato_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `admin_user` (`id_user`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contrato`
--

LOCK TABLES `contrato` WRITE;
/*!40000 ALTER TABLE `contrato` DISABLE KEYS */;
INSERT INTO `contrato` VALUES ('bvclsuolaksyok,wpkyvbxgsy','Permanente','Ativo','abcabcabcabcabc','2026-06-13','2026-06-13');
/*!40000 ALTER TABLE `contrato` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `curso`
--

DROP TABLE IF EXISTS `curso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `curso` (
  `id_curso` varchar(255) NOT NULL,
  `curso` varchar(255) NOT NULL,
  `status` enum('Ativo','Desativado') DEFAULT 'Ativo',
  `id_user` varchar(255) NOT NULL,
  `id_categoria` varchar(255) NOT NULL,
  `data_criacao` date DEFAULT (curtime()),
  `data_atualizacao` date DEFAULT (curtime()),
  PRIMARY KEY (`id_curso`),
  KEY `id_user` (`id_user`),
  KEY `id_categoria` (`id_categoria`),
  CONSTRAINT `curso_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `admin_user` (`id_user`),
  CONSTRAINT `curso_ibfk_2` FOREIGN KEY (`id_categoria`) REFERENCES `categoria` (`id_categoria`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `curso`
--

LOCK TABLES `curso` WRITE;
/*!40000 ALTER TABLE `curso` DISABLE KEYS */;
INSERT INTO `curso` VALUES ('0b6f75f3-99cd-4687-8e38-1e43996cb6cd','Licenciatura em Arquitectura','Ativo','abcabcabcabcabc','d6dc1eb3-188f-4f02-b7de-943770214c2a','2026-06-28','2026-06-28'),('127abfbf-d28d-4977-97da-be30b54baed9','Licenciatura em Planeamento Regional e Urbano','Ativo','abcabcabcabcabc','d6dc1eb3-188f-4f02-b7de-943770214c2a','2026-06-28','2026-06-28'),('1d4cf6ff-0b21-4d78-889b-4aa63eb461e6','Licenciatura em Ciências da computação','Ativo','abcabcabcabcabc','d6dc1eb3-188f-4f02-b7de-943770214c2a','2026-06-28','2026-06-28'),('217734d5-ee4b-459a-b6ec-59416422fa61','Licenciatura em Engenharia Civil','Ativo','abcabcabcabcabc','d6dc1eb3-188f-4f02-b7de-943770214c2a','2026-06-28','2026-06-28'),('2d04cad5-e822-4a1c-b9a5-8a515bd49543','Licenciatura em Direito','Ativo','abcabcabcabcabc','9ad4a13d-4698-4935-9ee0-16c7130d4c1a','2026-06-28','2026-06-28'),('348f8725-bd77-477c-bb53-5f2c036f0e61','Licenciatura em Engenharia Eletrônica e Telecomunicações','Ativo','abcabcabcabcabc','d6dc1eb3-188f-4f02-b7de-943770214c2a','2026-06-28','2026-06-28'),('39d52dee-0b9f-4c3a-b535-000eabe45669','Licenciatura em Jornalismo','Ativo','abcabcabcabcabc','9ad4a13d-4698-4935-9ee0-16c7130d4c1a','2026-06-28','2026-06-28'),('3ace1cc8-6b86-47c3-b933-52abcabe4237','Licenciatura em Economia','Ativo','abcabcabcabcabc','aac30154-38ac-4026-ad36-9572f606bedd','2026-06-28','2026-06-28'),('48366e6e-0aee-4b3a-84e1-d359e3d1f6c3','Licenciatura em Cinemas e Televisão','Ativo','abcabcabcabcabc','9ad4a13d-4698-4935-9ee0-16c7130d4c1a','2026-06-28','2026-06-28'),('c990a822-4986-4bf5-acc7-0c5909bd34fb','Licenciatura em Gestão Pública','Ativo','abcabcabcabcabc','aac30154-38ac-4026-ad36-9572f606bedd','2026-06-28','2026-06-28'),('d15a1952-8160-4fc0-8dfa-9e28116a81a6','Licenciatura em Gestão de Recursos Humanos','Ativo','abcabcabcabcabc','aac30154-38ac-4026-ad36-9572f606bedd','2026-06-28','2026-06-28'),('f7c92157-4e71-4b20-950b-09b858aed393','Licenciatura em Administração de Empresas','Ativo','abcabcabcabcabc','aac30154-38ac-4026-ad36-9572f606bedd','2026-06-28','2026-06-28'),('fe868c63-93b7-45a7-bdc4-391803af856b','Licenciatura em Geologia e Minas','Ativo','abcabcabcabcabc','d6dc1eb3-188f-4f02-b7de-943770214c2a','2026-06-28','2026-06-28');
/*!40000 ALTER TABLE `curso` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `disc_professor`
--

DROP TABLE IF EXISTS `disc_professor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `disc_professor` (
  `id_dp` varchar(255) NOT NULL,
  `status` enum('Ativo','Eliminado') DEFAULT 'Ativo',
  `id_professor` varchar(255) NOT NULL,
  `id_disciplina` varchar(255) NOT NULL,
  `data_criacao` date DEFAULT NULL,
  `data_actualizacao` date DEFAULT (curdate()),
  `id_user` varchar(255) NOT NULL,
  PRIMARY KEY (`id_dp`),
  KEY `id_professor` (`id_professor`),
  KEY `id_disciplina` (`id_disciplina`),
  KEY `id_user` (`id_user`),
  CONSTRAINT `disc_professor_ibfk_1` FOREIGN KEY (`id_professor`) REFERENCES `professor` (`id_professor`),
  CONSTRAINT `disc_professor_ibfk_2` FOREIGN KEY (`id_disciplina`) REFERENCES `disciplina` (`id_disciplina`),
  CONSTRAINT `disc_professor_ibfk_3` FOREIGN KEY (`id_user`) REFERENCES `admin_user` (`id_user`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `disc_professor`
--

LOCK TABLES `disc_professor` WRITE;
/*!40000 ALTER TABLE `disc_professor` DISABLE KEYS */;
INSERT INTO `disc_professor` VALUES ('20cb997f-a1a0-4837-8ced-714fac90bc43','Ativo','504d8412-7cdb-4d11-a76e-f87d37bd5790','f336393f-4532-4879-a3c6-b9f76d3806ab',NULL,'2026-06-28','abcabcabcabcabc'),('35198e1f-f057-4970-a7df-48c020a3a3ff','Ativo','504d8412-7cdb-4d11-a76e-f87d37bd5790','8c6764a2-43ef-458b-9675-5c3fcbccbc61',NULL,'2026-06-29','abcabcabcabcabc'),('7eee9cd7-ddd5-4f42-87ea-76e43f1aac1f','Ativo','504d8412-7cdb-4d11-a76e-f87d37bd5790','0f7aa6d4-db83-4e46-8ff6-8f5e9ef9d85f',NULL,'2026-07-02','abcabcabcabcabc'),('81bbe0e7-6303-4232-bedd-fe6a0d3421e8','Ativo','504d8412-7cdb-4d11-a76e-f87d37bd5790','ead54de2-b708-4450-9438-349271675d4a',NULL,'2026-06-29','abcabcabcabcabc'),('a38b6be7-669b-4bfe-88ee-f56eaeb8340d','Ativo','504d8412-7cdb-4d11-a76e-f87d37bd5790','010b58a6-f30e-41f9-9358-e289b3f7aaab',NULL,'2026-06-29','abcabcabcabcabc'),('eaaa08db-4628-48e5-b021-54229dd6024c','Ativo','504d8412-7cdb-4d11-a76e-f87d37bd5790','de3336de-81ac-44b8-a36e-fc86f9b6751c',NULL,'2026-06-29','abcabcabcabcabc');
/*!40000 ALTER TABLE `disc_professor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `disciplina`
--

DROP TABLE IF EXISTS `disciplina`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `disciplina` (
  `id_disciplina` varchar(255) NOT NULL,
  `disciplina` varchar(255) NOT NULL,
  `status` enum('Ativo','Desativado') DEFAULT 'Ativo',
  `data_criacao` date DEFAULT (curdate()),
  `id_user` varchar(255) NOT NULL,
  `data_atualizacao` date DEFAULT (curtime()),
  PRIMARY KEY (`id_disciplina`),
  KEY `id_user` (`id_user`),
  CONSTRAINT `disciplina_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `admin_user` (`id_user`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `disciplina`
--

LOCK TABLES `disciplina` WRITE;
/*!40000 ALTER TABLE `disciplina` DISABLE KEYS */;
INSERT INTO `disciplina` VALUES ('010b58a6-f30e-41f9-9358-e289b3f7aaab','Programação II','Ativo','2026-06-29','abcabcabcabcabc','2026-06-29'),('034c9f77-4a62-4ef2-8026-5fa8f7abb592','Engenharia e Análise de Software II','Ativo','2026-06-29','abcabcabcabcabc','2026-06-29'),('0f7aa6d4-db83-4e46-8ff6-8f5e9ef9d85f','Álgebra Linear  Geometria Analítica','Ativo','2026-06-29','abcabcabcabcabc','2026-06-29'),('0f7c8b29-432b-4ae8-8e9c-2b4cd1d45236','Jornalismo Investigativo','Ativo','2026-06-29','abcabcabcabcabc','2026-06-29'),('116c0beb-337b-4580-aa33-560462605c7c','Computação Gráfica','Ativo','2026-06-29','abcabcabcabcabc','2026-06-29'),('1820736d-1d0b-467b-a0a2-eb00a1730313','Qualidade de Software','Ativo','2026-06-29','abcabcabcabcabc','2026-06-29'),('1b2a8de4-2731-443b-bd9d-35eff4346f8e','Gestão de Projectos Informáticos','Ativo','2026-06-29','abcabcabcabcabc','2026-06-29'),('1c39f6f9-479d-4431-b1d7-f596c7b7d373','Base de Dados II','Ativo','2026-06-29','abcabcabcabcabc','2026-06-29'),('285c7baf-659c-47b6-af68-7116074506e9','Algoritmos e Estrutura de Dados','Ativo','2026-06-29','abcabcabcabcabc','2026-06-29'),('2b2663cc-ecfa-451b-a7b2-a40f7f064fff','Matemática Discreta','Ativo','2026-06-29','abcabcabcabcabc','2026-06-29'),('2d6e0581-7575-489c-91b7-2192e806dcff','Sistemas Distribuídos e Paralelos','Ativo','2026-06-29','abcabcabcabcabc','2026-06-29'),('2df610ec-4966-412f-a302-378ad07a0554','Inglês Técnico','Ativo','2026-06-29','abcabcabcabcabc','2026-06-29'),('3242d1c4-9187-4943-99ca-560df7c3db27','Comunicação Escrita','Ativo','2026-06-29','abcabcabcabcabc','2026-06-29'),('34588452-a3d8-4ffa-9976-2bfaae705954','Sistemas Operativos','Ativo','2026-06-29','abcabcabcabcabc','2026-06-29'),('355b3dad-1443-4dce-96d4-3862b88d24f1','Fundamentos de Sistemas de Informação','Ativo','2026-06-29','abcabcabcabcabc','2026-06-29'),('4429cdf1-e7dc-4ca6-91f1-e804fdbfc84a','Empreendedorismo','Ativo','2026-06-29','abcabcabcabcabc','2026-06-29'),('5e69bec8-08dc-4c31-85cc-b2e5dcc4086c','Análise Matemática I','Ativo','2026-06-29','abcabcabcabcabc','2026-06-29'),('64b84b1f-c171-471a-9ac5-0283d3a5b1a0','Pedagogia da Comunicação','Ativo','2026-06-29','abcabcabcabcabc','2026-06-29'),('6a5ef540-1906-4130-b41b-4e7ee1349c80','Teoria da Computação e Linguagens','Ativo','2026-06-29','abcabcabcabcabc','2026-06-29'),('6c1e28ca-0591-4449-bd5a-8c8b7fb9e980','Estágio','Ativo','2026-06-29','abcabcabcabcabc','2026-06-29'),('73c375a7-ea21-4201-bd6f-e5114117d0f4','Redes de Computadores I','Ativo','2026-06-29','abcabcabcabcabc','2026-06-29'),('7e590f8e-e0d7-43b6-9570-00b9773177fe','Electrónica','Ativo','2026-06-29','abcabcabcabcabc','2026-06-29'),('84517467-d387-47b6-9f36-26befd27ef2e','Jornalismo Científico e Ambiental','Ativo','2026-06-29','abcabcabcabcabc','2026-06-29'),('881c2e75-21f7-43a1-8ab6-0eb7b7c9a451','Inteligência Artificial','Ativo','2026-06-29','abcabcabcabcabc','2026-06-29'),('8c6764a2-43ef-458b-9675-5c3fcbccbc61','Programação V','Ativo','2026-06-29','abcabcabcabcabc','2026-06-29'),('92bc1d39-d1a2-40f8-a30e-15e0f5de46b0','Física Computacional','Ativo','2026-06-29','abcabcabcabcabc','2026-06-29'),('972a1a5c-5725-4757-a0a3-dbf6c5e1fb3b','Programação Web I','Ativo','2026-06-29','abcabcabcabcabc','2026-06-29'),('97b7f2eb-e58d-4cef-a532-b4fd0ec7a0fc','Análise Matemática II','Ativo','2026-06-29','abcabcabcabcabc','2026-06-29'),('a7d7d6f0-a83e-44df-a564-70d750596e22','Probabilidade  Estatística','Ativo','2026-06-29','abcabcabcabcabc','2026-06-29'),('a82858b9-5640-4314-ac1a-d8c5f46890a2','Lógica Matemática','Ativo','2026-06-29','abcabcabcabcabc','2026-06-29'),('acaf436d-1875-4f1a-b910-7f26965869b7','Metodologia de Investigação Científica','Ativo','2026-06-29','abcabcabcabcabc','2026-06-29'),('b868ad3c-5793-4954-a68a-acaa76e05487','Base de Dados I','Ativo','2026-06-29','abcabcabcabcabc','2026-06-29'),('c071af7a-5a24-4cf5-8625-afad8f2e6273','Cálculo Numérico Computacional','Ativo','2026-06-29','abcabcabcabcabc','2026-06-29'),('cc26415d-6153-4a3b-9caa-f8ecd9f02bee','Ética e Deontologia Profissional','Ativo','2026-06-29','abcabcabcabcabc','2026-06-29'),('cd4475e9-48e1-48f5-922e-2a89c52b1366','Redes de Computadores II','Ativo','2026-06-29','abcabcabcabcabc','2026-06-29'),('ce08796f-6c8f-485b-8fe0-08e12247814b','Data Warehouse e Data Mining','Ativo','2026-06-29','abcabcabcabcabc','2026-06-29'),('cf1d38f6-3b70-4f52-9056-85cd1db7a962','Projecto e Administração de Redes','Ativo','2026-06-29','abcabcabcabcabc','2026-06-29'),('d07174f3-af31-4d1a-be28-4ba833a4aae5','Arquitectura de Computadores','Ativo','2026-06-29','abcabcabcabcabc','2026-06-29'),('d9360649-0481-4ce2-aa50-1bc23a93b7b5','Introdução à Ciência da Computação','Ativo','2026-06-29','abcabcabcabcabc','2026-06-29'),('d9762a6c-bfbe-4c4c-bd47-09a9e63e23cc','Programação de Dispositivos Informáticos','Ativo','2026-06-29','abcabcabcabcabc','2026-06-29'),('d9d2559a-0ce2-4531-869e-80aa775095b9','Programação Web II','Ativo','2026-06-29','abcabcabcabcabc','2026-06-29'),('de3336de-81ac-44b8-a36e-fc86f9b6751c','Programação III','Ativo','2026-06-29','abcabcabcabcabc','2026-06-29'),('df50f02d-705e-42ae-bbc9-dad91f473646','Sistemas Digitais e Computadores','Ativo','2026-06-29','abcabcabcabcabc','2026-06-29'),('e9df381a-d126-48eb-9a10-66ced7d81496','Segurança em Computação','Ativo','2026-06-29','abcabcabcabcabc','2026-06-29'),('ead54de2-b708-4450-9438-349271675d4a','Programação IV','Ativo','2026-06-29','abcabcabcabcabc','2026-06-29'),('f0ac96c1-e901-4d34-abcf-caa4e23f1cce','Trabalho de Conclusão do Curso','Ativo','2026-06-29','abcabcabcabcabc','2026-06-29'),('f336393f-4532-4879-a3c6-b9f76d3806ab','Programação I','Ativo','2026-06-28','abcabcabcabcabc','2026-06-28'),('fd59d2e8-6e7f-4cca-9dc5-4147e9b1fc91','Engenharia e Análise de Software I','Ativo','2026-06-29','abcabcabcabcabc','2026-06-29');
/*!40000 ALTER TABLE `disciplina` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `doc_funcionario`
--

DROP TABLE IF EXISTS `doc_funcionario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `doc_funcionario` (
  `id_doc_func` varchar(255) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `doc` varchar(255) NOT NULL,
  `status` enum('Ativo','Eliminado') DEFAULT 'Ativo',
  `id_user` varchar(255) NOT NULL,
  `id_func` varchar(255) NOT NULL,
  `data_criacao` date DEFAULT (curtime()),
  `data_atualizacao` date DEFAULT (curtime()),
  PRIMARY KEY (`id_doc_func`),
  KEY `id_user` (`id_user`),
  KEY `id_func` (`id_func`),
  CONSTRAINT `doc_funcionario_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `admin_user` (`id_user`),
  CONSTRAINT `doc_funcionario_ibfk_2` FOREIGN KEY (`id_func`) REFERENCES `funcionario` (`id_func`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doc_funcionario`
--

LOCK TABLES `doc_funcionario` WRITE;
/*!40000 ALTER TABLE `doc_funcionario` DISABLE KEYS */;
INSERT INTO `doc_funcionario` VALUES ('0ec180ce-c725-4e4c-b6d3-fec18ad40415','Cópia de LCC_Plano de Estudos','1782611153819-Co__pia_de_LCC_Plano_de_Estudos.pdf','Ativo','abcabcabcabcabc','01ec45fe-1362-4f18-85d4-81902ab57fe7','2026-06-28','2026-06-28'),('6d5e4214-4a8e-400e-8a47-0b18e21b8a34','Primeiro','1782611153841-Primeiro.pdf','Ativo','abcabcabcabcabc','01ec45fe-1362-4f18-85d4-81902ab57fe7','2026-06-28','2026-06-28'),('d86720cc-a5a2-4d29-ad97-d3331988f18c','E','1782611195326-EXERC__CIOS_ELECTROST__TICA_2026_.pdf','Ativo','abcabcabcabcabc','f5484b9f-a1b6-402f-b2fc-71075b1f2c5b','2026-06-28','2026-06-28');
/*!40000 ALTER TABLE `doc_funcionario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estudante_inscricao`
--

DROP TABLE IF EXISTS `estudante_inscricao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estudante_inscricao` (
  `id_est` varchar(255) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `contacto` varchar(255) NOT NULL,
  `genero` enum('Masculino','Feminino') DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `bi` varchar(255) NOT NULL,
  `status` enum('Admitido','Não Admitido','Pendente','Aprovado','Reprovado','Matriculado') DEFAULT NULL,
  `id_curso` varchar(255) NOT NULL,
  `id_periodo` varchar(255) NOT NULL,
  `codigo` int NOT NULL,
  `nota` varchar(255) DEFAULT '--',
  `senha` varchar(255) NOT NULL,
  `foto` varchar(255) NOT NULL,
  `pagamento_inscricao` varchar(255) DEFAULT NULL,
  `pagamento_matricula` varchar(255) DEFAULT NULL,
  `data_inscricao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_est`),
  KEY `id_curso` (`id_curso`),
  KEY `id_periodo` (`id_periodo`),
  CONSTRAINT `estudante_inscricao_ibfk_1` FOREIGN KEY (`id_curso`) REFERENCES `curso` (`id_curso`),
  CONSTRAINT `estudante_inscricao_ibfk_2` FOREIGN KEY (`id_periodo`) REFERENCES `periodo` (`id_periodo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estudante_inscricao`
--

LOCK TABLES `estudante_inscricao` WRITE;
/*!40000 ALTER TABLE `estudante_inscricao` DISABLE KEYS */;
INSERT INTO `estudante_inscricao` VALUES ('3d42ed04-0270-4573-b7e9-79a4d25d56c2','Artur Macumba Paulo','929277043','Masculino','arturmakumbapaulo@gmail.com','008555739LA047','Aprovado','1d4cf6ff-0b21-4d78-889b-4aa63eb461e6','69187159-558b-42c6-bbc9-3a8a691fc4d6',2026928683,'15','$2b$10$6iDbTWQ3QjGKKvyR.33s4eq1cBnHinBkx3uBB0.ciohn.8YkB6aM.','1783797915348-frontCartao.jpeg','....','....','2026-07-13 23:16:33'),('a3f24894-87eb-46c8-aaf4-8a1746dac428','Jeovani Paxe','946069104','Masculino','jeovanipaxe@gmail.com','000000000LA000','Aprovado','1d4cf6ff-0b21-4d78-889b-4aa63eb461e6','69187159-558b-42c6-bbc9-3a8a691fc4d6',2026564517,'11','$2b$10$r6PVoflQfbzoEvug.pfOE.d1hqTBWee4a66KYm4E6ETah8oUu5j6G','1783887441170-WhatsApp_Image_2026_06_19_at_17_35_27.jpeg','....','....','2026-07-13 23:16:33'),('f2485b07-6837-4190-8d25-095e0973f892','Pedro','000000000','Masculino','arturpaulo929@gmail.com','000000000LA001','Aprovado','1d4cf6ff-0b21-4d78-889b-4aa63eb461e6','69187159-558b-42c6-bbc9-3a8a691fc4d6',2026135536,'10','$2b$10$lYXylN.RH5GT4MiamEqef.eISpu96XboXzShZp4v4IvMbtWbKkMmO','1783968711475-viroslabs_cartao_editado.png','....','','2026-07-13 23:16:33');
/*!40000 ALTER TABLE `estudante_inscricao` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ficheiro_estudante_inscricao`
--

DROP TABLE IF EXISTS `ficheiro_estudante_inscricao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ficheiro_estudante_inscricao` (
  `id_fei` varchar(255) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `doc` varchar(255) NOT NULL,
  `id_est` varchar(255) NOT NULL,
  PRIMARY KEY (`id_fei`),
  KEY `id_est` (`id_est`),
  CONSTRAINT `ficheiro_estudante_inscricao_ibfk_1` FOREIGN KEY (`id_est`) REFERENCES `estudante_inscricao` (`id_est`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ficheiro_estudante_inscricao`
--

LOCK TABLES `ficheiro_estudante_inscricao` WRITE;
/*!40000 ALTER TABLE `ficheiro_estudante_inscricao` DISABLE KEYS */;
INSERT INTO `ficheiro_estudante_inscricao` VALUES ('094c2ff7-cff2-4d1a-8c98-a7423a8ef812','documento_projeto_saborsync.pdf','1783797915363-documento_projeto_saborsync.pdf','3d42ed04-0270-4573-b7e9-79a4d25d56c2'),('38d3a551-fb48-41ef-8ff4-40896793b5a1','viroslabs_cartao_editado.png','1783968711489-viroslabs_cartao_editado.png','f2485b07-6837-4190-8d25-095e0973f892'),('87bc94b3-dcfa-46ea-9061-c4eb233ee814','backCartao.jpeg','1783797915352-backCartao.jpeg','3d42ed04-0270-4573-b7e9-79a4d25d56c2'),('9068cb8c-b124-4186-a47a-28f03d3b5ac1','servicos_tecnologia-1.pdf','1783968711482-servicos_tecnologia_1.pdf','f2485b07-6837-4190-8d25-095e0973f892'),('a83e9b12-11ab-4de9-a871-8e3306b42bad','Site VirosLabs.pdf','1783887441175-Site_VirosLabs.pdf','a3f24894-87eb-46c8-aaf4-8a1746dac428'),('bb7b38df-5e78-4fb9-b0ac-7ffd56d5d3c9','frontCartao.jpeg','1783797915359-frontCartao.jpeg','3d42ed04-0270-4573-b7e9-79a4d25d56c2'),('d3b0df5e-fbcf-4b1a-a4f0-99899aed6203','documento_projeto_viroslabs.docx','1783887441181-documento_projeto_viroslabs.docx','a3f24894-87eb-46c8-aaf4-8a1746dac428'),('dd3beab2-7957-403e-b58c-cf388ef746f4','viroslabs_redes_editado.png','1783968711484-viroslabs_redes_editado.png','f2485b07-6837-4190-8d25-095e0973f892');
/*!40000 ALTER TABLE `ficheiro_estudante_inscricao` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ficheiro_prof`
--

DROP TABLE IF EXISTS `ficheiro_prof`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ficheiro_prof` (
  `id_ficheiro` varchar(255) NOT NULL,
  `ficheiro` varchar(255) NOT NULL,
  `status` enum('Ativo','Eliminado') DEFAULT 'Ativo',
  `id_professor` varchar(255) NOT NULL,
  `data_criacao` date DEFAULT NULL,
  `data_actualizacao` date DEFAULT (curdate()),
  `nome` varchar(255) NOT NULL,
  PRIMARY KEY (`id_ficheiro`),
  KEY `id_professor` (`id_professor`),
  CONSTRAINT `ficheiro_prof_ibfk_1` FOREIGN KEY (`id_professor`) REFERENCES `professor` (`id_professor`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ficheiro_prof`
--

LOCK TABLES `ficheiro_prof` WRITE;
/*!40000 ALTER TABLE `ficheiro_prof` DISABLE KEYS */;
INSERT INTO `ficheiro_prof` VALUES ('4a829c90-f786-48c8-bf06-a1eedcd1f345','servicos_tecnologia','Ativo','57d0f69e-407f-4d7d-b1ba-b1b0573559d8','2026-07-12','2026-07-12','1783889200020-servicos_tecnologia.pdf'),('4f745018-908a-4ae6-9e60-241352429bcb','Currículo ','Ativo','504d8412-7cdb-4d11-a76e-f87d37bd5790','2026-06-28','2026-06-28','1782611320692-Primeiro.pdf'),('7fce21ec-0f36-4bb3-a385-8bfe2d2cdee1','W','Ativo','57d0f69e-407f-4d7d-b1ba-b1b0573559d8',NULL,'2026-07-12','1783889125117-WhatsApp_Image_2026_06_19_at_17_35_27.jpeg'),('9daf8c35-82b0-46af-b83d-1635e10100e8','documento_projeto_saborsync','Ativo','57d0f69e-407f-4d7d-b1ba-b1b0573559d8','2026-07-12','2026-07-12','1783889200008-documento_projeto_saborsync.pdf'),('b2c10bf1-7015-4f0a-8ab3-95222bf4b83d','documento_projeto_saborsync','Ativo','57d0f69e-407f-4d7d-b1ba-b1b0573559d8','2026-07-12','2026-07-12','1783889200025-documento_projeto_saborsync.pdf');
/*!40000 ALTER TABLE `ficheiro_prof` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `funcionario`
--

DROP TABLE IF EXISTS `funcionario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `funcionario` (
  `id_func` varchar(255) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `contacto` varchar(20) NOT NULL,
  `bi` varchar(30) NOT NULL,
  `status` enum('Ativo','Desativado') DEFAULT 'Ativo',
  `id_user` varchar(255) NOT NULL,
  `id_cargo` varchar(255) NOT NULL,
  `data_criacao` date DEFAULT (curtime()),
  `data_atualizacao` date DEFAULT (curtime()),
  `senha` varchar(255) NOT NULL,
  `foto` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `codigo` varchar(255) NOT NULL,
  PRIMARY KEY (`id_func`),
  KEY `id_user` (`id_user`),
  KEY `id_cargo` (`id_cargo`),
  CONSTRAINT `funcionario_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `admin_user` (`id_user`),
  CONSTRAINT `funcionario_ibfk_2` FOREIGN KEY (`id_cargo`) REFERENCES `cargo` (`id_cargo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `funcionario`
--

LOCK TABLES `funcionario` WRITE;
/*!40000 ALTER TABLE `funcionario` DISABLE KEYS */;
INSERT INTO `funcionario` VALUES ('01ec45fe-1362-4f18-85d4-81902ab57fe7','Artur Paulo','929277043','008555739LA047','Ativo','abcabcabcabcabc','550e8400-e29b-41d4-a716-446655440000550e8400-e29b-41d4-a716-446655440000','2026-06-13','2026-07-10','$2b$10$FTYwg/Pb0vM3Od3tmhDZTOfBrybZwXg4/OzDeiq7BjLFLsggUPkJy','1782611153769-imagem1.jpeg','arturmakumbapaulo@gmail.com','95103833'),('292bfe0d-cc56-4697-9291-7ef8779f9b5c','Artur','999999999','008555739LA048','Desativado','abcabcabcabcabc','550e8400-e29b-41d4-a716-446655440000550e8400-e29b-41d4-a716-446655440000','2026-07-09','2026-07-12','$2b$10$Ox1imwdDDfYIBcbnToAoAuZY4VJKPXZ3spRKKzigRcQ/K9Q.whrCm',NULL,'arturpaulo929@gmail.com','76619831');
/*!40000 ALTER TABLE `funcionario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `periodo`
--

DROP TABLE IF EXISTS `periodo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `periodo` (
  `id_periodo` varchar(255) NOT NULL,
  `periodo` enum('Manhã','Tarde','Noite','Diurno') NOT NULL,
  `status` enum('Ativo','Desativado') DEFAULT 'Ativo',
  `id_user` varchar(255) NOT NULL,
  `id_turma` varchar(255) NOT NULL,
  `data_criacao` date DEFAULT (curtime()),
  `data_atualizacao` date DEFAULT (curtime()),
  `id_anocurricular` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_periodo`),
  KEY `id_user` (`id_user`),
  KEY `id_turma` (`id_turma`),
  KEY `id_anocurricular` (`id_anocurricular`),
  CONSTRAINT `periodo_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `admin_user` (`id_user`),
  CONSTRAINT `periodo_ibfk_2` FOREIGN KEY (`id_turma`) REFERENCES `turma` (`id_turma`),
  CONSTRAINT `periodo_ibfk_anocurricular` FOREIGN KEY (`id_anocurricular`) REFERENCES `anocurricular` (`id_anocurricular`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `periodo`
--

LOCK TABLES `periodo` WRITE;
/*!40000 ALTER TABLE `periodo` DISABLE KEYS */;
INSERT INTO `periodo` VALUES ('04dac3ed-136b-4bad-bdab-f9fdb01e639c','Manhã','Ativo','abcabcabcabcabc','b24821ce-8132-4be4-8c8a-e7d7016ab623','2026-07-07','2026-07-07','7be3baf9-4213-41f5-885a-f622bf07b06d'),('0cac0f28-6401-4af3-9c54-f0bd02e560a3','Manhã','Ativo','abcabcabcabcabc','9e83556c-7e39-4e71-b324-0918222d16cd','2026-07-07','2026-07-12','3b18a0b6-d9e4-494e-be33-796f9c56f702'),('278a423d-fe92-49d7-a2f2-8d596fc30f2f','Manhã','Ativo','abcabcabcabcabc','9a4b43da-9f7c-4e87-9481-2ac4480ac266','2026-07-06','2026-07-08','de19dc7f-ca70-4f94-9b42-4fd46f923f8a'),('50feb6c1-c636-48e4-98ea-f47552c82d78','Tarde','Ativo','abcabcabcabcabc','2229a57f-5bd3-4b1d-be53-359c408c4faa','2026-07-06','2026-07-08','de19dc7f-ca70-4f94-9b42-4fd46f923f8a'),('63127c9f-652f-4947-8734-f42ddd3238d7','Tarde','Ativo','abcabcabcabcabc','5bf6ce1b-26b3-4699-82ac-f048143d0757','2026-07-04','2026-07-08','7be3baf9-4213-41f5-885a-f622bf07b06d'),('69187159-558b-42c6-bbc9-3a8a691fc4d6','Manhã','Ativo','abcabcabcabcabc','2ebfce7e-96d6-457d-bdf7-960bf6c2f295','2026-07-04','2026-07-08','7be3baf9-4213-41f5-885a-f622bf07b06d'),('906f612e-8443-4e71-a610-70da0a305e06','Noite','Ativo','abcabcabcabcabc','56e4cc31-ceff-403b-aa5b-9de1a549d8ec','2026-07-04','2026-07-08','7be3baf9-4213-41f5-885a-f622bf07b06d'),('ea65d533-a8e5-4922-ba86-ca419659cf5f','Noite','Ativo','abcabcabcabcabc','093abdb6-b466-484c-b841-135466ba5683','2026-07-06','2026-07-08','de19dc7f-ca70-4f94-9b42-4fd46f923f8a');
/*!40000 ALTER TABLE `periodo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prof_turma_disc`
--

DROP TABLE IF EXISTS `prof_turma_disc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `prof_turma_disc` (
  `id_ptd` varchar(255) NOT NULL,
  `status` enum('Ativo','Eliminado') DEFAULT 'Ativo',
  `id_dp` varchar(255) NOT NULL,
  `id_turma` varchar(255) NOT NULL,
  `id_periodo` varchar(255) NOT NULL,
  `id_anoletivo` varchar(255) NOT NULL,
  `id_user` varchar(255) NOT NULL,
  `data_criacao` date DEFAULT NULL,
  `data_actualizacao` date DEFAULT (curdate()),
  PRIMARY KEY (`id_ptd`),
  KEY `id_dp` (`id_dp`),
  KEY `id_turma` (`id_turma`),
  KEY `id_periodo` (`id_periodo`),
  KEY `id_anoletivo` (`id_anoletivo`),
  KEY `id_user` (`id_user`),
  CONSTRAINT `prof_turma_disc_ibfk_1` FOREIGN KEY (`id_dp`) REFERENCES `disc_professor` (`id_dp`),
  CONSTRAINT `prof_turma_disc_ibfk_2` FOREIGN KEY (`id_turma`) REFERENCES `turma` (`id_turma`),
  CONSTRAINT `prof_turma_disc_ibfk_3` FOREIGN KEY (`id_periodo`) REFERENCES `periodo` (`id_periodo`),
  CONSTRAINT `prof_turma_disc_ibfk_4` FOREIGN KEY (`id_anoletivo`) REFERENCES `anoletivo` (`id_anoletivo`),
  CONSTRAINT `prof_turma_disc_ibfk_5` FOREIGN KEY (`id_user`) REFERENCES `admin_user` (`id_user`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prof_turma_disc`
--

LOCK TABLES `prof_turma_disc` WRITE;
/*!40000 ALTER TABLE `prof_turma_disc` DISABLE KEYS */;
INSERT INTO `prof_turma_disc` VALUES ('059a2776-d49a-408c-9c18-d61e41a37c4e','Ativo','7eee9cd7-ddd5-4f42-87ea-76e43f1aac1f','2ebfce7e-96d6-457d-bdf7-960bf6c2f295','69187159-558b-42c6-bbc9-3a8a691fc4d6','cd8a8b37-ea7a-4970-aac6-ef4252e7f38b','abcabcabcabcabc','2026-07-07','2026-07-07'),('7009c1c4-51ad-4e76-9442-9a824f34e3ff','Ativo','a38b6be7-669b-4bfe-88ee-f56eaeb8340d','56e4cc31-ceff-403b-aa5b-9de1a549d8ec','906f612e-8443-4e71-a610-70da0a305e06','88378ded-e10d-4368-8730-25bb26042773','abcabcabcabcabc','2026-07-04','2026-07-04'),('b3393285-e6ab-4215-a11b-6cdf15cab43f','Ativo','7eee9cd7-ddd5-4f42-87ea-76e43f1aac1f','5bf6ce1b-26b3-4699-82ac-f048143d0757','63127c9f-652f-4947-8734-f42ddd3238d7','337a24f4-955b-49ed-9c0e-3ea64cab649e','abcabcabcabcabc','2026-07-07','2026-07-07'),('b4687c44-7138-43a7-9a83-0d91277695f6','Ativo','a38b6be7-669b-4bfe-88ee-f56eaeb8340d','2ebfce7e-96d6-457d-bdf7-960bf6c2f295','69187159-558b-42c6-bbc9-3a8a691fc4d6','cd8a8b37-ea7a-4970-aac6-ef4252e7f38b','abcabcabcabcabc','2026-07-04','2026-07-04'),('c3fd7baf-da78-48e7-97cc-1c9e4db11827','Ativo','20cb997f-a1a0-4837-8ced-714fac90bc43','2ebfce7e-96d6-457d-bdf7-960bf6c2f295','69187159-558b-42c6-bbc9-3a8a691fc4d6','e8ea5c1f-542c-4ddd-ae03-bb92b949e736','abcabcabcabcabc','2026-07-04','2026-07-04'),('e496a717-d880-46b2-851d-8e6c0fe62146','Ativo','20cb997f-a1a0-4837-8ced-714fac90bc43','5bf6ce1b-26b3-4699-82ac-f048143d0757','63127c9f-652f-4947-8734-f42ddd3238d7','337a24f4-955b-49ed-9c0e-3ea64cab649e','abcabcabcabcabc','2026-07-06','2026-07-06'),('f1592e55-4c67-489b-ad98-044f12d87ada','Ativo','20cb997f-a1a0-4837-8ced-714fac90bc43','2ebfce7e-96d6-457d-bdf7-960bf6c2f295','69187159-558b-42c6-bbc9-3a8a691fc4d6','cd8a8b37-ea7a-4970-aac6-ef4252e7f38b','abcabcabcabcabc','2026-07-04','2026-07-04');
/*!40000 ALTER TABLE `prof_turma_disc` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `professor`
--

DROP TABLE IF EXISTS `professor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `professor` (
  `id_professor` varchar(255) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `genero` enum('Masculino','Feminino') NOT NULL,
  `nacionalidade` varchar(255) NOT NULL,
  `nomepai` varchar(255) NOT NULL,
  `nomemae` varchar(255) NOT NULL,
  `bi` varchar(255) NOT NULL,
  `contacto` varchar(255) NOT NULL,
  `whatsapp` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `contactoemergencia` varchar(255) NOT NULL,
  `anoexperienca` int NOT NULL,
  `titulacao` varchar(255) NOT NULL,
  `iban` varchar(255) NOT NULL,
  `tiposangue` varchar(255) NOT NULL,
  `codigo` int NOT NULL,
  `senha` varchar(255) NOT NULL,
  `status` enum('Ativo','Eliminado') DEFAULT 'Ativo',
  `data_nascimento` date DEFAULT NULL,
  `data_admissao` date DEFAULT NULL,
  `data_criacao` date DEFAULT (curtime()),
  `data_atualizacao` date DEFAULT (curtime()),
  `id_contrato` varchar(255) NOT NULL,
  `id_user` varchar(255) NOT NULL,
  `foto` varchar(255) NOT NULL,
  `estadocivil` varchar(255) NOT NULL,
  PRIMARY KEY (`id_professor`),
  KEY `id_contrato` (`id_contrato`),
  KEY `id_user` (`id_user`),
  CONSTRAINT `professor_ibfk_2` FOREIGN KEY (`id_contrato`) REFERENCES `contrato` (`id_contrato`),
  CONSTRAINT `professor_ibfk_3` FOREIGN KEY (`id_user`) REFERENCES `admin_user` (`id_user`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `professor`
--

LOCK TABLES `professor` WRITE;
/*!40000 ALTER TABLE `professor` DISABLE KEYS */;
INSERT INTO `professor` VALUES ('504d8412-7cdb-4d11-a76e-f87d37bd5790','Artur Paulo','Masculino','Angolano','Ndombele Pai','Senga Macumba Paulo','008555379LA047','929277043','929277043','arturpaulo929@gmail.com','928583366',5,'Mestrado','AO06000600000052757230154','A-',53930607,'$2b$10$srTmfPIXVNAZGE1vYujGRu0UJaAg8YnG0O790c336AIeZVX.f8hvC','Ativo','2004-04-05','2026-06-09','2026-06-13','2026-07-12','bvclsuolaksyok,wpkyvbxgsy','abcabcabcabcabc','1782611320623-imagem1.jpeg','Solteiro'),('57d0f69e-407f-4d7d-b1ba-b1b0573559d8','aaaaaaa','Masculino','aaaaaa','aaaaaa','aaaaaa','0000000000000','000000000','000000000','a@g.c','000000000',3,'Licenciado','AO000000000000000000000','AB+',2628855,'$2b$10$.OHUH74Bif1gIBz3k45xmuMG4sr9G0OAjHkfK4DUJ9jjVlkPzvr/e','Ativo','1999-02-01','2026-07-12','2026-07-12','2026-07-12','bvclsuolaksyok,wpkyvbxgsy','abcabcabcabcabc','1783889125116-WhatsApp_Image_2026_06_19_at_17_35_26.jpeg','Solteiro');
/*!40000 ALTER TABLE `professor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `semestre`
--

DROP TABLE IF EXISTS `semestre`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `semestre` (
  `id_semestre` varchar(255) NOT NULL,
  `semestre` int NOT NULL,
  `status` enum('Ativo','Desativado','Cancelado') DEFAULT 'Ativo',
  `id_user` varchar(255) NOT NULL,
  `id_categoria` varchar(255) NOT NULL,
  `id_curso` varchar(255) NOT NULL,
  `id_disciplina` varchar(255) NOT NULL,
  `id_anocurricular` varchar(255) NOT NULL,
  `data_criacao` date DEFAULT (curtime()),
  `data_atualizacao` date DEFAULT (curtime()),
  `dispensa` enum('Sim','Não') DEFAULT 'Não',
  `nota_dispensa` int NOT NULL DEFAULT '14',
  PRIMARY KEY (`id_semestre`),
  KEY `id_user` (`id_user`),
  KEY `id_categoria` (`id_categoria`),
  KEY `id_curso` (`id_curso`),
  KEY `id_disciplina` (`id_disciplina`),
  KEY `id_anocurricular` (`id_anocurricular`),
  CONSTRAINT `semestre_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `admin_user` (`id_user`),
  CONSTRAINT `semestre_ibfk_2` FOREIGN KEY (`id_categoria`) REFERENCES `categoria` (`id_categoria`),
  CONSTRAINT `semestre_ibfk_3` FOREIGN KEY (`id_curso`) REFERENCES `curso` (`id_curso`),
  CONSTRAINT `semestre_ibfk_4` FOREIGN KEY (`id_disciplina`) REFERENCES `disciplina` (`id_disciplina`),
  CONSTRAINT `semestre_ibfk_5` FOREIGN KEY (`id_anocurricular`) REFERENCES `anocurricular` (`id_anocurricular`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `semestre`
--

LOCK TABLES `semestre` WRITE;
/*!40000 ALTER TABLE `semestre` DISABLE KEYS */;
INSERT INTO `semestre` VALUES ('0b9c92b6-24b4-43eb-bc82-255dd352e8ce',2,'Ativo','abcabcabcabcabc','d6dc1eb3-188f-4f02-b7de-943770214c2a','1d4cf6ff-0b21-4d78-889b-4aa63eb461e6','355b3dad-1443-4dce-96d4-3862b88d24f1','7be3baf9-4213-41f5-885a-f622bf07b06d','2026-07-04','2026-07-04','Não',14),('0ba00590-544f-4657-8519-c2f007e7bfba',2,'Ativo','abcabcabcabcabc','d6dc1eb3-188f-4f02-b7de-943770214c2a','1d4cf6ff-0b21-4d78-889b-4aa63eb461e6','1c39f6f9-479d-4431-b1d7-f596c7b7d373','de19dc7f-ca70-4f94-9b42-4fd46f923f8a','2026-07-04','2026-07-04','Não',14),('0d3bead9-52f6-4dd3-baa2-7d37a43bcf24',1,'Ativo','abcabcabcabcabc','d6dc1eb3-188f-4f02-b7de-943770214c2a','1d4cf6ff-0b21-4d78-889b-4aa63eb461e6','2df610ec-4966-412f-a302-378ad07a0554','7be3baf9-4213-41f5-885a-f622bf07b06d','2026-07-04','2026-07-04','Não',14),('110b1a31-855b-46a6-a52f-2395694a3b40',1,'Ativo','abcabcabcabcabc','d6dc1eb3-188f-4f02-b7de-943770214c2a','1d4cf6ff-0b21-4d78-889b-4aa63eb461e6','cc26415d-6153-4a3b-9caa-f8ecd9f02bee','6026ad61-2c5d-45e0-bccc-0e444ec9c3c8','2026-07-04','2026-07-04','Não',14),('16841fb0-f82a-40ac-ba55-fda3b59fd37e',2,'Ativo','abcabcabcabcabc','d6dc1eb3-188f-4f02-b7de-943770214c2a','1d4cf6ff-0b21-4d78-889b-4aa63eb461e6','0f7c8b29-432b-4ae8-8e9c-2b4cd1d45236','6026ad61-2c5d-45e0-bccc-0e444ec9c3c8','2026-07-04','2026-07-04','Não',14),('18b44378-239a-47ec-8016-262b00b2e794',2,'Ativo','abcabcabcabcabc','d6dc1eb3-188f-4f02-b7de-943770214c2a','1d4cf6ff-0b21-4d78-889b-4aa63eb461e6','285c7baf-659c-47b6-af68-7116074506e9','de19dc7f-ca70-4f94-9b42-4fd46f923f8a','2026-07-04','2026-07-04','Não',14),('1c52e798-505f-486f-af42-96d68fe984df',1,'Ativo','abcabcabcabcabc','d6dc1eb3-188f-4f02-b7de-943770214c2a','1d4cf6ff-0b21-4d78-889b-4aa63eb461e6','972a1a5c-5725-4757-a0a3-dbf6c5e1fb3b','cc790682-428f-4501-b77b-8efd2ca73c57','2026-07-04','2026-07-04','Não',14),('1d3b5334-40c3-4d9c-b6be-6530b7ee2457',2,'Ativo','abcabcabcabcabc','d6dc1eb3-188f-4f02-b7de-943770214c2a','1d4cf6ff-0b21-4d78-889b-4aa63eb461e6','0f7aa6d4-db83-4e46-8ff6-8f5e9ef9d85f','7be3baf9-4213-41f5-885a-f622bf07b06d','2026-07-04','2026-07-04','Não',14),('25aeadbe-bec1-4187-98b9-b21766097e9d',2,'Ativo','abcabcabcabcabc','d6dc1eb3-188f-4f02-b7de-943770214c2a','1d4cf6ff-0b21-4d78-889b-4aa63eb461e6','73c375a7-ea21-4201-bd6f-e5114117d0f4','de19dc7f-ca70-4f94-9b42-4fd46f923f8a','2026-07-04','2026-07-04','Não',14),('30bbf6d5-d5fc-451a-b9d9-70b6d4e3f5d3',1,'Ativo','abcabcabcabcabc','d6dc1eb3-188f-4f02-b7de-943770214c2a','1d4cf6ff-0b21-4d78-889b-4aa63eb461e6','b868ad3c-5793-4954-a68a-acaa76e05487','de19dc7f-ca70-4f94-9b42-4fd46f923f8a','2026-07-04','2026-07-04','Não',14),('3966ba7f-e1d0-4678-8fff-fff0498c8da5',2,'Ativo','abcabcabcabcabc','d6dc1eb3-188f-4f02-b7de-943770214c2a','1d4cf6ff-0b21-4d78-889b-4aa63eb461e6','d9d2559a-0ce2-4531-869e-80aa775095b9','cc790682-428f-4501-b77b-8efd2ca73c57','2026-07-04','2026-07-04','Não',14),('42af5f24-4fcd-4e03-9911-a3e2b961ee80',2,'Ativo','abcabcabcabcabc','d6dc1eb3-188f-4f02-b7de-943770214c2a','1d4cf6ff-0b21-4d78-889b-4aa63eb461e6','84517467-d387-47b6-9f36-26befd27ef2e','6026ad61-2c5d-45e0-bccc-0e444ec9c3c8','2026-07-04','2026-07-04','Não',14),('44904835-91cd-45bf-a6e8-ef51108b8e23',1,'Ativo','abcabcabcabcabc','d6dc1eb3-188f-4f02-b7de-943770214c2a','1d4cf6ff-0b21-4d78-889b-4aa63eb461e6','c071af7a-5a24-4cf5-8625-afad8f2e6273','de19dc7f-ca70-4f94-9b42-4fd46f923f8a','2026-07-04','2026-07-04','Não',14),('4639c617-76a1-42e9-98e1-c72a3db54312',2,'Ativo','abcabcabcabcabc','d6dc1eb3-188f-4f02-b7de-943770214c2a','1d4cf6ff-0b21-4d78-889b-4aa63eb461e6','ead54de2-b708-4450-9438-349271675d4a','de19dc7f-ca70-4f94-9b42-4fd46f923f8a','2026-07-04','2026-07-04','Não',14),('4cffa48f-5c3d-4503-ae55-33862e91d6c3',2,'Ativo','abcabcabcabcabc','d6dc1eb3-188f-4f02-b7de-943770214c2a','1d4cf6ff-0b21-4d78-889b-4aa63eb461e6','f0ac96c1-e901-4d34-abcf-caa4e23f1cce','6026ad61-2c5d-45e0-bccc-0e444ec9c3c8','2026-07-04','2026-07-04','Não',14),('5174552e-d662-41d5-a691-f3e5d9b110c8',1,'Ativo','abcabcabcabcabc','d6dc1eb3-188f-4f02-b7de-943770214c2a','1d4cf6ff-0b21-4d78-889b-4aa63eb461e6','de3336de-81ac-44b8-a36e-fc86f9b6751c','de19dc7f-ca70-4f94-9b42-4fd46f923f8a','2026-07-04','2026-07-04','Não',14),('5378c1e8-2622-4652-a391-d51b56ab134e',1,'Ativo','abcabcabcabcabc','d6dc1eb3-188f-4f02-b7de-943770214c2a','1d4cf6ff-0b21-4d78-889b-4aa63eb461e6','2d6e0581-7575-489c-91b7-2192e806dcff','6026ad61-2c5d-45e0-bccc-0e444ec9c3c8','2026-07-04','2026-07-04','Não',14),('57e6a9e5-de44-4389-af8f-397975444467',2,'Ativo','abcabcabcabcabc','d6dc1eb3-188f-4f02-b7de-943770214c2a','1d4cf6ff-0b21-4d78-889b-4aa63eb461e6','97b7f2eb-e58d-4cef-a532-b4fd0ec7a0fc','7be3baf9-4213-41f5-885a-f622bf07b06d','2026-07-04','2026-07-04','Não',14),('60af5c7d-2961-4bc0-a55f-6f55d4d5ce49',2,'Ativo','abcabcabcabcabc','d6dc1eb3-188f-4f02-b7de-943770214c2a','1d4cf6ff-0b21-4d78-889b-4aa63eb461e6','64b84b1f-c171-471a-9ac5-0283d3a5b1a0','6026ad61-2c5d-45e0-bccc-0e444ec9c3c8','2026-07-04','2026-07-04','Não',14),('691a530e-70f9-4e91-992f-af95c5020324',1,'Ativo','abcabcabcabcabc','d6dc1eb3-188f-4f02-b7de-943770214c2a','1d4cf6ff-0b21-4d78-889b-4aa63eb461e6','3242d1c4-9187-4943-99ca-560df7c3db27','7be3baf9-4213-41f5-885a-f622bf07b06d','2026-07-04','2026-07-04','Não',14),('6954dfaa-fbc8-4b83-af0b-84463bf2e629',2,'Ativo','abcabcabcabcabc','d6dc1eb3-188f-4f02-b7de-943770214c2a','1d4cf6ff-0b21-4d78-889b-4aa63eb461e6','6c1e28ca-0591-4449-bd5a-8c8b7fb9e980','6026ad61-2c5d-45e0-bccc-0e444ec9c3c8','2026-07-04','2026-07-04','Não',14),('6d1c4c57-9423-45eb-bef6-d488d271e92c',1,'Ativo','abcabcabcabcabc','d6dc1eb3-188f-4f02-b7de-943770214c2a','1d4cf6ff-0b21-4d78-889b-4aa63eb461e6','cf1d38f6-3b70-4f52-9056-85cd1db7a962','6026ad61-2c5d-45e0-bccc-0e444ec9c3c8','2026-07-04','2026-07-04','Não',14),('6e9f8ee6-5f31-4e00-a48a-f24980916905',1,'Ativo','abcabcabcabcabc','d6dc1eb3-188f-4f02-b7de-943770214c2a','1d4cf6ff-0b21-4d78-889b-4aa63eb461e6','ce08796f-6c8f-485b-8fe0-08e12247814b','cc790682-428f-4501-b77b-8efd2ca73c57','2026-07-04','2026-07-04','Não',14),('736a4fc3-4a6d-47c6-a03e-d4ad675fbcae',1,'Ativo','abcabcabcabcabc','d6dc1eb3-188f-4f02-b7de-943770214c2a','1d4cf6ff-0b21-4d78-889b-4aa63eb461e6','7e590f8e-e0d7-43b6-9570-00b9773177fe','cc790682-428f-4501-b77b-8efd2ca73c57','2026-07-04','2026-07-04','Não',14),('753dc58f-39e5-4686-a082-589bf9ac6e47',1,'Ativo','abcabcabcabcabc','d6dc1eb3-188f-4f02-b7de-943770214c2a','348f8725-bd77-477c-bb53-5f2c036f0e61','285c7baf-659c-47b6-af68-7116074506e9','40eb93f6-b7d4-4a1f-a977-bc72c3cd5a17','2026-07-06','2026-07-06','Não',14),('7d710f4b-07bc-46b4-93e2-8e1a321fd164',1,'Ativo','abcabcabcabcabc','d6dc1eb3-188f-4f02-b7de-943770214c2a','1d4cf6ff-0b21-4d78-889b-4aa63eb461e6','cd4475e9-48e1-48f5-922e-2a89c52b1366','cc790682-428f-4501-b77b-8efd2ca73c57','2026-07-04','2026-07-04','Não',14),('818eda42-0e2c-434e-9fa5-a5ee70197b34',1,'Ativo','abcabcabcabcabc','d6dc1eb3-188f-4f02-b7de-943770214c2a','1d4cf6ff-0b21-4d78-889b-4aa63eb461e6','034c9f77-4a62-4ef2-8026-5fa8f7abb592','cc790682-428f-4501-b77b-8efd2ca73c57','2026-07-04','2026-07-04','Não',14),('83a84549-cd86-4a78-b657-82da34987dcb',2,'Ativo','abcabcabcabcabc','d6dc1eb3-188f-4f02-b7de-943770214c2a','1d4cf6ff-0b21-4d78-889b-4aa63eb461e6','116c0beb-337b-4580-aa33-560462605c7c','cc790682-428f-4501-b77b-8efd2ca73c57','2026-07-04','2026-07-04','Não',14),('8895c065-39f5-42bf-83a9-85331a412278',1,'Ativo','abcabcabcabcabc','d6dc1eb3-188f-4f02-b7de-943770214c2a','1d4cf6ff-0b21-4d78-889b-4aa63eb461e6','8c6764a2-43ef-458b-9675-5c3fcbccbc61','cc790682-428f-4501-b77b-8efd2ca73c57','2026-07-04','2026-07-04','Não',14),('904c2c39-e390-4526-991a-779eb5980535',1,'Ativo','abcabcabcabcabc','d6dc1eb3-188f-4f02-b7de-943770214c2a','1d4cf6ff-0b21-4d78-889b-4aa63eb461e6','e9df381a-d126-48eb-9a10-66ced7d81496','6026ad61-2c5d-45e0-bccc-0e444ec9c3c8','2026-07-04','2026-07-04','Não',14),('a3465327-b89f-419b-9517-9c7766193728',1,'Ativo','abcabcabcabcabc','d6dc1eb3-188f-4f02-b7de-943770214c2a','1d4cf6ff-0b21-4d78-889b-4aa63eb461e6','a82858b9-5640-4314-ac1a-d8c5f46890a2','7be3baf9-4213-41f5-885a-f622bf07b06d','2026-07-04','2026-07-04','Não',14),('afdf1ae3-1c6b-4bcf-9ca4-10ad694bf64f',2,'Ativo','abcabcabcabcabc','d6dc1eb3-188f-4f02-b7de-943770214c2a','1d4cf6ff-0b21-4d78-889b-4aa63eb461e6','881c2e75-21f7-43a1-8ab6-0eb7b7c9a451','cc790682-428f-4501-b77b-8efd2ca73c57','2026-07-04','2026-07-04','Não',14),('b501d6b0-c23d-45c2-a91f-d9107effee82',2,'Ativo','abcabcabcabcabc','d6dc1eb3-188f-4f02-b7de-943770214c2a','1d4cf6ff-0b21-4d78-889b-4aa63eb461e6','d9762a6c-bfbe-4c4c-bd47-09a9e63e23cc','cc790682-428f-4501-b77b-8efd2ca73c57','2026-07-04','2026-07-04','Não',14),('b7909800-bce0-41dc-8458-6a67865242df',1,'Ativo','abcabcabcabcabc','d6dc1eb3-188f-4f02-b7de-943770214c2a','1d4cf6ff-0b21-4d78-889b-4aa63eb461e6','f336393f-4532-4879-a3c6-b9f76d3806ab','7be3baf9-4213-41f5-885a-f622bf07b06d','2026-07-04','2026-07-04','Não',14),('b8753fdd-63e4-421b-aebd-4a5fe012ec2c',2,'Ativo','abcabcabcabcabc','d6dc1eb3-188f-4f02-b7de-943770214c2a','1d4cf6ff-0b21-4d78-889b-4aa63eb461e6','df50f02d-705e-42ae-bbc9-dad91f473646','7be3baf9-4213-41f5-885a-f622bf07b06d','2026-07-04','2026-07-04','Não',14),('baf8edbd-70f0-4a3e-a353-3833b269d357',1,'Ativo','abcabcabcabcabc','d6dc1eb3-188f-4f02-b7de-943770214c2a','1d4cf6ff-0b21-4d78-889b-4aa63eb461e6','5e69bec8-08dc-4c31-85cc-b2e5dcc4086c','7be3baf9-4213-41f5-885a-f622bf07b06d','2026-07-04','2026-07-04','Não',14),('bb38103e-31da-46fe-824c-1e9e8e9b960a',2,'Ativo','abcabcabcabcabc','d6dc1eb3-188f-4f02-b7de-943770214c2a','1d4cf6ff-0b21-4d78-889b-4aa63eb461e6','92bc1d39-d1a2-40f8-a30e-15e0f5de46b0','7be3baf9-4213-41f5-885a-f622bf07b06d','2026-07-04','2026-07-04','Não',14),('bc7e40b7-f110-4cbe-91d8-2f1ae4966f75',1,'Ativo','abcabcabcabcabc','d6dc1eb3-188f-4f02-b7de-943770214c2a','1d4cf6ff-0b21-4d78-889b-4aa63eb461e6','d07174f3-af31-4d1a-be28-4ba833a4aae5','de19dc7f-ca70-4f94-9b42-4fd46f923f8a','2026-07-04','2026-07-04','Não',14),('be2c152f-0651-4bca-ac50-d356bff1d795',2,'Ativo','abcabcabcabcabc','d6dc1eb3-188f-4f02-b7de-943770214c2a','1d4cf6ff-0b21-4d78-889b-4aa63eb461e6','1b2a8de4-2731-443b-bd9d-35eff4346f8e','cc790682-428f-4501-b77b-8efd2ca73c57','2026-07-04','2026-07-04','Não',14),('c3607504-7325-4ee5-9655-e475d8b43833',1,'Ativo','abcabcabcabcabc','d6dc1eb3-188f-4f02-b7de-943770214c2a','1d4cf6ff-0b21-4d78-889b-4aa63eb461e6','d9360649-0481-4ce2-aa50-1bc23a93b7b5','7be3baf9-4213-41f5-885a-f622bf07b06d','2026-07-04','2026-07-04','Não',14),('c4ff8e8a-8914-4eba-91f8-ac588fb1eaf1',2,'Ativo','abcabcabcabcabc','d6dc1eb3-188f-4f02-b7de-943770214c2a','1d4cf6ff-0b21-4d78-889b-4aa63eb461e6','34588452-a3d8-4ffa-9976-2bfaae705954','de19dc7f-ca70-4f94-9b42-4fd46f923f8a','2026-07-04','2026-07-04','Não',14),('cfa71910-dadb-4553-a33b-afc92b6f19d4',2,'Ativo','abcabcabcabcabc','d6dc1eb3-188f-4f02-b7de-943770214c2a','1d4cf6ff-0b21-4d78-889b-4aa63eb461e6','fd59d2e8-6e7f-4cca-9dc5-4147e9b1fc91','de19dc7f-ca70-4f94-9b42-4fd46f923f8a','2026-07-04','2026-07-04','Não',14),('e24be2d7-1f39-457d-89cb-f2f965234730',1,'Ativo','abcabcabcabcabc','d6dc1eb3-188f-4f02-b7de-943770214c2a','1d4cf6ff-0b21-4d78-889b-4aa63eb461e6','acaf436d-1875-4f1a-b910-7f26965869b7','7be3baf9-4213-41f5-885a-f622bf07b06d','2026-07-04','2026-07-04','Não',14),('e7f02c00-c800-41ac-bb5e-235b37514cae',2,'Ativo','abcabcabcabcabc','d6dc1eb3-188f-4f02-b7de-943770214c2a','1d4cf6ff-0b21-4d78-889b-4aa63eb461e6','1820736d-1d0b-467b-a0a2-eb00a1730313','cc790682-428f-4501-b77b-8efd2ca73c57','2026-07-04','2026-07-04','Não',14),('eae9c2de-c394-4519-bf73-306b7a8fd8f3',2,'Ativo','abcabcabcabcabc','d6dc1eb3-188f-4f02-b7de-943770214c2a','1d4cf6ff-0b21-4d78-889b-4aa63eb461e6','010b58a6-f30e-41f9-9358-e289b3f7aaab','7be3baf9-4213-41f5-885a-f622bf07b06d','2026-07-04','2026-07-04','Não',14),('ef13ffc3-ad29-4cc5-9c7d-563b690140f3',1,'Ativo','abcabcabcabcabc','d6dc1eb3-188f-4f02-b7de-943770214c2a','1d4cf6ff-0b21-4d78-889b-4aa63eb461e6','2b2663cc-ecfa-451b-a7b2-a40f7f064fff','de19dc7f-ca70-4f94-9b42-4fd46f923f8a','2026-07-04','2026-07-04','Não',14),('f647a99a-c780-48ac-8975-d9db44abd856',1,'Ativo','abcabcabcabcabc','d6dc1eb3-188f-4f02-b7de-943770214c2a','1d4cf6ff-0b21-4d78-889b-4aa63eb461e6','6a5ef540-1906-4130-b41b-4e7ee1349c80','6026ad61-2c5d-45e0-bccc-0e444ec9c3c8','2026-07-04','2026-07-04','Não',14),('f99e6b9c-1c86-4592-9717-dcc865f762f8',1,'Ativo','abcabcabcabcabc','d6dc1eb3-188f-4f02-b7de-943770214c2a','1d4cf6ff-0b21-4d78-889b-4aa63eb461e6','a7d7d6f0-a83e-44df-a564-70d750596e22','de19dc7f-ca70-4f94-9b42-4fd46f923f8a','2026-07-04','2026-07-04','Não',14),('ff1255f4-3416-47fe-8ee3-e91bae425bea',1,'Ativo','abcabcabcabcabc','d6dc1eb3-188f-4f02-b7de-943770214c2a','1d4cf6ff-0b21-4d78-889b-4aa63eb461e6','4429cdf1-e7dc-4ca6-91f1-e804fdbfc84a','6026ad61-2c5d-45e0-bccc-0e444ec9c3c8','2026-07-04','2026-07-04','Não',14);
/*!40000 ALTER TABLE `semestre` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `topicoexamiinscricao`
--

DROP TABLE IF EXISTS `topicoexamiinscricao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `topicoexamiinscricao` (
  `id_topicoexame` varchar(255) NOT NULL,
  `topico` varchar(255) NOT NULL,
  `arquivo` varchar(255) DEFAULT NULL,
  `status` enum('Ativo','Eliminado') DEFAULT 'Ativo',
  `id_func` varchar(255) NOT NULL,
  `data_criacao` date DEFAULT (curtime()),
  PRIMARY KEY (`id_topicoexame`),
  KEY `id_func` (`id_func`),
  CONSTRAINT `topicoexamiinscricao_ibfk_1` FOREIGN KEY (`id_func`) REFERENCES `funcionario` (`id_func`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `topicoexamiinscricao`
--

LOCK TABLES `topicoexamiinscricao` WRITE;
/*!40000 ALTER TABLE `topicoexamiinscricao` DISABLE KEYS */;
INSERT INTO `topicoexamiinscricao` VALUES ('26ff7498-6fce-4968-9003-f132af87c2ff','Esxame de Admissao','1783987704824-servicos_tecnologia_1.pdf','Ativo','01ec45fe-1362-4f18-85d4-81902ab57fe7','2026-07-14');
/*!40000 ALTER TABLE `topicoexamiinscricao` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `turma`
--

DROP TABLE IF EXISTS `turma`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `turma` (
  `id_turma` varchar(255) NOT NULL,
  `turma` varchar(255) NOT NULL,
  `status` enum('Ativo','Desativado') DEFAULT 'Ativo',
  `id_user` varchar(255) NOT NULL,
  `id_curso` varchar(255) NOT NULL,
  `data_criacao` date DEFAULT (curtime()),
  `data_atualizacao` date DEFAULT (curtime()),
  PRIMARY KEY (`id_turma`),
  KEY `id_user` (`id_user`),
  KEY `id_curso` (`id_curso`),
  CONSTRAINT `turma_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `admin_user` (`id_user`),
  CONSTRAINT `turma_ibfk_2` FOREIGN KEY (`id_curso`) REFERENCES `curso` (`id_curso`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `turma`
--

LOCK TABLES `turma` WRITE;
/*!40000 ALTER TABLE `turma` DISABLE KEYS */;
INSERT INTO `turma` VALUES ('045a0ab0-eef9-4856-bde7-2e706de8a519','LCC3T','Ativo','abcabcabcabcabc','1d4cf6ff-0b21-4d78-889b-4aa63eb461e6','2026-07-07','2026-07-07'),('093abdb6-b466-484c-b841-135466ba5683','LCC2N','Ativo','abcabcabcabcabc','1d4cf6ff-0b21-4d78-889b-4aa63eb461e6','2026-07-06','2026-07-06'),('2229a57f-5bd3-4b1d-be53-359c408c4faa','LCC2T','Ativo','abcabcabcabcabc','1d4cf6ff-0b21-4d78-889b-4aa63eb461e6','2026-07-06','2026-07-06'),('2ebfce7e-96d6-457d-bdf7-960bf6c2f295','LCC1M','Ativo','abcabcabcabcabc','1d4cf6ff-0b21-4d78-889b-4aa63eb461e6','2026-07-04','2026-07-04'),('4e77cb70-9860-4b46-8ddc-533bf187999a','LCC4M','Ativo','abcabcabcabcabc','1d4cf6ff-0b21-4d78-889b-4aa63eb461e6','2026-07-06','2026-07-06'),('56e4cc31-ceff-403b-aa5b-9de1a549d8ec','LCC1N','Ativo','abcabcabcabcabc','1d4cf6ff-0b21-4d78-889b-4aa63eb461e6','2026-07-04','2026-07-04'),('5bb11625-946f-4efd-a0f4-95b50520cb57','LD5M','Ativo','abcabcabcabcabc','2d04cad5-e822-4a1c-b9a5-8a515bd49543','2026-07-07','2026-07-07'),('5bf6ce1b-26b3-4699-82ac-f048143d0757','LCC1T','Ativo','abcabcabcabcabc','1d4cf6ff-0b21-4d78-889b-4aa63eb461e6','2026-07-04','2026-07-04'),('649f9f66-cb12-4b53-9464-f48b9c622a5a','LCC1MM','Ativo','abcabcabcabcabc','1d4cf6ff-0b21-4d78-889b-4aa63eb461e6','2026-07-06','2026-07-06'),('9a4b43da-9f7c-4e87-9481-2ac4480ac266','LCC2M','Ativo','abcabcabcabcabc','1d4cf6ff-0b21-4d78-889b-4aa63eb461e6','2026-07-06','2026-07-06'),('9e83556c-7e39-4e71-b324-0918222d16cd','LD1M','Ativo','abcabcabcabcabc','2d04cad5-e822-4a1c-b9a5-8a515bd49543','2026-07-07','2026-07-07');
/*!40000 ALTER TABLE `turma` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-14  1:09:48
