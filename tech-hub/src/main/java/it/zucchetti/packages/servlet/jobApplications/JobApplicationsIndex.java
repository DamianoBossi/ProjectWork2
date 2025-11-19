package it.zucchetti.packages.servlet.jobApplications;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

import java.io.IOException;
import java.io.PrintWriter;

import it.zucchetti.packages.jdbc.JDBCConnection;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

//TODO: X CLASSIFICA METTERE FILTRO SU JOBOPENING!

@WebServlet("/servlet/jobapplications")
public class JobApplicationsIndex extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

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

            String requestedJobOpeningId = request.getParameter("jobOpeningId");

            String userIdParam = request.getParameter("userId");

            String query = "SELECT * FROM APPLICATIONS";

            if (userIdParam != null) {
                query += " WHERE USERID = '" + userIdParam + "'";
            }

            if (requestedJobOpeningId != null) {
                query += " WHERE JOBOPENINGID = '" + requestedJobOpeningId + "'";
            }

            //TODO: se inseriti entrambi i parametri allora ritorno errore e altre possibili condizioni

            resultSet = statement.executeQuery(query);
            
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
}