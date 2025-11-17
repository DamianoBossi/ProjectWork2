package it.zucchetti.packages.servlet.sessionsManagement;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import java.io.IOException;
import java.io.PrintWriter;

//da sistemare la sicurezza?

@WebServlet("/servlet/logout")
public class Logout extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        PrintWriter out = response.getWriter();

        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }

        String jsessionidCookie = "JSESSIONID=; Path=/tech-hub" + "; HttpOnly; Max-Age=0"; //Da fixare se lo modifico nella Servlet di Login

        response.setHeader("Set-Cookie", jsessionidCookie);
        response.setStatus(HttpServletResponse.SC_OK);
        out.write("{\"success\": true, \"message\": \"Logout effettuato.\"}");
    }
}
