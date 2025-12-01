package it.zucchetti.packages.servlet.jobApplications;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

import it.zucchetti.packages.jdbc.JDBCConnection;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

@WebServlet("/servlet/jobapplications/*")
public class JobApplicationShow extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String pathInfo = request.getPathInfo(); // es. "/1"
        String id = (pathInfo != null && pathInfo.length() > 1) ? pathInfo.substring(1) : null;

        Connection connection = null;
        Statement statement = null;
        ResultSet resultSet = null;

        PrintWriter out = response.getWriter();
        Gson gson = new Gson();

        try {
            Class.forName(JDBCConnection.JDBC_DRIVER);

            connection = DriverManager.getConnection(JDBCConnection.CONNECTION_STRING, JDBCConnection.USER,
                    JDBCConnection.PASSWORD);

            statement = connection.createStatement();

            resultSet = statement.executeQuery("SELECT * FROM APPLICATIONS WHERE APPLICATIONID = " + id);

            response.setStatus(HttpServletResponse.SC_OK);

            JsonObject jsonResponse = new JsonObject();
            jsonResponse.addProperty("success", true);
            jsonResponse.addProperty("message", "Servlet correttamente eseguita");

            JsonArray dataArray = new JsonArray();
            while (resultSet.next()) {
                JsonObject applicationObj = new JsonObject();
                int applicationId = resultSet.getInt("APPLICATIONID");
                if (resultSet.wasNull()) {
                    applicationObj.add("applicationId", null);
                } else {
                    applicationObj.addProperty("applicationId", applicationId);
                }

                int userId = resultSet.getInt("USERID");
                if (resultSet.wasNull()) {
                    applicationObj.add("userId", null);
                } else {
                    applicationObj.addProperty("userId", userId);
                }

                int jobOpeningId = resultSet.getInt("JOBOPENINGID");
                if (resultSet.wasNull()) {
                    applicationObj.add("jobOpeningId", null);
                } else {
                    applicationObj.addProperty("jobOpeningId", jobOpeningId);
                }

                double totalScore = resultSet.getDouble("TOTALSCORE");
                if (resultSet.wasNull()) {
                    applicationObj.add("totalScore", null);
                } else {
                    applicationObj.addProperty("totalScore", totalScore);
                }
                applicationObj.addProperty("createdAt", resultSet.getString("CREATEDAT"));
                applicationObj.addProperty("letter", resultSet.getString("LETTER"));
                dataArray.add(applicationObj);
            }

            jsonResponse.add("data", dataArray);

            response.setStatus(HttpServletResponse.SC_OK);
            out.write(gson.toJson(jsonResponse));

        } catch (ClassNotFoundException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write(gson.toJson(errorResponse("Errore: driver JDBC non trovato.")));
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write(gson.toJson(errorResponse("Errore: errore SQL.")));
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write(gson.toJson(errorResponse("Errore: errore inaspettato.")));
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
                out.write(gson.toJson(errorResponse("Errore: errore durante la chiusura delle risorse.")));
            }
        }
    }

    private JsonObject errorResponse(String message) {
        JsonObject errorJson = new JsonObject();
        errorJson.addProperty("success", false);
        errorJson.addProperty("message", message);
        return errorJson;
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String pathInfo = request.getPathInfo();
        String id = (pathInfo != null && pathInfo.length() > 1) ? pathInfo.substring(1) : null;

        PrintWriter out = response.getWriter();
        Gson gson = new Gson();

        if (id == null) {
            out.write(gson.toJson(errorResponse("Parametro ID mancante")));
            return;
        }

        try (Connection connection = DriverManager.getConnection(JDBCConnection.CONNECTION_STRING,
                JDBCConnection.USER, JDBCConnection.PASSWORD);
                Statement statement = connection.createStatement()) {

            Class.forName(JDBCConnection.JDBC_DRIVER);

            int applicationsDeleted = statement.executeUpdate("DELETE FROM APPLICATIONS WHERE APPLICATIONID = " + id);

            JsonObject jsonResponse = new JsonObject();
            jsonResponse.addProperty("success", applicationsDeleted > 0);
            jsonResponse.addProperty("message", applicationsDeleted > 0
                    ? "Annuncio eliminato con successo."
                    : "Nessuna candidatura trovata con questo ID.");
            jsonResponse.addProperty("applicationsDeleted", applicationsDeleted);

            response.setStatus(HttpServletResponse.SC_OK);
            out.write(gson.toJson(jsonResponse));

        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write(gson.toJson(errorResponse("Errore: " + e.getMessage())));
        }
    }

}
