"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { 
  Heart, 
  Trash2,
  Plus,
  ShoppingCart,
  Star,
  Clock,
  Flame,
  Loader2
} from "lucide-react";
import { useFavorites } from "@/lib/api/favorites";
import { useToggleFavorite } from "@/lib/api/favorites";
import { formatCategoryLabel } from "@/lib/product-labels";

const fallbackImages = ["/images/white.png", "/images/yellow.png", "/images/blue.png"];

export default function FavoritesPage() {
  const { data: favoritesData, isLoading } = useFavorites();
  const toggleFavorite = useToggleFavorite();

  const favorites = (favoritesData?.data ?? []).map((fav, i) => ({
    id: fav.product.id,
    name: fav.product.name,
    description: fav.product.description ?? '',
    image: fav.product.image ?? fallbackImages[i % 3],
    calories: 0,
    proteins: 0,
    prepTime: 0,
    rating: fav.product.rating ?? 0,
    category: fav.product.category ?? 'Plats',
    price: fav.product.finalPrice ?? fav.product.price,
    addedDate: new Date(fav.addedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
  }));

  const removeFavorite = (productId: string) => {
    toggleFavorite.mutate({ productId, isFavorite: true });
  };

  const categoryCount = {
    Plats: favorites.filter(f => f.category === 'PLATS').length,
    Boissons: favorites.filter(f => f.category === 'BOISSONS').length,
    Desserts: favorites.filter(f => f.category === 'DESSERTS').length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-sans font-bold text-secondary-850 flex items-center gap-3">
          <Heart className="w-8 h-8 text-red-500 fill-red-500" />
          Mes Favoris
        </h1>
        <p className="text-secondary-850/60 font-sans mt-1">
          {favorites.length} produits dans vos favoris
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border-2 border-secondary/10 rounded-2xl p-4">
          <p className="text-sm text-secondary-850/60 font-sans mb-1">Plats</p>
          <p className="text-3xl font-sans font-bold text-secondary-850">{categoryCount.Plats}</p>
        </div>
        <div className="bg-card border-2 border-secondary/10 rounded-2xl p-4">
          <p className="text-sm text-secondary-850/60 font-sans mb-1">Boissons</p>
          <p className="text-3xl font-sans font-bold text-secondary-850">{categoryCount.Boissons}</p>
        </div>
        <div className="bg-card border-2 border-secondary/10 rounded-2xl p-4">
          <p className="text-sm text-secondary-850/60 font-sans mb-1">Desserts</p>
          <p className="text-3xl font-sans font-bold text-secondary-850">{categoryCount.Desserts}</p>
        </div>
      </div>

      {/* Favorites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {favorites.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-card border-2 border-secondary/10 rounded-2xl p-4 hover:border-secondary/30 transition-all duration-200 relative overflow-hidden group"
          >
            {/* Category badge */}
              <div className="absolute top-4 right-4 bg-secondary/20 text-secondary px-3 py-1 rounded-full text-xs font-sans font-semibold">
                {formatCategoryLabel(item.category)}
              </div>

            <div className="flex gap-4">
              {/* Image */}
              <div className="relative w-28 h-28 rounded-xl overflow-hidden flex-shrink-0">
                <Image 
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-sans font-bold text-secondary-850 mb-1 pr-12">
                  {item.name}
                </h3>
                <p className="text-sm text-secondary-850/60 font-sans mb-2 line-clamp-2">
                  {item.description}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < item.rating
                          ? 'text-primary-400 fill-primary-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-3 text-xs font-sans text-secondary-850/60 mb-3">
                  <span className="flex items-center gap-1">
                    <Flame className="w-3 h-3 text-orange-500" />
                    {item.calories} kcal
                  </span>
                  <span>{item.proteins}g P</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-blue-500" />
                    {item.prepTime} min
                  </span>
                </div>

                {/* Price & Actions */}
                <div className="flex items-center gap-2">
                  <span className="text-xl font-sans font-bold text-secondary">
                    {item.price.toFixed(2)}€
                  </span>
                  
                  <div className="flex-1" />

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="h-8 w-8 bg-secondary text-white rounded-full flex items-center justify-center hover:bg-secondary/90 transition-colors duration-200"
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => removeFavorite(item.id)}
                    className="h-8 w-8 bg-red-100 text-red-500 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>

                {/* Added date */}
                <p className="text-xs text-secondary-850/40 font-sans mt-2">
                  Ajouté {item.addedDate}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty state */}
      {favorites.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card border-2 border-secondary/10 rounded-3xl p-12 text-center"
        >
          <Heart className="w-16 h-16 text-secondary/30 mx-auto mb-4" />
          <h3 className="text-xl font-sans font-bold text-secondary-850 mb-2">
            Aucun favori pour le moment
          </h3>
          <p className="text-secondary-850/60 font-sans mb-6">
            Commencez à ajouter vos plats préférés
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="h-12 px-8 bg-secondary text-white rounded-full font-sans font-semibold hover:bg-secondary/90 transition-colors duration-200 inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Explorer les plats
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
}
