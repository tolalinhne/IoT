package com.ptit.iot.controller;

import com.ptit.iot.dto.ApiResponse;
import com.ptit.iot.dto.LoginRequest;
import com.ptit.iot.model.User;
import com.ptit.iot.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Map<String, Object>>> login(@RequestBody LoginRequest request,
                                                                   HttpServletRequest httpReq) {
        Optional<User> userOpt = authService.login(request.getUsername(), request.getPassword());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // Lưu username vào session để các request sau dùng được
            HttpSession session = httpReq.getSession(true);
            session.setAttribute("username", user.getUsername());
            Map<String, Object> data = new HashMap<>();
            data.put("id", user.getId());
            data.put("username", user.getUsername());
            data.put("fullName", user.getFullName());
            data.put("email", user.getEmail());
            data.put("studentId", user.getStudentId());
            data.put("classRoom", user.getClassRoom());
            data.put("githubUrl", user.getGithubUrl());
            data.put("figmaUrl", user.getFigmaUrl());
            data.put("postmanUrl", user.getPostmanUrl());
            data.put("reportUrl", user.getReportUrl());
            data.put("avatarUrl", user.getAvatarUrl());
            return ResponseEntity.ok(ApiResponse.ok("Dang nhap thanh cong", data));
        }
        return ResponseEntity.status(401).body(ApiResponse.error("Sai tai khoan hoac mat khau"));
    }

    @GetMapping("/profile/{username}")
    public ResponseEntity<ApiResponse<User>> getProfile(@PathVariable String username) {
        return authService.findByUsername(username)
                .map(user -> ResponseEntity.ok(ApiResponse.ok(user)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/profile/{id}")
    public ResponseEntity<ApiResponse<User>> updateProfile(@PathVariable Long id, @RequestBody User updated) {
        updated.setId(id);
        User saved = authService.updateProfile(updated);
        return ResponseEntity.ok(ApiResponse.ok("Cap nhat thanh cong", saved));
    }
}