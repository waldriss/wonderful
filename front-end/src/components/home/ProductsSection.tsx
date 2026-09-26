"use client"
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { StarIcon } from '@/components/icons/StarIcon';
import Image from 'next/image';
import card from "../../../public/images/card.png"
import { ChevronLeft, ChevronRight, ShoppingCart, Check } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

type ProductCategory = 'Plats' | 'Jus' | 'Desserts' | 'Snacks';

interface Product {
  id: string;
  name: string;
  price: number;
  rating: number;
  category: ProductCategory;
  image: string; // Should be a path to an image, e.g., '/images/safy.jpg'
  description?: string;
}

const ProductsSection = () => {
  const [activeCategory, setActiveCategory] = useState<ProductCategory>('Plats');
  const [currentPage, setCurrentPage] = useState(0);
  const [addedProducts, setAddedProducts] = useState<Set<string>>(new Set());
  const itemsPerPage = 3; 
  
  const { addItem, openCart, getItemQuantity } = useCart(); 

  // Sample product data - replace with actual data source
  const allProducts: Product[] = [
    { id: '1', name: 'Safy Délicieux', price: 9.99, rating: 5, category: 'Plats', image: '/placeholder-food-1.jpg', description: "Un plat exquis aux saveurs authentiques, préparé avec soin." },
    { id: '2', name: 'Yassa Poulet', price: 12.50, rating: 4, category: 'Plats', image: '/placeholder-food-2.jpg', description: "Poulet mariné au citron et oignons, un classique revisité." },
    { id: '3', name: 'Thieboudienne', price: 11.00, rating: 5, category: 'Plats', image: '/placeholder-food-3.jpg', description: "Le plat national sénégalais, riche en goût et en couleurs." },
    { id: '4', name: 'Mafé Royal', price: 10.50, rating: 4, category: 'Plats', image: '/placeholder-food-4.jpg', description: "Sauce onctueuse à base d'arachide, servie avec du riz." },
    { id: '5', name: 'Jus de Bissap', price: 3.50, rating: 5, category: 'Jus', image: '/placeholder-juice-1.jpg', description: "Boisson rafraîchissante à base de fleurs d'hibiscus." },
    { id: '6', name: 'Jus de Gingembre', price: 3.50, rating: 4, category: 'Jus', image: '/placeholder-juice-2.jpg', description: "Un jus tonifiant et épicé, parfait pour un coup de boost." },
    { id: '7', name: 'Fondant Chocolat', price: 5.00, rating: 5, category: 'Desserts', image: '/placeholder-dessert-1.jpg', description: "Un coeur coulant au chocolat intense pour les gourmands." },
    { id: '8', name: 'Pastels Croustillants', price: 4.50, rating: 4, category: 'Snacks', image: '/placeholder-snack-1.jpg', description: "Délicieux chaussons farcis, parfaits pour une petite faim." },
  ];

  const filteredProducts = allProducts.filter(p => p.category === activeCategory);
  const paginatedProducts = filteredProducts.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handleNextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  useEffect(() => {
    setCurrentPage(0);
  }, [activeCategory]);

  return (
    <section className="py-16 bg-gradient-to-b to-primary-100 from-primary-200 overflow-hidden">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl sm:text-5xl font-bold font-sans tracking-widest text-center mb-4 text-secondary">
          Nos produits
        </h2>
        <div className="mx-auto w-24  h-[6px] rounded-full bg-secondary mb-12"></div>
        
        <div className="flex w-[450px] mx-auto justify-center gap-x-2  mb-12 bg-primary-100/40 border-[3px] border-secondary rounded-full py-2 shadow-[5px_5px_0px_0px_#ED676D]  ">
          {(['Plats', 'Jus', 'Desserts', 'Snacks'] as ProductCategory[]).map((category) => (
            <div
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`rounded-full cursor-pointer font-sans px-5 sm:px-7 py-2 text-sm sm:text-base font-semibold transition-all duration-200 ease-in-out
                ${activeCategory === category 
                  ? 'bg-secondary text-white ' 
                  : ' text-secondary-850  ' 
                }`}
            >
              {category}
            </div>
          ))}
        </div>
        
        <div className="relative px-4 sm:px-0">
          {filteredProducts.length > itemsPerPage && (
            <>
              <div 
                onClick={handlePrevPage}
                className="absolute left-[-8px] sm:left-[-15px] md:left-[-25px] top-1/2 transform -translate-y-1/2 bg-secondary text-white rounded-full p-2  z-20 transition-all duration-200 ease-in-out hover:scale-110 "
                aria-label="Previous products"
              >
                <ChevronLeft className="w-5 h-5 stroke-2 sm:w-8 sm:h-8" />
              </div>
              <button 
                onClick={handleNextPage}
                className="absolute right-[-8px] sm:right-[-15px] md:right-[-25px] top-1/2 transform -translate-y-1/2 bg-secondary text-white rounded-full p-2  z-20 transition-all duration-200 ease-in-out hover:scale-110 "
                aria-label="Next products"
              >
                <ChevronRight className="w-5 h-5 stroke-2 sm:w-8 sm:h-8" />
                </button>
            </>
          )}
          
          {paginatedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-20 md:gap-x-10 md:gap-y-24 mx-auto max-w-xs sm:max-w-none md:max-w-4xl lg:max-w-5xl xl:max-w-6xl">
              {paginatedProducts.map((product) => {
                const isAdded = addedProducts.has(product.id);
                
                const handleAddToCart = () => {
                  addItem({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: card.src,
                    category: product.category,
                    description: product.description,
                    rating: product.rating,
                  });
                  
                  setAddedProducts(prev => new Set(prev).add(product.id));
                  setTimeout(() => {
                    setAddedProducts(prev => {
                      const newSet = new Set(prev);
                      newSet.delete(product.id);
                      return newSet;
                    });
                    openCart();
                  }, 500);
                };
                
                return (
                  <Link key={product.id} href={`/boutique/${product.id}`}>
                    <div className="flex bg-card border-secondary/5 border-4 rounded-[28px] flex-col items-center text-center group relative p-4 hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                      <div className="w-full h-60 rounded-[28px] border-[3px] border-secondary/5 bg-primary-100 flex items-center justify-center p-1">
                        <Image className='h-full w-auto' src={card.src} alt="" height={card.height} width={card.width} />
                      </div>
                      <section className='flex justify-between px-2 py-3 items-center w-full'>
                        <div className='flex items-center gap-x-1 rounded-full bg-secondary/20 px-2 border border-secondary/30 py-[1px]'>
                          <div className='size-1 bg-secondary rotate-45 rounded-[2px]'/>
                          <p className='text-xs font-sans text-secondary font-semibold'>Sans gluten</p>
                        </div>
                        <div className='flex items-center gap-x-1 rounded-full bg-primary-500/15 border border-primary-500/20 px-2 py-[1px]'>
                          <div className='size-1 bg-primary-500 rotate-45 rounded-[2px]'/>
                          <p className='text-xs font-sans text-primary-500 font-semibold'>Sans sucre</p>
                        </div>
                        <div className='flex items-center gap-x-1 rounded-full bg-[#9f8ad4]/20 border border-[#9f8ad4]/30 px-2 py-[1px]'>
                          <div className='size-1 bg-[#9f8ad4] rotate-45 rounded-[2px]'/>
                          <p className='text-xs font-sans text-[#9f8ad4] font-semibold'>Sans sel</p>
                        </div>
                      </section>
                      <div className='h-[1px] bg-secondary/20 w-full mb-2'/>
                      
                      <div className="w-full flex-col justify-start items-start">
                        <h2 className='text-start font-sans text-secondary text-sm tracking-wider font-medium'>Plat</h2>
                        <h3 className="text-lg sm:text-xl font-sans text-start font-semibold tracking-wide text-secondary-850 mb-1 truncate">{product.name}</h3>
                        <p className="text-sm font-sans text-start text-secondary-850/80 mb-1 h-10 leading-tight overflow-hidden">
                          {product.description || `Délicieux ${product.name.toLowerCase()} préparé avec des ingrédients frais.`}
                        </p>
                        <div className='flex justify-between items-center mb-3'>
                          <p className="text-md sm:text-lg font-sans font-semibold tracking-wide text-secondary">{product.price.toFixed(2)} DA</p>
                          
                          <div className="flex items-center justify-center">
                            {Array(5).fill(0).map((_, i) => (
                              <StarIcon 
                                key={i} 
                                className={`w-4 h-4 sm:w-5 sm:h-5 ${i < product.rating ? 'text-primary-400' : 'text-primary-200'}`}
                              />
                            ))}
                          </div>
                        </div>
                        
                        <Button 
                          className='px-5 mb-1 w-full'
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAddToCart();
                          }}
                        >
                          <motion.span
                            className="flex items-center justify-center gap-2"
                            animate={isAdded ? { scale: [1, 1.1, 1] } : {}}
                            transition={{ duration: 0.3 }}
                          >
                            {isAdded ? (
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
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-10 text-lg">Aucun produit trouvé dans cette catégorie.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;
