package ra.api_project_react_native_booking.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "room_images")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RoomImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @Column(nullable = false, length = 500)
    private String imageUrl;

    @Column(nullable = false)
    private Boolean isPrimary;
}