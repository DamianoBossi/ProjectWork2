    // Logout
    document.getElementById("logoutBtn").addEventListener("click", function () {
      localStorage.removeItem("user");
      sessionStorage.removeItem("user");
      window.location.href = "prova.html";
    });