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
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@WebServlet("/servlet/jobopenings/create")
public class JobOpeningCreate extends HttpServlet {

    private String errorMessage = "";

    private boolean jobOpeningValidation(String title, String description, Double ralFrom, Double ralTo, Boolean isOpen,
            Integer empTypeId, Integer workSchedId, Integer cityId, String closingDate) {
        
        boolean isValid = true;
        errorMessage = "";
        
        if (title == null || title.isEmpty()) {
            errorMessage += "Il campo del titolo non deve essere vuoto. ";
            isValid = false;
        }
        if (description != null && description.length() > 10000) {
            errorMessage += "Il campo della descrizione non deve superare i 1000 caratteri. ";
            isValid = false;
        }
        if (ralFrom == null && ralTo != null) {
            errorMessage += "Devi compilare entrambi i campi RAL (da) e RAL (a). ";
            isValid = false;
        }
        if (ralFrom != null && ralTo == null) {
            errorMessage += "Devi compilare entrambi i campi RAL (da) e RAL (a). ";
            isValid = false;
        }
        if (ralFrom != null && ralFrom < 0) {
            errorMessage += "Il campo RAL (da) non deve essere negativo. ";
            isValid = false;
        }
        if (ralTo != null && ralTo < 0) {
            errorMessage += "Il campo RAL (a) non deve essere negativo.  ";
            isValid = false;
        }
        if (ralFrom != null && ralTo != null && ralFrom > ralTo) {
            errorMessage += "Il campo RAL (da) non deve essere maggiore di RAL (a). ";
            isValid = false;
        }
        if (isOpen == null) {
            errorMessage += "Il campo dello stato non deve essere vuoto.  ";
            isValid = false;
        }
        if (empTypeId == null) {
            errorMessage += "Il campo del contratto non deve essere vuoto. ";
            isValid = false;
        }
        if (workSchedId == null) {
            errorMessage += "Il campo orario di lavoro non deve essere vuoto.  ";
            isValid = false;
        }
        if (cityId == null) {
            errorMessage += "Il campo della sede non deve essere vuoto.  ";
            isValid = false;
        }
        if (closingDate == null || closingDate.isEmpty()) {
            errorMessage += "Il campo della data di chiusura non deve essere vuoto.  ";
            isValid = false;
        }
        if (closingDate != null && !closingDate.matches("^\\d{4}-\\d{2}-\\d{2}$")) {
            errorMessage += "Il campo della data di chiusura deve essere nel formato YYYY-MM-DD.  ";
            isValid = false;
        }                   
        if (closingDate != null && closingDate.matches("^\\d{4}-\\d{2}-\\d{2}$")) {
            String[] dateParts = closingDate.split("-");
            int year = Integer.parseInt(dateParts[0]);
            int month = Integer.parseInt(dateParts[1]);
            int day = Integer.parseInt(dateParts[2]);

            if (month < 1 || month > 12 || day < 1 || day > 31) {
                errorMessage += "Il campo della data di chiusura non rappresenta una data valida.  ";
                isValid = false;
            } else if ((month == 4 || month == 6 || month == 9 || month == 11) && day > 30) {
                errorMessage += "Il campo della data di chiusura non rappresenta una data valida.  ";
                isValid = false;
            }else if (month == 2) {
                boolean isLeapYear = (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0);
                if ((isLeapYear && day > 29) || (!isLeapYear && day > 28)) {
                    errorMessage += "Il campo della data di chiusura non rappresenta una data valida.  ";
                    isValid = false;
                }
            }
            if (!errorMessage.contains("non rappresenta una data valida")) {
                DateTimeFormatter fmt = DateTimeFormatter.ISO_LOCAL_DATE;
                LocalDate close = LocalDate.parse(closingDate, fmt);
                LocalDate today = LocalDate.now();

                if (close.isBefore(today) || close.isEqual(today)) {
                    errorMessage += "Il campo della data di chiusura non deve essere una data passata o la data odierna.";
                    isValid = false;
                }
            }
            
        }


        return isValid;
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json; charset=UTF-8");
        response.setCharacterEncoding("UTF-8");

        PrintWriter out = response.getWriter();

        HttpSession currentSession = request.getSession(false);
        if (currentSession == null || currentSession.getAttribute("username") == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            out.write("{\"success\": false, \"message\": \"utente non autenticato.\"}");
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
            out.write("{\"success\": false, \"message\": \"driver JDBC non trovato.\"}");
            return;
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"success\": false, \"message\": \"errore SQL nella connessione al DB.\"}");
            try {
                if (connection != null)
                    connection.close();
            } catch (SQLException e2) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write(
                        "{\"success\": false, \"message\": \"errore SQL nella connessione al DB e errore durante la chiusura delle risorse.\"}");
            }
            return;
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"success\": false, \"message\": \"errore inaspettato nella connessione al DB.\"}");
            try {
                if (statement != null)
                    statement.close();
                if (connection != null)
                    connection.close();
            } catch (SQLException e2) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write(
                        "{\"success\": false, \"message\": \"errore inaspettato nella connessione al DB e errore durante la chiusura delle risorse.\"}");
            }
            return;
        }

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

        String title = obj.has("title") && !obj.get("title").isJsonNull() ? (obj.get("title").getAsString()).trim() : null;
        String description = obj.has("description") && !obj.get("description").isJsonNull()
                ? (obj.get("description").getAsString()).trim()
                : "";
        // uso di Double (wrapper di double)
        Double ralFrom = obj.has("ralFrom") && !obj.get("ralFrom").isJsonNull() ? obj.get("ralFrom").getAsDouble()
                : null;
        Double ralTo = obj.has("ralTo") && !obj.get("ralTo").isJsonNull() ? obj.get("ralTo").getAsDouble() : null;
        // uso di Boolean (wrapper di boolean)
        Boolean isOpen = obj.has("isOpen") && !obj.get("isOpen").isJsonNull() ? obj.get("isOpen").getAsBoolean() : null;
                                                                                                                         
        Integer empTypeId = obj.has("empTypeId") && !obj.get("empTypeId").isJsonNull() ? obj.get("empTypeId").getAsInt()
                : null;
        Integer workSchedId = obj.has("workSchedId") && !obj.get("workSchedId").isJsonNull()
                ? obj.get("workSchedId").getAsInt()
                : null;
        Integer cityId = obj.has("cityId") && !obj.get("cityId").isJsonNull() ? obj.get("cityId").getAsInt() : null;

        Double latitude = (double) 0;
        Double longitude = (double) 0;

        String updatedAt = (new Date(System.currentTimeMillis())).toString();

        String closingDate = obj.has("closingDate") && !obj.get("closingDate").isJsonNull()
                ? (obj.get("closingDate").getAsString()).trim()
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

        errorMessage = "";
        if (!jobOpeningValidation(title, description, ralFrom, ralTo, isOpen, empTypeId, workSchedId, cityId, closingDate)) {
            try {
                if (statement != null)
                    statement.close();
                if (connection != null)
                    connection.close();
            } catch (SQLException e2) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write("{\"success\": false, \"message\": \"" + errorMessage +
                "errore durante la chiusura delle risorse.\"}");
                return;
            }
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"success\": false, \"message\": \" " + errorMessage + "\"}");
            return;
        }

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
                        "{\"success\": false, \"message\": \"Inserimento della posizione lavorativa nel db non riuscito.\"}");
                try {
                    if (statement != null)
                        statement.close();
                    if (connection != null)
                        connection.close();
                } catch (SQLException e2) {
                    response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                    out.write(
                            "{\"success\": false, \"message\": \"Inserimento della posizione lavorativa nel db non riuscito e errore durante la chiusura delle risorse.\"}");
                }
                return;
            } else if (rowsInserted > 1) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write(
                        "{\"success\": false, \"message\": \"Inserimento della posizione lavorativa nel db non riuscito per motivi sconosciuti.\"}");
                try {
                    if (statement != null)
                        statement.close();
                    if (connection != null)
                        connection.close();
                } catch (SQLException e2) {
                    response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                    out.write(
                            "{\"success\": false, \"message\": \"Inserimento della posizione lavorativa nel db non riuscito per motivi sconosciuti e errore durante la chiusura delle risorse.\"}");
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
                        "{\"success\": false, \"message\": \"errore SQL nell'inserimento della posizione lavorativa nel db e errore durante la chiusura delle risorse.\"}");
            }
            return;
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write(
                    "{\"success\": false, \"message\": \"errore inaspettato nell'inserimento della posizione lavorativa nel db.\"}");
            try {
                if (statement != null)
                    statement.close();
                if (connection != null)
                    connection.close();
            } catch (SQLException e2) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write(
                        "{\"success\": false, \"message\": \"errore inaspettato nell'inserimento della posizione lavorativa nel db e errore durante la chiusura delle risorse.\"}");
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
                            "{\"success\": false, \"message\": \"errore durante la chiusura delle risorse dopo aver recuperato correttamente l'ID della posizione lavorativa .\"}");
                    return;
                }
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write(
                        "{\"success\": false, \"message\": \"impossibile recuperare l'ID della posizione lavorativa dopo la registrazione.\"}");
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
                            "{\"success\": false, \"message\": \"impossibile recuperare l'ID della posizione lavorativa dopo la registrazione e errore durante la chiusura delle risorse.\"}");
                }
                return;
            }
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write(
                    "{\"success\": false, \"message\": \"errore SQL nel recuperare l'ID della posizione lavorativa.\"}");
            try {
                if (statement != null)
                    statement.close();
                if (connection != null)
                    connection.close();
            } catch (SQLException e2) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write(
                        "{\"success\": false, \"message\": \"errore SQL nel recuperare l'ID della posizione lavorativa e errore durante la chiusura delle risorse.\"}");
            }
            return;
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write(
                    "{\"success\": false, \"message\": \"errore inaspettato nel recuperare l'ID della posizione lavorativa.\"}");
            try {
                if (statement != null)
                    statement.close();
                if (connection != null)
                    connection.close();
            } catch (SQLException e2) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write(
                        "{\"success\": false, \"message\": \"errore inaspettato nel recuperare l'ID della posizione lavorativa e errore durante la chiusura delle risorse.\"}");
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
                    "{\"success\": false, \"message\": \"errore SQL nell'inserimento delle skill della posizione lavorativa nel db.\"}");
            try {
                if (statement != null)
                    statement.close();
                if (connection != null)
                    connection.close();
            } catch (SQLException e2) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write(
                        "{\"success\": false, \"message\": \"errore SQL nell'inserimento delle skill della posizione lavorativa nel db e errore durante la chiusura delle risorse.\"}");
            }
            return;
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write(
                    "{\"success\": false, \"message\": \"errore inaspettato nell'inserimento delle skill della posizione lavorativa nel db.\"}");
            try {
                if (statement != null)
                    statement.close();
                if (connection != null)
                    connection.close();
            } catch (SQLException e2) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write(
                        "{\"success\": false, \"message\": \"errore inaspettato nell'inserimento delle skill della posizione lavorativa nel db e errore durante la chiusura delle risorse.\"}");
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
            out.write("{\"success\": false, \"message\": \"errore durante la chiusura delle risorse.\"}");
            return;
        }

        response.setStatus(HttpServletResponse.SC_CREATED);
        out.write("{\"success\": true, \"message\": \"Posizione lavorativa correttamente inserita nel db.\"}");

        return;

    }
}
