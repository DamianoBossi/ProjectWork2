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
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

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

            response.setStatus(HttpServletResponse.SC_OK);
            String jsonResponse = "{\"success\": true, \"message\": \"Servlet correttamente eseguita\", \"data\": {";
            while (resultSet.next()) {
                int userId = resultSet.getInt("userid");
                String firstName = resultSet.getString("firstName");
                jsonResponse += "{\"userId\": " + userId + ", \"firstName\": \"" + firstName + "\"},";
            }
            jsonResponse = jsonResponse.substring(0, jsonResponse.length() - 1); //rimuovo ultima virgola
            jsonResponse += "}}";
            out.write(jsonResponse);
        } catch (ClassNotFoundException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"success\": false, \"message\": \"Errore: driver JDBC non trovato.\"}");
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"success\": false, \"message\": \"Errore: errore SQL.\"}");
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"success\": false, \"message\": \"Errore: errore inaspettato.\"}");
        } finally {
            try {
                if (resultSet != null)
                    resultSet.close();
                if (statement != null)
                    statement.close();
                if (connection != null)
                    connection.close();
            } catch (SQLException e) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write("{\"success\": false, \"message\": \"Errore: errore durante la chiusura delle risorse.\"}");
            }
        }
    }

}
