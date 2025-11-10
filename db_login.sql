/*
ALTER LOGIN [sa] ENABLE;
GO
ALTER LOGIN [sa] WITH PASSWORD = 'Admin!123';
*/ 
--setta nelle proprietà della connessione encrypt=true;trustServerCertificate=true

--entra con sa
/*USE master; --USE AdventureWorks
DROP USER TechHub
DROP LOGIN TechHub;*/
USE master;
CREATE LOGIN TechHub WITH PASSWORD = 'Segretone123',
CHECK_POLICY = ON;
USE AdventureWorks;
CREATE USER TechHub FOR LOGIN TechHub;
ALTER ROLE db_datareader ADD MEMBER TechHub;
ALTER ROLE db_datawriter ADD MEMBER TechHub;
-- opzionale:
ALTER USER TechHub WITH DEFAULT_SCHEMA = dbo; --per chiamare le tabelle senza dover scrivere dbo.
