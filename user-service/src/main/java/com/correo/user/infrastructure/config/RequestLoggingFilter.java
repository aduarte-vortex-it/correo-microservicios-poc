package com.correo.user.infrastructure.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Slf4j
@Component
public class RequestLoggingFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;
        
        log.info("Recibida solicitud: {} {} de {}", 
                req.getMethod(), 
                req.getRequestURI(), 
                req.getRemoteAddr());
        
        chain.doFilter(request, response);
        
        log.info("Respuesta enviada: {} con código de estado {}", 
                req.getRequestURI(), 
                res.getStatus());
    }
} 