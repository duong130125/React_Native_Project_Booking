import { useEffect, useState } from "react";
import { bookmarksService } from "../services/bookmarksService";
import { favoritesService } from "../services/favoritesService";
import { notificationsService } from "../services/notificationsService";
import { Hotel } from "../types/hotel";

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const favoriteList = await favoritesService.loadFavorites();
      setFavorites(favoriteList);
    } catch (error) {
      console.error("Error loading favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (hotel: Hotel) => {
    try {
      const hotelId = hotel.id;
      const isFavorite = favorites.includes(hotelId);
      const wasAdded = await favoritesService.toggleFavorite(hotelId);

      // Update local state
      if (wasAdded) {
        setFavorites([...favorites, hotelId]);
      } else {
        setFavorites(favorites.filter((id) => id !== hotelId));
      }

      // Handle bookmarks
      if (wasAdded) {
        // Add to bookmarks
        const bookmark = {
          id: Date.now().toString(),
          hotelId: hotelId.toString(),
          hotelName: hotel.name,
          location: hotel.location,
          rating: hotel.rating,
          reviews: hotel.reviews,
          price: hotel.price,
          image: hotel.image,
          savedAt: "Today",
        };
        await bookmarksService.addBookmark(bookmark);

        // Create notification
        const notification = {
          id: Date.now().toString(),
          type: "bookmark" as const,
          title: `You Saved "${hotel.name}"`,
          description: "Your just bookmarked",
          date: "Today",
          image: hotel.image,
          createdAt: new Date().toISOString(),
          hotelId: hotelId.toString(),
        };
        await notificationsService.addNotification(notification);
      } else {
        // Remove from bookmarks
        await bookmarksService.removeBookmark(hotelId.toString());
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      // Revert state on error
      await loadFavorites();
    }
  };

  return {
    favorites,
    loading,
    toggleFavorite,
    isFavorite: (hotelId: number) => favorites.includes(hotelId),
    reload: loadFavorites,
  };
};
