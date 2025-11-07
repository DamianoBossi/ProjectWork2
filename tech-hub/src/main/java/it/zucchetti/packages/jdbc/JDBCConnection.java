package it.zucchetti.packages.jdbc;

public class JDBCConnection { //temporaneo, dobbiamo fare un file env in modo che ognuno possa avere la sua configurazione della JDBC
    public static final String JDBC_DRIVER = "com.microsoft.sqlserver.jdbc.SQLServerDriver";
    public static final String CONNECTION_STRING = "jdbc:sqlserver://localhost:1433;databaseName=AdventureWorks;encrypted=false;trustServerCertificate=true;integratedSecurity=true;"; 
    public static final String USER = "";
    public static final String PASSWORD = "";
}