package ra.api_project_react_native_booking.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentCardRequest {
	@NotBlank(message = "Card holder name is required")
	private String cardHolderName;

	@NotBlank(message = "Card brand is required")
	private String cardBrand; // VISA, MASTERCARD, etc.

	@NotBlank(message = "Card number is required")
	@Pattern(regexp = "^[0-9]{13,19}$", message = "Card number must be 13-19 digits")
	private String cardNumber;

	@NotNull(message = "Expiry month is required")
	private Integer expMonth;

	@NotNull(message = "Expiry year is required")
	private Integer expYear;

	@NotBlank(message = "CVV is required")
	@Pattern(regexp = "^[0-9]{3,4}$", message = "CVV must be 3-4 digits")
	private String cvv; // Không lưu vào DB, chỉ dùng để validate

	private Boolean isDefault;
}


