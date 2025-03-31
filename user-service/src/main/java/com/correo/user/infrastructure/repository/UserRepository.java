package com.correo.user.infrastructure.repository;

import com.correo.user.domain.aggregate.UserAggregate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<UserAggregate, UUID> {
} 