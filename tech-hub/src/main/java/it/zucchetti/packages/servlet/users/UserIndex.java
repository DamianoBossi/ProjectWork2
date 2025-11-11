package it.zucchetti.packages.servlet.users;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
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

@WebServlet("/servlet/users") 
public class UserIndex extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("text/plain");

        Connection connection = null;
        Statement statement = null;
        ResultSet resultSet = null;

        PrintWriter out = response.getWriter();

        try {
            Class.forName(JDBCConnection.JDBC_DRIVER);

            connection = DriverManager.getConnection(JDBCConnection.CONNECTION_STRING, JDBCConnection.USER,
                    JDBCConnection.PASSWORD);

            statement = connection.createStatement();

            resultSet = statement.executeQuery("SELECT * FROM Users");

            while (resultSet.next()) {
                int userId = resultSet.getInt("userid");
                String firstName = resultSet.getString("firstName");
                out.println("userId: " + userId + ", firstName: " + firstName);
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
        } finally {
            try {
                if (resultSet != null)
                    resultSet.close();
                if (statement != null)
                    statement.close();
                if (connection != null)
                    connection.close();
            } catch (SQLException e) {
                out.println("Errore durante la chiusura delle risorse:");
                e.printStackTrace(out);
            }
        }
    }

}
