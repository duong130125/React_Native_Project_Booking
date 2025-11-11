import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Xóa tất cả tokens khỏi AsyncStorage
 * Sử dụng khi cần clear token cũ không hợp lệ
 */
export async function clearAllTokens(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      "accessToken",
      "refreshToken",
      "userId",
    ]);
    console.log("✅ Đã xóa tất cả tokens");
  } catch (error) {
    console.error("❌ Lỗi khi xóa tokens:", error);
  }
}

/**
 * Kiểm tra và xóa token nếu không hợp lệ
 */
export async function validateAndClearToken(): Promise<boolean> {
  try {
    const accessToken = await AsyncStorage.getItem("accessToken");
    if (accessToken) {
      // Kiểm tra token có format hợp lệ không (JWT thường có 3 phần)
      const parts = accessToken.split(".");
      if (parts.length !== 3) {
        console.log("⚠️ Token không hợp lệ, đang xóa...");
        await clearAllTokens();
        return false;
      }
    }
    return true;
  } catch (error) {
    console.error("❌ Lỗi khi validate token:", error);
    return false;
  }
}

