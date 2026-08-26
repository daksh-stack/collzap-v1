package collzap.backend.models;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import collzap.backend.enums.Status;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users",
    indexes = {
        @Index(name = "idx_users_college_id" , columnList = "college_id")
    }
)
@AllArgsConstructor
@NoArgsConstructor
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private String user_id;

    @ManyToOne
    @JoinColumn(name = "college_id")
    private String college_id;
    @Column(unique = true,nullable = false)
    private String email;
    @Column(nullable = false)
    private String name;

    private String profile_photo_url;
    private Integer year_of_study;

    private String city;
    private String story_prompt_1;
    private String story_prompt_2;
    private String story_prompt_3;

    private String proof_of_work_url;
    @Column(nullable = false)
    private String verification_status = "pending";

    @Column(nullable = false)
    private Boolean profile_completed = false; 

    @Enumerated(EnumType.STRING)
    private Status account_status = Status.ACTIVE;

    @CreationTimestamp
    private LocalDateTime created_At;
    
    @UpdateTimestamp
    private LocalDateTime updated_At;
}
