/*
ALTER LOGIN [sa] ENABLE;
GO
ALTER LOGIN [sa] WITH PASSWORD = 'Admin!123';
*/

--setta encrypt=true;trustServerCertificate=true

/*--entra con sa
USE master; --USE AdventureWorks oppure pw2
DROP USER TechHub;
DROP LOGIN TechHub;*/
USE master;
CREATE LOGIN TechHub WITH PASSWORD = 'Segretone123',
CHECK_POLICY = ON;
USE pw2;
CREATE USER TechHub FOR LOGIN TechHub;
ALTER ROLE db_datareader ADD MEMBER TechHub;
ALTER ROLE db_datawriter ADD MEMBER TechHub;
-- opzionale:
ALTER USER TechHub WITH DEFAULT_SCHEMA = dbo; --per chiamare le tabelle senza dover scrivere dbo.


/*potrebbe essere necessario rimaneggiare i percorsi file
RESTORE HEADERONLY FROM DISK = N'C:\Program Files\Microsoft SQL Server\MSSQL16.MSSQLSERVER\MSSQL\Backup\pw2.bak';
RESTORE FILELISTONLY FROM DISK = N'C:\Program Files\Microsoft SQL Server\MSSQL16.MSSQLSERVER\MSSQL\Backup\pw2.bak';
RESTORE DATABASE pw2
FROM DISK = N'C:\Program Files\Microsoft SQL Server\MSSQL16.MSSQLSERVER\MSSQL\Backup\pw2.bak'
WITH FILE = 1, 
  MOVE N'pw2' TO N'C:\Program Files\Microsoft SQL Server\MSSQL16.MSSQLSERVER\MSSQL\DATA\pw2.mdf',
  MOVE N'pw2_log'  TO N'C:\Program Files\Microsoft SQL Server\MSSQL16.MSSQLSERVER\MSSQL\DATA\pw2_log.ldf',
  RECOVERY;
*/


