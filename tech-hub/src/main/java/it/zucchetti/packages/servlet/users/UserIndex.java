package it.zucchetti.packages.servlet.users;

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
        Statement statement2 = null;
        ResultSet resultSet2 = null;

        PrintWriter out = response.getWriter();
        Gson gson = new Gson();

        try {
            Class.forName(JDBCConnection.JDBC_DRIVER);

            connection = DriverManager.getConnection(JDBCConnection.CONNECTION_STRING, JDBCConnection.USER,
                    JDBCConnection.PASSWORD);

            statement = connection.createStatement();

            resultSet = statement.executeQuery("SELECT * FROM Users");

            // Costruisco il JSON con Gson
            JsonObject jsonResponse = new JsonObject();
            jsonResponse.addProperty("success", true);
            jsonResponse.addProperty("message", "Servlet correttamente eseguita");

            int currentUserId;
            JsonArray dataArray = new JsonArray();
            JsonArray skillsArray;
            while (resultSet.next()) {
                JsonObject jsonObj = new JsonObject();
                currentUserId = resultSet.getInt("userId");
                jsonObj.addProperty("userId", currentUserId);
                jsonObj.addProperty("roleId", resultSet.getString("roleId"));
                jsonObj.addProperty("email", resultSet.getString("email"));
                jsonObj.addProperty("firstName", resultSet.getString("firstName"));
                jsonObj.addProperty("lastName", resultSet.getString("lastName"));
                jsonObj.addProperty("birthDate", resultSet.getString("birthDate"));
                jsonObj.addProperty("address", resultSet.getString("address"));
                jsonObj.addProperty("cityId", resultSet.getString("cityId"));
                jsonObj.addProperty("regionId", resultSet.getString("regionId"));
                jsonObj.addProperty("countryId", resultSet.getString("countryId"));
                jsonObj.addProperty("latitude", resultSet.getString("latitude"));
                jsonObj.addProperty("longitude", resultSet.getString("longitude"));
                jsonObj.addProperty("cvFilePath", resultSet.getString("cvFilePath"));

                if (statement2 != null)
                    statement2.close();
                if (resultSet2 != null)
                    resultSet2.close();
                statement2 = connection.createStatement();
                resultSet2 = statement2.executeQuery("SELECT * FROM USERSSKILLS WHERE USERID = " + currentUserId);
                
                skillsArray = new JsonArray();
                while (resultSet2.next()) {
                    skillsArray.add(resultSet2.getString("SKILLID"));
                }
                jsonObj.add("skills", skillsArray);

                dataArray.add(jsonObj);
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
                if (resultSet2 != null)
                    resultSet2.close();
                if (statement2 != null)
                    statement2.close();
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
