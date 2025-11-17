package it.zucchetti.packages.servlet.sessionsManagement;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.Date;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import it.zucchetti.packages.jdbc.JDBCConnection;

//da sistemare la sicurezza?

public class Registration extends HttpServlet {
    
    private static String errorMessage = "";

    private static boolean emailFormatValidation(String email) {
        if (email == null || !email.matches("^[\\w.-]+@[\\w.-]+(\\.[A-Za-z]{2,})+$")) {
            errorMessage += "Email non valida. ";
            return false;
        }
        return true;
    }

    private static boolean passwordFormatValidation(String password) {
        if (password == null || !password.matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$")) {
            errorMessage += "Password non valida. ";
            return false;
        }
        return true;
    }

    private static boolean firstNameFormatValidation(String firstName) {
        if (firstName == null || !firstName.matches("^[A-Za-zÀ-ÿ -]{2,}$")) {
            errorMessage += "Nome non valido. ";
            return false;
        }
        return true;
    }

    private static boolean lastNameFormatValidation(String lastName) {
        if (lastName == null || !lastName.matches("^[A-Za-zÀ-ÿ' -]{2,}$")) {
            errorMessage += "Cognome non valido. ";
            return false;
        }
        return true;
    }

    private static boolean birthdateFormatValidation(String birthdate) {
        if (birthdate == null || !birthdate.matches("^\\d{4}-\\d{2}-\\d{2}$")) {
            errorMessage += "Data di nascita non valida. ";
            return false;
        }
        return true;
    }

    private static boolean addressFormatValidation(String address) {
        if (address == null || address.matches("(?i)^(Via|Viale|Vicolo|P\\.za|Piazza|Corso|Largo|L\\.go|Strada|S\\.da)\\s+[\\p{L}0-9 .-']+(?:,)?\\s*\\d+\\p{L}?$")) {
            errorMessage += "Indirizzo non valido. ";
            return false;
        }
        return true;
    }

    private static boolean cityIdValidation(int id) {
        if (id <= 0) {
            errorMessage += "Città non valida. ";
            return false;
        }
        return true;
    }

    private static boolean regionIdValidation(int id) {
        if (id <= 0) {
            errorMessage += "Regione non valida. ";
            return false;
        }
        return true;
    }

    private static boolean countryIdValidation(int id) {
        if (id <= 0) {
            errorMessage += "Paese non valido. ";
            return false;
        }
        return true;
    }

    private static boolean registrationValidation(String email, String password, String firstName, String lastName, String birthdate, String address, 
            int cityid, int regionid, int countryid) {
        errorMessage = "";

        boolean validEmail = emailFormatValidation(email);
        boolean validPassword = passwordFormatValidation(password);
        boolean validFirstName = firstNameFormatValidation(firstName);
        boolean validLastName = lastNameFormatValidation(lastName);
        boolean validBirthdate = birthdateFormatValidation(birthdate);
        boolean validAddress = addressFormatValidation(address);
        boolean validCityId = cityIdValidation(cityid);
        boolean validRegionId = regionIdValidation(regionid);
        boolean validId = countryIdValidation(countryid);

        return validEmail && validPassword && validFirstName && validLastName && validBirthdate && validAddress && validCityId && validRegionId && validId;
    }

    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        BufferedReader bodyReader = request.getReader();
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = bodyReader.readLine()) != null) {
            sb.append(line);
        }
        String jsonString = sb.toString();

        JsonObject obj = JsonParser.parseString(jsonString).getAsJsonObject();

        int roleid = 1;
        String email = obj.has("email") ? obj.get("email").getAsString() : null;
        String password = obj.has("password") ? obj.get("password").getAsString() : null;
        String firstName = obj.has("firstName") ? obj.get("firstName").getAsString() : null;
        String lastName = obj.has("lastName") ? obj.get("lastName").getAsString() : null;
        String birthdate = obj.has("birthdate") ? obj.get("birthdate").getAsString() : null;
        String address = obj.has("address") ? obj.get("address").getAsString() : null;

        int cityid = obj.has("city") ? obj.get("city").getAsInt() : 0;
        int regionid = obj.has("region") ? obj.get("region").getAsInt() : 0;
        int countryid = obj.has("country") ? obj.get("country").getAsInt() : 0;

        float latitude = 0; //TODO
        float longitude = 0; //TODO
        String cvFilePath = ""; //TODO

        int[] userSkills;

        if (obj.has("skills")) {
            JsonArray skillsArray = obj.getAsJsonArray("skills");

            userSkills = new int[skillsArray.size()];

            for (int i = 0; i < skillsArray.size(); i++) {
                userSkills[i] = skillsArray.get(i).getAsInt();
            }
        } else {
            userSkills = new int[0];
        }

        String updateDat = (new Date(System.currentTimeMillis())).toString();
        
        PrintWriter out = response.getWriter();

        if (!registrationValidation(email, password, firstName, lastName, birthdate, address, cityid, regionid, countryid)) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"success\": false, \"message\": \" Errore: " + errorMessage + "\"}");
            return;
        }

        HttpSession oldSession = request.getSession(false);
        if (oldSession != null) {
            oldSession.invalidate();
        }

        Connection connection = null;
        Statement statement = null;

        try {
            Class.forName(JDBCConnection.JDBC_DRIVER);

            connection = DriverManager.getConnection(JDBCConnection.CONNECTION_STRING, JDBCConnection.USER,
                    JDBCConnection.PASSWORD);

            String insertion = "INSERT INTO USERS (ROLEID, EMAIL, PASSWORD, FIRSTNAME, LASTNAME, BIRTHDATE, ADDRESS, CITYID, REGIONID, COUNTRYID, LATITUDE," +
                    " LONGITUDE, CVFILEPATH, UPDATEDAT) VALUES ('" + roleid + "', '" + email + "', '" + password + "', '" + firstName + "', '" + 
                    lastName + "', '" + birthdate + "', '" + address + "', '" + cityid + "', '" + regionid + "', '" + countryid + "', '" + latitude + "', '" + 
                    longitude + "', '" + cvFilePath + "', '" + updateDat + "')"; 
            
            statement = connection.createStatement();
            int rowsInserted = statement.executeUpdate(insertion);

            if (rowsInserted == 0) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write("{\"success\": false, \"message\": \"Errore: Registrazione non riuscita.\"}");
            } 
            else if (rowsInserted > 1) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write("{\"success\": false, \"message\": \"Errore: Registrazione non riuscita per motivi sconosciuti.\"}");
            } 
            else {
                String userIdQuery = "SELECT USERID FROM USERS WHERE EMAIL = '" + email + "'";
                ResultSet resultSet = statement.executeQuery(userIdQuery);
                int userId;
                if (resultSet.next()) {
                    userId = resultSet.getInt("USERID");
                    resultSet.close();
                }
                else {
                    resultSet.close();
                    response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                    out.write("{\"success\": false, \"message\": \"Errore: impossibile recuperare l'ID utente dopo la registrazione.\"}");
                    return;
                }
            
                for (int skillId : userSkills) {
                    String skillInsertion = "INSERT INTO USERSKILLS (USERID, SKILLID) VALUES ('" + userId + "', '" + skillId + "')";
                    statement.executeUpdate(skillInsertion);
                }   

                HttpSession session = request.getSession(true);

                session.setAttribute("username", email); 
                session.setAttribute("role", "user");
                session.setMaxInactiveInterval(30*60); //30 minuti

                String jsessionidCookie = "JSESSIONID=" + session.getId() + "; Path=/tech-hub" + "; HttpOnly;"; //da sistemare se lo modifico nella Servlet di Login
                
                response.setHeader("Set-Cookie", jsessionidCookie);

                response.setStatus(HttpServletResponse.SC_CREATED);
                out.write("{\"success\": true, \"message\": \"Registrazione effettuata.\"}");
            }
        } catch (ClassNotFoundException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"success\": false, \"message\": \"Errore: driver JDBC non trovato.\"}");
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"success\": false, \"message\": \"Errore: errore SQL.\"}");
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"success\": false, \"message\": \"Errore: errore inaspettato.\"}");
        } finally {
            try {
                if (statement != null)
                    statement.close();
                if (connection != null)
                    connection.close();
            } catch (SQLException e) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write("{\"success\": false, \"message\": \"Errore: errore durante la chiusura delle risorse.\"}");
            }
        }
    }
}
