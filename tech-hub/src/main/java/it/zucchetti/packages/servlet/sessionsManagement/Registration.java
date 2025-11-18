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
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import it.zucchetti.packages.jdbc.JDBCConnection;

/* 
-------------------------------------------------------------------------------------------------------------------------------------------------
https://chatgpt.com/share/691b4d12-477c-8012-9e11-933c8b257239 <- discussione riguardo ad aggiustamenti di sta servlet
-------------------------------------------------------------------------------------------------------------------------------------------------
*/

//da sistemare la sicurezza?

@WebServlet("/servlet/registration")
public class Registration extends HttpServlet {
    
    private static String errorMessage = ""; //TODO: fixa! non è thread safe!

    private static boolean emailFormatValidation(String email) {
        if (email == null /*|| !email.matches("^[\\w.-]+@[\\w.-]+(\\.[A-Za-z]{2,})+$")*/) {
            errorMessage += "Email non valida. ";
            return false;
        }
        return true;
    }

    private static boolean passwordFormatValidation(String password) {
        if (password == null /*|| !password.matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$")*/) {
            errorMessage += "Password non valida. ";
            return false;
        }
        return true;
    }

    //TODO: riguarda ciò: validazione nome/cognome accettano caratteri non latini? Il regex include À-ÿ che può andar bene, ma attenzione a caratteri combinati; potresti preferire \p{L}

    private static boolean firstNameFormatValidation(String firstName) {
        if (firstName == null /*|| !firstName.matches("^[A-Za-zÀ-ÿ -]{2,}$")*/) {
            errorMessage += "Nome non valido. ";
            return false;
        }
        return true;
    }

    private static boolean lastNameFormatValidation(String lastName) {
        if (lastName == null /*|| !lastName.matches("^[A-Za-zÀ-ÿ' -]{2,}$")*/) {
            errorMessage += "Cognome non valido. ";
            return false;
        }
        return true;
    }

    private static boolean birthdateFormatValidation(String birthdate) {
        if (birthdate == null /*|| !birthdate.matches("^\\d{4}-\\d{2}-\\d{2}$")*/) {
            //TODO: manca la verifica che sia una data valida, sensata
            errorMessage += "Data di nascita non valida. ";
            return false;
        }
        return true;
    }

    private static boolean addressFormatValidation(String address) {
        if (address == null /*|| !address.matches("(?i)^(Via|Viale|Vicolo|P\\.za|Piazza|Corso|Largo|L\\.go|Strada|S\\.da)\\s+[\\p{L}0-9 .-']+(?:,)?\\s*\\d+\\p{L}?$")*/) {
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
        boolean validCountryId = countryIdValidation(countryid);

        return validEmail && validPassword && validFirstName && validLastName && validBirthdate && validAddress && validCityId && validRegionId && validCountryId;
    }
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
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

        int roleId = 1;
        String email = obj.has("email") ? obj.get("email").getAsString() : null;
        String password = obj.has("password") ? obj.get("password").getAsString() : null;
        String firstName = obj.has("firstName") ? obj.get("firstName").getAsString() : null;
        String lastName = obj.has("lastName") ? obj.get("lastName").getAsString() : null;
        String birthdate = obj.has("birthdate") ? obj.get("birthdate").getAsString() : null;
        String address = obj.has("address") ? obj.get("address").getAsString() : null;

        int cityId = obj.has("city") ? obj.get("city").getAsInt() : 0;
        int regionId = obj.has("region") ? obj.get("region").getAsInt() : 0;
        int countryId = obj.has("country") ? obj.get("country").getAsInt() : 0;

        if (!registrationValidation(email, password, firstName, lastName, birthdate, address, cityId, regionId, countryId)) {
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

        /*
        //impostazione di latitude e longitude
        String city = null; 
        String region = null; 
        String country = null;
        try {
            String cityNameQuery = "SELECT NAME FROM CITIES WHERE CITYID = '" + cityId + "'";
            ResultSet resultSet = statement.executeQuery(cityNameQuery);
            
            if (resultSet.next()) {
                city = resultSet.getString("NAME");
                resultSet.close();
            }
            else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write("{\"success\": false, \"message\": \"Errore: impossibile recuperare il nome della città.\"}");
                try {
                    if (resultSet != null)
                        resultSet.close();
                    if (statement != null)
                        statement.close();
                    if (connection != null)
                        connection.close();
                } catch (SQLException e) {
                    response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                    out.write("{\"success\": false, \"message\": \"Errore: impossibile recuperare il nome della città e errore durante la chiusura delle risorse.\"}");
                }
                return;
            }
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"success\": false, \"message\": \"Errore: errore SQL nella Query per ricavare il nome della città.\"}");
            try {
                if (resultSet != null)
                    resultSet.close();
                if (statement != null)
                    statement.close();
                if (connection != null)
                    connection.close();
            } catch (SQLException e2) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write("{\"success\": false, \"message\": \"Errore: errore SQL nella Query per ricavare il nome della città e errore durante la chiusura delle risorse.\"}");
            }
            return;
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"success\": false, \"message\": \"Errore: errore inaspettato nel recuperare il nome della città.\"}");
            try {
                if (resultSet != null)
                    resultSet.close();
                if (statement != null)
                    statement.close();
                if (connection != null)
                    connection.close();
            } catch (SQLException e2) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write("{\"success\": false, \"message\": \"Errore: errore inaspettato nel recuperare il nome della città e errore durante la chiusura delle risorse.\"}");
            }
            return;
        }

        try {
            String regionNameQuery = "SELECT NAME FROM REGIONS WHERE REGIONID = '" + regionId + "'";
            ResultSet resultSet = statement.executeQuery(regionNameQuery);
            
            if (resultSet.next()) {
                region = resultSet.getString("NAME");
                resultSet.close();
            }
            else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write("{\"success\": false, \"message\": \"Errore: impossibile recuperare il nome della regione.\"}");
                try {
                    if (resultSet != null)
                        resultSet.close();
                    if (statement != null)
                        statement.close();
                    if (connection != null)
                        connection.close();
                } catch (SQLException e) {
                    response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                    out.write("{\"success\": false, \"message\": \"Errore: impossibile recuperare il nome della regione e errore durante la chiusura delle risorse.\"}");
                }
                return;
            }
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"success\": false, \"message\": \"Errore: errore SQL nella Query per ricavare il nome della regione.\"}");
            try {
                if (resultSet != null)
                    resultSet.close();
                if (statement != null)
                    statement.close();
                if (connection != null)
                    connection.close();
            } catch (SQLException e2) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write("{\"success\": false, \"message\": \"Errore: errore SQL nella Query per ricavare il nome della regione e errore durante la chiusura delle risorse.\"}");
            }
            return;
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"success\": false, \"message\": \"Errore: errore inaspettato nel recuperare il nome della regione.\"}");
            try {
                if (resultSet != null)
                    resultSet.close();
                if (statement != null)
                    statement.close();
                if (connection != null)
                    connection.close();
            } catch (SQLException e2) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write("{\"success\": false, \"message\": \"Errore: errore inaspettato nel recuperare il nome della regione e errore durante la chiusura delle risorse.\"}");
            }
            return;
        }

        try {
            String countryNameQuery = "SELECT NAME FROM COUNTRIES WHERE COUNTRYID = '" + countryId + "'";
            ResultSet resultSet = statement.executeQuery(countryNameQuery);
            
            if (resultSet.next()) {
                country = resultSet.getString("NAME");
                resultSet.close();
            }
            else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write("{\"success\": false, \"message\": \"Errore: impossibile recuperare il nome del paese.\"}");
                try {
                    if (resultSet != null)
                        resultSet.close();
                    if (statement != null)
                        statement.close();
                    if (connection != null)
                        connection.close();
                } catch (SQLException e) {
                    response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                    out.write("{\"success\": false, \"message\": \"Errore: impossibile recuperare il nome del paese e errore durante la chiusura delle risorse.\"}");
                }
                return;
            }
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"success\": false, \"message\": \"Errore: errore SQL nella Query per ricavare il nome del paese.\"}");
            try {
                if (resultSet != null)
                    resultSet.close();
                if (statement != null)
                    statement.close();
                if (connection != null)
                    connection.close();
            } catch (SQLException e2) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write("{\"success\": false, \"message\": \"Errore: errore SQL nella Query per ricavare il nome del paese e errore durante la chiusura delle risorse.\"}");
            }
            return;
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"success\": false, \"message\": \"Errore: errore inaspettato nel recuperare il nome del paese.\"}");
            try {
                if (resultSet != null)
                    resultSet.close();
                if (statement != null)
                    statement.close();
                if (connection != null)
                    connection.close();
            } catch (SQLException e2) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write("{\"success\": false, \"message\": \"Errore: errore inaspettato nel recuperare il nome del paese e errore durante la chiusura delle risorse.\"}");
            }
            return;
        }

        String fullAddress = address + ", " + city + ", " + region + ", " + country;
        */


        //TODO: meglio double
        float latitude = 0f;
        float longitude = 0f;

        /*
        try {
            String apiKey = "LA_TUA_API_KEY"; // sostituire con la tua API Key
            String encodedAddress = java.net.URLEncoder.encode(fullAddress, "UTF-8");
            String urlStr = "https://maps.googleapis.com/maps/api/geocode/json?address=" + encodedAddress + "&key=" + apiKey;

            java.net.URL url = new java.net.URL(urlStr);
            java.net.HttpURLConnection conn = (java.net.HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");

            BufferedReader reader = new BufferedReader(new java.io.InputStreamReader(conn.getInputStream()));
            StringBuilder responseSb = new StringBuilder();
            String responseLine;
            while ((responseLine = reader.readLine()) != null) {
                responseSb.append(responseLine);
            }
            reader.close();

            String jsonResponse = responseSb.toString();

            JsonObject responseObj = JsonParser.parseString(jsonResponse).getAsJsonObject();
            JsonArray results = responseObj.getAsJsonArray("results");

            if (results.size() > 0) {
                JsonObject location = results.get(0)
                                            .getAsJsonObject()
                                            .getAsJsonObject("geometry")
                                            .getAsJsonObject("location");

                latitude = location.get("lat").getAsFloat();
                longitude = location.get("lng").getAsFloat();
            }
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"success\": false, \"message\": \"Errore: impossibile recuperare le coordinate geografiche.\"}");
            try {
                if (resultSet != null)
                    resultSet.close();
                if (statement != null)
                    statement.close();
                if (connection != null)
                    connection.close();
            } catch (SQLException e2) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write("{\"success\": false, \"message\": \"Errore: impossibile recuperare le coordinate geografiche e errore durante la chiusura delle risorse.\"}");
            }
            return;
        }*/

        //gestione del file curriculum
        /* 
        try {
            //TODO: gestione file del cv 
        } catch () {
            return;
        }
        */
        String cvFilePath = ""; //TODO

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

        //se c'è una vecchia sessione la invalido
        HttpSession oldSession = request.getSession(false);
        if (oldSession != null) {
            oldSession.invalidate();
        }

        try {
            //inserimento utente nel db
            String insertion = "INSERT INTO USERS (ROLEID, EMAIL, PASSWORD, FIRSTNAME, LASTNAME, BIRTHDATE, ADDRESS, CITYID, REGIONID, COUNTRYID, LATITUDE," +
                    " LONGITUDE, CVFILEPATH, UPDATEDAT) VALUES ('" + roleId + "', '" + email + "', '" + password + "', '" + firstName + "', '" + 
                    lastName + "', '" + birthdate + "', '" + address + "', '" + cityId + "', '" + regionId + "', '" + countryId + "', '" + latitude + "', '" + 
                    longitude + "', '" + cvFilePath + "', '" + updatedAt + "')"; 
            
            int rowsInserted = statement.executeUpdate(insertion);

            if (rowsInserted == 0) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write("{\"success\": false, \"message\": \"Errore: Inserimento dell'utente nel db non riuscito.\"}");
                try {
                    if (statement != null)
                        statement.close();
                    if (connection != null)
                        connection.close();
                } catch (SQLException e2) {
                    response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                    out.write("{\"success\": false, \"message\": \"Errore: Inserimento dell'utente nel db non riuscito e errore durante la chiusura delle risorse.\"}");
                }
                return;
            } 
            else if (rowsInserted > 1) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write("{\"success\": false, \"message\": \"Errore: Inserimento dell'utente nel db non riuscito per motivi sconosciuti.\"}");
                try {
                    if (statement != null)
                        statement.close();
                    if (connection != null)
                        connection.close();
                } catch (SQLException e2) {
                    response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                    out.write("{\"success\": false, \"message\": \"Errore: Inserimento dell'utente nel db non riuscito per motivi sconosciuti e errore durante la chiusura delle risorse.\"}");
                }
                return;
            } 
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"success\": false, \"message\": \"Errore: errore SQL nell'inserimento dell'utente nel db.\"}");
            try {
                if (statement != null)
                    statement.close();
                if (connection != null)
                    connection.close();
            } catch (SQLException e2) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write("{\"success\": false, \"message\": \"Errore: errore SQL nell'inserimento dell'utente nel db e errore durante la chiusura delle risorse.\"}");
            }
            return;
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"success\": false, \"message\": \"Errore: errore inaspettato nell'inserimento dell'utente nel db.\"}");
            try {
                if (statement != null)
                    statement.close();
                if (connection != null)
                    connection.close();
            } catch (SQLException e2) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write("{\"success\": false, \"message\": \"Errore: errore inaspettato nell'inserimento dell'utente nel db e errore durante la chiusura delle risorse.\"}");
            }
            return;
        }

        int userId = 0;
        try {
            //prelevo l'id dell'utente inseito
            String userIdQuery = "SELECT USERID FROM USERS WHERE EMAIL = '" + email + "'";
            ResultSet resultSet = statement.executeQuery(userIdQuery);
            if (resultSet.next()) {
                userId = resultSet.getInt("USERID");
                try {
                    if (resultSet != null)
                        resultSet.close();
                } catch (SQLException e) {
                    response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                    out.write("{\"success\": false, \"message\": \"Errore: errore durante la chiusura delle risorse dopo aver recuperato correttamente l'ID utente.\"}");
                    return;
                }
            }
            else {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write("{\"success\": false, \"message\": \"Errore: impossibile recuperare l'ID utente dopo la registrazione.\"}");
                try {
                    if (resultSet != null)
                        resultSet.close();
                    if (statement != null)
                        statement.close();
                    if (connection != null)
                        connection.close();
                } catch (SQLException e) {
                    response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                    out.write("{\"success\": false, \"message\": \"Errore: impossibile recuperare l'ID utente dopo la registrazione e errore durante la chiusura delle risorse.\"}");
                }
                return;
            }
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"success\": false, \"message\": \"Errore: errore SQL nel recuperare l'ID utente.\"}");
            try {
                if (statement != null)
                    statement.close();
                if (connection != null)
                    connection.close();
            } catch (SQLException e2) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write("{\"success\": false, \"message\": \"Errore: errore SQL nel recuperare l'ID utente e errore durante la chiusura delle risorse.\"}");
            }
            return;
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"success\": false, \"message\": \"Errore: errore inaspettato nel recuperare l'ID utente.\"}");
            try {
                if (statement != null)
                    statement.close();
                if (connection != null)
                    connection.close();
            } catch (SQLException e2) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write("{\"success\": false, \"message\": \"Errore: errore inaspettato nel recuperare l'ID utente e errore durante la chiusura delle risorse.\"}");
            }
            return;
        }
            
        try {
            //inserimento skill dell'utente nel db
            String skillInsertion = "";
            for (int skillId : userSkills) {
                skillInsertion = "INSERT INTO USERSSKILLS (USERID, SKILLID) VALUES ('" + userId + "', '" + skillId + "')";
                statement.executeUpdate(skillInsertion);
            }
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"success\": false, \"message\": \"Errore: errore SQL nell'inserimento delle skill dell'utente nel db.\"}");
            try {
                if (statement != null)
                    statement.close();
                if (connection != null)
                    connection.close();
            } catch (SQLException e2) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write("{\"success\": false, \"message\": \"Errore: errore SQL nell'inserimento delle skill dell'utente nel db e errore durante la chiusura delle risorse.\"}");
            }
            return;
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"success\": false, \"message\": \"Errore: errore inaspettato nell'inserimento delle skill dell'utente nel db.\"}"); 
            try {
                if (statement != null)
                    statement.close();
                if (connection != null)
                    connection.close();
            } catch (SQLException e2) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write("{\"success\": false, \"message\": \"Errore: errore inaspettato nell'inserimento delle skill dell'utente nel db e errore durante la chiusura delle risorse.\"}");
            }
            return; 
        }

        //creo sessione
        HttpSession session = request.getSession(true);

        //creo il cookie JSESSIONID 
        session.setAttribute("username", email); 
        session.setAttribute("role", "user");
        session.setMaxInactiveInterval(30*60); //30 minuti

        String jsessionidCookie = "JSESSIONID=" + session.getId() + "; Path=/tech-hub; HttpOnly;"; //da sistemare se lo modifico nella Servlet di Login
        
        response.setHeader("Set-Cookie", jsessionidCookie);

        response.setStatus(HttpServletResponse.SC_CREATED);
        out.write("{\"success\": true, \"message\": \"Registrazione effettuata.\"}");

        //TODO: redirect a pagina principale dell'admin/user (a seconda del caso) o da altre parti...

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
