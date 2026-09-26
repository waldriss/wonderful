import React from 'react';
import Navigation from '@/components/common/Navigation';
import HeroSection from '@/components/home/HeroSection';
import ProductsSection from '@/components/home/ProductsSection';
import AboutUsSection from '@/components/home/AboutUsSection';
import ServicesSection from '@/components/home/ServicesSection';
import FAQSection from '@/components/home/FAQSection';
import { Navbar } from '@/components/home/Navbar';

const HomePage = () => {
  return (
    <div className="min-h-screen  relative overflow-hidden">
     
      <HeroSection />
      <ProductsSection />
      <AboutUsSection />
      <ServicesSection />
      <FAQSection />
    </div>
  );
};

export default HomePage;