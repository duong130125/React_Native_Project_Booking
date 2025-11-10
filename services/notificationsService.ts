import AsyncStorage from "@react-native-async-storage/async-storage";
import { Notification } from "../types/hotel";

const NOTIFICATIONS_KEY = "notifications";

export const notificationsService = {
  /**
   * Load notifications from AsyncStorage
   */
  async loadNotifications(): Promise<Notification[]> {
    try {
      const notifications = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      return notifications ? JSON.parse(notifications) : [];
    } catch (error) {
      console.error("Error loading notifications:", error);
      return [];
    }
  },

  /**
   * Save notifications to AsyncStorage
   */
  async saveNotifications(notifications: Notification[]): Promise<void> {
    try {
      await AsyncStorage.setItem(
        NOTIFICATIONS_KEY,
        JSON.stringify(notifications)
      );
    } catch (error) {
      console.error("Error saving notifications:", error);
    }
  },

  /**
   * Add notification
   */
  async addNotification(notification: Notification): Promise<void> {
    const notifications = await this.loadNotifications();
    notifications.unshift(notification); // Add to beginning
    await this.saveNotifications(notifications);
  },

  /**
   * Remove notification by id
   */
  async removeNotification(id: string): Promise<void> {
    const notifications = await this.loadNotifications();
    const updated = notifications.filter((n) => n.id !== id);
    await this.saveNotifications(updated);
  },

  /**
   * Clear all notifications
   */
  async clearNotifications(): Promise<void> {
    await AsyncStorage.removeItem(NOTIFICATIONS_KEY);
  },
};
