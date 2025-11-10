import AsyncStorage from "@react-native-async-storage/async-storage";

const FAVORITES_KEY = "favorites";

export const favoritesService = {
  /**
   * Load favorites from AsyncStorage
   */
  async loadFavorites(): Promise<number[]> {
    try {
      const favorites = await AsyncStorage.getItem(FAVORITES_KEY);
      return favorites ? JSON.parse(favorites) : [];
    } catch (error) {
      console.error("Error loading favorites:", error);
      return [];
    }
  },

  /**
   * Save favorites to AsyncStorage
   */
  async saveFavorites(favorites: number[]): Promise<void> {
    try {
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error("Error saving favorites:", error);
    }
  },

  /**
   * Check if hotel is favorite
   */
  async isFavorite(hotelId: number): Promise<boolean> {
    const favorites = await this.loadFavorites();
    return favorites.includes(hotelId);
  },

  /**
   * Toggle favorite status
   */
  async toggleFavorite(hotelId: number): Promise<boolean> {
    const favorites = await this.loadFavorites();
    const isFavorite = favorites.includes(hotelId);

    if (isFavorite) {
      const updated = favorites.filter((id) => id !== hotelId);
      await this.saveFavorites(updated);
      return false;
    } else {
      const updated = [...favorites, hotelId];
      await this.saveFavorites(updated);
      return true;
    }
  },
};
