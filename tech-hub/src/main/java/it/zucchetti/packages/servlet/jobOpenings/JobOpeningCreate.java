package it.zucchetti.packages.servlet.jobOpenings;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

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
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

/*TODO: cambiare tipi delle var e degli oggetti che pongo uguali alle cose che mi arrivano dal json di richiesta (x controllo se null o meno, se va bene o meno) (magari metterli 
tutti a String in modo che posso verificare che siano null e in modo che il frontend possa mandarmeli null)*/

//TODO: ricontrollare la parte del recuperare il jobOpeningId e l'inserimento delle skill (anche se sembrano funzionare)

@WebServlet("/servlet/jobopenings/create")
public class JobOpeningCreate extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        PrintWriter out = response.getWriter();

        HttpSession currentSession = request.getSession(false);
        if (currentSession == null || currentSession.getAttribute("username") == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            out.write("{\"success\": false, \"message\": \"Errore: utente non autenticato.\"}");
            return;
        }

        Connection connection = null;
        Statement statement = null;

        // connessione al db
        try {
            Class.forName(JDBCConnection.JDBC_DRIVER);
            connection = DriverManager.getConnection(JDBCConnection.CONNECTION_STRING, JDBCConnection.USER,
                    JDBCConnection.PASSWORD);
            statement = connection.createStatement();
        } catch (ClassNotFoundException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"success\": false, \"message\": \"Errore: driver JDBC non trovato.\"}");
            return;
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"success\": false, \"message\": \"Errore: errore SQL nella connessione al DB.\"}");
            try {
                if (connection != null)
                    connection.close();
            } catch (SQLException e2) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write(
                        "{\"success\": false, \"message\": \"Errore: errore SQL nella connessione al DB e errore durante la chiusura delle risorse.\"}");
            }
            return;
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"success\": false, \"message\": \"Errore: errore inaspettato nella connessione al DB.\"}");
            try {
                if (statement != null)
                    statement.close();
                if (connection != null)
                    connection.close();
            } catch (SQLException e2) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write(
                        "{\"success\": false, \"message\": \"Errore: errore inaspettato nella connessione al DB e errore durante la chiusura delle risorse.\"}");
            }
            return;
        }

        // recupero parametri dal JSON della richiesta
        BufferedReader bodyReader = request.getReader();
        StringBuilder sb = new StringBuilder();
        String line = null;
        while ((line = bodyReader.readLine()) != null) {
            sb.append(line);
        }
        String jsonString = sb.toString();

        JsonObject obj = JsonParser.parseString(jsonString).getAsJsonObject();

        String title = obj.has("title") && !obj.get("title").isJsonNull() ? obj.get("title").getAsString() : null;
        String description = obj.has("description") && !obj.get("description").isJsonNull()
                ? obj.get("description").getAsString()
                : "";
        // uso di Double (wrapper di double)
        Double ralFrom = obj.has("ralFrom") && !obj.get("ralFrom").isJsonNull() ? obj.get("ralFrom").getAsDouble()
                : null;
        Double ralTo = obj.has("ralTo") && !obj.get("ralTo").isJsonNull() ? obj.get("ralTo").getAsDouble() : null;
        // uso di Boolean (wrapper di boolean)
        Boolean isOpen = obj.has("isOpen") && !obj.get("isOpen").isJsonNull() ? obj.get("isOpen").getAsBoolean() : null; // mi
                                                                                                                         // aspetto
                                                                                                                         // che
                                                                                                                         // la
                                                                                                                         // richiesta
                                                                                                                         // qui
                                                                                                                         // mi
                                                                                                                         // invi
                                                                                                                         // un
                                                                                                                         // booleano
                                                                                                                         // true/false
        Integer empTypeId = obj.has("empTypeId") && !obj.get("empTypeId").isJsonNull() ? obj.get("empTypeId").getAsInt()
                : null;
        Integer workSchedId = obj.has("workSchedId") && !obj.get("workSchedId").isJsonNull()
                ? obj.get("workSchedId").getAsInt()
                : null;
        Integer cityId = obj.has("cityId") && !obj.get("cityId").isJsonNull() ? obj.get("cityId").getAsInt() : null;

        // TODO: calcolo latitude e longitude
        Double latitude = (double) 0;
        Double longitude = (double) 0;

        String updatedAt = (new Date(System.currentTimeMillis())).toString();

        String closingDate = obj.has("closingDate") && !obj.get("closingDate").isJsonNull()
                ? obj.get("closingDate").getAsString()
                : null;

        int[] jobOpeningSkills = null;
        if (obj.has("skills")) {
            JsonArray skillsArray = obj.getAsJsonArray("skills");

            jobOpeningSkills = new int[skillsArray.size()];

            for (int i = 0; i < skillsArray.size(); i++) {
                jobOpeningSkills[i] = skillsArray.get(i).getAsInt();
            }
        } else {
            jobOpeningSkills = new int[0];
        }

        /*
         * if (!jobOpeningValidation(title, description, ralFrom, ralTo, empTypeId,
         * workSchedId, cityId, closingDate)) {
         * response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
         * out.write("{\"success\": false, \"message\": \" Errore: " + errorMessage +
         * "\"}");
         * try {
         * if (statement != null)
         * statement.close();
         * if (connection != null)
         * connection.close();
         * } catch (SQLException e2) {
         * response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
         * out.write("{\"success\": false, \"message\": \"Errore: " + errorMessage +
         * "errore durante la chiusura delle risorse.\"}");
         * }
         * return;
         * }
         */

        try {
            // inserimento jobOpening nel db con PreparedStatement
            String insertion = "INSERT INTO JOBOPENINGS (TITLE, DESCRIPTION, RALFROM, RALTO, ISOPEN, EMPTYPEID, WORKSCHEDID, CITYID, LATITUDE, LONGITUDE, UPDATEDAT, CLOSINGDATE) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CONVERT(DATETIME2, ?), CONVERT(DATE, ?))";

            PreparedStatement pstmt = connection.prepareStatement(insertion);
            pstmt.setString(1, title);
            pstmt.setString(2, description);
            pstmt.setObject(3, ralFrom);
            pstmt.setObject(4, ralTo);
            pstmt.setInt(5, isOpen ? 1 : 0);
            pstmt.setInt(6, empTypeId);
            pstmt.setInt(7, workSchedId);
            pstmt.setInt(8, cityId);
            pstmt.setDouble(9, latitude);
            pstmt.setDouble(10, longitude);
            pstmt.setString(11, updatedAt);
            pstmt.setString(12, closingDate);

            int rowsInserted = pstmt.executeUpdate();
            pstmt.close();

            if (rowsInserted == 0) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write(
                        "{\"success\": false, \"message\": \"Errore: Inserimento della posizione lavorativa nel db non riuscito.\"}");
                try {
                    if (statement != null)
                        statement.close();
                    if (connection != null)
                        connection.close();
                } catch (SQLException e2) {
                    response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                    out.write(
                            "{\"success\": false, \"message\": \"Errore: Inserimento della posizione lavorativa nel db non riuscito e errore durante la chiusura delle risorse.\"}");
                }
                return;
            } else if (rowsInserted > 1) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write(
                        "{\"success\": false, \"message\": \"Errore: Inserimento della posizione lavorativa nel db non riuscito per motivi sconosciuti.\"}");
                try {
                    if (statement != null)
                        statement.close();
                    if (connection != null)
                        connection.close();
                } catch (SQLException e2) {
                    response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                    out.write(
                            "{\"success\": false, \"message\": \"Errore: Inserimento della posizione lavorativa nel db non riuscito per motivi sconosciuti e errore durante la chiusura delle risorse.\"}");
                }
                return;
            }
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            String errorDetail = e.getMessage() != null ? e.getMessage() : "Errore sconosciuto";
            out.write(
                    "{\"success\": false, \"message\": \"Errore SQL: " + errorDetail + "\"}");
            e.printStackTrace();
            try {
                if (statement != null)
                    statement.close();
                if (connection != null)
                    connection.close();
            } catch (SQLException e2) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write(
                        "{\"success\": false, \"message\": \"Errore: errore SQL nell'inserimento della posizione lavorativa nel db e errore durante la chiusura delle risorse.\"}");
            }
            return;
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write(
                    "{\"success\": false, \"message\": \"Errore: errore inaspettato nell'inserimento della posizione lavorativa nel db.\"}");
            try {
                if (statement != null)
                    statement.close();
                if (connection != null)
                    connection.close();
            } catch (SQLException e2) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write(
                        "{\"success\": false, \"message\": \"Errore: errore inaspettato nell'inserimento della posizione lavorativa nel db e errore durante la chiusura delle risorse.\"}");
            }
            return;
        }

        int jobOpeningId = 0;
        try {
            // prelevo l'id della posizione lavorativa inserita
            String jobOpeningIdQuery = "SELECT JOBOPENINGID FROM JOBOPENINGS WHERE JOBOPENINGID = (SELECT MAX(JOBOPENINGID) FROM JOBOPENINGS)";
            ResultSet resultSet = statement.executeQuery(jobOpeningIdQuery);
            if (resultSet.next()) {
                jobOpeningId = resultSet.getInt("JOBOPENINGID");
                try {
                    if (resultSet != null)
                        resultSet.close();
                } catch (SQLException e) {
                    response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                    out.write(
                            "{\"success\": false, \"message\": \"Errore: errore durante la chiusura delle risorse dopo aver recuperato correttamente l'ID della posizione lavorativa .\"}");
                    return;
                }
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write(
                        "{\"success\": false, \"message\": \"Errore: impossibile recuperare l'ID della posizione lavorativa dopo la registrazione.\"}");
                try {
                    if (resultSet != null)
                        resultSet.close();
                    if (statement != null)
                        statement.close();
                    if (connection != null)
                        connection.close();
                } catch (SQLException e) {
                    response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                    out.write(
                            "{\"success\": false, \"message\": \"Errore: impossibile recuperare l'ID della posizione lavorativa dopo la registrazione e errore durante la chiusura delle risorse.\"}");
                }
                return;
            }
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write(
                    "{\"success\": false, \"message\": \"Errore: errore SQL nel recuperare l'ID della posizione lavorativa.\"}");
            try {
                if (statement != null)
                    statement.close();
                if (connection != null)
                    connection.close();
            } catch (SQLException e2) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write(
                        "{\"success\": false, \"message\": \"Errore: errore SQL nel recuperare l'ID della posizione lavorativa e errore durante la chiusura delle risorse.\"}");
            }
            return;
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write(
                    "{\"success\": false, \"message\": \"Errore: errore inaspettato nel recuperare l'ID della posizione lavorativa.\"}");
            try {
                if (statement != null)
                    statement.close();
                if (connection != null)
                    connection.close();
            } catch (SQLException e2) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write(
                        "{\"success\": false, \"message\": \"Errore: errore inaspettato nel recuperare l'ID della posizione lavorativa e errore durante la chiusura delle risorse.\"}");
            }
            return;
        }

        try {
            // inserimento skill della posizione lavorativa nel db
            String skillInsertion = "";
            for (int skillId : jobOpeningSkills) {
                skillInsertion = "INSERT INTO JOBOPENINGSSKILLS (JOBOPENINGID, SKILLID) VALUES (" + jobOpeningId + ", "
                        + skillId + ")";
                statement.executeUpdate(skillInsertion);
            }
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write(
                    "{\"success\": false, \"message\": \"Errore: errore SQL nell'inserimento delle skill della posizione lavorativa nel db.\"}");
            try {
                if (statement != null)
                    statement.close();
                if (connection != null)
                    connection.close();
            } catch (SQLException e2) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write(
                        "{\"success\": false, \"message\": \"Errore: errore SQL nell'inserimento delle skill della posizione lavorativa nel db e errore durante la chiusura delle risorse.\"}");
            }
            return;
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write(
                    "{\"success\": false, \"message\": \"Errore: errore inaspettato nell'inserimento delle skill della posizione lavorativa nel db.\"}");
            try {
                if (statement != null)
                    statement.close();
                if (connection != null)
                    connection.close();
            } catch (SQLException e2) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write(
                        "{\"success\": false, \"message\": \"Errore: errore inaspettato nell'inserimento delle skill della posizione lavorativa nel db e errore durante la chiusura delle risorse.\"}");
            }
            return;
        }

        try {
            if (statement != null)
                statement.close();
            if (connection != null)
                connection.close();
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"success\": false, \"message\": \"Errore: errore durante la chiusura delle risorse.\"}");
            return;
        }

        response.setStatus(HttpServletResponse.SC_CREATED);
        out.write("{\"success\": true, \"message\": \"Posizione lavorativa correttamente inserita nel db.\"}");

        return;

    }
}
