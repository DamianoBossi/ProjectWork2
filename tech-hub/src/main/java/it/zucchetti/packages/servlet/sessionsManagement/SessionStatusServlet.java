package it.zucchetti.packages.servlet.sessionsManagement;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

//da sistemare la sicurezza?

@WebServlet("/servlet/sessionStatus")
public class SessionStatusServlet extends HttpServlet {
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        PrintWriter out = response.getWriter();

        HttpSession currentSession = request.getSession(false);
        if (currentSession != null && currentSession.getAttribute("username") != null) {
            String username = (String) currentSession.getAttribute("username");
            String role = (String) currentSession.getAttribute("role");
            response.setStatus(HttpServletResponse.SC_OK);
            out.write("{\"success\": true, \"message\": {\"isLogged\":true, \"username\":\"" + username + "\", \"role\":\"" + role + "\"}}");
        } else {
            response.setStatus(HttpServletResponse.SC_OK);
            out.write("{\"success\": true, \"message\": {\"isLogged\":false}}");
        }
        return;

    }
}

