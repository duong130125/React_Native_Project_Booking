# Phân tích và Sửa lỗi Backend API

## 🔍 Các vấn đề đã phát hiện:

### 1. ❌ **CORS Configuration thiếu**

- **Vấn đề**: SpringSecurity config không có CORS configuration global
- **Hiện tại**: Chỉ có `@CrossOrigin(origins = "*")` ở controller level
- **Ảnh hưởng**: Có thể gây lỗi CORS khi frontend gọi API từ React Native

### 2. ❌ **LoginResponse không set field `success`**

- **Vấn đề**: Trong `UserServiceImpl.login()`, LoginResponse được tạo nhưng không set `success = true`
- **Hiện tại**: Controller check `loginResponse.isSuccess()` nhưng field này null/false
- **Ảnh hưởng**: Login luôn trả về UNAUTHORIZED thay vì OK

### 3. ❌ **RuntimeException không được handle**

- **Vấn đề**: GlobalExceptionHandler không handle RuntimeException
- **Hiện tại**: RuntimeException sẽ trả về 500 với format không chuẩn
- **Ảnh hưởng**: Frontend không nhận được error message đúng format

### 4. ⚠️ **Server port không được config rõ ràng**

- **Vấn đề**: Không có `server.port` trong application.properties
- **Hiện tại**: Mặc định port 8080
- **Ảnh hưởng**: Cần đảm bảo frontend đúng port

---

## ✅ Giải pháp sửa lỗi:

### **Fix 1: Thêm CORS Configuration vào SpringSecurity**

```java
// File: src/main/java/.../security/config/SpringSecurity.java
// Thêm vào trong class SpringSecurity

@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOriginPatterns(Arrays.asList("*"));
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
    configuration.setAllowedHeaders(Arrays.asList("*"));
    configuration.setAllowCredentials(true);
    configuration.setMaxAge(3600L);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}

// Cập nhật SecurityFilterChain:
@Bean
public SecurityFilterChain configure(HttpSecurity http, JWTAuthFilter jwtAuthFilter) throws Exception {
    http.csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource())) // ✅ Thêm dòng này
            .authorizeHttpRequests(auth -> auth
                    .requestMatchers("/api/v1/auth/**").permitAll()
                    .anyRequest().authenticated()
            )
            .exceptionHandling(ex -> ex.authenticationEntryPoint(authenticationEntryPoint()))
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

    return http.build();
}
```

### **Fix 2: Set success field trong LoginResponse**

```java
// File: src/main/java/.../service/Impl/UserServiceImpl.java
// Sửa method login():

@Override
public LoginResponse login(LoginRequest loginRequest) {
    Optional<User> userOptional = userRepository.findByEmail(loginRequest.getEmail());

    if (userOptional.isEmpty()) {
        throw new RuntimeException("User not found");
    }

    User user = userOptional.get();

    if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
        throw new RuntimeException("Invalid password");
    }
    String token = generateToken(user);

    return LoginResponse.builder()
            .success(true) // ✅ Thêm dòng này
            .token(token)
            .email(user.getEmail())
            .fullName(user.getFullName())
            .gender(user.getGender())
            .message("Login successful")
            .build();
}
```

### **Fix 3: Handle RuntimeException trong GlobalExceptionHandler**

```java
// File: src/main/java/.../exception/GlobalExceptionHandler.java
// Thêm method mới:

@ExceptionHandler(RuntimeException.class)
public ResponseEntity<APIResponse<Map<String, String>>> handleRuntimeException(RuntimeException ex) {
    Map<String, String> errors = new HashMap<>();
    errors.put("message", ex.getMessage());

    // Determine status based on error message
    HttpStatus status = HttpStatus.BAD_REQUEST;
    if (ex.getMessage().contains("not found") || ex.getMessage().contains("Not found")) {
        status = HttpStatus.NOT_FOUND;
    } else if (ex.getMessage().contains("Invalid password") || ex.getMessage().contains("Unauthorized")) {
        status = HttpStatus.UNAUTHORIZED;
    }

    return buildErrorResponse(ex.getMessage() != null ? ex.getMessage() : "Đã xảy ra lỗi", errors, status);
}
```

### **Fix 4: Thêm server port config (tùy chọn)**

```properties
# File: src/main/resources/application.properties
# Thêm dòng này:

server.port=8080
```

---

## 📋 Checklist sau khi sửa:

- [ ] Thêm CORS configuration vào SpringSecurity
- [ ] Set `success = true` trong LoginResponse
- [ ] Thêm RuntimeException handler vào GlobalExceptionHandler
- [ ] Test lại login API
- [ ] Test lại register API
- [ ] Kiểm tra error responses có đúng format không

---

## 🧪 Test API sau khi sửa:

### Test Login:

```bash
POST http://localhost:8080/api/v1/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "success": true,
    "token": "jwt-token-...",
    "email": "test@example.com",
    "fullName": "Test User",
    "message": "Login successful"
  },
  "status": "200 OK",
  "timestamp": "2024-01-01T12:00:00"
}
```

### Test Register:

```bash
POST http://localhost:8080/api/v1/auth/register
Content-Type: application/json

{
  "fullName": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "phoneNumber": "0123456789",
  "birthday": "1990-01-01",
  "genderName": "MALE"
}
```

---

## 📝 Lưu ý:

1. **CORS**: Sau khi thêm CORS config, có thể remove `@CrossOrigin` ở controller level (hoặc giữ lại cũng không sao)
2. **Error Messages**: Các error message từ RuntimeException sẽ được format chuẩn bởi GlobalExceptionHandler
3. **Port**: Đảm bảo frontend đang connect đúng port 8080 (hoặc port bạn config)
