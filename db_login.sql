/*
ALTER LOGIN [sa] ENABLE;
GO
ALTER LOGIN [sa] WITH PASSWORD = 'Admin!123';
*/ 
--setta nelle proprietà della connessione encrypt=true;trustServerCertificate=true

/*USE master;
/*DROP USER TechHub*/
DROP LOGIN TechHub;*/
CREATE LOGIN TechHub WITH PASSWORD = 'Segretone123',
CHECK_POLICY = ON;
USE Z_glam;
CREATE USER TechHub FOR LOGIN TechHub;
ALTER ROLE db_datareader ADD MEMBER TechHub;
ALTER ROLE db_datawriter ADD MEMBER TechHub;
-- opzionale:
ALTER USER TechHub WITH DEFAULT_SCHEMA = dbo; --per chiamare le tabelle senza dover scrivere dbo.
