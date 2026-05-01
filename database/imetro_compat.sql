CREATE DATABASE IF NOT EXISTS `imetro` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

USE `imetro`;
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
-- Table structure for table `admimetro`
--

DROP TABLE IF EXISTS `admimetro`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admimetro` (
  `idAdm` int NOT NULL AUTO_INCREMENT,
  `nomeAdm` varchar(255) NOT NULL,
  `emailAdm` varchar(255) NOT NULL,
  `contactoAdm` varchar(15) DEFAULT NULL,
  `senhaAdm` varchar(255) NOT NULL,
  PRIMARY KEY (`idAdm`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admimetro`
--

LOCK TABLES `admimetro` WRITE;
/*!40000 ALTER TABLE `admimetro` DISABLE KEYS */;
INSERT INTO `admimetro` VALUES (1,'Artur M. Paulo','arturpaulo929@gmail.com','929277043','$2b$10$5w/syExxg.7N0P9Ky5UpFe9gvuF0AGJx4lAQ2EtdSPw3zLN4DD/vy'),(2,'Nsimba Paula Suami','nsimbapaulas@gmail.com','937260507','$2b$10$5w/syExxg.7N0P9Ky5UpFe9gvuF0AGJx4lAQ2EtdSPw3zLN4DD/vy');
/*!40000 ALTER TABLE `admimetro` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=135 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `anocurricular`
--

LOCK TABLES `anocurricular` WRITE;
/*!40000 ALTER TABLE `anocurricular` DISABLE KEYS */;
INSERT INTO `anocurricular` VALUES (74,'1',24),(75,'2',24),(76,'3',24),(77,'4',24),(78,'1',35),(79,'2',35),(80,'3',35),(81,'4',35),(82,'5',35),(83,'4',34),(84,'3',34),(85,'2',34),(86,'1',34),(87,'1',30),(88,'2',30),(89,'3',30),(90,'4',30),(91,'5',30),(92,'1',33),(93,'2',33),(94,'3',33),(95,'4',33),(96,'1',29),(97,'2',29),(98,'3',29),(99,'4',29),(100,'1',27),(101,'2',27),(102,'3',27),(103,'4',27),(104,'5',27),(106,'4',26),(107,'3',26),(108,'2',26),(109,'1',26),(110,'1',32),(111,'2',32),(112,'3',32),(113,'4',32),(114,'5',32),(115,'5',31),(116,'4',31),(117,'3',31),(118,'2',31),(119,'1',31),(120,'1',23),(121,'2',23),(122,'3',23),(124,'4',25),(125,'3',25),(126,'2',25),(127,'1',25),(128,'1',28),(129,'2',28),(130,'3',28),(131,'4',28);
/*!40000 ALTER TABLE `anocurricular` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cargo_funcionario`
--

DROP TABLE IF EXISTS `cargo_funcionario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cargo_funcionario` (
  `id_cargo` int NOT NULL AUTO_INCREMENT,
  `cargo` varchar(255) NOT NULL,
  `idAdm` int NOT NULL,
  PRIMARY KEY (`id_cargo`),
  KEY `idAdm` (`idAdm`),
  CONSTRAINT `cargo_funcionario_ibfk_1` FOREIGN KEY (`idAdm`) REFERENCES `admimetro` (`idAdm`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cargo_funcionario`
--

LOCK TABLES `cargo_funcionario` WRITE;
/*!40000 ALTER TABLE `cargo_funcionario` DISABLE KEYS */;
INSERT INTO `cargo_funcionario` VALUES (1,'Coordenador de AdmissÃµes e MatrÃ­culas',2),(2,'Tesoureiro',2),(3,'Assistente Administrativo',2),(4,'Oficial de CartÃµes e IdentificaÃ§Ãµes',2);
/*!40000 ALTER TABLE `cargo_funcionario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cargo_funcionario_relation`
--

DROP TABLE IF EXISTS `cargo_funcionario_relation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cargo_funcionario_relation` (
  `id_cargo_funcionario_relation` int NOT NULL AUTO_INCREMENT,
  `id_cargo` int NOT NULL,
  `id_funcionario` int NOT NULL,
  PRIMARY KEY (`id_cargo_funcionario_relation`),
  KEY `id_funcionario` (`id_funcionario`),
  KEY `id_cargo` (`id_cargo`),
  CONSTRAINT `cargo_funcionario_relation_ibfk_1` FOREIGN KEY (`id_funcionario`) REFERENCES `funcionario` (`id_funcionario`),
  CONSTRAINT `cargo_funcionario_relation_ibfk_2` FOREIGN KEY (`id_cargo`) REFERENCES `cargo_funcionario` (`id_cargo`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cargo_funcionario_relation`
--

LOCK TABLES `cargo_funcionario_relation` WRITE;
/*!40000 ALTER TABLE `cargo_funcionario_relation` DISABLE KEYS */;
INSERT INTO `cargo_funcionario_relation` VALUES (6,1,6),(7,4,7),(9,1,9);
/*!40000 ALTER TABLE `cargo_funcionario_relation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categoriacurso`
--

DROP TABLE IF EXISTS `categoriacurso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categoriacurso` (
  `idcategoriacurso` int NOT NULL AUTO_INCREMENT,
  `categoriacurso` varchar(255) NOT NULL,
  `idAdm` int NOT NULL,
  PRIMARY KEY (`idcategoriacurso`),
  KEY `idAdm` (`idAdm`),
  CONSTRAINT `categoriacurso_ibfk_1` FOREIGN KEY (`idAdm`) REFERENCES `admimetro` (`idAdm`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categoriacurso`
--

LOCK TABLES `categoriacurso` WRITE;
/*!40000 ALTER TABLE `categoriacurso` DISABLE KEYS */;
INSERT INTO `categoriacurso` VALUES (25,'CiÃªncias EconÃ³micas e GestÃ£o',1),(26,'CiÃªncias Humanas, EducaÃ§Ã£o e Artes',1),(27,'CiÃªncias TecnolÃ³gicas e Engenharia',1);
/*!40000 ALTER TABLE `categoriacurso` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `curso`
--

DROP TABLE IF EXISTS `curso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `curso` (
  `idcurso` int NOT NULL AUTO_INCREMENT,
  `curso` varchar(255) NOT NULL,
  `idcategoriacurso` int NOT NULL,
  PRIMARY KEY (`idcurso`),
  KEY `idcategoriacurso` (`idcategoriacurso`),
  CONSTRAINT `curso_ibfk_1` FOREIGN KEY (`idcategoriacurso`) REFERENCES `categoriacurso` (`idcategoriacurso`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `curso`
--

LOCK TABLES `curso` WRITE;
/*!40000 ALTER TABLE `curso` DISABLE KEYS */;
INSERT INTO `curso` VALUES (23,'GestÃ£o de Recursos Humanos',25),(24,'AdministraÃ§Ã£o de Empresas',25),(25,'GestÃ£o PÃºblica',25),(26,'Economia',25),(27,'Direito',26),(28,'Jornalismo',26),(29,'Cinema e TV',26),(30,'Arquitectura',27),(31,'Geologia e Minas',27),(32,'Engenharia Civil',27),(33,'CiÃªncias da ComputaÃ§Ã£o',27),(34,'Planeamento Regional e Urbano',26),(35,' Engenharia ElectrÃ³nica e TelecomunicaÃ§Ãµes',27);
/*!40000 ALTER TABLE `curso` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=209 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `disc_prof`
--

LOCK TABLES `disc_prof` WRITE;
/*!40000 ALTER TABLE `disc_prof` DISABLE KEYS */;
INSERT INTO `disc_prof` VALUES (137,10,58),(138,4,58),(141,10,73),(166,13,57),(167,2,57),(168,8,57),(169,10,57),(170,5,57),(171,12,73),(172,11,73),(173,9,73),(175,2,100),(176,10,100),(177,8,100),(178,4,100),(179,14,100),(180,7,100),(181,2,58),(182,7,58),(186,7,269),(187,14,73),(188,2,321),(189,8,321),(190,2,127),(191,8,127),(192,5,127),(193,5,321),(194,5,343),(195,14,232),(196,8,232),(197,11,321),(198,2,223),(199,8,223),(200,3,223),(201,11,223),(202,12,223),(203,7,223),(205,6,343),(206,6,321),(207,6,223),(208,13,223);
/*!40000 ALTER TABLE `disc_prof` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=346 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `disciplina`
--

LOCK TABLES `disciplina` WRITE;
/*!40000 ALTER TABLE `disciplina` DISABLE KEYS */;
INSERT INTO `disciplina` VALUES (50,'ComunicaÃ§Ã£o Escrita',1),(51,'IntroduÃ§Ã£o Ã  CiÃªncia da ComputaÃ§Ã£o',1),(52,'Metodologia de InvestigaÃ§Ã£o CientÃ­fica',1),(53,'InglÃªs TÃ©cnico',1),(55,'ProgramaÃ§Ã£o I',1),(56,'LÃ³gica MatemÃ¡tica',1),(57,'Ãlgebra Linear e Geometria AnalÃ­tica',1),(58,'Analise Matematica II',1),(59,'Sistemas Digitais E Computadores',1),(60,'Fundamentos De Sistemas De Informacao',1),(61,'ProgramaÃ§Ã£o II',1),(62,'Fisica Computacional',1),(63,'Calculo Numerico Computacional',1),(64,'Arquitectura de Computadores',1),(65,'Matematica Discreta',1),(66,'ProgramaÃ§Ã£o III',1),(67,'Probabilidade E Estatistica',1),(68,'Base De Dados I',1),(69,'Sistemas Operativos',1),(70,'ProgramaÃ§Ã£o IV',1),(71,'Engenharia E Analise De Software I',1),(72,'Base De Dados II',1),(73,'Algoritmos E Estrutura De Dados',1),(74,'Redes De Computadores I',1),(75,'EletrÃ³nica',1),(76,'ProgramaÃ§Ã£o Web I',1),(77,'Data Warehouse e Data Mining',1),(78,'ProgramaÃ§Ã£o V',1),(79,'Redes de Computadores II',1),(80,'Engenharia e Analise de Software II',1),(81,'Qualidade de Software',1),(82,'Inteligencia Artificial',1),(83,'Computacao Grafica',1),(84,'ProgramaÃ§Ã£o Web II',1),(85,'Gestao De Projectos Informaticos',1),(86,'ProgramaÃ§Ã£o de Dispositivos Electronicos',1),(87,'Sistema Distribuidos e Paralelos',1),(88,'Projecto e Administracao de Redes',1),(89,'Seguranca em Computacao',1),(90,'Ã‰tica e Deontologia Profissional',1),(91,'Teoria da Computacao e Linguagem',1),(92,'Empreendedorismo',1),(93,'Computacao Movel',1),(94,'Projecto De Sistemas',1),(96,'Direito e Tecnologia da Informacao',1),(100,'Analise Matematica I',1),(109,'LÃ­ngua Portuguesa',2),(110,'InglÃªs Instrumental',2),(111,'IntroduÃ§Ã£o Ã  a ComputaÃ§Ã£o',2),(112,'IntroduÃ§Ã£o Ã  Engenharia Elect. e TelecomunicaÃ§Ãµes',2),(113,'FÃ­sica I',2),(114,'IntroduÃ§Ã£o a ProgramaÃ§Ã£o',2),(115,'FÃ­sica II',2),(116,'QuÃ­mica Fundamental',2),(117,'IntroduÃ§Ã£o Ã s TelecomunicaÃ§Ãµes',2),(118,'AnÃ¡lise MatemÃ¡tica III',2),(119,'FÃ­sica III',2),(120,'AnÃ¡lise Circuito I',2),(121,'ProgramaÃ§Ã£o Orientada a Objecto',2),(122,'Sistemas Digitais I',2),(123,'AnÃ¡lise MatemÃ¡tica IV',2),(124,'Sistemas Digitais II',2),(125,'AnÃ¡lise NÃºmerica',2),(126,'ElectrÃ³nica Teoria I',2),(127,'AnÃ¡lise Circuito II',2),(128,'Fundamentos ElectrÃ³nica',2),(129,'ElectrÃ³nica I',2),(130,'EquaÃ§Ã£o Diferenciais',2),(131,'Teorias dos Sinais e Sistemas',2),(132,'Fundamentos de TelecomunicaÃ§Ãµes I',2),(133,'Electrotecnia TeÃ³rica',2),(134,'InstrumentaÃ§Ã£o e Medidas',2),(135,'Propag. e Rad de Ondas ElectromagnÃ©ticas',2),(136,'Controlo I',2),(137,'Fundamentos de TelecomunicaÃ§Ãµes II',2),(138,'Electronica II',2),(139,'Sistemas de Energia em TelecomunicaÃ§Ãµes',2),(140,'Redes de ComunicaÃ§Ã£o I',2),(141,'Sistemas De TelecomunicaÃ§Ãµes I',2),(142,'Controlo II',2),(143,'Antenas',2),(144,'ElectrÃ³nica III',2),(145,'CompreessÃ£o e CodificaÃ§Ã£o de Dados',2),(146,'Redes de ComunicaÃ§Ã£o II',2),(147,'Sistemas De TelecomunicaÃ§Ãµes II',2),(148,'IntroduÃ§Ã£o Ã  GestÃ£o',2),(149,'Desenho TÃ©cnico',2),(150,'ElectrÃ³nica De PotÃªncia',2),(151,'TelevisÃ£o',2),(152,'GestÃ£o de Projectos de TelecomunicaÃ§Ãµes',2),(153,'ComunicaÃ§Ãµes MÃ³veis',2),(154,'GestÃ£o de ServiÃ§os de Redes',2),(155,'ComunicaÃ§Ãµes de Audio e Video',2),(156,'Optativa I',2),(157,'ComunicaÃ§Ã£o Por SatÃ©lite',2),(158,'Novas Tecnologias',2),(159,'Software para TelecomunicaÃ§Ãµes',2),(161,'Optativa II',2),(162,'QuÃ­mica Geral',2),(163,'Geometria Descritiva',2),(164,'MecÃ¢nica Aplicada',2),(165,'Desenho de ConstruÃ§Ã£o Civil e Arquitectura',2),(166,'Geologia Geral',2),(167,'Materiasis de ConstruÃ§Ã£o I',2),(168,'HidrÃ¡ulica I',2),(169,'ResistÃªncia dos Materiais I',2),(170,'FÃ­sica dos Meios ContÃ­nuos',2),(171,'Planeamento Regional Urbano',2),(172,'Materiasis de ConstruÃ§Ã£o II',2),(173,'ResistÃªncia dos Materiais II',2),(174,'MecÃ¢nica dos Solos e FundaÃ§Ãµes I',2),(175,'Teoria das Estruturas I',2),(176,'Vias da ComunicaÃ§Ã£o I',2),(177,'Tecnologia de ConstruÃ§Ã£o I',2),(178,'InstalaÃ§Ãµes HidrÃ¡ulica em EdifÃ­cios I',2),(179,'MecÃ¢nica dos Solos e FundaÃ§Ãµes II',2),(180,'Teoria das Estruturas II',2),(181,'Vias da ComunicaÃ§Ã£o II',2),(182,'InstalaÃ§Ãµes HidrÃ¡ulica em EdifÃ­cios II',2),(183,'BetÃ£o Armado e PrÃ©-esforÃ§ado I',2),(184,'GestÃ£o estaleiro de obra I',2),(185,'ModelaÃ§Ã£o e Ãnalise de Estruturas',2),(186,'Caminhos de Ferro',2),(187,'Estruturas MetÃ¡licas e Mistas',2),(188,'BetÃ£o Armado e PrÃ©-esforÃ§ado II',2),(189,'GestÃ£o estaleiro de obra II',2),(190,'Pontes',2),(191,'Pavimentos de AerÃ³dromos',2),(192,'Estruturas de Madeiras',2),(193,'ReabilitaÃ§Ã£o e EsforÃ§o de Estruturas',2),(194,'GestÃ£o de ResÃ­duos SÃ³l. e Impact. Ambientais',2),(195,'Economia de ConstruÃ§Ã£o',2),(196,'InvestigaÃ§Ã£o Operacional',2),(197,'Dimensinamento de Estruturas',2),(198,'EstÃ¡gio',2),(199,'Trabalho de Fim de Curso',2),(200,'Topografia Gerals',2),(201,'Tecnologia de ConstruÃ§Ã£o II',2),(202,'MatemÃ¡tica I',1),(203,'InformÃ¡tica de GestÃ£o',1),(204,'InglÃªs I',1),(205,'LÃ­ngua Portuguesa para ComunicaÃ§Ã£o I',2),(206,'Microeconomia I',1),(207,'InformÃ¡tica',2),(208,'HistÃ³ria das Siciedades Africanas',2),(209,'ExtensÃ£o I',2),(210,'Contabilidade Geral I',1),(211,'Microeconomia II',1),(212,'InglÃªs II',1),(213,'LÃ­ngua Portuguesa para ComunicaÃ§Ã£o II',2),(214,'MatemÃ¡tica II',1),(215,'HistÃ³ria do pensamento EconÃ³mico',1),(216,'Sociologia das OrganizaÃ§Ãµes',1),(217,'HistÃ³ria EconÃ³mica de Angola',1),(218,'Fundamentos da CiÃªncia Tecnologica',2),(219,'Contabilidade Geral II',1),(220,'EstÃ¡tisca I',1),(221,'Macroeconomia I',1),(222,'HistÃ³ria de Angola',2),(223,'Ã€lgebra Linear',1),(224,'HistÃ³ria da ComunicaÃ§Ã£o e dos MÃ©dia',2),(225,'MatemÃ¡tica Financeira',1),(226,'IntroduÃ§Ã£o a Econometria',1),(227,'Sociologia Geral',2),(228,'Contabilidade AnÃ¡litica I',1),(229,'EstÃ¡tisca II',1),(230,'SistÃ©mica e Modelos da informaÃ§Ã£o',2),(231,'Macroeconomia II',1),(232,'Analise e gestÃ£o de Projectos',1),(233,'Geografia Politica e Social de Angola',2),(234,'Analise Financeira',1),(235,'Economia Monetaria e Financeira',1),(236,'Econometria',1),(237,'microeconomia III',1),(238,'Fiscalidade',1),(239,'Contabilidade AnÃ¡litica II',1),(240,'FinanÃ§as PÃºblicas',1),(241,'MutaÃ§Ã£o dos MÃ©dias',2),(242,'ComunicaÃ§Ã£o Social e Politica',2),(243,'Macroeconomia III',1),(244,'MÃ©todos de ProgramaÃ§Ã£o e PrevisÃ£o Financeira',1),(245,'InglÃªs III',2),(246,'Mercados Financeiros',1),(247,'IntroduÃ§Ã£o Ã  Economia',2),(248,'FinanÃ§as Corporativa',1),(249,'Economia Internacional',1),(250,'PolÃ­ticas EconÃ³micas',1),(251,'ExtensÃ£o II',2),(252,'Marketing',1),(253,'Direito e Deontologia da ComunicaÃ§Ã£o',2),(254,'Direito EconÃ³mico',1),(255,'Economia da Ãfrica Sub - Sahariana',1),(256,'EstÃ©tica da ComunicaÃ§Ã£o',2),(257,'Economia do crescimento e Desenvolvimento',1),(258,'OratÃ³ria',1),(259,'HistÃ³ria e Teoria do Jornalismo',2),(261,'ComunicaÃ§Ã£o instituicional',2),(262,'Sociologia da ComunicaÃ§Ã£o',2),(263,'OrganizaÃ§Ãµes internacionais',2),(264,'HistÃ³ria das Ideias PolÃ­ticas',2),(265,'AnÃ¡lise do Discurso JornalÃ­stico',2),(266,'RelaÃ§Ã£o e conflitos internacionais',2),(267,'GÃ©neros Jornalistico',2),(268,'Direito Constituicional de Angola',2),(269,'Angola no Contexto da Ãfrica',2),(270,'Teoria da Reportagems',2),(271,'RedaÃ§Ã£o Jornalistica I',2),(272,'Jornalismo Televisivo',2),(273,'Jornalismo CientÃ­fico e Ambiental',2),(274,'Teoria da Publicidade e Marketing',2),(275,'RedaÃ§Ã£o Jornalistica II',2),(276,'RetÃ³rica e ArgumentaÃ§Ã£o',2),(277,'Planeamento GrÃ¡fico e EditorÃ§Ã£o',2),(278,'Oficina de CriaÃ§Ã£o Jornalistica',2),(279,'Oficina de Jornalismo RadiofÃ³noco II',2),(280,'SeminÃ¡rio I',2),(281,'Monografia I',2),(282,'ProduÃ§Ã£o Jornalistica',2),(283,'Pedagogia da ComunicaÃ§Ã£o',2),(284,'Oficina de Jornalismo ElectrÃ³nico',2),(285,'LaboratÃ³rio de InvestigaÃ§Ã£o JornalÃ­stica',2),(286,'SeminÃ¡rio II',2),(287,'Monografia II',2),(288,'Teoria Geral da ComunicaÃ§Ã£o',2),(289,'Teoria Geral da AdministraÃ§Ã£o',1),(290,'IntroduÃ§Ã£o ao Direito',1),(291,'EstatÃ­stica I',1),(292,'Comportamento Organizacional',1),(293,'Contabilidade Financeira',1),(294,'EstatÃ­stica II',1),(295,'Direito do Trabalho',1),(296,'GestÃ£o Financeira',1),(297,'Fiscalidade I',1),(298,'Fiscalidade II',1),(299,'Direito Comercial',1),(300,'GestÃ£o de Recusos Humanos',1),(301,'GestÃ£o de OperaÃ§Ãµes',1),(302,'EstratÃ©gia Empresarial',1),(303,'FinanÃ§as Internacionais',1),(304,'Auditoria Financeira',1),(305,'Controlo de GestÃ£o',1),(306,'GovernanÃ§a Corporativa',1),(307,'AnÃ¡lise e GestÃ£o de Projectos de Investimento',1),(308,'IntroduÃ§Ã£o Ã  Economia I',2),(309,'IntroduÃ§Ã£o Ã  Economia II',2),(310,'Geografia PolÃ­tica e Administrativa de Angola',2),(311,'Probabilidade',2),(312,'Desenho e MÃ©todos GrÃ¡ficos',2),(313,'Geomorfologia e Recursos Naturais',2),(314,'Topografia',2),(315,'HistÃ³ria do Urbanismo e do Planeamento',2),(316,'Ordenamento e GestÃ£o do TerritÃ³rio',2),(317,'Geo-estratÃ©gia na polÃ­tica do territÃ³rio',2),(318,'Demografia',2),(319,'MÃ©todos EstatÃ­sticos',2),(320,'Sistemas de InformaÃ§Ã£o GeogrÃ¡fica I',2),(321,'AdministraÃ§Ã£o PÃºblica do TerritÃ³rio',2),(322,'GeopolÃ­tica (Internacional e Nacional)',2),(323,'Estudos de Impacto Ambiental',2),(324,'Planeamento das Cidades',2),(325,'Economia do TerritÃ³rio',2),(326,'Geo-estatÃ­stica e AnÃ¡lise de Dados',2),(327,'Sistemas de InformaÃ§Ã£o GeogrÃ¡fica II',2),(328,'Teoria e MÃ©todos de Planeamento (ParÃ¢metros UrbanÃ­sticos)',2),(329,'Geo-estratÃ©gia PolÃ­tica, Social e EnergÃ©tica',2),(330,'Planeamento da HabitaÃ§Ã£o, Equipamentos e Infra-Estruturas',2),(331,'Direito do Urbanismo',2),(332,'Projecto SIG I: Plan. Regional e PDM',2),(333,'Projecto UrbanÃ­stico Aplicado I: CAD',2),(334,'Ordenamento Rural e Ambiental',2),(335,'AlteraÃ§Ãµes ClimÃ¡ticas e Planeamento EnergÃ©tico',2),(336,'Ã‰tica e Deontologia',2),(337,'Projecto SIG II: Desenvolvimento de Infra-estruturas e Equipamentos',2),(338,'Projecto UrbanÃ­stico Aplicado II:CAD',2),(339,'Desenvolvimento EconÃ³mico do TerritÃ³rio',2),(340,'AvaliaÃ§Ã£o e GestÃ£o de Projectos Urbanos',2),(341,'Planeamento e PolÃ­tica Regional',2),(342,'Economia Ambiental',2),(343,'AdministraÃ§Ã£o UrbanÃ­stica',2),(344,'Planeamento da CirculaÃ§Ã£o e dos Transportes',2);
/*!40000 ALTER TABLE `disciplina` ENABLE KEYS */;
UNLOCK TABLES;

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
  `estado_estdanteInscrito` enum('Aprovado','Reprovado','Admitido','NÃ£o Admitido','Pendente') NOT NULL DEFAULT 'Pendente',
  PRIMARY KEY (`id_estudanteInscricao`),
  UNIQUE KEY `contacto_estudanteInscricao` (`contacto_estudanteInscricao`),
  UNIQUE KEY `email_estudanteInscricao` (`email_estudanteInscricao`),
  KEY `idcurso` (`idcurso`),
  CONSTRAINT `estudanteinscricao_ibfk_1` FOREIGN KEY (`idcurso`) REFERENCES `curso` (`idcurso`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estudanteinscricao`
--

LOCK TABLES `estudanteinscricao` WRITE;
/*!40000 ALTER TABLE `estudanteinscricao` DISABLE KEYS */;
INSERT INTO `estudanteinscricao` VALUES (2,'Artur Macumba Paulo','+244 929277043','arturpaulo929@gmail.com','Masculino','ManhÃ£',33,'estudante_2026284708_doc_1773346824606.pdf','estudante_2026284708_foto_1773346824610.jpeg','$2b$10$5LAeJ7EzJB10fEpVE7pRgOo2BztQ29VxLgKsTuNYK5GBNbaViRbJK','008555739LA047','2026284708',NULL,NULL,'Aprovado'),(3,'Nsimba Paula Maniongo Suami','+244 937260507','nsimbapaulas@gmail.com','Feminino','ManhÃ£',33,'estudante_2026378126_doc_1773393048765.pdf','estudante_2026378126_foto_1773393048770.png','$2b$10$M.Q27CslhahDDQI8dCx5be4rfP04FVMMJUw1O4VyB51mGzXRp6YOW','008649051LA049','2026378126',NULL,NULL,'Aprovado'),(5,'Artur M Paulo','+929277044','arturmakumbapaulo@gmail.com','Masculino','ManhÃ£',32,'estudante_2026502058_doc_1776432655551.pdf','estudante_2026502058_foto_1776432655561.png','$2b$10$zeXQnGkx/D9ENtoqyPiP0.zfKmY8vdHnQlgMjaSUoNHXjNA.HlAbq','005558379LA044','2026502058',NULL,NULL,'Aprovado'),(6,'Oneill Baltazar','244 944330672','oneillb399@gmail.com','Masculino','ManhÃ£',33,'estudante_2026199708_doc_1777018310395.pdf','estudante_2026199708_foto_1777018310425.png','$2b$10$hOrMKf1Q.P9W2BlkPN0J9emUB//rMg4dFNItQwcUg2PW8avi2vVxu','007382062LA049','2026199708',NULL,NULL,'Pendente');
/*!40000 ALTER TABLE `estudanteinscricao` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `funcionario`
--

DROP TABLE IF EXISTS `funcionario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `funcionario` (
  `id_funcionario` int NOT NULL AUTO_INCREMENT,
  `nome_funcionario` varchar(255) NOT NULL,
  `contacto_funcionario` varchar(16) NOT NULL,
  `bi_funcionario` varchar(50) NOT NULL,
  `estado_funcionario` enum('Ativo','Desativado') DEFAULT 'Ativo',
  `senha_funcionario` varchar(255) NOT NULL,
  `idAdm` int NOT NULL,
  PRIMARY KEY (`id_funcionario`),
  UNIQUE KEY `contacto_funcionario` (`contacto_funcionario`),
  UNIQUE KEY `bi_funcionario` (`bi_funcionario`),
  KEY `idAdm` (`idAdm`),
  CONSTRAINT `funcionario_ibfk_1` FOREIGN KEY (`idAdm`) REFERENCES `admimetro` (`idAdm`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `funcionario`
--

LOCK TABLES `funcionario` WRITE;
/*!40000 ALTER TABLE `funcionario` DISABLE KEYS */;
INSERT INTO `funcionario` VALUES (6,'Artur Paulo M','929-277-043','008555739LA047','Ativo','$2b$10$bTSuILgWcGEWgYYI52iIqe3bD1cT6MLM1Q/necEmO1.NK.HjDONhi',2),(7,'Nsimba Paula Maniongo Suami','+244 937-250-607','008649051LA049','Ativo','$2b$10$5n.Q.8.F/6DIER62pkBiN.2Nf/V68haj.OYDVt1Jr/x/WSSVSJXE2',2),(9,'Leovigildo JoÃ£o','244935882371','00000000LA000','Desativado','$2b$10$kaXHOjaayLEWNbmxhAS4GuvrVB8dD8WJybklh0DL1Cc3Xr3GREiaS',2);
/*!40000 ALTER TABLE `funcionario` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=84 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `periodo`
--

LOCK TABLES `periodo` WRITE;
/*!40000 ALTER TABLE `periodo` DISABLE KEYS */;
INSERT INTO `periodo` VALUES (40,92,27,33,'ManhÃ£','LCC1M','2025-2026'),(41,92,27,33,'Tarde','LCC1T','2025-2026'),(42,92,27,33,'Noite','LCC1N','2025-2026'),(43,93,27,33,'ManhÃ£','LCC2M','2025-2026'),(44,93,27,33,'Tarde','LCC2T','2025-2026'),(45,93,27,33,'Noite','LCC2N','2025-2026'),(46,94,27,33,'ManhÃ£','LCC3M','2025-2026'),(47,94,27,33,'Tarde','LCC3T','2025-2026'),(48,94,27,33,'Noite','LCC3N','2025-2026'),(49,95,27,33,'ManhÃ£','LCC4M','2025-2026'),(50,95,27,33,'Tarde','LCC4T','2025-2026'),(51,95,27,33,'Noite','LCC4N','2025-2026'),(53,78,27,35,'ManhÃ£','LEET1M','2025-2026'),(54,78,27,35,'Tarde','LEET1T','2025-2026'),(55,78,27,35,'Noite','LEET1N','2025-2026'),(56,112,27,32,'ManhÃ£','LEET3M','2025-2026'),(57,79,27,35,'Tarde','LEET2T','2025-2026'),(58,79,27,35,'Noite','LEET2N','2025-2026'),(59,80,27,35,'ManhÃ£','LEET3M','2025-2026'),(60,80,27,35,'Tarde','LEET3T','2025-2026'),(61,80,27,35,'Noite','LEET3N','2025-2026'),(62,81,27,35,'ManhÃ£','LEET4M','2025-2026'),(63,81,27,35,'Tarde','LEET4T','2025-2026'),(64,81,27,35,'Noite','LEET4N','2025-2026'),(65,82,27,35,'ManhÃ£','LEET5M','2025-2026'),(66,82,27,35,'Tarde','LEET5T','2025-2026'),(67,82,27,35,'Noite','LEET5N','2025-2026'),(68,110,27,32,'ManhÃ£','LEC1M','2025-2026'),(70,110,27,32,'Tarde','LEC1T','2025-2026'),(71,110,27,32,'Noite','LEC1N','2025-2026'),(72,112,27,32,'ManhÃ£','LEC3M','2025-2026'),(73,111,27,32,'Tarde','LEC2M','2025-2026'),(74,111,27,32,'Noite','LEC2M','2025-2026'),(75,112,27,32,'Noite','LEC2M','2025-2026'),(76,112,27,32,'Tarde','LEC2M','2025-2026'),(77,112,27,32,'ManhÃ£','LEC2M','2025-2026'),(78,113,27,32,'ManhÃ£','LEC4M','2025-2026'),(79,113,27,32,'Tarde','LEC2M','2025-2026'),(80,113,27,32,'Noite','LEC4M','2025-2026'),(81,114,27,32,'Noite','LEC5N','2025-2026'),(82,114,27,32,'Tarde','LEC5T','2025-2026'),(83,114,27,32,'ManhÃ£','LEC5M','2025-2026');
/*!40000 ALTER TABLE `periodo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `professor`
--

DROP TABLE IF EXISTS `professor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `professor` (
  `idprofessor` int NOT NULL AUTO_INCREMENT,
  `fotoprofessor` varchar(255) NOT NULL,
  `nomeprofessor` varchar(255) NOT NULL,
  `generoprofessor` varchar(255) NOT NULL,
  `nacionalidadeprofessor` varchar(255) NOT NULL,
  `estadocivilprofessor` varchar(255) NOT NULL,
  `nomepaiprofessor` varchar(255) NOT NULL,
  `nomemaeprofessor` varchar(255) NOT NULL,
  `nbiprofessor` varchar(20) NOT NULL,
  `datanascimentoprofessor` varchar(25) NOT NULL,
  `bipdfprofessor` varchar(205) NOT NULL,
  `residenciaprofessor` varchar(255) NOT NULL,
  `telefoneprofessor` varchar(13) NOT NULL,
  `whatsappprofessor` varchar(13) NOT NULL,
  `emailprofessor` varchar(255) NOT NULL,
  `anoexperienciaprofessor` varchar(13) NOT NULL,
  `titulacaoprofessor` varchar(255) NOT NULL,
  `dataadmissaoprofessor` varchar(255) NOT NULL,
  `tipocontratoprofessor` varchar(255) NOT NULL,
  `ibanprofessor` varchar(50) NOT NULL,
  `tiposanguineoprofessor` varchar(5) NOT NULL,
  `condicoesprofessor` varchar(255) NOT NULL,
  `contactoemergenciaprofessor` varchar(255) NOT NULL,
  `idAdm` int NOT NULL,
  `codigoprofessor` varchar(8) NOT NULL,
  `senhaprofessor` varchar(255) NOT NULL,
  `estado` enum('Ativo','Desativado') NOT NULL DEFAULT 'Ativo',
  PRIMARY KEY (`idprofessor`),
  UNIQUE KEY `telefoneprofessor` (`telefoneprofessor`),
  UNIQUE KEY `emailprofessor` (`emailprofessor`),
  UNIQUE KEY `whatsappprofessor` (`whatsappprofessor`),
  KEY `idAdm` (`idAdm`),
  CONSTRAINT `professor_ibfk_1` FOREIGN KEY (`idAdm`) REFERENCES `admimetro` (`idAdm`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `professor`
--

LOCK TABLES `professor` WRITE;
/*!40000 ALTER TABLE `professor` DISABLE KEYS */;
INSERT INTO `professor` VALUES (2,'professor_00000002_foto_1772548939531.jpeg','Artur M. Paulo','Masculino','Angolano','Casado(a)','Ndombele Paulo','Senga Macumba Paulo','008555739LA047','2004-04-04','professor_00000002_bi_1773399735491.pdf','Sequele/Bloco 5/Predio 33/Entrada A/101','929277043','929277043','arturpaulo929@gmail.com','4','Doutoramento','2024-09-12','Efetivo','000600000052757230154','A+','Psicopata','928583366',1,'27296897','$2b$10$5w/syExxg.7N0P9Ky5UpFe9gvuF0AGJx4lAQ2EtdSPw3zLN4DD/vy','Ativo'),(3,'professor_39902330_foto_1770626410695.jpeg','Nsimba Paula Maniongo Suami','Feminino','Angolano','Solteiro(a)','Samuel Mango Suami','MÃ´nica Maniongo','008649051LA049','2002-05-10','professor_39902330_bi_1770626410696.pdf','Sequele/Bloco 2/Predio 26/Entrada A/201','937260507','937260507','nsimbapaulas@gmail.com','2','Licenciatura','2026-02-09','EstagiÃ¡rio','004000004866226010168','O-','Maluca','928583366',1,'39902330','$2b$10$5w/syExxg.7N0P9Ky5UpFe9gvuF0AGJx4lAQ2EtdSPw3zLN4DD/vy','Ativo'),(4,'professor_61434104_foto_1771857143904.jpeg','Jose Manuel','Masculino','Cubano','Solteiro','Manuel AndrÃ©','Maria Jose','008649051LA149','2026-02-02','professor_00000004_bi_1771942068599.pdf','Cacuaco','929277044','929277044','manueljose@gmail.com','4','Licenciatura','2026-02-23','Efetivo','004000004866226010168','A+','Alergico a MAnga','928583377',1,'61434100','$2b$10$n0jjKgRWZU.MUeNC3EshyeAxfzaILbEEZE5M2Erlj1QpHBgmvsmgO','Ativo'),(5,'professor_14075701_foto_1771860013494.png','JoÃ£o Carlos Silva','Masculino','Angolana','Casado(a)','AntÃ³nio Silva','Maria Silva','007895432LA049','1985-03-15','professor_14075701_bi_1771860013495.pdf','Rua da Paz, 123 - Luanda','923456789','923456789','joao.silva@email.com','12','Mestrado','2015-02-10','Efetivo','AO06 0040 0000 1234 5678 9012 3','0+','Nenhuma','923456789',2,'14075701','$2b$10$K7ijYyhFCSQn6Aw29BVaGe/.TQUnaIX6Hgm1EMRcOZpFTVSFwTqFW','Ativo'),(6,'professor_63770621_foto_1771860579685.png','Ana Paula Fernandes ','Feminino','Angolana','Solteiro(a)','Manuel Fernandes','Teresa Fernandes','008765432LA078','1990-07-22','professor_00000006_bi_1772703246063.pdf','Av. 4 de Fevereiro, 45 - Luanda','934567890','934567890','ana.fernandes@email.com','8','Licenciatura','2018-03-01','Contratado','AO06 0040 0000 2345 6789 0123 4','A+','Nenhuma','923456780',2,'63770622','$2b$10$f/V1C2jP/RgnuwCZ03/M8emE98k2O6hDSEh6KA1EvljSwVXJH5KEW','Ativo'),(7,'professor_83398631_foto_1771860887660.png','Miguel AntÃ³nio Costa','Masculino','Angolana','Divorciado(a)','JosÃ© Costa','Isabel Costa','009876543LA012','1982-11-10','professor_83398631_bi_1771860887661.pdf','Rua do ComÃ©rcio, 78 - Benguela','945678901','945678901','miguel.costa@email.com','15','Doutoramento','2010-08-05','Efetivo','AO06 0040 0000 3456 7890 1234 5','B+','HipertensÃ£o controlada','934567891',2,'83398631','$2b$10$qCqGb2FFV80N4jx4r3f/TOjvZw9igmeNBSvwZz1uQZuucI/VfGiu2','Ativo'),(8,'professor_15891244_foto_1771861076231.png','Carla Marisa Santos','Feminino','Angolana','Casado(a)','Francisco Santos','Rosa Santos','006543219LA034','1988-09-28','professor_00000008_bi_1772808035318.pdf','Bairro Alvalade, 234 - Luanda','956789012','956789012','carla.santos@email.com','9','Mestrado','2016-04-12','Efetivo','AO06 0040 0000 4567 8901 2345 6','AB-','Asma leve','945678902',2,'15891244','$2b$10$ROh/YWFL16HkwidlEhbsbuPw0alYXunITFUosiPg.huSl2DzL/r9K','Ativo'),(9,'professor_60598906_foto_1771921248451.png','Pedro Miguel Fereeira','Masculino','Angolana','Solteiro(a)','Armando Ferreira','LÃºcia Ferreira','005432198LA056','1992-12-03','professor_60598906_bi_1771921248451.pdf','UrbanizaÃ§Ã£o Nova Vida, Bloco 3 - Luanda','967890123','967890123','pedro.ferreira@email.com','5','Licenciatura','2019-09-20','Contratado','AO06 0040 0000 5678 9012 3456 7','O-','Nenhuma','956789013',1,'60598906','$2b$10$zKh9BM7MVJ9VospXKrQCD.k8jDYGnPNzt7Zmdsv.8RME23s6tZFR6','Ativo'),(10,'professor_20341261_foto_1771922068136.png','Isabel Maria Gome','Feminino','Angolana ','ViÃºvo(a)','Carlos Gomes','FÃ¡tima Gomes','  004321987LA067','1975-05-15','professor_00000010_bi_1772705182436.pdf','Rua Direita, 56 - Lubango','978901234','978901234','isabel.gomes@email.com','20','Doutoramento','2000-03-13','Efetivo','AO06 0040 0000 6789 0123 4567 8','A-','Diabetes tipo 2','967890124',2,'20341261','$2b$10$NRGzglphXFYbYfcoylwiheoG97AdMnt9OKcY5Q9uwoWFsU6yINUTq','Ativo'),(11,'professor_90060036_foto_1771922358325.png','Rui Manuel Pinto','Masculino','Angolano','Casado(a)','Joaquim Pinto','Albertina Pinto ','003219876LA078','1980-08-07','professor_90060036_bi_1771922358326.pdf','Bairro Benfica, 321 - Luanda','989012345','989012345','rui.pinto@email.com','14','Mestrado','2012-06-15','Efetivo','AO06 0040 0000 7890 1234 5678 9','B-','Nenhuma','978901235',2,'90060036','$2b$10$Ttp.awnHjfvRAaIIlM5RO.Dp/.lvsnrg.oxgutbi5E35nBE5o7kdu','Ativo'),(12,'professor_68777094_foto_1771922690193.png','SÃ³nia Cristina Lopes','Feminino','Angolana','Solteiro(a)','Fernando Lopes','Helena Lopes','002198765LA089','1995-02-19','professor_68777094_bi_1771922690194.pdf','Talatona, Rua 5 - Luanda','990123456','990123456','sonia.lopes@email.com','3','Licenciatura','2021-01-10','EstagiÃ¡rio','AO06 0040 0000 8901 2345 6789 0','AB+','Alergia a pÃ³len','989012346',2,'68777094','$2b$10$sJo8a7psHNrb6HzGQvx7wOSr9nqYlodbtc7WWVj3nTl9HZpa8grz6','Ativo'),(13,'professor_74318650_foto_1771923013007.png','AntÃ³nio JosÃ© Mendes','Masculino','Angolano','Casado(a)','Alberto Mendes','Celeste Mendes','001987654LA090','1978-06-25','professor_74318650_bi_1771923013008.pdf','Rua dos Combatentes, 90 - Huambo','901234567','901234567','antonio.mendes@email.com','18','Doutoramento','2008-09-01','Efetivo','AO06 0040 0000 9012 3456 7890 1','O+','Nenhuma','990123457',2,'74318650','$2b$10$kjPKEWGWwYD30e5.8ofioexpIjnq1Sz7rmzFnON2gr5AlRPV0NtSm','Ativo'),(14,'professor_17430970_foto_1771923201871.png','Maria do Carmo Andrade','Feminino','Angolana','Solteiro(a)','Paulo Andrade','LuÃ­sa Andrade','000876543LA101','1987-11-30','professor_17430970_bi_1771923201872.pdf','Ingombotas, Rua da MissÃ£o - Luanda','912345678','912345678','maria.andrade@email.com','10','Mestrado','2014-07-10','Efetivo','AO06 0040 0000 0123 4567 8901 2','A+','Nenhuma','901234568',2,'17430970','$2b$10$3wKuP1zeNDiVVQA1TwyOreo3LKvWIuzoaoTcYQXiIuU9vfgmSIU9S','Ativo'),(15,'professor_99383647_foto_1776952127161.png','AAAAA','Masculino','AAAA','Solteiro(a)','AAAA','AAAA','00000000','2026-04-29','professor_99383647_bi_1776952127165.pdf','AAAA','99999','99999','aaaa@gmail.com','3','Licenciatura','2026-04-30','Efetivo','00000000000','A','A','99999',1,'99383647','$2b$10$Zotp0qkiA3IPKY/0SqAyU.GX9hjG1oaWZev1YpvdaSZsy5ZQtrBuu','Desativado');
/*!40000 ALTER TABLE `professor` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB AUTO_INCREMENT=289 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `semestre`
--

LOCK TABLES `semestre` WRITE;
/*!40000 ALTER TABLE `semestre` DISABLE KEYS */;
INSERT INTO `semestre` VALUES (20,27,33,55,'1',92),(21,27,33,52,'1',92),(22,27,33,56,'1',92),(23,27,33,51,'1',92),(24,27,33,53,'1',92),(25,27,33,50,'1',92),(27,27,33,57,'2',92),(28,27,33,58,'2',92),(29,27,33,62,'2',92),(30,27,33,60,'2',92),(31,27,33,61,'2',92),(32,27,33,59,'2',92),(33,27,33,63,'1',93),(34,27,33,64,'1',93),(35,27,33,65,'1',93),(36,27,33,66,'1',93),(37,27,33,67,'1',93),(38,27,33,68,'1',93),(39,27,33,69,'2',93),(40,27,33,70,'2',93),(41,27,33,71,'2',93),(42,27,33,72,'2',93),(43,27,33,73,'2',93),(44,27,33,74,'2',93),(45,27,33,75,'1',94),(46,27,33,76,'1',94),(47,27,33,77,'1',94),(48,27,33,78,'1',94),(49,27,33,79,'1',94),(50,27,33,80,'1',94),(51,27,33,81,'2',94),(52,27,33,82,'2',94),(53,27,33,83,'2',94),(54,27,33,84,'2',94),(55,27,33,85,'2',94),(56,27,33,86,'2',94),(57,27,33,87,'1',95),(58,27,33,88,'1',95),(59,27,33,89,'1',95),(60,27,33,90,'1',95),(61,27,33,91,'1',95),(62,27,33,92,'1',95),(63,27,33,93,'2',95),(64,27,33,94,'2',95),(66,27,33,83,'2',95),(67,27,33,96,'2',95),(68,27,33,100,'1',92),(74,27,35,109,'1',78),(75,27,35,110,'1',78),(76,27,35,111,'1',78),(77,27,35,100,'1',78),(78,27,35,113,'1',78),(79,27,35,52,'1',78),(80,27,35,114,'2',78),(81,27,35,58,'2',78),(82,27,35,115,'2',78),(83,27,35,116,'2',78),(84,27,35,57,'2',78),(85,27,35,117,'2',78),(86,27,35,112,'1',78),(87,27,35,118,'1',79),(88,27,35,119,'1',79),(89,27,35,120,'1',79),(90,27,35,121,'1',79),(91,27,35,122,'1',79),(92,27,35,67,'1',79),(93,27,35,123,'2',79),(94,27,35,124,'2',79),(95,27,35,125,'2',79),(96,27,35,126,'2',79),(97,27,35,127,'2',79),(98,27,35,69,'2',79),(99,27,35,128,'2',79),(100,27,35,129,'1',80),(101,27,35,130,'1',80),(102,27,35,131,'1',80),(103,27,35,132,'1',80),(104,27,35,133,'1',80),(105,27,35,64,'1',80),(106,27,35,134,'2',80),(107,27,35,135,'2',80),(108,27,35,136,'2',80),(109,27,35,137,'2',80),(110,27,35,138,'2',80),(111,27,35,139,'2',80),(112,27,35,140,'1',81),(113,27,35,141,'1',81),(114,27,35,142,'1',81),(115,27,35,143,'1',81),(116,27,35,144,'1',81),(117,27,35,145,'1',81),(118,27,35,146,'2',81),(119,27,35,147,'2',81),(120,27,35,148,'2',81),(121,27,35,149,'2',81),(122,27,35,150,'2',81),(123,27,35,151,'2',81),(124,27,35,152,'1',82),(125,27,35,153,'1',82),(126,27,35,154,'1',82),(127,27,35,155,'1',82),(128,27,35,156,'1',82),(129,27,35,161,'2',82),(130,27,35,158,'2',82),(131,27,35,159,'2',82),(133,27,35,157,'2',82),(134,27,32,109,'1',110),(135,27,32,162,'1',110),(136,27,32,67,'1',110),(137,27,32,163,'1',110),(138,27,32,100,'1',110),(139,27,32,113,'1',110),(140,27,32,57,'1',110),(141,27,32,125,'2',110),(142,27,32,164,'2',110),(143,27,32,58,'2',110),(144,27,32,165,'2',110),(145,27,32,200,'2',110),(146,27,32,118,'1',111),(147,27,32,119,'1',111),(148,27,32,166,'1',111),(149,27,32,168,'1',111),(150,27,32,169,'1',111),(151,27,32,167,'1',111),(152,27,32,123,'2',111),(153,27,32,170,'2',111),(154,27,32,171,'2',111),(155,27,32,172,'2',111),(156,27,32,189,'2',111),(157,27,32,173,'2',111),(158,27,32,174,'1',112),(159,27,32,177,'1',112),(160,27,32,176,'1',112),(161,27,32,178,'1',112),(162,27,32,179,'2',112),(163,27,32,180,'2',112),(164,27,32,181,'2',112),(165,27,32,201,'2',112),(166,27,32,182,'2',112),(167,27,32,183,'1',113),(168,27,32,184,'1',113),(169,27,32,185,'1',113),(170,27,32,186,'1',113),(171,27,32,187,'1',113),(172,27,32,188,'2',113),(173,27,32,189,'2',113),(174,27,32,190,'2',113),(175,27,32,191,'2',113),(176,27,32,192,'2',113),(177,27,32,193,'1',114),(178,27,32,194,'1',114),(179,27,32,195,'1',114),(180,27,32,196,'1',114),(181,27,32,197,'1',114),(182,27,32,198,'2',114),(183,27,32,199,'2',114),(184,27,32,115,'2',110),(185,27,32,175,'1',112),(186,27,33,199,'2',95),(187,25,26,109,'1',109),(188,25,26,202,'1',109),(189,25,26,203,'1',109),(190,25,26,204,'1',109),(191,25,26,52,'1',109),(192,25,26,206,'1',109),(193,25,26,90,'2',109),(194,25,26,210,'2',109),(195,25,26,211,'2',109),(196,25,26,212,'2',109),(197,25,26,214,'2',109),(198,25,26,215,'2',109),(199,25,26,216,'1',108),(200,25,26,217,'1',108),(201,25,26,219,'1',108),(202,25,26,220,'1',108),(203,25,26,221,'1',108),(204,25,26,223,'1',108),(205,25,26,225,'2',108),(206,25,26,226,'2',108),(207,25,26,228,'2',108),(208,25,26,229,'2',108),(209,25,26,231,'2',108),(210,25,26,232,'2',108),(211,25,26,234,'1',107),(212,25,26,235,'1',107),(213,25,26,236,'1',107),(214,25,26,237,'1',107),(215,25,26,238,'1',107),(216,25,26,239,'1',107),(217,26,28,205,'1',128),(218,26,28,52,'1',128),(219,25,26,240,'2',107),(220,26,28,207,'1',128),(221,25,26,196,'2',107),(222,26,28,204,'1',128),(223,25,26,243,'2',107),(224,26,28,208,'1',128),(225,25,26,244,'2',107),(226,25,26,246,'2',107),(227,25,26,248,'2',107),(228,25,26,249,'1',106),(229,26,28,288,'1',128),(230,25,26,250,'1',106),(231,25,26,252,'1',106),(232,25,26,254,'1',106),(233,25,26,255,'1',106),(234,25,26,257,'1',106),(235,25,26,258,'2',106),(236,26,28,209,'1',128),(237,25,26,198,'2',106),(238,25,26,199,'2',106),(239,26,28,213,'2',128),(241,26,28,212,'2',128),(242,26,28,218,'2',128),(243,26,28,222,'2',128),(244,26,28,224,'2',128),(246,27,35,90,'2',82),(247,26,28,230,'1',129),(248,26,28,227,'1',129),(249,26,28,267,'1',129),(250,26,28,241,'1',129),(251,26,28,242,'1',129),(252,26,28,212,'1',129),(253,26,28,251,'1',129),(254,26,28,253,'2',129),(255,26,28,256,'2',129),(256,26,28,259,'2',129),(257,26,28,261,'2',129),(258,26,28,262,'2',129),(259,26,28,263,'2',129),(260,26,28,264,'2',129),(261,26,28,265,'1',130),(262,26,28,266,'1',130),(263,26,28,267,'1',130),(264,26,28,268,'1',130),(265,26,28,269,'1',130),(266,26,28,156,'1',130),(267,26,28,251,'1',130),(268,26,28,161,'2',130),(269,26,28,270,'2',130),(270,26,28,271,'2',130),(271,26,28,272,'2',130),(272,26,28,273,'2',130),(273,26,28,274,'2',130),(274,26,28,275,'1',131),(275,26,28,276,'1',131),(276,26,28,277,'1',131),(277,26,28,278,'1',131),(278,26,28,279,'1',131),(279,26,28,280,'1',131),(280,26,28,281,'1',131),(281,26,28,287,'2',131),(282,26,28,286,'2',131),(283,26,28,285,'2',131),(284,26,28,279,'2',131),(285,26,28,284,'2',131),(286,26,28,283,'2',131),(287,26,28,282,'2',131);
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

-- Dump completed on 2026-04-27  7:41:01



