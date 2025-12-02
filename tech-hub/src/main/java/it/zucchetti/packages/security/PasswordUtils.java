package it.zucchetti.packages.security;

import at.favre.lib.crypto.bcrypt.BCrypt;

public class PasswordUtils {

    /**
     * Genera un hash BCrypt della password fornita
     * 
     * @param password la password in chiaro
     * @return l'hash della password
     */
    public static String hashPassword(String password) {
        return BCrypt.withDefaults().hashToString(12, password.toCharArray());
    }

    /**
     * Verifica se una password corrisponde al suo hash
     * 
     * @param password       la password in chiaro
     * @param hashedPassword l'hash memorizzato nel database
     * @return true se la password corrisponde, false altrimenti
     */
    public static boolean verifyPassword(String password, String hashedPassword) {
        BCrypt.Result result = BCrypt.verifyer().verify(password.toCharArray(), hashedPassword);
        return result.verified;
    }
}
