package com.correo.user.domain.aggregate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserAggregate {
    private UUID id;
    private String firstName;
    private String lastName;
    private String email;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}