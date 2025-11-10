import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Alert, Platform } from "react-native";

const getBaseURL = () => {
  // Ưu tiên biến môi trường
  if (process.env.EXPO_PUBLIC_API_URL) {
    console.log(
      "🔍 Using EXPO_PUBLIC_API_URL from environment:",
      process.env.EXPO_PUBLIC_API_URL
    );
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Android emulator dùng 10.0.2.2 để kết nối với localhost của máy
  if (Platform.OS === "android") {
    // Kiểm tra xem có đang chạy trên emulator không
    // Nếu có biến môi trường hoặc đang dev, có thể là thiết bị thật
    // Bạn có thể thay đổi IP này theo IP máy tính của bạn
    // IP WiFi hiện tại: 192.168.1.225 (kiểm tra bằng ipconfig)
    const devURL = "http://192.168.1.225:8080/api/v1/"; // Thiết bị thật - thay IP này nếu cần
    const emulatorURL = "http://10.0.2.2:8080/api/v1/"; // Emulator

    const selectedURL = __DEV__ ? devURL : emulatorURL;
    console.log(
      "🔍 Android URL selected:",
      selectedURL,
      __DEV__ ? "(DEV - Thiết bị thật)" : "(Production - Emulator)"
    );
    return selectedURL;
  }

  // iOS simulator
  if (Platform.OS === "ios") {
    return "http://localhost:8080/api/v1/";
  }

  // Web hoặc fallback
  return "http://localhost:8080/api/v1/";
};

const baseURL = getBaseURL();
console.log("🔍 API Base URL:", baseURL);
console.log("🔍 Platform:", Platform.OS);
console.log("🔍 __DEV__:", __DEV__);
console.log(
  "🔍 EXPO_PUBLIC_API_URL:",
  process.env.EXPO_PUBLIC_API_URL || "Không có"
);

const axiosInstance = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds timeout
});

// Gửi các request kèm theo lên API (thông qua interceptor)
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      // Không gửi token cho các auth endpoints (register, login, etc.)
      const url = config.url || "";
      const isAuthEndpoint = url.startsWith("auth/");

      if (!isAuthEndpoint) {
        // Chỉ gửi token cho các endpoints cần authentication
        const accessToken = await AsyncStorage.getItem("accessToken");
        if (accessToken) {
          config.headers["Authorization"] = `Bearer ${accessToken}`;
        }
      } else {
        // Xóa Authorization header nếu có (để tránh gửi token cũ không hợp lệ)
        delete config.headers["Authorization"];
      }
    } catch (error) {
      console.error("Error getting token from AsyncStorage:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Lấy các phản hồi từ phía server một cách tự động
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Kiểm tra nếu không có response (network error, timeout, etc.)
    if (!error.response) {
      // Log chi tiết để debug
      console.error("❌ Network Error Details:", {
        message: error.message,
        code: error.code,
        baseURL: baseURL,
        platform: Platform.OS,
        config: error.config?.url,
      });

      // Tạo error message chi tiết hơn
      let errorMessage = "Không thể kết nối đến server.\n\n";
      errorMessage += `URL: ${baseURL}\n`;
      errorMessage += `Platform: ${Platform.OS}\n\n`;

      if (error.code === "ERR_NETWORK") {
        errorMessage += "Nguyên nhân có thể:\n";
        errorMessage += "1. Server chưa chạy hoặc đã tắt\n";
        errorMessage += "2. IP không đúng (kiểm tra IP máy tính)\n";
        errorMessage += "3. Thiết bị và máy tính không cùng mạng WiFi\n";
        errorMessage += "4. Firewall chặn cổng 8080\n";
        if (Platform.OS === "android") {
          errorMessage +=
            "5. Android chặn HTTP (đã cấu hình usesCleartextTraffic)\n";
        }
        errorMessage += "\nCách sửa:\n";
        errorMessage += "- Kiểm tra server đang chạy: http://localhost:8080\n";
        errorMessage +=
          "- Tìm IP máy tính: ipconfig (Windows) hoặc ifconfig (Mac/Linux)\n";
        errorMessage +=
          "- Tạo file .env với: EXPO_PUBLIC_API_URL=http://YOUR_IP:8080/api/v1/\n";
        errorMessage += "- Restart app: npx expo start --clear";
      } else if (
        error.code === "ECONNABORTED" ||
        error.message?.includes("timeout")
      ) {
        errorMessage =
          "Kết nối quá thời gian chờ. Vui lòng kiểm tra server và thử lại.";
      }

      // Tạo error object với thông tin chi tiết
      const networkError: any = new Error(errorMessage);
      networkError.isNetworkError = true;
      networkError.baseURL = baseURL;
      networkError.platform = Platform.OS;
      networkError.code = error.code;
      networkError.originalMessage = error.message;

      // Không hiển thị alert ở đây, để component tự xử lý
      return Promise.reject(networkError);
    }

    // Kiểm tra nếu originalRequest tồn tại và chưa retry
    if (
      originalRequest &&
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true; // Mark the request to prevent infinite loops

      try {
        // Lấy refresh token từ AsyncStorage
        const refreshToken = await AsyncStorage.getItem("refreshToken");

        if (refreshToken) {
          // Call refresh token endpoint (dùng axios trực tiếp để tránh interceptor loop)
          const response = await axios.post(
            `${baseURL}auth/refresh-token`,
            {
              refreshToken: refreshToken,
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          const { accessToken } = response?.data?.data;

          // Update stored tokens on AsyncStorage
          if (accessToken) {
            await AsyncStorage.setItem("accessToken", accessToken);
          }

          // Update the Authorization header in the original failed request
          axiosInstance.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${accessToken}`;
          originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;

          // Retry the original request with the new access token
          return axiosInstance(originalRequest);
        } else {
          // Không có refresh token, yêu cầu đăng nhập lại
          await AsyncStorage.removeItem("accessToken");
          await AsyncStorage.removeItem("refreshToken");
          Alert.alert(
            "Cảnh báo",
            "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại"
          );
          return Promise.reject(error);
        }
      } catch (refreshError: any) {
        // Xóa token nếu refresh thất bại
        await AsyncStorage.removeItem("accessToken");
        await AsyncStorage.removeItem("refreshToken");

        const errorMessage =
          refreshError.response?.data?.message ||
          refreshError.message ||
          "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại";

        Alert.alert("Cảnh báo", errorMessage);
        return Promise.reject(refreshError);
      }
    }

    // Xử lý các lỗi HTTP khác
    const status = error.response.status;
    let errorMessage = "Đã xảy ra lỗi. Vui lòng thử lại.";

    // Lấy error message từ APIResponse format
    const apiResponse = error.response.data;
    if (apiResponse?.message) {
      errorMessage = apiResponse.message;
    } else {
      // Fallback messages
      switch (status) {
        case 400:
          errorMessage = "Yêu cầu không hợp lệ";
          break;
        case 401:
          errorMessage = "Không có quyền truy cập";
          break;
        case 403:
          errorMessage = "Bị cấm truy cập";
          break;
        case 404:
          errorMessage = "Không tìm thấy tài nguyên";
          break;
        case 500:
          errorMessage = "Lỗi server. Vui lòng thử lại sau";
          break;
        default:
          errorMessage = error.message || errorMessage;
      }
    }

    // Không hiển thị alert cho tất cả lỗi, chỉ log (để component tự xử lý)
    console.error("❌ API Error:", {
      status,
      message: errorMessage,
      data: error.response.data,
    });

    return Promise.reject(error);
  }
);

export default axiosInstance;
