package com.correo.user.infrastructure.repository;

import com.correo.user.domain.aggregate.UserAggregate;
import com.correo.user.domain.repository.IUserRepository;
import com.correo.user.infrastructure.persistence.entity.UserEntity;
import com.correo.user.infrastructure.persistence.repository.JpaUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class UserRepository implements IUserRepository {
    private final JpaUserRepository jpaUserRepository;

    @Override
    public UserAggregate save(UserAggregate user) {
        UserEntity entity = toEntity(user);
        entity = jpaUserRepository.save(entity);
        return toAggregate(entity);
    }

    @Override
    public Optional<UserAggregate> findById(UUID id) {
        return jpaUserRepository.findById(id)
                .map(this::toAggregate);
    }

    @Override
    public List<UserAggregate> findAll() {
        return jpaUserRepository.findAll().stream()
                .map(this::toAggregate)
                .collect(Collectors.toList());
    }

    @Override
    public boolean existsByEmail(String email) {
        return jpaUserRepository.existsByEmail(email);
    }

    @Override
    public boolean existsById(UUID id) {
        return jpaUserRepository.existsById(id);
    }

    @Override
    public Optional<UserAggregate> findByEmail(String email) {
        return jpaUserRepository.findByEmail(email)
                .map(this::toAggregate);
    }

    @Override
    public void deleteById(UUID id) {
        jpaUserRepository.deleteById(id);
    }

    private UserEntity toEntity(UserAggregate aggregate) {
        UserEntity entity = new UserEntity();
        entity.setId(aggregate.getId());
        entity.setName(aggregate.getName());
        entity.setEmail(aggregate.getEmail());
        entity.setPhone(aggregate.getPhone());
        entity.setStatus(aggregate.getStatus());
        entity.setCreatedAt(aggregate.getCreatedAt());
        entity.setUpdatedAt(aggregate.getUpdatedAt());
        return entity;
    }

    private UserAggregate toAggregate(UserEntity entity) {
        return UserAggregate.builder()
                .id(entity.getId())
                .name(entity.getName())
                .email(entity.getEmail())
                .phone(entity.getPhone())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
} 