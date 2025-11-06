package it.zucchetti.packages.servlets;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

import it.zucchetti.packages.jdbc.JDBCConnection;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;


public class ExampleServlet2 extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("text/plain");

        Connection connection = null;
        Statement statement = null;
        ResultSet resultSet = null;

        try {
            Class.forName(JDBCConnection.JDBC_DRIVER);
    
            connection = DriverManager.getConnection(JDBCConnection.CONNECTION_STRING , JDBCConnection.USER, JDBCConnection.PASSWORD);
    
            statement = connection.createStatement();
    
            resultSet = statement.executeQuery("SELECT Nome, Prezzo FROM PRODOTTO");

            PrintWriter out = response.getWriter();
            while (resultSet.next()) {
                String name = resultSet.getString("Nome");
                double price = resultSet.getDouble("Prezzo");
                out.println("Name: " + name + ", Price: " + price);
            }
        } catch (ClassNotFoundException | SQLException e) {}
        finally {
            try {
                if (resultSet != null) resultSet.close();
                if (statement != null) statement.close();
                if (connection != null) connection.close();
            } catch (SQLException ignored) {}
        }
    }

}
