package com.correo.user.application.controller;

import com.correo.user.application.dto.UserDTO;
import com.correo.user.domain.aggregate.UserAggregate;
import com.correo.user.domain.service.UserDomainService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserDomainService userDomainService;

    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<UserAggregate> users = userDomainService.findAll();
        List<UserDTO> dtos = users.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable UUID id) {
        return userDomainService.findById(id)
                .map(this::mapToDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<UserDTO> createUser(@RequestBody UserDTO userDTO) {
        UserAggregate user = mapToDomain(userDTO);
        UserAggregate savedUser = userDomainService.save(user);
        return ResponseEntity.ok(mapToDTO(savedUser));
    }

    private UserDTO mapToDTO(UserAggregate user) {
        return UserDTO.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .status(user.getStatus())
                .build();
    }

    private UserAggregate mapToDomain(UserDTO dto) {
        return UserAggregate.builder()
                .id(dto.getId())
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .email(dto.getEmail())
                .status(dto.getStatus())
                .build();
    }
} 