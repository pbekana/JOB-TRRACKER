package com.job_tracker.job.tracker;

import com.job_tracker.job.tracker.LoginRepository;
import com.job_tracker.job.tracker.LoginUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
public class LoginController {

    @Autowired
    private LoginRepository loginRepository;

    // Signup endpoint
    @PostMapping("/signup")
    public ResponseEntity<String> saveUser(@RequestBody LoginUser loginuser) {
        if (loginuser.getEmail() == null || loginuser.getPassword() == null) {
            return ResponseEntity.badRequest().body("Missing fields");
        }
        loginRepository.save(loginuser);
        return ResponseEntity.ok("User saved");
    }

    // Normal login
    @PostMapping("/login")
    public ResponseEntity<String> loginUser(@RequestBody LoginUser loginuser) {
        Optional<LoginUser> existingUser = loginRepository.findByEmail(loginuser.getEmail());
        if (existingUser.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");

        if (existingUser.get().getPassword().equals(loginuser.getPassword())) {
            return ResponseEntity.ok("Login successful");
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid password");
    }

    // Google login (single method)
    @PostMapping("/google-login")
    public ResponseEntity<String> googleLogin(@RequestBody Map<String, String> payload) {
        String email = payload.get("email").toLowerCase().trim(); // normalize

        Optional<LoginUser> dbUser = loginRepository.findByEmail(email);

        if (dbUser.isEmpty()) {
            // First-time login with Google → create new user
            LoginUser newUser = new LoginUser();
            newUser.setEmail(email);
            newUser.setPassword("google-oauth"); // marker for Google
            loginRepository.save(newUser);
            return ResponseEntity.ok("Google account created and logged in!");
        }

        // User already exists (normal or Google) → just log in
        return ResponseEntity.ok("Google login successful!");
    }


    // Get user info
    // ✅ Get user info (used in export)
    @GetMapping("/user/{email}")
    public ResponseEntity<Object> getUser(@PathVariable String email) {
        Optional<LoginUser> user = loginRepository.findByEmail(email);
        if (user.isPresent()) {
            return ResponseEntity.ok(user.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
    }


    // Update password
    @PutMapping("/user/{email}")
    public ResponseEntity<String> updatePassword(@PathVariable String email, @RequestBody LoginUser updatedUser) {
        Optional<LoginUser> userOpt = loginRepository.findByEmail(email);
        if (userOpt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");

        LoginUser user = userOpt.get();
        user.setPassword(updatedUser.getPassword());
        loginRepository.save(user);
        return ResponseEntity.ok("Password updated");
    }

    // Delete user
    @DeleteMapping("/user/{email}")
    public ResponseEntity<String> deleteUser(@PathVariable String email) {
        Optional<LoginUser> user = loginRepository.findByEmail(email);
        if (user.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");

        loginRepository.delete(user.get());
        return ResponseEntity.ok("User deleted");
    }
}
