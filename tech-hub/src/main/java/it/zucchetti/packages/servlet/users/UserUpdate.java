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
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.PrintWriter;

import it.zucchetti.packages.jdbc.JDBCConnection;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;

@WebServlet("/servlet/users/me/update")
public class UserUpdate extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        Connection connection = null;
        Statement statement0 = null;
        ResultSet resultSet0 = null;
        Statement statement1 = null;
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

            statement0 = connection.createStatement();
            statement1 = connection.createStatement();
            statement2 = connection.createStatement();
            statement3 = connection.createStatement();
            statement4 = connection.createStatement();

            HttpSession currentSession = request.getSession(false);

            // TODO: se non esiste una sessione corrente ritornare apposito errore!

            String username = (String) currentSession.getAttribute("username");

            // recupero parametri dal JSON della richiesta
            request.setCharacterEncoding("UTF-8");
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

            // path del file CV da salvare nel DB
            String cvFilePathDB = null; // TODO

            // Recupero stringa Base64 del CV
            String cvBase64 = (obj.has("cv") && !obj.get("cv").isJsonNull()) ? obj.get("cv").getAsString() : null;

            // TODO: validazione dei parametri

            // Gestione Salvataggio File CV e poi delete del cv precedente
            if (cvBase64 != null && !cvBase64.isEmpty()) {
                try {
                    // Se la stringa base64 ha l'header lo rimuovo
                    if (cvBase64.contains(",")) {
                        cvBase64 = cvBase64.split(",")[1];
                    }

                    byte[] cvBytes = Base64.getDecoder().decode(cvBase64);

                    // Controllo che il file sia davvero un PDF
                    if (cvBytes.length < 4
                            || !(cvBytes[0] == '%' && cvBytes[1] == 'P' && cvBytes[2] == 'D' && cvBytes[3] == 'F')) {
                        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                        out.write("{\"success\": false, \"message\": \"Il file caricato non è un PDF valido.\"}");
                        return;
                    }

                    // Cartella di destinazione (NEL TOMCAT, non nella cartella del progetto)
                    String uploadPath = getServletContext().getRealPath("") + File.separator + "curriculum";

                    // creo la cartella se non esiste
                    File uploadDir = new File(uploadPath);
                    if (!uploadDir.exists()) {
                        uploadDir.mkdirs();
                    }

                    // Generiamo un nome file unico per evitare sovrascritture (in sto caso è
                    // email_timestamp.pdf)
                    // Assumiamo sia un PDF, altrimenti bisognerebbe analizzare i primi byte del
                    // file
                    String fileName = username.replaceAll("[^a-zA-Z0-9]", "_") + "_" + System.currentTimeMillis()
                            + ".pdf";
                    String fullPath = uploadPath + File.separator + fileName;

                    try (FileOutputStream fos = new FileOutputStream(fullPath)) {
                        fos.write(cvBytes);
                    }

                    // Questo è il path che salviamo nel DB (relativo alla cartella target del
                    // Tomcat)
                    cvFilePathDB = "/tech-hub/curriculum/" + fileName;

                    // Recupero il path del vecchio file dal DB
                    resultSet0 = statement0
                            .executeQuery("SELECT CVFILEPATH FROM USERS WHERE EMAIL = '" + username + "';");
                    if (resultSet0.next()) {
                        String oldCvPath = resultSet0.getString("CVFILEPATH");
                        if (oldCvPath != null && !oldCvPath.isEmpty()) {
                            String fullOldCvPath = getServletContext().getRealPath("")
                                    + (oldCvPath.replace("/tech-hub/", "")).replace("/", File.separator);
                            // out.println(fullOldCvPath);
                            File oldCvFile = new File(fullOldCvPath);
                            if (oldCvFile.exists()) {
                                oldCvFile.delete();
                            }
                        }
                    }

                } catch (IllegalArgumentException e) {
                    System.err.println("Errore decodifica Base64: " + e.getMessage());
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    out.write("{\"success\": false, \"message\": \"Errore nella decodifica del file CV.\"}");
                    return;
                } catch (IOException e) {
                    System.err.println("Errore scrittura file CV: " + e.getMessage());
                    response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                    out.write("{\"success\": false, \"message\": \"Errore durante la scrittura del file CV.\"}");
                    return;
                } catch (Exception e) {
                    System.err.println("Errore generico gestione file: " + e.getMessage());
                    response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                    out.write("{\"success\": false, \"message\": \"Errore durante la gestione del file CV.\"}");
                    return;
                }

            }

            // TODO: nelle successive query mettere rollback se anche una sola delle query
            // non va a buon fine!!!

            // Eseguo l'aggiornamento dell'utente
            // TODO: aggiustare query (da problemi in molte casistiche valide)
            String query = "UPDATE USERS SET FIRSTNAME = '" + firstName + "', LASTNAME = '" + lastName
                    + "', BIRTHDATE = '" + birthDate + "', ADDRESS = '" + address + "', " +
                    "CITYID = " + cityId + ", REGIONID = " + regionId + ", COUNTRYID = " + countryId + ", UPDATEDAT = '"
                    + updatedAt + "'";

            if (cvFilePathDB != null) {
                query += ", CVFILEPATH = '" + cvFilePathDB + "'";
            }

            query += " WHERE EMAIL = '" + username + "';";
            statement1.executeUpdate(query);

            resultSet = statement2.executeQuery("SELECT USERID FROM USERS WHERE EMAIL = '" + username + "';");
            resultSet.next();
            String userId = resultSet.getString("USERID");

            statement3.executeUpdate("DELETE FROM USERSSKILLS WHERE USERID = " + userId + ";");

            for (int i = 0; i < userNewSkills.length; i++) {
                statement4.executeUpdate(
                        "INSERT INTO USERSSKILLS (USERID, SKILLID) VALUES (" + userId + ", " + userNewSkills[i] + ");");
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
                if (statement0 != null)
                    statement0.close();
                if (resultSet0 != null)
                    resultSet0.close();
                if (statement1 != null)
                    statement1.close();
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
