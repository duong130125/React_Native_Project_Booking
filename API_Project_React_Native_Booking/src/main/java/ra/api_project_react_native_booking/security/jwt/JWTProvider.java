package ra.api_project_react_native_booking.security.jwt;

import io.jsonwebtoken.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
@Slf4j
public class JWTProvider {
    @Value("${jwt_secret}")
    private String jwtSecret;
    @Value("${jwt_expire}")
    private int jwtExpire;
    @Value("${jwt_refresh}")
    private int jwtRefresh;

    public String generateToken(String username) {
        Date now = new Date();
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(now)
                .setExpiration(new Date(now.getTime() + jwtExpire))
                .signWith(SignatureAlgorithm.HS256, jwtSecret) // Đổi từ HS512 sang HS256
                .compact();
    }

    /**
     * Generate JWT token với custom claims (userId, role, status, deviceId)
     * Giống format token mẫu: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     */
    public String generateTokenWithClaims(Long userId, String username, String role, String status, String deviceId) {
        Date now = new Date();
        Map<String, Object> claims = new HashMap<>();
        claims.put("sub", userId); // Subject là userId (số)
        claims.put("role", role != null ? role : "USER");
        claims.put("status", status != null ? status : "ACTIVE");
        if (deviceId != null) {
            claims.put("deviceId", deviceId);
        }

        return Jwts.builder()
                .setClaims(claims) // Đặt tất cả claims, bao gồm subject
                .setIssuedAt(now)
                .setExpiration(new Date(now.getTime() + jwtExpire))
                .signWith(SignatureAlgorithm.HS256, jwtSecret)
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().setSigningKey(jwtSecret).parseClaimsJws(token);
            return true;
        } catch (ExpiredJwtException e) {
            log.error("JWT token expired!");
        } catch (UnsupportedJwtException e) {
            log.error("JWT token unsupported!");
        } catch (MalformedJwtException e) {
            log.error("JWT token malformed!");
        } catch (SignatureException e) {
            log.error("JWT token signature error!");
        } catch (IllegalArgumentException e) {
            log.error("JWT token argument error!");
        }
        return false;
    }

    public String getUsernameFromToken(String token) {
        return Jwts.parser().setSigningKey(jwtSecret).parseClaimsJws(token).getBody().getSubject();
    }

    public String refreshToken(String token, String username) {
        if (validateToken(token) && getUsernameFromToken(token).equals(username)) {
            Date now = new Date();
            return Jwts.builder()
                    .setSubject(username)
                    .setIssuedAt(now)
                    .setExpiration(new Date(now.getTime() + jwtRefresh))
                    .signWith(SignatureAlgorithm.HS256, jwtSecret) // Đổi từ HS512 sang HS256
                    .compact();
        }
        return null;
    }
}