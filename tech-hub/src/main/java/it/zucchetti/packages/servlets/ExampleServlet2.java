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

//@WebServlet("/servlets/ExampleServlet2")
public class ExampleServlet2 extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("text/plain");

        Connection connection = null;
        Statement statement = null;
        ResultSet resultSet = null;

        PrintWriter out = response.getWriter();

        try {
            Class.forName(JDBCConnection.JDBC_DRIVER);
    
            connection = DriverManager.getConnection(JDBCConnection.CONNECTION_STRING , JDBCConnection.USER, JDBCConnection.PASSWORD);
    
            statement = connection.createStatement();
    
            resultSet = statement.executeQuery("SELECT PersonID, PersonName FROM Person");

            while (resultSet.next()) {
                int pid = resultSet.getInt("PersonID");
                String pname = resultSet.getString("PersonName");
                out.println("PersonID: " + pid + ", PersonName: " + pname);
            }
        } catch (ClassNotFoundException e) {
            out.println("Errore: driver JDBC non trovato.");
            e.printStackTrace(out);
        } catch (SQLException e) {
            out.println("Errore SQL:");
            e.printStackTrace(out);
        } catch (Exception e) {
            out.println("Errore inaspettato:");
            e.printStackTrace(out);
        }
        finally {
            try {
                if (resultSet != null) resultSet.close();
                if (statement != null) statement.close();
                if (connection != null) connection.close();
            } catch (SQLException e) {
                out.println("Errore durante la chiusura delle risorse:");
                e.printStackTrace(out);
            }
        }
    }
    
}
