package it.zucchetti.packages.servlet.sessionsManagement;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import java.io.IOException;
import java.io.PrintWriter;

import it.zucchetti.packages.jdbc.JDBCConnection;
import it.zucchetti.packages.security.PasswordUtils;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

/*import java.util.UUID;*/
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

/* 
-------------------------------------------------------------------------------------------------------------------------------------------------
https://chatgpt.com/share/6915ba90-b600-8012-8f4f-267c3ae02924 <- discussione riguardo alla sicurezza
-------------------------------------------------------------------------------------------------------------------------------------------------
*/

//da sistemare la sicurezza?

@WebServlet("/servlet/login")
public class Login extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        PrintWriter out = response.getWriter();

        String email;
        String password;

        JsonObject json = JsonParser.parseReader(request.getReader()).getAsJsonObject();
        email = json.get("email").getAsString();
        password = json.get("password").getAsString();

        HttpSession oldSession = request.getSession(false);
        if (oldSession != null) {
            oldSession.invalidate();
        }

        Connection connection = null;
        Statement statement = null;
        ResultSet resultSet = null;

        try {
            Class.forName(JDBCConnection.JDBC_DRIVER);

            connection = DriverManager.getConnection(JDBCConnection.CONNECTION_STRING, JDBCConnection.USER,
                    JDBCConnection.PASSWORD);

            statement = connection.createStatement();

            String query = "SELECT * FROM USERS WHERE EMAIL = '" + email + "'";
            // TODO: sostituire con PreparedStatement per evitare SQL Injection
            resultSet = statement.executeQuery(query);

            if (resultSet.next()) {
                // Recupera l'hash della password dal database
                String storedHashedPassword = resultSet.getString("PASSWORD");

                // Verifica se la password fornita corrisponde all'hash
                if (PasswordUtils.verifyPassword(password, storedHashedPassword)) {
                    HttpSession session = request.getSession(true);

                    session.setAttribute("username", email);
                    int roleid = resultSet.getInt("ROLEID");
                    String role = roleid == 1 ? "user" : "admin";
                    session.setAttribute("role", role);
                    session.setMaxInactiveInterval(30 * 60); // 30 minuti //Da evitare?

                    /*
                     * String csrfToken = UUID.randomUUID().toString(); //da usare nelle form POST
                     * come campo nascosto o nell'header X-CSRF-Token
                     * session.setAttribute("csrfToken", csrfToken);
                     */

                    /*
                     * String sameSite = "SameSite=Lax"; //o "SameSite=Strict"
                     * String secureFlag = request.isSecure() ? "; Secure" : "";
                     */
                    String jsessionidCookie = "JSESSIONID=" + session.getId() + "; Path=/tech-hub; HttpOnly;" /*
                                                                                                               * +
                                                                                                               * secureFlag
                                                                                                               * + "; "
                                                                                                               * +
                                                                                                               * sameSite
                                                                                                               */;

                    response.setHeader("Set-Cookie", jsessionidCookie);

                    if (role.equals("admin")) {
                        response.setStatus(HttpServletResponse.SC_OK);
                        out.write(
                                "{\"success\": true, \"message\": \"Login effettuato.\", \"redirect\": \"admin.html\"}");
                    } else {
                        response.setStatus(HttpServletResponse.SC_OK);
                        out.write("{\"success\": true, \"message\": \"Login effettuato.\"}");
                    }
                } else {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    out.write("{\"success\": false, \"message\": \"Errore: Credenziali non valide.\"}");
                }
            } else {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                out.write("{\"success\": false, \"message\": \"Errore: Credenziali non valide.\"}");
            }
        } catch (ClassNotFoundException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"success\": false, \"message\": \"Errore: driver JDBC non trovato.\"}");
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"success\": false, \"message\": \"Errore: errore SQL nella connessione al DB.\"}");
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"success\": false, \"message\": \"Errore: errore inaspettato nella connessione al DB.\"}");
        } finally {
            try {
                if (resultSet != null)
                    resultSet.close();
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

    // bloccare la doGet implementandola in modo che restituisca un JSON d'errore?
}
