package it.zucchetti.packages.servlet.jobOpenings;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;

import it.zucchetti.packages.jdbc.JDBCConnection;

import java.sql.Connection;
import java.sql.Date;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;

@WebServlet("/servlet/jobopenings/create")
public class JobOpeningCreate extends HttpServlet {

    private static String errorMessage = ""; //TODO: fixa! non è thread safe!

    private static boolean jobOpeningValidation(String title, String description, Double ralFrom, Double ralTo, int empTypeId, int cityId, String closingDate) {
        return true; //TODO
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        HttpSession currentSession = request.getSession(false); //TODO: se è null ritornare errore
        //TODO: validazione: (VEDI TODO.txt) + verificare che l'utente sia admin (è solo l'admin che "crea" le posizioni lavorative)

        PrintWriter out = response.getWriter();
        Connection connection = null;
        Statement statement = null;        
        
        //connessione al db
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
                out.write("{\"success\": false, \"message\": \"Errore: errore SQL nella connessione al DB e errore durante la chiusura delle risorse.\"}");
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
                out.write("{\"success\": false, \"message\": \"Errore: errore inaspettato nella connessione al DB e errore durante la chiusura delle risorse.\"}");
            }
            return;
        }

        //recupero parametri dal JSON della richiesta
        BufferedReader bodyReader = request.getReader();
        StringBuilder sb = new StringBuilder();
        String line = null;
        while ((line = bodyReader.readLine()) != null) {
            sb.append(line);
        }
        String jsonString = sb.toString();

        JsonObject obj = JsonParser.parseString(jsonString).getAsJsonObject();

        String title = obj.has("title") ? obj.get("title").getAsString() : null;
        String description = obj.has("description") ? obj.get("description").getAsString() : null;
        Double ralFrom = obj.has("ralFrom") ? obj.get("ralFrom").getAsDouble() : null;
        Double ralTo = obj.has("ralTo") ? obj.get("ralTo").getAsDouble() : null;
        boolean isOpen = obj.has("isOpen") ? obj.get("isOpen").getAsBoolean() : false; //mi aspetto che la richiesta qui mi invi un booleano true/false
        int empTypeId = obj.has("empTypeId") ? obj.get("empTypeId").getAsInt() : 0;
        int cityId = obj.has("cityId") ? obj.get("cityId").getAsInt() : 0;
        
        //TODO: calcolo latitude e longitude
        double latitude = 0;
        double longitude = 0;

        String updatedAt = (new Date(System.currentTimeMillis())).toString();

        String closingDate = obj.has("closingDate") ? obj.get("closingDate").getAsString() : null;

        if (!jobOpeningValidation(title, description, ralFrom, ralTo, empTypeId, cityId, closingDate)) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"success\": false, \"message\": \" Errore: " + errorMessage + "\"}");
            try {
                if (statement != null)
                    statement.close();
                if (connection != null)
                    connection.close();
            } catch (SQLException e2) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write("{\"success\": false, \"message\": \"Errore: " + errorMessage + "errore durante la chiusura delle risorse.\"}");
            }
            return;
        } 

        try {
            //inserimento jobOpening nel db
            String insertion = "INSERT INTO JOBOPENINGS (TITLE, DESCRIPTION, RALFROM, RALTO, ISOPEN, EMPTYPEID, CITYID, LATITUDE, LONGITUDE, UPDATEDAT, CLOSINGDATE) VALUES ('" + 
                title + "', '" + description + "', '" + ralFrom + "', '" + ralTo + "', '" + isOpen + "', '" + empTypeId + "', '" + cityId + "', '" + latitude + "', '" + longitude + "', '" + updatedAt + "', '" + closingDate + "')"; 
            
            int rowsInserted = statement.executeUpdate(insertion);

            if (rowsInserted == 0) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write("{\"success\": false, \"message\": \"Errore: Inserimento della posizione lavorativa nel db non riuscito.\"}");
                try {
                    if (statement != null)
                        statement.close();
                    if (connection != null)
                        connection.close();
                } catch (SQLException e2) {
                    response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                    out.write("{\"success\": false, \"message\": \"Errore: Inserimento della posizione lavorativa nel db non riuscito e errore durante la chiusura delle risorse.\"}");
                }
                return;
            } 
            else if (rowsInserted > 1) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write("{\"success\": false, \"message\": \"Errore: Inserimento della posizione lavorativa nel db non riuscito per motivi sconosciuti.\"}");
                try {
                    if (statement != null)
                        statement.close();
                    if (connection != null)
                        connection.close();
                } catch (SQLException e2) {
                    response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                    out.write("{\"success\": false, \"message\": \"Errore: Inserimento della posizione lavorativa nel db non riuscito per motivi sconosciuti e errore durante la chiusura delle risorse.\"}");
                }
                return;
            } 
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"success\": false, \"message\": \"Errore: errore SQL nell'inserimento della posizione lavorativa nel db.\"}");
            try {
                if (statement != null)
                    statement.close();
                if (connection != null)
                    connection.close();
            } catch (SQLException e2) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                    out.write("{\"success\": false, \"message\": \"Errore: errore SQL nell'inserimento della posizione lavorativa nel db e errore durante la chiusura delle risorse.\"}");
            }
            return;
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"success\": false, \"message\": \"Errore: errore inaspettato nell'inserimento della posizione lavorativa nel db.\"}");
            try {
                if (statement != null)
                    statement.close();
                if (connection != null)
                    connection.close();
            } catch (SQLException e2) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                    out.write("{\"success\": false, \"message\": \"Errore: errore inaspettato nell'inserimento della posizione lavorativa nel db e errore durante la chiusura delle risorse.\"}");
            }
            return;
        }

        response.setStatus(HttpServletResponse.SC_CREATED);
        out.write("{\"success\": true, \"message\": \"Posizione lavorativa correttamente inserita nel db.\"}");

        try {
            if (statement != null)
                statement.close();
            if (connection != null)
                connection.close();
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"success\": false, \"message\": \"Errore: errore durante la chiusura delle risorse.\"}");
        }

        return;

    }
}
