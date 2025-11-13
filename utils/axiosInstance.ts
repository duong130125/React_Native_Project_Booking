import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Platform } from "react-native";

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
  timeout: 30000, // 30 seconds timeout for file uploads
});

// Đảm bảo không có Authorization trong default headers
if (axiosInstance.defaults.headers.common) {
  delete axiosInstance.defaults.headers.common["Authorization"];
}

// Gửi các request kèm theo lên API (thông qua interceptor)
axiosInstance.interceptors.request.use(
  async (config) => {
    // Check if this is a FormData request
    // In React Native, FormData might not pass instanceof check
    const isFormData =
      config.data instanceof FormData ||
      (config.data &&
        config.data.constructor &&
        config.data.constructor.name === "FormData") ||
      (config.data && typeof config.data.append === "function");

    // Log for debugging
    if (isFormData) {
      console.log("📤 FormData detected, removing Content-Type header", {
        dataType: typeof config.data,
        constructor: config.data?.constructor?.name,
        hasAppend: typeof config.data?.append === "function",
        url: config.url,
      });
    }

    // For FormData, remove Content-Type completely FIRST
    // so axios can set it automatically with boundary
    if (isFormData) {
      if (config.headers) {
        delete config.headers["Content-Type"];
        delete config.headers["content-type"];
      }
      // Also remove from common headers
      if (config.headers?.common) {
        delete config.headers.common["Content-Type"];
        delete config.headers.common["content-type"];
      }
      // Remove from post headers too
      if (config.headers?.post) {
        delete config.headers.post["Content-Type"];
        delete config.headers.post["content-type"];
      }
    } else {
      // Set default Content-Type for non-FormData requests
      if (!config.headers) {
        config.headers = {} as any;
      }
      if (!config.headers["Content-Type"]) {
        config.headers["Content-Type"] = "application/json";
      }
    }

    try {
      const url = config.url || "";

      // Danh sách các public endpoints không cần authentication
      // Chỉ các auth endpoints cụ thể là public (register, login, check-email)
      // Các endpoints khác như getUserById, updateProfile cần authentication
      const publicAuthEndpoints = [
        "auth/register",
        "auth/login",
        "auth/check-email",
        "auth/forgot-password",
        "auth/verify-otp",
        "auth/reset-password",
      ];

      const publicEndpoints = [
        ...publicAuthEndpoints,
        "hotels", // Hotel endpoints (public) - GET requests
        "rooms", // Room endpoints (public) - GET requests
        "reviews", // Review endpoints (public - để xem) - GET requests
      ];

      // Kiểm tra xem có phải public auth endpoint không
      const isPublicAuthEndpoint = publicAuthEndpoints.some((endpoint) =>
        url.startsWith(endpoint)
      );

      // Kiểm tra xem có phải public endpoint khác không (hotels, rooms, reviews)
      const isPublicOtherEndpoint =
        url.startsWith("hotels") ||
        url.startsWith("rooms") ||
        url.startsWith("reviews");

      const isPublicEndpoint = isPublicAuthEndpoint || isPublicOtherEndpoint;

      if (isPublicEndpoint) {
        // XÓA HOÀN TOÀN Authorization header cho public endpoints
        delete config.headers["Authorization"];
        delete config.headers.common?.["Authorization"];
        // Đảm bảo không có trong bất kỳ đâu
        if (config.headers) {
          config.headers["Authorization"] = undefined;
        }
      } else {
        // Chỉ gửi token cho các endpoints cần authentication (bookings, payments, etc.)
        const accessToken = await AsyncStorage.getItem("accessToken");
        if (accessToken) {
          config.headers["Authorization"] = `Bearer ${accessToken}`;
        } else {
          // Nếu không có token, xóa header
          delete config.headers["Authorization"];
        }
      }
    } catch (error) {
      console.error("Error getting token from AsyncStorage:", error);
      // Nếu có lỗi, xóa Authorization header
      delete config.headers["Authorization"];
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
    // QUAN TRỌNG: Không xử lý refresh token cho các auth endpoints (login, register, etc.)
    const requestUrl = originalRequest?.url || "";
    const isAuthEndpoint =
      requestUrl.includes("auth/login") ||
      requestUrl.includes("auth/register") ||
      requestUrl.includes("auth/forgot-password") ||
      requestUrl.includes("auth/reset-password") ||
      requestUrl.includes("auth/verify-otp") ||
      requestUrl.includes("auth/refresh-token");

    // Nếu là auth endpoint và có lỗi 401, reject ngay để component xử lý
    // KHÔNG xử lý refresh token cho auth endpoints
    if (isAuthEndpoint && error.response?.status === 401) {
      // Reject ngay để component có thể xử lý error message
      return Promise.reject(error);
    }

    if (
      originalRequest &&
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint // Chỉ refresh token cho các request không phải auth endpoints
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

          // Update the Authorization header in the original failed request only
          // KHÔNG set vào defaults.headers.common để tránh gửi token cho mọi request
          originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;

          // Retry the original request with the new access token
          return axiosInstance(originalRequest);
        } else {
          // Không có refresh token, chỉ xóa token và reject
          // KHÔNG hiển thị Alert ở đây - để component tự xử lý
          await AsyncStorage.removeItem("accessToken");
          await AsyncStorage.removeItem("refreshToken");
          return Promise.reject(error);
        }
      } catch (refreshError: any) {
        // Xóa token nếu refresh thất bại
        // KHÔNG hiển thị Alert ở đây - để component tự xử lý
        await AsyncStorage.removeItem("accessToken");
        await AsyncStorage.removeItem("refreshToken");
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
