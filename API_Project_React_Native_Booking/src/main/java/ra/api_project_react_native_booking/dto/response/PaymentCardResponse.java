package ra.api_project_react_native_booking.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentCardResponse {
	private Long id;
	private Long userId;
	private String cardHolderName;
	private String cardBrand;
	private String cardNumber; // masked (chỉ hiển thị 4 số cuối)
	private Integer expMonth;
	private Integer expYear;
	private String balance; // Số dư
	private Boolean isDefault;
	private String createdAt;
	private String updatedAt;
}


