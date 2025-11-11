package ra.api_project_react_native_booking.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "amenities")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Amenity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 255)
    private String icon;

    @Column(columnDefinition = "TEXT")
    private String description;
}