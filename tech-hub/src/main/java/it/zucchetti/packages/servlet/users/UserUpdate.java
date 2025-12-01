package it.zucchetti.packages.servlet.users;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;

import it.zucchetti.packages.jdbc.JDBCConnection;

import java.sql.Connection;
import java.sql.Date;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@WebServlet("/servlet/users/me/update")
public class UserUpdate extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        Connection connection = null;
        Statement statement = null;
        Statement statement2 = null;
        ResultSet resultSet = null;
        Statement statement3 = null;
        Statement statement4 = null;

        PrintWriter out = response.getWriter();
        Gson gson = new Gson();

        try {
            Class.forName(JDBCConnection.JDBC_DRIVER);

            connection = DriverManager.getConnection(JDBCConnection.CONNECTION_STRING, JDBCConnection.USER,
                    JDBCConnection.PASSWORD);

            statement = connection.createStatement();
            statement2 = connection.createStatement();
            statement3 = connection.createStatement();
            statement4 = connection.createStatement();

            HttpSession currentSession = request.getSession(false);

            //TODO: se non esiste una sessione corrente ritornare apposito errore!

            String username = (String) currentSession.getAttribute("username");

            // recupero parametri dal JSON della richiesta
            BufferedReader bodyReader = request.getReader();
            StringBuilder sb = new StringBuilder();
            String line = null;
            while ((line = bodyReader.readLine()) != null) {
                sb.append(line);
            }
            String jsonString = sb.toString();

            JsonObject obj = JsonParser.parseString(jsonString).getAsJsonObject();

            String firstName = obj.has("firstName") ? obj.get("firstName").getAsString() : null;
            String lastName = obj.has("lastName") ? obj.get("lastName").getAsString() : null;
            String birthDate = obj.has("birthDate") ? obj.get("birthDate").getAsString() : null;
            String countryId = obj.has("countryId") ? obj.get("countryId").getAsString() : null;
            String regionId = obj.has("regionId") ? obj.get("regionId").getAsString() : null;
            String cityId = obj.has("cityId") ? obj.get("cityId").getAsString() : null;
            String address = obj.has("address") ? obj.get("address").getAsString() : null;
            
            String[] userNewSkills = null;
            if (obj.has("skills")) {
                JsonArray skillsArray = obj.getAsJsonArray("skills");

                userNewSkills = new String[skillsArray.size()];

                for (int i = 0; i < skillsArray.size(); i++) {
                    userNewSkills[i] = skillsArray.get(i).getAsString();
                }
            } else {
                userNewSkills = new String[0];
            }

            String updatedAt = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS"));

            //TODO: validazione dei parametri

            //TODO: nelle successive query mettere rollback se anche una sola delle query non va a buon fine!!!

            // Eseguo l'aggiornamento dell'utente
            //TODO: aggiustare query (da problemi in molte casistiche valide)
            statement.executeUpdate("UPDATE USERS SET FIRSTNAME = '"+firstName+"', LASTNAME = '"+lastName+"', BIRTHDATE = '"+birthDate+"', ADDRESS = '"+address+"', "+
                    "CITYID = "+cityId+", REGIONID = "+regionId+", COUNTRYID = "+countryId+", UPDATEDAT = '"+updatedAt+"' WHERE EMAIL = '"+username+"';");
            
            //TODO: estraggo userId dell'utente

            resultSet = statement2.executeQuery("SELECT USERID FROM USERS WHERE EMAIL = '"+username+"';");
            resultSet.next();
            String userId = resultSet.getString("USERID");

            //TODO: delete delle skills da usersskills 
            statement3.executeUpdate("DELETE FROM USERSSKILLS WHERE USERID = "+userId+";");

            //TODO: insert delle skills nuove in usersskills
            for (int i = 0; i < userNewSkills.length; i++) {
                statement4.executeUpdate("INSERT INTO USERSSKILLS (USERID, SKILLID) VALUES ("+userId+", "+userNewSkills[i]+");");
            }

            // Costruisco il JSON con Gson
            JsonObject jsonResponse = new JsonObject();
            jsonResponse.addProperty("success", true);
            jsonResponse.addProperty("message", "Servlet correttamente eseguita");

            response.setStatus(HttpServletResponse.SC_OK);
            out.write(gson.toJson(jsonResponse));

        } catch (ClassNotFoundException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write(gson.toJson(errorResponse("Errore: driver JDBC non trovato:" + e.getMessage())));
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write(gson.toJson(errorResponse("Errore: errore SQL: " + e.getMessage())));
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write(gson.toJson(errorResponse("Errore: errore inaspettato: " + e.getMessage())));
        } finally {
            try {
                if (statement != null)
                    statement.close();
                if (statement2 != null)
                    statement2.close();
                if (statement3 != null)
                    statement3.close();
                if (statement4 != null)
                    statement4.close();
                if (resultSet != null)
                    resultSet.close();
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
