import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Alert, Platform } from "react-native";

// Xác định base URL dựa trên platform
const getBaseURL = () => {
  // Nếu có biến môi trường, ưu tiên dùng nó
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Mặc định cho Android Emulator
  if (Platform.OS === "android") {
    return "http://10.0.2.2:8080/api/v1/";
  }

  // Mặc định cho iOS Simulator hoặc Web
  return "http://localhost:8080/api/v1/";
};

const baseURL = getBaseURL();
console.log("🔍 API Base URL:", baseURL);
console.log("🔍 Platform:", Platform.OS);

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

      // Tạo error object với thông tin chi tiết
      const networkError: any = new Error(error.message || "Network Error");
      networkError.isNetworkError = true;
      networkError.baseURL = baseURL;
      networkError.platform = Platform.OS;
      networkError.code = error.code;

      // Không hiển thị alert ở đây, để component tự xử lý
      return Promise.reject(networkError);
    }

    // Kiểm tra nếu originalRequest tồn tại và chưa retry
    if (
      originalRequest &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true; // Mark the request to prevent infinite loops

      try {
        // Lấy refresh token từ AsyncStorage
        const refreshToken = await AsyncStorage.getItem("refreshToken");

        if (refreshToken) {
          // Call refresh token endpoint
          const response = await axios.post(`${baseURL}auth/refresh-token`, {
            refreshToken: refreshToken,
          });

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
