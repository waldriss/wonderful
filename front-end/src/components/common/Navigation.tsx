"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
// Placeholder icons
const ShoppingCartIcon = ({ className }: { className?: string }) => <span className={className}>🛒</span>;
const SearchIcon = ({ className }: { className?: string }) => <span className={className}>🔍</span>;
const UserIcon = ({ className }: { className?: string }) => <span className={className}>👤</span>;

const Navigation = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  
  useEffect(() => {
    // Function to handle scroll event
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      const isScrollingDown = prevScrollPos < currentScrollPos;
      const isScrolledPastThreshold = currentScrollPos > 100;
      
      // Logic for when to show/hide the navbar
      if (isScrollingDown && isScrolledPastThreshold) {
        setIsVisible(false); // Hide when scrolling down and past threshold
      } else if (!isScrollingDown) {
        setIsVisible(true); // Show when scrolling up
      }
      
      setPrevScrollPos(currentScrollPos);
    };
    
    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    
    // Clean up
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [prevScrollPos]);
  
  // CSS classes for transition and position
  const navClasses = `fixed top-0 w-full transition-transform duration-300 ease-in-out z-50 bg-amber-50/95 backdrop-blur-md shadow-sm ${
    isVisible ? 'translate-y-0' : '-translate-y-full'
  }`;

  return (
    <header className={navClasses}>
      <div className="container mx-auto py-3 sm:py-4 px-4 sm:px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-amber-500 font-cursive text-3xl sm:text-4xl font-bold hover:text-amber-600 transition-colors">
          Wonderful
        </Link>
        
        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
          {[
            { href: "/", label: "Accueil" },
            { href: "/boutique", label: "Boutique" },
            { href: "/abonnement", label: "Abonnement" },
            { href: "/qui-sommes-nous", label: "Qui sommes-nous" },
            { href: "/contact", label: "Nous contacter" },
          ].map((item) => (
            <Link 
              key={item.label}
              href={item.href} 
              className="text-sm font-medium text-gray-700 hover:text-amber-500 transition-colors pb-1 border-b-2 border-transparent hover:border-amber-400"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        
        {/* Action Icons & Login Button */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button 
            aria-label="Search" 
            className="text-gray-600 hover:text-amber-500 transition-colors p-1.5 rounded-full hover:bg-amber-100"
          >
            <SearchIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button 
            aria-label="Cart" 
            className="text-gray-600 hover:text-amber-500 transition-colors p-1.5 rounded-full hover:bg-amber-100 relative"
          >
            <ShoppingCartIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            {/* Optional: Cart item count badge */}
            {/* <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs rounded-full px-1.5 py-0.5">3</span> */}
          </button>
          
          <Button 
            variant="default"
            size="sm"
            className="rounded-full bg-amber-100 text-amber-600 hover:bg-amber-200 hover:text-amber-700 font-semibold px-4 sm:px-5 py-2 text-sm shadow-sm hover:shadow-md transition-all duration-200 group"
          >
            <UserIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 group-hover:scale-110 transition-transform" />
            Se connecter
          </Button>
        </div>
        
        {/* Mobile Menu Button (placeholder) */}
        <div className="md:hidden">
          <button className="text-gray-700 hover:text-amber-500 p-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-3.75 5.25h12.75" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
