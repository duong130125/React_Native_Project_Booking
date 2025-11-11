package ra.api_project_react_native_booking.security.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JWTAuthFilter extends OncePerRequestFilter {
    @Autowired
    private JWTProvider jwtProvider;
    @Autowired
    UserDetailsService userDetailsService;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        // Skip filter cho các public endpoints (không cần JWT token)
        String path = request.getRequestURI();
        String method = request.getMethod();

        // Skip cho auth endpoints
        if (path.startsWith("/api/v1/auth/")) {
            return true;
        }

        // Skip cho hotels endpoints (GET requests - public)
        if (path.startsWith("/api/v1/hotels") && "GET".equalsIgnoreCase(method)) {
            return true;
        }

        // Skip cho rooms endpoints (GET requests - public)
        if (path.startsWith("/api/v1/rooms") && "GET".equalsIgnoreCase(method)) {
            return true;
        }

        // Skip cho reviews endpoints (GET requests - public)
        if (path.startsWith("/api/v1/reviews") && "GET".equalsIgnoreCase(method)) {
            return true;
        }

        return false;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String token = getTokenFromRequest(request);
        // Chỉ xử lý token nếu có và hợp lệ
        if (token != null && jwtProvider.validateToken(token)) {
            try {
                String username = jwtProvider.getUsernameFromToken(token);
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                Authentication authen = new UsernamePasswordAuthenticationToken(userDetails, null,
                        userDetails.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(authen);
            } catch (Exception e) {
                // Nếu có lỗi khi load user (token không hợp lệ, user không tồn tại, etc.)
                // Không set authentication, nhưng vẫn cho request tiếp tục
                // Điều này cho phép public endpoints hoạt động ngay cả khi có token không hợp
                // lệ
            }
        }
        filterChain.doFilter(request, response);
    }

    private String getTokenFromRequest(HttpServletRequest request) {
        String authorization = request.getHeader("Authorization");
        if (authorization != null && authorization.startsWith("Bearer ")) {
            return authorization.substring(7);
        }
        return null;
    }
}
