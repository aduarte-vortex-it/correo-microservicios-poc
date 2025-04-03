package com.correo.user.application.controller;

import com.correo.user.application.dto.CreateUserRequest;
import com.correo.user.application.dto.UpdateUserRequest;
import com.correo.user.application.dto.UserResponse;
import com.correo.user.domain.aggregate.UserAggregate;
import com.correo.user.domain.service.UserDomainService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserDomainService userDomainService;

    @PostMapping
    public ResponseEntity<UserResponse> createUser(@RequestBody CreateUserRequest request) {
        log.info("Creando usuario con email: {}", request.getEmail());
        UserAggregate user = UserAggregate.create(
            request.getName(),
            request.getEmail(),
            request.getPhone()
        );

        user = userDomainService.createUser(user);
        return ResponseEntity.ok(toResponse(user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUserByPathId(
            @PathVariable UUID id,
            @RequestBody UpdateUserRequest request) {
        log.info("Actualizando usuario con ID (path): {}", id);
        return updateUserInternal(id, request);
    }

    @PutMapping
    public ResponseEntity<UserResponse> updateUserByQueryId(
            @RequestParam(required = false) UUID id,
            @RequestBody UpdateUserRequest request) {
        if (id == null) {
            log.warn("Se recibió petición PUT sin ID. Se debe proporcionar un ID.");
            return ResponseEntity.badRequest()
                    .body(UserResponse.builder()
                            .name("Error")
                            .email("Debe especificar el ID del usuario. Ejemplo: /api/users?id=uuid")
                            .build());
        }
        log.info("Actualizando usuario con ID (query): {}", id);
        return updateUserInternal(id, request);
    }

    private ResponseEntity<UserResponse> updateUserInternal(UUID id, UpdateUserRequest request) {
        return userDomainService.getUserById(id)
                .map(existingUser -> {
                    log.info("Usuario encontrado, actualizando datos");
                    UserAggregate updatedUser = UserAggregate.builder()
                            .id(existingUser.getId())
                            .name(request.getName())
                            .email(request.getEmail())
                            .phone(request.getPhone())
                            .status(existingUser.getStatus())
                            .createdAt(existingUser.getCreatedAt())
                            .updatedAt(existingUser.getUpdatedAt())
                            .build();
                    
                    updatedUser = userDomainService.updateUser(updatedUser);
                    return ResponseEntity.ok(toResponse(updatedUser));
                })
                .orElseGet(() -> {
                    log.warn("Usuario no encontrado con ID: {}", id);
                    return ResponseEntity.notFound().build();
                });
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUserByPathId(@PathVariable UUID id) {
        log.info("Eliminando usuario con ID (path): {}", id);
        return deleteUserInternal(id);
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteUserByQueryId(@RequestParam(required = false) UUID id) {
        if (id == null) {
            log.info("Eliminando todos los usuarios");
            try {
                List<UserAggregate> users = userDomainService.getAllUsers();
                for (UserAggregate user : users) {
                    userDomainService.deleteUser(user.getId());
                }
                return ResponseEntity.ok().build();
            } catch (Exception e) {
                log.error("Error al eliminar usuarios: {}", e.getMessage());
                return ResponseEntity.internalServerError().build();
            }
        }
        log.info("Eliminando usuario con ID (query): {}", id);
        return deleteUserInternal(id);
    }

    private ResponseEntity<Void> deleteUserInternal(UUID id) {
        try {
            userDomainService.deleteUser(id);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            log.warn("Error al eliminar usuario: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        log.info("Obteniendo todos los usuarios");
        List<UserResponse> users = userDomainService.getAllUsers().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserByPathId(@PathVariable UUID id) {
        log.info("Buscando usuario con ID (path): {}", id);
        return getUserByIdInternal(id);
    }

    @GetMapping(params = "id")
    public ResponseEntity<UserResponse> getUserByQueryId(@RequestParam UUID id) {
        log.info("Buscando usuario con ID (query): {}", id);
        return getUserByIdInternal(id);
    }

    private ResponseEntity<UserResponse> getUserByIdInternal(UUID id) {
        return userDomainService.getUserById(id)
                .map(this::toResponse)
                .map(ResponseEntity::ok)
                .orElseGet(() -> {
                    log.warn("Usuario no encontrado con ID: {}", id);
                    return ResponseEntity.notFound().build();
                });
    }

    private UserResponse toResponse(UserAggregate user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
} 