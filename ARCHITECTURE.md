# Cấu Trúc Dự Án

## Tổng Quan

Dự án được tổ chức theo kiến trúc modular với các thư mục và file được phân chia rõ ràng để dễ quản lý và bảo trì.

## Cấu Trúc Thư Mục

```
Project_React_Native_Booking/
├── app/                    # Screens và routing (Expo Router)
│   ├── (tabs)/            # Tab navigation screens
│   ├── *.tsx              # Các screens khác
│   └── _layout.tsx        # Root layout
├── components/            # Reusable components
│   ├── common/            # Common components (Header, SearchBar, etc.)
│   ├── hotel/             # Hotel-related components
│   ├── ui/                # UI components (StarRating, FavoriteButton, etc.)
│   └── index.ts           # Export all components
├── services/              # Business logic services
│   ├── favoritesService.ts
│   ├── bookmarksService.ts
│   └── notificationsService.ts
├── hooks/                 # Custom React hooks
│   ├── useFavorites.ts
│   └── ...
├── types/                 # TypeScript type definitions
│   ├── auth.ts
│   └── hotel.ts
├── constants/             # Constants (colors, spacing, typography)
│   ├── colors.ts
│   ├── spacing.ts
│   ├── typography.ts
│   └── config.ts
├── utils/                 # Utility functions
│   └── axiosInstance.ts
└── assets/                # Static assets (images, etc.)
```

## Components

### Common Components
- **Header**: Header với logo và search bar
- **SearchBar**: Thanh tìm kiếm có thể tái sử dụng
- **CityCard**: Card hiển thị thành phố

### Hotel Components
- **HotelCard**: Card hiển thị khách sạn (horizontal/vertical variants)

### UI Components
- **StarRating**: Component hiển thị đánh giá sao
- **FavoriteButton**: Nút yêu thích

## Services

### favoritesService
Quản lý favorites trong AsyncStorage:
- `loadFavorites()`: Load danh sách favorites
- `saveFavorites()`: Lưu danh sách favorites
- `isFavorite()`: Kiểm tra hotel có trong favorites
- `toggleFavorite()`: Thêm/xóa favorite

### bookmarksService
Quản lý bookmarks trong AsyncStorage:
- `loadBookmarks()`: Load danh sách bookmarks
- `saveBookmarks()`: Lưu danh sách bookmarks
- `addBookmark()`: Thêm bookmark
- `removeBookmark()`: Xóa bookmark
- `isBookmarked()`: Kiểm tra hotel có trong bookmarks

### notificationsService
Quản lý notifications trong AsyncStorage:
- `loadNotifications()`: Load danh sách notifications
- `saveNotifications()`: Lưu danh sách notifications
- `addNotification()`: Thêm notification
- `removeNotification()`: Xóa notification
- `clearNotifications()`: Xóa tất cả notifications

## Hooks

### useFavorites
Custom hook quản lý favorites:
```typescript
const { favorites, loading, toggleFavorite, isFavorite, reload } = useFavorites();
```

## Constants

### Colors
Tất cả màu sắc được định nghĩa trong `constants/colors.ts`:
- Primary colors
- Background colors
- Text colors
- Status colors (success, error, warning, info)

### Spacing
Khoảng cách và kích thước được định nghĩa trong `constants/spacing.ts`:
- Spacing values (xs, sm, md, lg, xl, xxl, xxxl)
- Border radius
- Sizes (icons, avatars, buttons, cards)

### Typography
Typography được định nghĩa trong `constants/typography.ts`:
- Font sizes
- Font weights
- Line heights

## Types

### Hotel Types
Định nghĩa trong `types/hotel.ts`:
- `Hotel`: Thông tin khách sạn
- `City`: Thông tin thành phố
- `Booking`: Thông tin booking
- `Notification`: Thông tin notification
- `Bookmark`: Thông tin bookmark

### Auth Types
Định nghĩa trong `types/auth.ts`:
- `APIResponse`: Response từ API
- `RegisterRequest`: Request đăng ký
- `LoginRequest`: Request đăng nhập
- `UserResponse`: Response user
- `LoginResponse`: Response đăng nhập

## Best Practices

1. **Component Reusability**: Sử dụng các components có thể tái sử dụng thay vì duplicate code
2. **Service Layer**: Tách business logic vào services thay vì đặt trong components
3. **Custom Hooks**: Sử dụng custom hooks để tái sử dụng logic
4. **Constants**: Sử dụng constants thay vì hardcode values
5. **Type Safety**: Sử dụng TypeScript types cho tất cả các entities
6. **Separation of Concerns**: Tách biệt UI, logic, và data layers

## Ví Dụ Sử Dụng

### Sử dụng HotelCard Component
```typescript
import { HotelCard } from "../../components";

<HotelCard
  hotel={hotel}
  isFavorite={isFavorite(hotel.id)}
  onToggleFavorite={toggleFavorite}
  variant="vertical"
/>
```

### Sử dụng useFavorites Hook
```typescript
import { useFavorites } from "../../hooks/useFavorites";

const { favorites, toggleFavorite, isFavorite } = useFavorites();
```

### Sử dụng Services
```typescript
import { favoritesService } from "../../services/favoritesService";

const favorites = await favoritesService.loadFavorites();
await favoritesService.toggleFavorite(hotelId);
```

## Tương Lai

- Thêm unit tests cho components và services
- Thêm error boundaries
- Thêm loading states và error handling tốt hơn
- Thêm API integration layer
- Thêm caching layer
- Thêm offline support

