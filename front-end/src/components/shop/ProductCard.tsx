import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { StarIcon } from '@/components/icons/StarIcon';
import Image from 'next/image';
import Link from 'next/link';
import card from "../../../public/images/card.png";
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Clock, Target, Plus, MoreHorizontal, ShoppingCart, Check, Heart, Leaf, AlertTriangle } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { resolveAppImage } from '@/lib/resolve-image';
import { formatCategoryLabel, formatDietTypeLabel } from '@/lib/product-labels';

export interface ProductProps {
  id: string;
  name: string;
  price: number;
  rating: number;
  category: string;
  image: string;
  description?: string;
  isNew?: boolean;
  isOnSale?: boolean;
  isBestSeller?: boolean;
  discount?: number;
  // New health-focused properties
  dietTypes?: string[];
  allergens?: string[];
  mealType?: string[];
  portionSize?: string;
  dietaryGoals?: string[];
  prepTime?: string;
  nutrition?: {
    calories: number;
    proteins: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  /** Si true, le cœur est plein (produit en favori) */
  isFavorite?: boolean;
  /** Appelé quand l'utilisateur clique sur le cœur */
  onToggleFavorite?: (productId: string, currentIsFavorite: boolean) => void;
}

const ProductCard: React.FC<ProductProps> = ({ 
  id,
  name, 
  price, 
  rating, 
  category,
  image,
  description,
  isNew = false,
  isOnSale = false,
  isBestSeller = false,
  discount = 0,
  dietTypes,
  allergens,
  mealType,
  dietaryGoals,
  nutrition,
  isFavorite = false,
  onToggleFavorite,
}) => {
  const resolvedImage = resolveAppImage(image, card.src);
  const [showAllTags, setShowAllTags] = useState(false);
  const [visibleTagsCount, setVisibleTagsCount] = useState(2);
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const tagsContainerRef = useRef<HTMLDivElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  
  const { addItem, openCart, getItemQuantity } = useCart();
  const itemInCart = getItemQuantity(id);

  // Combine all badges into one array
  const allBadges = [
    ...(dietTypes?.map(type => ({
      name: formatDietTypeLabel(type),
      color: 'text-green-700',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-200',
      icon: <Leaf className="w-3 h-3" />
    })) || []),
    ...(allergens?.map(allergen => ({
      name: allergen,
      color: 'text-orange-700',
      bgColor: 'bg-orange-100',
      borderColor: 'border-orange-200',
      icon: <AlertTriangle className="w-3 h-3" />
    })) || []),
    ...(mealType?.map(type => ({
      name: type,
      color: 'text-secondary-850',
      bgColor: 'bg-primary-200/50',
      borderColor: 'border-primary-200',
      icon: type === 'Post-entraînement' ? <Dumbbell className="w-3 h-3" /> : <Clock className="w-3 h-3" />
    })) || []),
    ...(dietaryGoals?.map(goal => ({
      name: goal,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
      borderColor: 'border-secondary/20',
      icon: <Target className="w-3 h-3" />
    })) || [])
  ];

  // Calculate how many badges can fit in one row
  useEffect(() => {
    const calculateVisibleTags = () => {
      if (tagsContainerRef.current && allBadges.length > 0) {
        const containerWidth = tagsContainerRef.current.clientWidth;
        // Estimate tag width based on content and padding
        const avgTagWidth = 80; // Average width for badges
        const maxTags = Math.floor((containerWidth - 40) / avgTagWidth); // Reserve space for "more" button
        setVisibleTagsCount(Math.max(1, Math.min(maxTags, allBadges.length)));
      }
    };

    calculateVisibleTags();
    window.addEventListener('resize', calculateVisibleTags);
    return () => window.removeEventListener('resize', calculateVisibleTags);
  }, [allBadges.length]);

  const visibleBadges = allBadges.slice(0, visibleTagsCount);
  const hiddenBadges = allBadges.slice(visibleTagsCount);
  const hasMoreBadges = hiddenBadges.length > 0;

  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (moreButtonRef.current) {
      const rect = moreButtonRef.current.getBoundingClientRect();
      setPopoverPosition({
        x: rect.left,
        y: rect.bottom + 5
      });
    }
    setShowAllTags(!showAllTags);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem({
      id,
      name,
      price,
      image: resolvedImage,
      category,
      discount,
      isOnSale,
      description,
      rating,
      nutrition
    });
    
    // Show success feedback briefly then open cart
    setIsAddedToCart(true);
    setTimeout(() => {
      setIsAddedToCart(false);
      openCart();
    }, 500);
  };

  // Simplified card variants with minimal animations
  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 20
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    hover: {
      y: -4,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    }
  };

  // Minimal image animation
  const imageVariants = {
    hover: {
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    }
  };

  // Simplified badge animations
  const badgeVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.9
    },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: 0.1 + (i * 0.05),
        duration: 0.2,
        ease: "easeOut"
      }
    })
  };

  // Minimal button animation
  const buttonVariants = {
    hover: {
      scale: 1.01,
      transition: {
        duration: 0.15,
        ease: "easeOut"
      }
    },
    tap: {
      scale: 0.99,
      transition: {
        duration: 0.1
      }
    }
  };

  // Subtle star animation
  const starVariants = {
    hover: {
      scale: 1.1,
      transition: {
        duration: 0.15,
        ease: "easeOut"
      }
    }
  };

  // Simplified nutrition animation
  const nutritionVariants = {
    hidden: { 
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.2,
        duration: 0.2
      }
    }
  };

  // Clean popover animation
  const popoverVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.15,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.1
      }
    }
  };

  return (
    <>
      <Link href={`/boutique/${id}`} className="block">
        <motion.div 
          className="flex bg-card border-secondary/5 border-4 rounded-[28px] flex-col items-center text-center group relative p-4 transition-all duration-300 hover:shadow-lg cursor-pointer"
          style={{ height: '520px' }}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          custom={id}
        >
        {/* Special tags - simplified animations */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
          <AnimatePresence>
            {isNew && (
              <motion.div
                key="badge-new"
                variants={badgeVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                custom={0}
              >
                <Badge variant="default" className="bg-primary-300 font-sans text-black px-2 py-1 ">
                  Nouveau
                </Badge>
              </motion.div>
            )}
            {isOnSale && (
              <motion.div
                key="badge-sale"
                variants={badgeVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                custom={1}
              >
                <Badge variant="default" className="bg-secondary text-white px-2 py-1 font-semibold">
                  -{discount}%
                </Badge>
              </motion.div>
            )}
            {isBestSeller && (
              <motion.div
                key="badge-bestseller"
                variants={badgeVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                custom={2}
              >
                <Badge variant="default" className="bg-[#9f8ad4]/80 text-white px-2 py-1 font-semibold">
                  Best-seller
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.div 
          className="relative w-full h-60 rounded-[28px] overflow-hidden"
          variants={imageVariants}
        >
          <Image 
            className='object-cover transition-transform duration-200 group-hover:scale-105' 
            src={resolvedImage} 
            alt={name} 
            fill
            unoptimized
          />
        </motion.div>
        
        {/* Health info badges - minimal animation */}
        <AnimatePresence>
          {nutrition && (
            <motion.div 
              className="absolute top-2 left-2 bg-secondary-400/5 font-sans border border-secondary/10 backdrop-blur-sm rounded-lg px-2 py-1 text-xs font-semibold text-secondary-850 flex flex-col items-start"
              variants={nutritionVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="flex items-center gap-1 font-medium">
                <span>{nutrition.calories}</span>
                <span className="text-[10px]">kcal</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-secondary-600 font-medium">
                <span>P: {nutrition.proteins}g</span>
                <span>G: {nutrition.carbs}g</span>
                <span>L: {nutrition.fat}g</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Single row of badges - remove excessive animations */}
        <motion.section 
          ref={tagsContainerRef}
          className='flex items-center justify-start gap-2 px-2 py-3 w-full h-12'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.2 }}
        >
          {visibleBadges.map((badge, index) => (
            <motion.div 
              key={`${badge.name}-${index}`}
              className={`flex items-center gap-x-1 rounded-full ${badge.bgColor} px-2 border ${badge.borderColor} py-[1px] whitespace-nowrap transition-transform duration-150 hover:scale-105`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ 
                delay: 0.1 + (index * 0.02),
                duration: 0.2
              }}
            >
              {badge.icon && badge.icon}
              {!badge.icon && (
                <div className={`size-1 ${badge.bgColor.replace('/20', '').replace('/10', '').replace('/15','')} rotate-45 rounded-[2px]`}/>
              )}
              <p className={`text-xs font-sans ${badge.color} font-semibold`}>{badge.name}</p>
            </motion.div>
          ))}
          
          {/* "More" button - simplified */}
          {hasMoreBadges && (
            <motion.button
              ref={moreButtonRef}
              onClick={handleMoreClick}
              className="flex items-center gap-1 rounded-full bg-[#9f8ad4]/20 hover:bg-[#9f8ad4]/15 px-2 py-[1px] border border-[#9f8ad4]/30 transition-all duration-150 hover:scale-105"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.2 }}
            >
              <span className="text-xs font-sans text-[#9f8ad4] font-semibold">... +{hiddenBadges.length}</span>
            </motion.button>
          )}
        </motion.section>
        
        <motion.div 
          className='h-[1px] bg-secondary/20 w-full mb-2'
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.2, duration: 0.3, ease: "easeOut" }}
        />
        
        <motion.div 
          className="w-full flex-col justify-start items-start flex-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <h2 className='text-start font-sans text-secondary text-sm tracking-wider font-medium'>
            {formatCategoryLabel(category)}
          </h2>
          
          <h3 className="text-lg sm:text-xl font-sans text-start font-semibold tracking-wide text-secondary-850 mb-1 truncate">
            {name}
          </h3>
          
          <p className="text-sm font-sans text-start text-secondary-850/80 mb-1 h-10 leading-tight overflow-hidden">
            {description || `Délicieux ${name.toLowerCase()} préparé avec des ingrédients frais.`}
          </p>
          
          <div className='flex justify-between items-center mb-3'>
            <div className="flex flex-col items-start">
              <AnimatePresence mode="wait">
                {isOnSale ? (
                  <motion.div
                    key="sale-price"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="text-md sm:text-lg font-sans font-semibold tracking-wide text-secondary">
                      {(price * (1 - discount / 100)).toFixed(2)} DA
                    </p>
                    <p className="text-sm text-secondary-850/70 line-through">
                      {price.toFixed(2)} DA
                    </p>
                  </motion.div>
                ) : (
                  <p className="text-md sm:text-lg font-sans font-semibold tracking-wide text-secondary">
                    {price.toFixed(2)} DA
                  </p>
                )}
              </AnimatePresence>
            </div>
            
            <div className="flex items-center justify-center">
              {Array(5).fill(0).map((_, i) => (
                <motion.div
                  key={i}
                  variants={starVariants}
                  whileHover="hover"
                >
                  <StarIcon 
                    className={`w-4 h-4 sm:w-5 sm:h-5 ${i < rating ? 'text-primary-400' : 'text-primary-200'}`}
                  />
                </motion.div>
              ))}
            </div>
          </div>
          
          <div className="mt-auto">
            <div className="flex items-center gap-2 mb-1">
              {onToggleFavorite && (
                <button
                  type="button"
                  aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onToggleFavorite(id, isFavorite);
                  }}
                  className="flex-shrink-0 p-2 rounded-full border-2 border-secondary/20 hover:border-red-400 transition-colors duration-200"
                >
                  <Heart
                    className={`w-5 h-5 transition-colors duration-200 ${
                      isFavorite ? 'fill-red-500 text-red-500' : 'text-secondary/50 hover:text-red-400'
                    }`}
                  />
                </button>
              )}
              <motion.div
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                className="flex-1"
              >
                <Button 
                  className='px-5 w-full relative overflow-hidden'
                  onClick={handleAddToCart}
                >
                <motion.span
                  className="flex items-center justify-center gap-2"
                  animate={isAddedToCart ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  {isAddedToCart ? (
                    <>
                      <Check className="w-4 h-4" />
                      Ajouté !
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      Ajouter au panier
                    </>
                  )}
                </motion.span>
              </Button>
            </motion.div>
            </div>
          </div>
        </motion.div>
        </motion.div>
      </Link>

      {/* Simplified popover */}
      <AnimatePresence>
        {showAllTags && hasMoreBadges && (
          <>
            <motion.div
              className="fixed inset-0 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setShowAllTags(false)}
            />
            <motion.div
              className="fixed z-50 bg-primary-100/60 backdrop-blur-md rounded-xl border-2 border-secondary/5 p-3 max-w-xs"
              style={{
                left: popoverPosition.x - 120,
                top: popoverPosition.y
              }}
              variants={popoverVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="flex flex-wrap gap-2">
                {hiddenBadges.map((badge, index) => (
                  <div
                    key={`hidden-${badge.name}-${index}`}
                    className={`flex items-center gap-x-1 rounded-full ${badge.bgColor} px-2 border ${badge.borderColor} py-[1px] whitespace-nowrap`}
                  >
                    {badge.icon && badge.icon}
                    {!badge.icon && (
                      <div className={`size-1 ${badge.bgColor.replace('/20', '').replace('/10', '')} rotate-45 rounded-[2px]`}/>
                    )}
                    <p className={`text-xs font-sans ${badge.color} font-semibold`}>{badge.name}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};export default ProductCard;
