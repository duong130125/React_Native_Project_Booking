# Cấu Trúc Thư Mục App

## Tổng Quan

Các screens trong `app/` đã được tổ chức lại thành các nhóm chức năng sử dụng Expo Router's route groups `(folder)`.

## Cấu Trúc Thư Mục

```
app/
├── _layout.tsx              # Root layout
├── index.tsx                # Entry point (onboarding)
├── onboarding.tsx           # Onboarding screen
│
├── (auth)/                  # Authentication screens
│   ├── auth.tsx            # Login/Register
│   ├── forgot-password.tsx # Forgot password
│   ├── otp-verification.tsx # OTP verification
│   ├── new-password.tsx    # New password
│   └── password-success.tsx # Password success
│
├── (hotel)/                 # Hotel-related screens
│   ├── hotel-detail.tsx    # Hotel detail page
│   ├── hotel-photos.tsx    # Hotel photos gallery
│   ├── reviews.tsx         # Reviews page
│   └── zoom-image.tsx      # Zoom image viewer
│
├── (booking)/               # Booking flow screens
│   ├── select-date.tsx     # Select date
│   ├── select-guest.tsx    # Select guest
│   ├── confirm-pay.tsx     # Confirm & pay
│   └── payment-done.tsx    # Payment done
│
├── (profile)/               # Profile screens
│   ├── edit-profile.tsx    # Edit profile
│   └── add-new-card.tsx    # Add new card
│
├── (legal)/                 # Legal screens
│   ├── privacy-policy.tsx  # Privacy policy
│   └── terms-conditions.tsx # Terms & conditions
│
├── (search)/                # Search & filter screens
│   ├── search.tsx          # Search screen
│   └── filter.tsx          # Filter screen
│
└── (tabs)/                  # Tab navigation screens
    ├── _layout.tsx         # Tab layout
    ├── homepage.tsx        # Homepage
    ├── bookmarks.tsx       # Bookmarks (Notifications)
    ├── orders.tsx          # Orders (Bookings)
    ├── profile.tsx         # Profile tab
    └── discounts.tsx       # Discounts
```

## Route Groups

Expo Router sử dụng route groups với cú pháp `(folder)` để nhóm các routes mà không ảnh hưởng đến URL path.

### Ví dụ:

- `app/(auth)/auth.tsx` → Route: `/auth`
- `app/(hotel)/hotel-detail.tsx` → Route: `/hotel-detail`
- `app/(booking)/select-date.tsx` → Route: `/select-date`

## Import Paths

Sau khi di chuyển vào các thư mục con, các import paths cần được cập nhật:

### Từ `app/` → `app/(folder)/`:

- `../components` → `../../components`
- `../constants` → `../../constants`
- `../hooks` → `../../hooks`
- `../types` → `../../types`
- `../apis` → `../../apis`
- `../assets` → `../../assets`

## Navigation

Các đường dẫn navigation **không cần thay đổi** vì Expo Router tự động xử lý route groups:

```typescript
// ✅ Vẫn hoạt động bình thường
router.push("/auth");
router.push("/hotel-detail");
router.push("/select-date");
router.push("/edit-profile");
router.push("/search");
router.push("/filter");
```

## Lợi Ích

1. **Tổ chức rõ ràng**: Các screens được nhóm theo chức năng
2. **Dễ bảo trì**: Dễ tìm và quản lý các screens liên quan
3. **Scalable**: Dễ mở rộng khi thêm screens mới
4. **Không ảnh hưởng routing**: Route groups không thay đổi URL paths
5. **Clean code**: Code được tổ chức tốt hơn

## Notes

- Route groups `(folder)` chỉ là cách tổ chức, không ảnh hưởng đến routing
- Tất cả các đường dẫn navigation vẫn giữ nguyên
- Import paths đã được cập nhật tự động
- Components, services, hooks vẫn có thể được sử dụng từ bất kỳ screen nào
