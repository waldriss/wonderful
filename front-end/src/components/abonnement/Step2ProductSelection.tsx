"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  UtensilsCrossed,
  GlassWater,
  Cookie,
  Plus,
  Minus,
  ShoppingBag,
} from "lucide-react";
import { cn, formatDzdAmount } from "@/lib/utils";
import { ProductItem, ProductCategory } from "./types";
import { useProducts } from "@/lib/api/products";
import { Skeleton } from "@/components/ui/skeleton";

interface Step2Props {
  selectedProducts: ProductItem[];
  onProductsChange: (products: ProductItem[]) => void;
  onNext: () => void;
  onBack: () => void;
}

type CategoryTab = "meals" | "drinks" | "desserts";

/** Map catégories API → onglets wizard */
const API_CATEGORY_MAP: Record<string, CategoryTab> = {
  PLATS: "meals",
  BOISSONS: "drinks",
  DESSERTS: "desserts",
  SNACKS: "desserts",
};

const categoryInfo: Record<CategoryTab, { label: string; icon: React.ReactNode }> = {
  meals: {
    label: "Plats",
    icon: <UtensilsCrossed className="w-5 h-5" />,
  },
  drinks: {
    label: "Boissons",
    icon: <GlassWater className="w-5 h-5" />,
  },
  desserts: {
    label: "Desserts & Snacks",
    icon: <Cookie className="w-5 h-5" />,
  },
};

/** Fallback produits statiques utilisés si l'API est indisponible */
const FALLBACK_PRODUCTS: Record<CategoryTab, Omit<ProductItem, "quantity">[]> = {
  meals: [
    { id: "meal-1", name: "Safy Délicieux", description: "Plat traditionnel revisité", price: 8.50, category: "meals", image: "/images/card.png" },
    { id: "meal-2", name: "Yassa Poulet", description: "Poulet mariné aux oignons", price: 9.50, category: "meals", image: "/images/card.png" },
    { id: "meal-3", name: "Thieboudienne", description: "Riz au poisson et légumes", price: 11.00, category: "meals", image: "/images/card.png" },
    { id: "meal-4", name: "Mafé Royal", description: "Viande sauce arachide", price: 9.00, category: "meals", image: "/images/card.png" },
  ],
  drinks: [
    { id: "drink-1", name: "Jus de Bissap", description: "Hibiscus frais", price: 3.50, category: "drinks", image: "/images/card.png" },
    { id: "drink-2", name: "Jus de Gingembre", description: "Gingembre et citron", price: 3.50, category: "drinks", image: "/images/card.png" },
    { id: "drink-3", name: "Smoothie Mangue", description: "Mangue, banane, lait de coco", price: 4.50, category: "drinks", image: "/images/card.png" },
  ],
  desserts: [
    { id: "dessert-1", name: "Fondant Chocolat", description: "Cœur coulant", price: 4.50, category: "desserts", image: "/images/card.png" },
    { id: "dessert-2", name: "Pastels Sucrés", description: "Beignets traditionnels", price: 3.50, category: "desserts", image: "/images/card.png" },
    { id: "dessert-3", name: "Fruit Bowl", description: "Fruits frais de saison", price: 4.00, category: "desserts", image: "/images/card.png" },
  ],
};

const Step2ProductSelection: React.FC<Step2Props> = ({
  selectedProducts,
  onProductsChange,
  onNext,
  onBack,
}) => {
  const [activeCategory, setActiveCategory] = useState<CategoryTab>("meals");

  // Charger les produits depuis l'API
  const { data: apiData, isLoading: isLoadingProducts } = useProducts(
    { pageSize: 100 },
    true
  );

  // Mapper les produits API vers le format du wizard, groupés par onglet
  const availableProducts = useMemo<Record<CategoryTab, Omit<ProductItem, "quantity">[]>>(() => {
    if (!apiData?.data || apiData.data.length === 0) return FALLBACK_PRODUCTS;

    const grouped: Record<CategoryTab, Omit<ProductItem, "quantity">[]> = {
      meals: [],
      drinks: [],
      desserts: [],
    };

    for (const p of apiData.data) {
      const tab = API_CATEGORY_MAP[p.category];
      if (!tab) continue;
      grouped[tab].push({
        id: p.id,
        name: p.name,
        description: p.description,
        category: tab as ProductCategory,
        price: p.finalPrice,
        image: p.image || "/images/card.png",
      });
    }

    // Fallback par onglet si l'API ne retourne pas de produits dans cette catégorie
    return {
      meals: grouped.meals.length > 0 ? grouped.meals : FALLBACK_PRODUCTS.meals,
      drinks: grouped.drinks.length > 0 ? grouped.drinks : FALLBACK_PRODUCTS.drinks,
      desserts: grouped.desserts.length > 0 ? grouped.desserts : FALLBACK_PRODUCTS.desserts,
    };
  }, [apiData]);

  const getProductQuantity = (productId: string) => {
    const product = selectedProducts.find((p) => p.id === productId);
    return product?.quantity || 0;
  };

  const updateProductQuantity = (
    product: Omit<ProductItem, "quantity">,
    delta: number
  ) => {
    const existingProduct = selectedProducts.find((p) => p.id === product.id);
    let newProducts: ProductItem[];

    if (existingProduct) {
      const newQuantity = Math.max(0, existingProduct.quantity + delta);
      if (newQuantity === 0) {
        newProducts = selectedProducts.filter((p) => p.id !== product.id);
      } else {
        newProducts = selectedProducts.map((p) =>
          p.id === product.id ? { ...p, quantity: newQuantity } : p
        );
      }
    } else if (delta > 0) {
      newProducts = [
        ...selectedProducts,
        { ...product, quantity: 1 },
      ];
    } else {
      newProducts = selectedProducts;
    }

    onProductsChange(newProducts);
  };

  const getTotalByCategory = (category: CategoryTab) => {
    return selectedProducts
      .filter((p) => p.category === category)
      .reduce((sum, p) => sum + p.quantity, 0);
  };

  const getTotalItems = () => {
    return selectedProducts.reduce((sum, p) => sum + p.quantity, 0);
  };

  const getTotalPrice = () => {
    return selectedProducts.reduce((sum, p) => sum + p.quantity * p.price, 0);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const isValid = selectedProducts.length > 0;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Category Tabs */}
      <div className="flex flex-wrap justify-center gap-3">
        {(Object.keys(categoryInfo) as CategoryTab[]).map((cat) => {
          const isActive = activeCategory === cat;
          const count = getTotalByCategory(cat);
          const info = categoryInfo[cat];

          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "flex items-center gap-2 px-5 py-3 rounded-full font-semibold font-sans transition-all duration-200",
                isActive
                  ? "bg-secondary text-white"
                  : "bg-card border-2 border-secondary/10 text-secondary-850 hover:border-secondary/30"
              )}
            >
              {info.icon}
              <span>{info.label}</span>
              {count > 0 && (
                <span
                  className={cn(
                    "ml-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                    isActive ? "bg-white/20 text-white" : "bg-secondary/10 text-secondary"
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Products Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {isLoadingProducts
            ? [1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-64 rounded-2xl" />
              ))
            : availableProducts[activeCategory].map((product) => {
            const quantity = getProductQuantity(product.id);
            const isSelected = quantity > 0;

            return (
              <motion.div
                key={product.id}
                variants={itemVariants}
                className={cn(
                  "bg-card rounded-2xl overflow-hidden transition-all duration-200",
                  isSelected
                    ? "border-2 border-secondary shadow-md"
                    : "border-2 border-secondary/5 hover:border-secondary/20"
                )}
              >
                {/* Product Image */}
                <div className="relative h-40 bg-primary-100 flex items-center justify-center">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={120}
                    height={120}
                    className="object-contain"
                  />
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-3 right-3 bg-secondary text-white px-3 py-1 rounded-full text-sm font-bold font-sans"
                    >
                      x{quantity}
                    </motion.div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-bold font-sans text-secondary-850 mb-1">
                    {product.name}
                  </h3>
                  <p className="text-secondary-850/60 text-sm font-sans mb-2">{product.description}</p>
                  <p className="font-bold font-sans text-secondary text-lg">
                    {formatDzdAmount(product.price)}
                  </p>

                  {/* Quantity Controls */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateProductQuantity(product, -1)}
                        disabled={quantity === 0}
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                          quantity > 0
                            ? "bg-secondary/10 text-secondary hover:bg-secondary/20"
                            : "bg-primary-100 text-secondary-850/30 cursor-not-allowed"
                        )}
                      >
                        <Minus className="w-5 h-5" />
                      </button>

                      <span className="w-10 text-center font-bold font-sans text-xl text-secondary-850">
                        {quantity}
                      </span>

                      <button
                        onClick={() => updateProductQuantity(product, 1)}
                        className="w-10 h-10 rounded-xl bg-secondary text-white flex items-center justify-center hover:bg-secondary/90 transition-all"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>

                    {isSelected && (
                      <span className="font-semibold font-sans text-secondary">
                        {formatDzdAmount(quantity * product.price)}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Cart Summary */}
      <motion.div
        variants={itemVariants}
        className="bg-card border-2 border-secondary/5 rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6 text-secondary" />
          </div>
          <div>
            <h3 className="font-bold font-sans text-secondary-850">Votre sélection</h3>
            <p className="text-sm font-sans text-secondary-850/60">
              {getTotalItems()} article{getTotalItems() > 1 ? "s" : ""} sélectionné
              {getTotalItems() > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Selected Items Summary */}
        {selectedProducts.length > 0 ? (
          <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
            {selectedProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between py-2 border-b border-secondary/5 last:border-0"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full",
                      product.category === "meals"
                        ? "bg-secondary"
                        : product.category === "drinks"
                        ? "bg-primary-500"
                        : "bg-primary-400"
                    )}
                  />
                  <span className="text-sm font-sans text-secondary-850">{product.name}</span>
                  <span className="text-xs font-sans text-secondary-850/50">x{product.quantity}</span>
                </div>
                <span className="font-medium text-sm font-sans text-secondary">
                  {formatDzdAmount(product.quantity * product.price)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center font-sans text-secondary-850/40 py-4">
            Aucun produit sélectionné
          </p>
        )}

        {/* Total */}
        <div className="flex items-center justify-between pt-4 border-t-2 border-secondary/5">
          <span className="font-bold font-sans text-secondary-850">Total</span>
          <span className="font-bold font-sans text-2xl text-secondary">
            {formatDzdAmount(getTotalPrice())}
          </span>
        </div>
      </motion.div>

      {/* Navigation Buttons */}
      <div className="flex gap-4">
        <motion.button
          onClick={onBack}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 h-14 px-6 rounded-full border-2 border-secondary/30 text-secondary-850 font-semibold font-sans hover:bg-secondary/5 transition-colors"
        >
          Retour
        </motion.button>
        <motion.button
          onClick={onNext}
          disabled={!isValid}
          whileHover={isValid ? { scale: 1.02 } : {}}
          whileTap={isValid ? { scale: 0.98 } : {}}
          className={cn(
            "flex-1 h-14 px-6 rounded-full font-semibold font-sans transition-all",
            isValid
              ? "bg-secondary text-white hover:bg-secondary/90 shadow-md"
              : "bg-primary-200 text-secondary-850/40 cursor-not-allowed"
          )}
        >
          Continuer
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Step2ProductSelection;
