import AsyncStorage from "@react-native-async-storage/async-storage";
import { Bookmark } from "../types/hotel";

const BOOKMARKS_KEY = "bookmarks";

export const bookmarksService = {
  /**
   * Load bookmarks from AsyncStorage
   */
  async loadBookmarks(): Promise<Bookmark[]> {
    try {
      const bookmarks = await AsyncStorage.getItem(BOOKMARKS_KEY);
      return bookmarks ? JSON.parse(bookmarks) : [];
    } catch (error) {
      console.error("Error loading bookmarks:", error);
      return [];
    }
  },

  /**
   * Save bookmarks to AsyncStorage
   */
  async saveBookmarks(bookmarks: Bookmark[]): Promise<void> {
    try {
      await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    } catch (error) {
      console.error("Error saving bookmarks:", error);
    }
  },

  /**
   * Add bookmark
   */
  async addBookmark(bookmark: Bookmark): Promise<void> {
    const bookmarks = await this.loadBookmarks();
    bookmarks.unshift(bookmark); // Add to beginning
    await this.saveBookmarks(bookmarks);
  },

  /**
   * Remove bookmark by hotelId
   */
  async removeBookmark(hotelId: string): Promise<void> {
    const bookmarks = await this.loadBookmarks();
    const updated = bookmarks.filter((b) => b.hotelId !== hotelId);
    await this.saveBookmarks(updated);
  },

  /**
   * Check if hotel is bookmarked
   */
  async isBookmarked(hotelId: string): Promise<boolean> {
    const bookmarks = await this.loadBookmarks();
    return bookmarks.some((b) => b.hotelId === hotelId);
  },
};
