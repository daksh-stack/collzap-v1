package collzap.backend.models;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private String id;

    @ManyToOne
    @JoinColumn(name = "college_id")
    private String college_id;

    private String email;
    private String name;

    private String profile_photo_url;
    private Integer year_of_study;

    private String city;
    private String story_prompt_1;
    private String story_prompt_2;
    private String story_prompt_3;

    private String proof_of_work_url;
    private Boolean verification_status;

    @CreationTimestamp
    private LocalDateTime created_At;
}
