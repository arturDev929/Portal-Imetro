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
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `professor`
--

LOCK TABLES `professor` WRITE;
/*!40000 ALTER TABLE `professor` DISABLE KEYS */;
INSERT INTO `professor` VALUES (2,'professor_00000002_foto_1771403961926.jpeg','Artur Macumba Paulo','Masculino','Angolano','Casado(a)','Ndombele Paulo','Senga Macumba Paulo','008555739LA047','2004-04-04','professor_27296899_bi_1769625055916.pdf','Sequele/Bloco 5/Predio 33/Entrada A/101','929277043','929277043','arturpaulo929@gmail.com','4','Doutoramento','2024-09-12','Efetivo','000600000052757230154','A+','Psicopata','928583366',1,'27296898','$2b$10$V19henIdMvDzyKwxsAITZOAkciTSdv2VSN9okJUuSe91qjvZy1jmS','Ativo'),(3,'professor_39902330_foto_1770626410695.jpeg','Nsimba Paula Maniongo Suami','Feminino','Angolano','Solteiro(a)','Samuel Mango Suami','Mônica Maniongo','008649051LA049','2002-05-10','professor_39902330_bi_1770626410696.pdf','Sequele/Bloco 2/Predio 26/Entrada A/201','937260507','937260507','nsimbapaulas@gmail.com','2','Licenciatura','2026-02-09','Estagiário','004000004866226010168','O-','Maluca','928583366',1,'39902330','$2b$10$MVGMAqcB3ErhdmjbS03P4eKSiZNF5EvkVrGemJsyDRjFIPgIfgKmK','Ativo'),(4,'professor_61434104_foto_1771857143904.jpeg','Jose Manuel','Masculino','Cubano','Solteiro','Manuel André','Maria Jose','008649051LA149','2026-02-02','professor_00000004_bi_1771942068599.pdf','Cacuaco','929277044','929277044','manueljose@gmail.com','4','Licenciatura','2026-02-23','Efetivo','004000004866226010168','A+','Alergico a MAnga','928583377',1,'61434100','$2b$10$n0jjKgRWZU.MUeNC3EshyeAxfzaILbEEZE5M2Erlj1QpHBgmvsmgO','Desativado'),(5,'professor_14075701_foto_1771860013494.png','João Carlos Silva','Masculino','Angolana','Casado(a)','António Silva','Maria Silva','007895432LA049','1985-03-15','professor_14075701_bi_1771860013495.pdf','Rua da Paz, 123 - Luanda','923456789','923456789','joao.silva@email.com','12','Mestrado','2015-02-10','Efetivo','AO06 0040 0000 1234 5678 9012 3','0+','Nenhuma','923456789',2,'14075701','$2b$10$K7ijYyhFCSQn6Aw29BVaGe/.TQUnaIX6Hgm1EMRcOZpFTVSFwTqFW','Ativo'),(6,'professor_63770621_foto_1771860579685.png','Ana Paula Fernandes ','Feminino','Angolana','Solteiro(a)','Manuel Fernandes','Teresa Fernandes','008765432LA078','1990-07-22','professor_63770621_bi_1771860579685.pdf','Av. 4 de Fevereiro, 45 - Luanda','934567890','934567890','ana.fernandes@email.com','8','Licenciatura','2018-03-01','Contratado','AO06 0040 0000 2345 6789 0123 4','A+','Nenhuma','923456780',2,'63770621','$2b$10$f/V1C2jP/RgnuwCZ03/M8emE98k2O6hDSEh6KA1EvljSwVXJH5KEW','Ativo'),(7,'professor_83398631_foto_1771860887660.png','Miguel António Costa','Masculino','Angolana','Divorciado(a)','José Costa','Isabel Costa','009876543LA012','1982-11-10','professor_83398631_bi_1771860887661.pdf','Rua do Comércio, 78 - Benguela','945678901','945678901','miguel.costa@email.com','15','Doutoramento','2010-08-05','Efetivo','AO06 0040 0000 3456 7890 1234 5','B+','Hipertensão controlada','934567891',2,'83398631','$2b$10$qCqGb2FFV80N4jx4r3f/TOjvZw9igmeNBSvwZz1uQZuucI/VfGiu2','Ativo'),(8,'professor_15891244_foto_1771861076231.png','Carla Marisa Santos','Feminino','Angolana','Casado(a)','Francisco Santos','Rosa Santos','006543219LA034','1988-09-28','professor_15891244_bi_1771861076232.pdf','Bairro Alvalade, 234 - Luanda','956789012','956789012','carla.santos@email.com','9','Mestrado','2016-04-12','Efetivo','AO06 0040 0000 4567 8901 2345 6','AB-','Asma leve','945678902',2,'15891244','$2b$10$ROh/YWFL16HkwidlEhbsbuPw0alYXunITFUosiPg.huSl2DzL/r9K','Ativo'),(9,'professor_60598906_foto_1771921248451.png','Pedro Miguel Fereeira','Masculino','Angolana','Solteiro(a)','Armando Ferreira','Lúcia Ferreira','005432198LA056','1992-12-03','professor_60598906_bi_1771921248451.pdf','Urbanização Nova Vida, Bloco 3 - Luanda','967890123','967890123','pedro.ferreira@email.com','5','Licenciatura','2019-09-20','Contratado','AO06 0040 0000 5678 9012 3456 7','O-','Nenhuma','956789013',1,'60598906','$2b$10$zKh9BM7MVJ9VospXKrQCD.k8jDYGnPNzt7Zmdsv.8RME23s6tZFR6','Ativo'),(10,'professor_20341261_foto_1771922068136.png','Isabel Maria Gomes','Feminino','Angolana ','Viúvo(a)','Carlos Gomes','Fátima Gomes','  004321987LA067','1975-05-15','professor_20341261_bi_1771922068136.pdf','Rua Direita, 56 - Lubango','978901234','978901234','isabel.gomes@email.com','20','Doutoramento','2000-03-13','Efetivo','AO06 0040 0000 6789 0123 4567 8','A-','Diabetes tipo 2','967890124',2,'20341261','$2b$10$NRGzglphXFYbYfcoylwiheoG97AdMnt9OKcY5Q9uwoWFsU6yINUTq','Ativo'),(11,'professor_90060036_foto_1771922358325.png','Rui Manuel Pinto','Masculino','Angolano','Casado(a)','Joaquim Pinto','Albertina Pinto ','003219876LA078','1980-08-07','professor_90060036_bi_1771922358326.pdf','Bairro Benfica, 321 - Luanda','989012345','989012345','rui.pinto@email.com','14','Mestrado','2012-06-15','Efetivo','AO06 0040 0000 7890 1234 5678 9','B-','Nenhuma','978901235',2,'90060036','$2b$10$Ttp.awnHjfvRAaIIlM5RO.Dp/.lvsnrg.oxgutbi5E35nBE5o7kdu','Ativo'),(12,'professor_68777094_foto_1771922690193.png','Sónia Cristina Lopes','Feminino','Angolana','Solteiro(a)','Fernando Lopes','Helena Lopes','002198765LA089','1995-02-19','professor_68777094_bi_1771922690194.pdf','Talatona, Rua 5 - Luanda','990123456','990123456','sonia.lopes@email.com','3','Licenciatura','2021-01-10','Estagiário','AO06 0040 0000 8901 2345 6789 0','AB+','Alergia a pólen','989012346',2,'68777094','$2b$10$sJo8a7psHNrb6HzGQvx7wOSr9nqYlodbtc7WWVj3nTl9HZpa8grz6','Ativo'),(13,'professor_74318650_foto_1771923013007.png','António José Mendes','Masculino','Angolano','Casado(a)','Alberto Mendes','Celeste Mendes','001987654LA090','1978-06-25','professor_74318650_bi_1771923013008.pdf','Rua dos Combatentes, 90 - Huambo','901234567','901234567','antonio.mendes@email.com','18','Doutoramento','2008-09-01','Efetivo','AO06 0040 0000 9012 3456 7890 1','O+','Nenhuma','990123457',2,'74318650','$2b$10$kjPKEWGWwYD30e5.8ofioexpIjnq1Sz7rmzFnON2gr5AlRPV0NtSm','Ativo'),(14,'professor_17430970_foto_1771923201871.png','Maria do Carmo Andrade','Feminino','Angolana','Solteiro(a)','Paulo Andrade','Luísa Andrade','000876543LA101','1987-11-30','professor_17430970_bi_1771923201872.pdf','Ingombotas, Rua da Missão - Luanda','912345678','912345678','maria.andrade@email.com','10','Mestrado','2014-07-10','Efetivo','AO06 0040 0000 0123 4567 8901 2','A+','Nenhuma','901234568',2,'17430970','$2b$10$3wKuP1zeNDiVVQA1TwyOreo3LKvWIuzoaoTcYQXiIuU9vfgmSIU9S','Ativo');
/*!40000 ALTER TABLE `professor` ENABLE KEYS */;
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
