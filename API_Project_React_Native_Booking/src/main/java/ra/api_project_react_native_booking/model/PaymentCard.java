package ra.api_project_react_native_booking.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "payment_cards")
public class PaymentCard {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "card_holder_name", nullable = false, length = 150)
    private String cardHolderName;

    @Column(name = "card_brand", nullable = false, length = 50)
    private String cardBrand;

    @Column(name = "card_number", nullable = false, length = 32)
    private String cardNumber;

    @Column(name = "exp_month", nullable = false)
    private Integer expMonth;

    @Column(name = "exp_year", nullable = false)
    private Integer expYear;

    @Column(name = "balance", nullable = false, precision = 18, scale = 2)
    private BigDecimal balance;

    @Column(name = "is_default", nullable = false)
    private Boolean isDefault;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = this.createdAt;
        if (balance == null)
            balance = BigDecimal.ZERO;
        if (isDefault == null)
            isDefault = false;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
