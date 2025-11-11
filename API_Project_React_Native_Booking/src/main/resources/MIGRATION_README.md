# Migration Guide: Add Image URLs and Avatar URLs

## Mô tả
Migration này thêm các cột `image_url` vào bảng `hotels` và `avatar_url` vào bảng `users` để lưu trữ URLs của hình ảnh.

## Các bước thực hiện

### 1. Chạy Migration SQL

#### Cách 1: Sử dụng MySQL Command Line
```bash
mysql -u root -p api_project_react_native_booking < src/main/resources/migration.sql
```

#### Cách 2: Sử dụng MySQL Workbench hoặc phpMyAdmin
1. Mở MySQL Workbench hoặc phpMyAdmin
2. Kết nối đến database `api_project_react_native_booking`
3. Mở file `migration.sql`
4. Chạy toàn bộ script

#### Cách 3: Sử dụng Spring Boot với JPA
Nếu bạn đang sử dụng `spring.jpa.hibernate.ddl-auto=update`, Hibernate sẽ tự động tạo các cột mới khi khởi động ứng dụng. Tuy nhiên, vẫn nên chạy migration SQL để đảm bảo.

### 2. Cập nhật dữ liệu mẫu

Sau khi chạy migration, chạy script để cập nhật dữ liệu mẫu:

```bash
mysql -u root -p api_project_react_native_booking < src/main/resources/update-sample-data.sql
```

Hoặc chạy từ MySQL Workbench/phpMyAdmin.

### 3. Kiểm tra dữ liệu

Sau khi chạy migration và update data, kiểm tra bằng các query sau:

```sql
-- Kiểm tra hotels có image_url
SELECT id, name, image_url FROM hotels WHERE image_url IS NOT NULL;

-- Kiểm tra users có avatar_url
SELECT id, full_name, avatar_url FROM users WHERE avatar_url IS NOT NULL;

-- Đếm số lượng hotels có image
SELECT COUNT(*) as hotels_with_images FROM hotels WHERE image_url IS NOT NULL AND image_url != '';

-- Đếm số lượng users có avatar
SELECT COUNT(*) as users_with_avatars FROM users WHERE avatar_url IS NOT NULL AND avatar_url != '';
```

## Cấu trúc dữ liệu

### Hotels Table
- `image_url`: VARCHAR(500) - URL của hình ảnh chính của khách sạn
- Có thể là NULL nếu chưa có hình ảnh

### Users Table
- `avatar_url`: VARCHAR(500) - URL của avatar người dùng
- Có thể là NULL nếu chưa có avatar

## Lưu ý

1. **Image URLs**: Script sử dụng Unsplash images làm dữ liệu mẫu. Bạn có thể thay thế bằng URLs của hình ảnh thực tế.

2. **Avatar URLs**: Script sử dụng UI Avatars service để tạo avatar dựa trên tên người dùng. Bạn có thể thay thế bằng URLs avatar thực tế.

3. **Fallback**: Ứng dụng frontend sẽ hiển thị hình ảnh mặc định nếu `image_url` hoặc `avatar_url` là NULL.

4. **Performance**: Đảm bảo các image URLs hợp lệ và có thể truy cập được để tránh lỗi khi load hình ảnh.

## Troubleshooting

### Lỗi: Column already exists
Nếu cột đã tồn tại, bạn có thể bỏ qua lệnh ALTER TABLE hoặc sử dụng:
```sql
ALTER TABLE hotels MODIFY COLUMN image_url VARCHAR(500) NULL;
ALTER TABLE users MODIFY COLUMN avatar_url VARCHAR(500) NULL;
```

### Lỗi: Table doesn't exist
Đảm bảo database và các bảng đã được tạo. Kiểm tra trong `application.properties`:
```properties
spring.jpa.hibernate.ddl-auto=update
```

### Lỗi: Permission denied
Đảm bảo user MySQL có quyền ALTER TABLE:
```sql
GRANT ALL PRIVILEGES ON api_project_react_native_booking.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

## Rollback (nếu cần)

Nếu cần rollback migration:

```sql
-- Xóa cột image_url từ hotels
ALTER TABLE hotels DROP COLUMN image_url;

-- Xóa cột avatar_url từ users
ALTER TABLE users DROP COLUMN avatar_url;
```

**Lưu ý**: Rollback sẽ xóa tất cả dữ liệu trong các cột này.

