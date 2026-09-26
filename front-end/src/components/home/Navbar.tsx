"use client";
import React, { useState, useEffect } from "react";
import { HoveredLink, Menu, MenuItem, ProductItem } from "../ui/navbar-menu";
import { cn } from "@/lib/utils";
import Image from "next/image";
import logo from "../../../public/images/logo.png";
import cartIcon from "../../../public/icons/cart.png";
import searchIcon from "../../../public/icons/search.png";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { motion, AnimatePresence } from "framer-motion";
import { UserNav } from "@/components/auth/UserNav";

export function Navbar({ className }: { className?: string }) {
  const [active, setActive] = useState<string | null>(null);
  const [isFixed, setIsFixed] = useState(false);
  const { getTotalItems, openCart } = useCartStore();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const cartItemCount = mounted ? getTotalItems() : 0;

  useEffect(() => {
    const handleScroll = () => {
      // Get navbar element height to determine when it would be out of view
      const navbarElement = document.getElementById('main-navbar');
      const navbarHeight = navbarElement?.offsetHeight || 0;
      const navbarTop = navbarElement?.offsetTop || 0;
      
      // Check if we've scrolled past the navbar's original position
      if (window.scrollY > navbarTop + navbarHeight / 2) {
        setIsFixed(true);
      } else {
        setIsFixed(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // Call once to set initial state
    handleScroll();
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      id="main-navbar"
      className={cn(
        "max-w-[90%] mx-auto z-50 transition-all duration-300 rounded-full ", 
        className,
        isFixed 
          ? "fixed top-4 inset-x-0 animate-navSlideDown shadow-primary-700/5 shadow-xl bg-background/95 backdrop-blur-sm " 
          : "relative border-2 border-secondary/5"
      )}
    >
      <Menu setActive={setActive}>
        <div className="w-32 mr-10 relative  flex items-center justify-center">
        <Image className="w-32 absolute h-auto" src={logo.src} height={logo.height} width={logo.width} alt="" />

        </div>
        <MenuItem setActive={setActive} active={active} item="Accueil">
          <div className="flex flex-col space-y-4 text-sm">
            <HoveredLink href="/home">Accueil</HoveredLink>
            <HoveredLink href="/dashboard">Mon Dashboard</HoveredLink>
            <HoveredLink href="/home#about">À propos</HoveredLink>
            <HoveredLink href="/home#services">Nos services</HoveredLink>
            <HoveredLink href="/home#products">Nos produits</HoveredLink>
          </div>
        </MenuItem>
        <MenuItem setActive={setActive} active={active} item="Boutique" >
          <div className="flex flex-col space-y-4 text-sm">
            <HoveredLink href="/boutique">Tous les produits</HoveredLink>
            <HoveredLink href="/boutique?category=Plats">Plats</HoveredLink>
            <HoveredLink href="/boutique?category=Jus">Jus et boissons</HoveredLink>
            <HoveredLink href="/boutique?category=Desserts">Desserts</HoveredLink>
            <HoveredLink href="/boutique?category=Snacks">Snacks</HoveredLink>
          </div>
        </MenuItem>
        <MenuItem setActive={setActive} active={active} item="Abonnement">
          <div className="flex flex-col space-y-4 text-sm">
            <HoveredLink href="/abonnement">Nos abonnements</HoveredLink>
            <HoveredLink href="/abonnement#plans">Choisir un plan</HoveredLink>
            <HoveredLink href="/abonnement#benefits">Avantages</HoveredLink>
            <HoveredLink href="/abonnement#faq">Questions fréquentes</HoveredLink>
          </div>
        </MenuItem>
        <MenuItem setActive={setActive} active={active} item="Qui sommes-nous">
          <div className="flex flex-col space-y-4 text-sm">
            <HoveredLink href="/about">Notre histoire</HoveredLink>
            <HoveredLink href="/about#mission">Notre mission</HoveredLink>
            <HoveredLink href="/about#team">Notre équipe</HoveredLink>
            <HoveredLink href="/about#values">Nos valeurs</HoveredLink>
          </div>
        </MenuItem>
        <MenuItem setActive={setActive} active={active} item="Nous contacter">
          <div className="flex flex-col space-y-4 text-sm">
            <HoveredLink href="/contact">Nous contacter</HoveredLink>
            <HoveredLink href="/contact#support">Support client</HoveredLink>
            <HoveredLink href="/abonnement">Partenariats</HoveredLink>
            <HoveredLink href="/contact#locations">Nos adresses</HoveredLink>
          </div>
        </MenuItem>
        <div className=" flex-1 relative ">
          <div className="flex justify-end  items-center absolute w-full h-full">
          {/* Cart Button with Badge */}
          <button 
            onClick={openCart}
            className="relative mr-3 hover:scale-110 transition-transform duration-200"
            aria-label="Ouvrir le panier"
          >
            <Image className="w-7" src={cartIcon.src} height={cartIcon.height} width={cartIcon.width} alt="Panier" />
            <AnimatePresence>
              {mounted && cartItemCount > 0 && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute -top-2 -right-2 bg-secondary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold font-sans shadow-md"
                >
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </motion.div>
              )}
            </AnimatePresence>
          </button>
          
          <Image className="w-7 mr-6" src={searchIcon.src} height={searchIcon.height} width={searchIcon.width} alt="Rechercher" />

          <UserNav />
          </div>
          

        </div>
      </Menu>
    </div>
  );
}
