package ra.api_project_react_native_booking.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "room_types")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RoomType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;
}