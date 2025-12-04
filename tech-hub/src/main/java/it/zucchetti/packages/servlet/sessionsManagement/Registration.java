package it.zucchetti.packages.servlet.sessionsManagement;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.Date;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Base64;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import it.zucchetti.packages.jdbc.JDBCConnection;
import it.zucchetti.packages.security.PasswordUtils;

/* 
-------------------------------------------------------------------------------------------------------------------------------------------------
https://chatgpt.com/share/691b4d12-477c-8012-9e11-933c8b257239 <- discussione riguardo ad aggiustamenti di sta servlet
-------------------------------------------------------------------------------------------------------------------------------------------------
*/

//da sistemare la sicurezza?

@WebServlet("/servlet/registration")
public class Registration extends HttpServlet {

    private static String errorMessage = "";
    
    private static boolean registrationValidation(String email, String password, String firstName, String lastName,
            String birthdate, String address,
            int cityid, int regionid, int countryid) {
        errorMessage = "";
        boolean isValid = true;

        if (!email.matches("^[A-Za-z0-9._-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
            errorMessage += "Email non valida. ";
            isValid = false;
        }

        
        String[] dateParts = birthdate.split("-");
        int year = Integer.parseInt(dateParts[0]);
        int month = Integer.parseInt(dateParts[1]);
        int day = Integer.parseInt(dateParts[2]);

        if (month < 1 || month > 12 || day < 1 || day > 31) {
            errorMessage += "Il campo della data di nascita non rappresenta una data valida.  ";
            isValid = false;
        } else if ((month == 4 || month == 6 || month == 9 || month == 11) && day > 30) {
            errorMessage += "Il campo della data di nascita non rappresenta una data valida.  ";
            isValid = false;
        } else if (month == 2) {
            boolean isLeapYear = (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0);
            if ((isLeapYear && day > 29) || (!isLeapYear && day > 28)) {
                errorMessage += "Il campo della data di nascita non rappresenta una data valida.  ";
                isValid = false;
            }
        } 
        if (!errorMessage.contains("non rappresenta una data valida")) {
            DateTimeFormatter fmt = DateTimeFormatter.ISO_LOCAL_DATE;
            LocalDate birthD = LocalDate.parse(birthdate, fmt);
            LocalDate today = LocalDate.now();
            LocalDate eighteenYearsAgo = today.minusYears(18);

            if (birthD.isAfter(today)) {
                errorMessage += "Il campo della data di nascita non deve essere una data futura. ";
                isValid = false;
            }else if (birthD.isAfter(eighteenYearsAgo)) {
                errorMessage += "Devi essere maggiorenne per registrarti. ";
                isValid = false;
            }
        }

        return isValid;
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        PrintWriter out = response.getWriter();
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

        int roleId = 1;
        String email = obj.has("email") ? obj.get("email").getAsString() : null;
        String password = obj.has("password") ? obj.get("password").getAsString() : null;
        String firstName = obj.has("firstName") ? obj.get("firstName").getAsString() : null;
        String lastName = obj.has("lastName") ? obj.get("lastName").getAsString() : null;
        String birthdate = obj.has("birthDate") ? obj.get("birthDate").getAsString() : null;
        String address = obj.has("address") ? obj.get("address").getAsString() : null;

        int cityId = (obj.has("cityId") && !obj.get("cityId").isJsonNull())
                ? obj.get("cityId").getAsInt()
                : 0;
        int regionId = (obj.has("regionId") && !obj.get("regionId").isJsonNull())
                ? obj.get("regionId").getAsInt()
                : 0;
        int countryId = (obj.has("countryId") && !obj.get("countryId").isJsonNull())
                ? obj.get("countryId").getAsInt()
                : 0;

        float latitude = 0f;
        float longitude = 0f;

        // path del file CV da salvare nel DB
        String cvFilePathDB = null;

        // Recupero stringa Base64 del CV
        String cvBase64 = (obj.has("cv") && !obj.get("cv").isJsonNull()) ? obj.get("cv").getAsString() : null;

        // Gestione Salvataggio File CV
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
                String fileName = email.replaceAll("[^a-zA-Z0-9]", "_") + "_" + System.currentTimeMillis() + ".pdf";
                String fullPath = uploadPath + File.separator + fileName;

                try (FileOutputStream fos = new FileOutputStream(fullPath)) {
                    fos.write(cvBytes);
                }

                // Questo è il path che salviamo nel DB (relativo alla cartella target del
                // Tomcat)
                cvFilePathDB = "/tech-hub/curriculum/" + fileName;

            } catch (IllegalArgumentException e) {
                System.err.println("Errore decodifica Base64: " + e.getMessage());
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.write("{\"success\": false, \"message\": \"Errore nel formato del file CV.\"}");
                return;
            } catch (IOException e) {
                System.err.println("Errore salvataggio file: " + e.getMessage());
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write("{\"success\": false, \"message\": \"Errore nel salvataggio del file CV.\"}");
                return;
            }
        }

        errorMessage = "";

        // validazione parametri
        
        if (!registrationValidation(email, password, firstName, lastName, birthdate,
                address, cityId, regionId, countryId)) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"success\": false, \"message\": \"" + errorMessage +
            "\"}");
            try {
                if (statement != null)
                    statement.close();
                if (connection != null)
                    connection.close();
            } catch (SQLException e2) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write("{\"success\": false, \"message\": \"" + errorMessage +
                "errore durante la chiusura delle risorse.\"}");
            }
            return;
        }

        int[] userSkills = null;
        if (obj.has("skills")) {
            JsonArray skillsArray = obj.getAsJsonArray("skills");

            userSkills = new int[skillsArray.size()];

            for (int i = 0; i < skillsArray.size(); i++) {
                userSkills[i] = skillsArray.get(i).getAsInt();
            }
        } else {
            userSkills = new int[0];
        }

        String updatedAt = (new Date(System.currentTimeMillis())).toString();

        // se c'è una vecchia sessione la invalido
        HttpSession oldSession = request.getSession(false);
        if (oldSession != null) {
            oldSession.invalidate();
        }

        try {
            // Hash della password prima di salvarla
            String hashedPassword = PasswordUtils.hashPassword(password);

            // inserimento utente nel db
            String insertion = "INSERT INTO USERS (ROLEID, EMAIL, PASSWORD, FIRSTNAME, LASTNAME, BIRTHDATE, ADDRESS, " +
                   "CITYID, REGIONID, COUNTRYID, LATITUDE, LONGITUDE, CVFILEPATH, UPDATEDAT) " +
                   "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

            PreparedStatement ps = connection.prepareStatement(insertion);

            ps.setInt(1, roleId);
            ps.setString(2, email);
            ps.setString(3, hashedPassword);
            ps.setString(4, firstName);
            ps.setString(5, lastName);
            ps.setString(6, birthdate);
            ps.setString(7, address);
            ps.setInt(8, cityId);
            ps.setInt(9, regionId);
            ps.setInt(10, countryId);
            ps.setFloat(11, latitude);
            ps.setFloat(12, longitude);
            ps.setString(13, cvFilePathDB);
            ps.setString(14, updatedAt);

            int rowsInserted = ps.executeUpdate();

            if (rowsInserted == 0) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write(
                        "{\"success\": false, \"message\": \"Inserimento dell'utente nel db non riuscito.\"}");
                try {
                    if (statement != null)
                        statement.close();
                    if (connection != null)
                        connection.close();
                } catch (SQLException e2) {
                    response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                    out.write(
                            "{\"success\": false, \"message\": \"Inserimento dell'utente nel db non riuscito e errore durante la chiusura delle risorse.\"}");
                }
                return;
            } else if (rowsInserted > 1) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write(
                        "{\"success\": false, \"message\": \"Inserimento dell'utente nel db non riuscito per motivi sconosciuti.\"}");
                try {
                    if (statement != null)
                        statement.close();
                    if (connection != null)
                        connection.close();
                } catch (SQLException e2) {
                    response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                    out.write(
                            "{\"success\": false, \"message\": \"Inserimento dell'utente nel db non riuscito per motivi sconosciuti e errore durante la chiusura delle risorse.\"}");
                }
                return;
            }
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"success\": false, \"message\": \"Esiste gia un utente con questa email!\"}");
            try {
                if (statement != null)
                    statement.close();
                if (connection != null)
                    connection.close();
            } catch (SQLException e2) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write(
                        "{\"success\": false, \"message\": \"errore SQL nell'inserimento dell'utente nel db e errore durante la chiusura delle risorse.\"}");
            }
            return;
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write(
                    "{\"success\": false, \"message\": \"errore inaspettato nell'inserimento dell'utente nel db.\"}");
            try {
                if (statement != null)
                    statement.close();
                if (connection != null)
                    connection.close();
            } catch (SQLException e2) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write(
                        "{\"success\": false, \"message\": \"errore inaspettato nell'inserimento dell'utente nel db e errore durante la chiusura delle risorse.\"}");
            }
            return;
        }

        int userId = 0;
        try {
            // prelevo l'id dell'utente inseito
            String userIdQuery = "SELECT USERID FROM USERS WHERE EMAIL = '" + email + "'";
            ResultSet resultSet = statement.executeQuery(userIdQuery);
            if (resultSet.next()) {
                userId = resultSet.getInt("USERID");
                try {
                    if (resultSet != null)
                        resultSet.close();
                } catch (SQLException e) {
                    response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                    out.write(
                            "{\"success\": false, \"message\": \"errore durante la chiusura delle risorse dopo aver recuperato correttamente l'ID utente.\"}");
                    return;
                }
            } else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write(
                        "{\"success\": false, \"message\": \"impossibile recuperare l'ID utente dopo la registrazione.\"}");
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
                            "{\"success\": false, \"message\": \"impossibile recuperare l'ID utente dopo la registrazione e errore durante la chiusura delle risorse.\"}");
                }
                return;
            }
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"success\": false, \"message\": \"errore SQL nel recuperare l'ID utente.\"}");
            try {
                if (statement != null)
                    statement.close();
                if (connection != null)
                    connection.close();
            } catch (SQLException e2) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write(
                        "{\"success\": false, \"message\": \"errore SQL nel recuperare l'ID utente e errore durante la chiusura delle risorse.\"}");
            }
            return;
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"success\": false, \"message\": \"errore inaspettato nel recuperare l'ID utente.\"}");
            try {
                if (statement != null)
                    statement.close();
                if (connection != null)
                    connection.close();
            } catch (SQLException e2) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write(
                        "{\"success\": false, \"message\": \"errore inaspettato nel recuperare l'ID utente e errore durante la chiusura delle risorse.\"}");
            }
            return;
        }

        try {
            // inserimento skill dell'utente nel db
            String skillInsertion = "";
            for (int skillId : userSkills) {
                skillInsertion = "INSERT INTO USERSSKILLS (USERID, SKILLID) VALUES ('" + userId + "', '" + skillId
                        + "')";
                statement.executeUpdate(skillInsertion);
            }
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write(
                    "{\"success\": false, \"message\": \"errore SQL nell'inserimento delle skill dell'utente nel db.\"}");
            try {
                if (statement != null)
                    statement.close();
                if (connection != null)
                    connection.close();
            } catch (SQLException e2) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write(
                        "{\"success\": false, \"message\": \"errore SQL nell'inserimento delle skill dell'utente nel db e errore durante la chiusura delle risorse.\"}");
            }
            return;
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write(
                    "{\"success\": false, \"message\": \"errore inaspettato nell'inserimento delle skill dell'utente nel db.\"}");
            try {
                if (statement != null)
                    statement.close();
                if (connection != null)
                    connection.close();
            } catch (SQLException e2) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write(
                        "{\"success\": false, \"message\": \"errore inaspettato nell'inserimento delle skill dell'utente nel db e errore durante la chiusura delle risorse.\"}");
            }
            return;
        }

        // creo sessione
        HttpSession session = request.getSession(true);

        // creo il cookie JSESSIONID
        session.setAttribute("username", email);
        session.setAttribute("role", "user");
        session.setMaxInactiveInterval(30 * 60); // 30 minuti

        String jsessionidCookie = "JSESSIONID=" + session.getId() + "; Path=/tech-hub; HttpOnly;"; // da sistemare se lo
                                                                                                   // modifico nella
                                                                                                   // Servlet di Login

        response.setHeader("Set-Cookie", jsessionidCookie);

        response.setStatus(HttpServletResponse.SC_CREATED);
        out.write("{\"success\": true, \"message\": \"Registrazione effettuata.\"}");

        try {
            if (statement != null)
                statement.close();
            if (connection != null)
                connection.close();
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"success\": false, \"message\": \"errore durante la chiusura delle risorse.\"}");
        }

        return;

    }
}
