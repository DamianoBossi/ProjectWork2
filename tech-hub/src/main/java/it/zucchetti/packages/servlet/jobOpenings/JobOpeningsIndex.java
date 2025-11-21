package it.zucchetti.packages.servlet.jobOpenings;

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

@WebServlet("/servlet/jobopenings")
public class JobOpeningsIndex extends HttpServlet {

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

            resultSet = statement.executeQuery("SELECT * FROM jobopenings");

            // Costruisco il JSON con Gson
            JsonObject jsonResponse = new JsonObject();
            jsonResponse.addProperty("success", true);
            jsonResponse.addProperty("message", "Servlet correttamente eseguita");

            JsonArray dataArray = new JsonArray();
            while (resultSet.next()) {
                JsonObject skillObj = new JsonObject();
                skillObj.addProperty("jobOpeningId", resultSet.getInt("jobOpeningId"));
                skillObj.addProperty("title", resultSet.getString("title"));
                skillObj.addProperty("description", resultSet.getString("description"));
                skillObj.addProperty("ralFrom", resultSet.getString("ralFrom"));
                skillObj.addProperty("ralTo", resultSet.getString("ralTo"));
                skillObj.addProperty("isOpen", resultSet.getString("isOpen"));
                skillObj.addProperty("empTypeId", resultSet.getInt("empTypeId"));
                skillObj.addProperty("workSchedId", resultSet.getString("workSchedId"));
                skillObj.addProperty("cityId", resultSet.getString("cityId"));
                skillObj.addProperty("latitude", resultSet.getString("latitude"));
                skillObj.addProperty("longitude", resultSet.getString("longitude"));
                skillObj.addProperty("closingDate", resultSet.getString("closingDate"));
                dataArray.add(skillObj);
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
