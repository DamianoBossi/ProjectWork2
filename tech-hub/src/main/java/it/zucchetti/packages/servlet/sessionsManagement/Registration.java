package it.zucchetti.packages.servlet.sessionsManagement;

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

import it.zucchetti.packages.jdbc.JDBCConnection;

//da sistemare la sicurezza?

//da fixare username mettendo al suo posto email

public class Registration extends HttpServlet {
    /*
    private static boolean registrationValidation() {

    }
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        int roleid = 1;
        String username = request.getParameter("username");
        String password = request.getParameter("password");
        String firstName = request.getParameter("firstName");
        String lastName = request.getParameter("lastName");
        String birthdate = request.getParameter("birthdate"); 
        String address = request.getParameter("address");
        int cityid = request.getParameter("city"); //potrebbe dar problemi
        int regionid = request.getParameter("region"); //potrebbe dar problemi
        int countryid = request.getParameter("country"); //potrebbe dar problemi
        //latitude
        //longitude
        //cvFilePath
        Date createDat = new Date(System.currentTimeMillis());
        Date updateDat = createDat;//TODO: giusto? oppure la metto a null?

        PrintWriter out = response.getWriter();

        //TODO: validazione formato parametri (es: non vuoti, email valida, password valida ecc...)

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
                    " LONGITUDE, CVFILEPATH, CREATEDAT, UPDATEDAT) VALUES ('" + roleid + "', '" + username + "', '" + password + "', '" + firstName + "', '" + 
                    lastName + "', '" + birthdate + "', '" + address + "', '" + cityid + "', '" + regionid + "', '" + countryid + "', '" + latitude + "', '" + 
                    longitude + "', '" + cvFilePath + "', '" + createDat + "', '" + updateDat + "')"; 
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
                HttpSession session = request.getSession(true);

                session.setAttribute("username", username); 
                session.setAttribute("role", "user");
                session.setMaxInactiveInterval(30*60); //30 minuti

                String path = request.getContextPath();
                if (path == null || path.isEmpty()) {
                    path = "/";
                }
                String jsessionidCookie = "JSESSIONID=" + session.getId() + "; Path=" + path + "; HttpOnly;"; //da sistemare se lo modifico nella Servlet di Login
                
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
    }*/
}
