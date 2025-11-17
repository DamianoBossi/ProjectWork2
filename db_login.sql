/*
ALTER LOGIN [sa] ENABLE;
GO
ALTER LOGIN [sa] WITH PASSWORD = 'Admin!123';
*/

--entra con sa
/*USE master; --USE AdventureWorks oppure pw2
DROP LOGIN TechHub;
DROP USER TechHub;*/
USE master;
CREATE LOGIN TechHub WITH PASSWORD = 'Segretone123',
CHECK_POLICY = ON;
USE pw2;
CREATE USER TechHub FOR LOGIN TechHub;
ALTER ROLE db_datareader ADD MEMBER TechHub;
ALTER ROLE db_datawriter ADD MEMBER TechHub;
-- opzionale:
ALTER USER TechHub WITH DEFAULT_SCHEMA = dbo; --per chiamare le tabelle senza dover scrivere dbo.

--remapping dell'user TechHub in pw2 dopo il backup
/*USE pw2;
GO
ALTER USER TechHub WITH LOGIN = TechHub;
GO*/
