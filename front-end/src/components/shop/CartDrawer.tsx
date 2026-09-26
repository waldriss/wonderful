"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import card from '../../../public/images/card.png';
import { resolveAppImage } from '@/lib/resolve-image';

const CartDrawer = () => {
  const router = useRouter();
  const { 
    items, 
    isCartOpen, 
    closeCart, 
    updateQuantity, 
    removeItem, 
    clearCart,
    getTotalPrice,
    getTotalItems
  } = useCart();

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  const drawerVariants = {
    hidden: {
      x: '100%',
      transition: {
        duration: 0.3,
        ease: 'easeInOut'
      }
    },
    visible: {
      x: 0,
      transition: {
        duration: 0.3,
        ease: 'easeInOut'
      }
    }
  };

  const overlayVariants = {
    hidden: {
      opacity: 0,
      transition: {
        duration: 0.2
      }
    },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.2
      }
    }),
    exit: {
      opacity: 0,
      x: 20,
      transition: {
        duration: 0.15
      }
    }
  };

  const handleCheckout = () => {
    closeCart();
    router.push('/checkout');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/40 z-90 backdrop-blur-sm"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.div
            className="fixed right-0 top-0 h-full w-full sm:w-[480px] bg-gradient-to-b from-primary-200 to-primary-100 z-100 shadow-2xl flex flex-col"
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-secondary to-secondary/90 text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-6 h-6" />
                <div>
                  <h2 className="text-2xl font-bold font-sans">Mon Panier</h2>
                  <p className="text-sm text-white/80 font-sans">
                    {totalItems} {totalItems > 1 ? 'articles' : 'article'}
                  </p>
                </div>
              </div>
              <button
                onClick={closeCart}
                className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <motion.div
                  className="flex flex-col items-center justify-center h-full text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ShoppingBag className="w-20 h-20 text-secondary/30 mb-4" />
                  <h3 className="text-xl font-bold font-sans text-secondary-850 mb-2">
                    Votre panier est vide
                  </h3>
                  <p className="text-secondary-850/60 font-sans mb-6">
                    Ajoutez des produits délicieux pour commencer !
                  </p>
                  <Button onClick={closeCart} className="px-8">
                    Continuer mes achats
                  </Button>
                </motion.div>
              ) : (
                <>
                  <AnimatePresence mode="popLayout">
                    {items.map((item, index) => {
                      const finalPrice = item.isOnSale && item.discount
                        ? item.price * (1 - item.discount / 100)
                        : item.price;
                      const supplementsUnitTotal = (item.supplements ?? []).reduce(
                        (sum, s) => sum + s.price * s.quantity,
                        0
                      );
                      const itemPrice = finalPrice + supplementsUnitTotal;

                      return (
                        <motion.div
                          key={item.lineId}
                          custom={index}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          layout
                          className="bg-card rounded-[28px] border-4 border-secondary/5 p-4 hover:shadow-md transition-shadow duration-200"
                        >
                          <div className="flex gap-4">
                            {/* Product Image */}
                            <div className="w-24 h-24 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0 border-2 border-secondary/5 overflow-hidden">
                              <Image
                                src={resolveAppImage(item.image, card.src)}
                                alt={item.name}
                                width={96}
                                height={96}
                                className="object-contain"
                              />
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex-1 min-w-0 pr-2">
                                  <h3 className="font-bold font-sans text-secondary-850 text-base truncate">
                                    {item.name}
                                  </h3>
                                  <p className="text-xs text-secondary-850/60 font-sans">
                                    {item.category}
                                  </p>
                                </div>
                                <button
                                  onClick={() => removeItem(item.lineId)}
                                  className="p-1 hover:bg-red-100 rounded-lg transition-colors duration-200 text-red-500 flex-shrink-0"
                                  aria-label="Supprimer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              {/* Suppléments */}
                              {item.supplements && item.supplements.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-2">
                                  {item.supplements.map((supplement) => (
                                    <span
                                      key={supplement.id}
                                      className="text-xs font-sans text-secondary-850/70 bg-primary-100/60 border border-secondary/10 rounded-lg px-2 py-0.5"
                                    >
                                      + {supplement.quantity}× {supplement.name}
                                      <span className="font-semibold text-secondary">
                                        {" "}({supplement.price * supplement.quantity} DA)
                                      </span>
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Price and Quantity */}
                              <div className="flex items-center justify-between mt-3">
                                <div className="flex flex-col">
                                  <span className="text-lg font-bold font-sans text-secondary">
                                    {itemPrice.toFixed(2)} DA
                                  </span>
                                  {item.isOnSale && item.discount && (
                                    <span className="text-xs text-secondary-850/50 font-sans line-through">
                                      {item.price.toFixed(2)} DA
                                    </span>
                                  )}
                                </div>

                                {/* Quantity Controls */}
                                <div className="flex items-center gap-2 bg-primary-100/50 rounded-xl border-2 border-secondary/10 p-1">
                                  <button
                                    onClick={() => updateQuantity(item.lineId, item.quantity - 1)}
                                    className="p-1 hover:bg-secondary/10 rounded-lg transition-colors duration-200"
                                    aria-label="Diminuer la quantité"
                                  >
                                    <Minus className="w-4 h-4 text-secondary" />
                                  </button>
                                  <span className="w-8 text-center font-bold font-sans text-secondary-850">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => updateQuantity(item.lineId, item.quantity + 1)}
                                    className="p-1 hover:bg-secondary/10 rounded-lg transition-colors duration-200"
                                    aria-label="Augmenter la quantité"
                                  >
                                    <Plus className="w-4 h-4 text-secondary" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {/* Clear Cart Button */}
                  {items.length > 0 && (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      onClick={clearCart}
                      className="w-full py-2 text-sm font-sans font-semibold text-red-500 hover:bg-red-50 rounded-[20px] transition-colors duration-200 border-[3px] border-red-200 bg-card"
                    >
                      Vider le panier
                    </motion.button>
                  )}
                </>
              )}
            </div>

            {/* Footer / Checkout */}
            {items.length > 0 && (
              <div className="border-t-2 border-secondary/10 bg-card p-6 space-y-4">
                {/* Subtotal */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-sans">
                    <span className="text-secondary-850/70">Sous-total</span>
                    <span className="font-semibold text-secondary-850">
                      {totalPrice.toFixed(2)} DA
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-sans">
                    <span className="text-secondary-850/70">Livraison</span>
                    <span className="font-semibold text-green-600">Gratuite</span>
                  </div>
                  <div className="h-[1px] bg-secondary/20 my-2" />
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold font-sans text-secondary-850">Total</span>
                    <span className="text-2xl font-bold font-sans text-secondary">
                      {totalPrice.toFixed(2)} DA
                    </span>
                  </div>
                </div>

                {/* Checkout Button */}
                <Button
                  onClick={handleCheckout}
                  className="w-full py-6 text-lg font-bold"
                  size="lg"
                >
                  Passer la commande
                </Button>

                <p className="text-xs text-center text-secondary-850/50 font-sans">
                  Les frais de livraison sont offerts pour toute commande
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
