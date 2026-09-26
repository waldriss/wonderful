import React from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
// Assuming you have or will create these icons
// import { InstagramIcon, FacebookIcon, ArrowUpRightIcon } from '@/components/icons';

// Placeholder icons
import white from "../../../public/images/white.png"
import yellow from "../../../public/images/yellow.png"
import blue from "../../../public/images/blue.png"
import { CircleArrowOutUpRightIcon, Facebook, Instagram } from 'lucide-react';
import { cn } from '@/lib/utils';


// Product image placeholders
const productImages = [
  white.src,
  yellow.src,
  blue.src
];

const HeroSection = () => {
  return (
    <section className="bg-gradient-to-b from-primary-100 to-primary-200  overflow-hidden">
      <div className=" mx-auto ">
        <div className="flex flex-col  lg:flex-row items-start lg:gap-8 overflow-hidden">
          {/* Left Column - Text Content */}
          <div className="w-full pt-52 pb-4 pl-28 lg:w-1/2 relative z-10 text-center lg:text-left  ">
            {/* Vertical side text - positioned relative to this column */}
            <div className="absolute opacity-0 -left-[30px] sm:-left-[0] top-1/2 transform -translate-y-1/2 rotate-90 origin-center text-gray-400 text-xs font-medium tracking-wider hidden lg:block">
              Livraison 24h/24
            </div>

            <div className="max-w-xl mx-auto lg:mx-0">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-sans font-semibold mb-5 sm:mb-4 leading-tight">
                <span className="text-secondary-850">You're </span>
                <span className="text-primary-400">wonderful</span>
                <span className="text-secondary-850">,</span>
                <br />
                <span className="text-secondary-850">your </span>
                <span className="text-primary-400">food</span>
                <span className="text-secondary-850"> should be too!</span>
              </h1>
              
              <p className="text-base sm:text-xl text-secondary-850 sm:mb-7 leading-relaxed font-sans">
                Manger sain, se faire plaisir et être<br className="hidden sm:inline" />
                livré sans attendre—what else ?
              </p>
              
              <div className="relative w-full flex justify-center">
                <Link href="/boutique" 
                  className={cn(buttonVariants(),"text-base  py-5 !px-5 ")} 
                >
                  Voir le menu 
                  <CircleArrowOutUpRightIcon  className="size-4 stroke-[2.8] text-secondary" />
                </Link>
                
              </div>
            </div>
            
        
          </div>
          
          {/* Right Column - Scrolling Product Images */}
          <div className="w-full  lg:w-1/2 relative pl-8">
            
            {/* Scrolling images container */}
            <div className="relative h-[750px] max-w-md mx-auto lg:max-w-none ">
              <div className="flex  gap-4 h-full rotate-[19deg] ">
                {/* Column 1 - Scrolling down */}
                <div className="relative  ">
                  <div className="animate-scroll-down flex flex-col ">
                    {/* Double the images for seamless looping */}
                    {[...productImages, ...productImages].map((src, index) => (
                      <div 
                        key={`down-${index}`} 
                        className="w-[500px] aspect-square overflow-hidden -my-10 "
                      >
                        <div className="relative w-full h-full">
                          <Image 
                            src={src}
                            alt={`Product ${index % productImages.length + 1}`}
                            fill
                            sizes="(max-width: 768px) 50vw, 25vw"
                            className="object-cover rounded-md transform  hover:scale-105 transition-transform duration-300 -rotate-90"
                            placeholder="blur"
                            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/+F9PQAJewN6V3wUwgAAAABJRU5ErkJggg=="
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Column 2 - Scrolling up */}
                <div className="relative w-1/2 ">
                  <div className="animate-scroll-up flex flex-col -ml-32 mt-8">
                    {/* Double the images for seamless looping */}
                    {[...productImages, ...productImages].map((src, index) => (
                      <div 
                        key={`up-${index}`} 
                        className="w-[500px] aspect-square  overflow-hidden -my-10 "
                      >
                        <div className="relative w-full h-full">
                          <Image 
                            src={src}
                            alt={`Product ${index % productImages.length + 1}`}
                            fill
                            sizes="(max-width: 768px) 50vw, 25vw"
                            className="object-cover rounded-md transform  hover:scale-105 transition-transform duration-300 -rotate-90"
                            placeholder="blur"
                            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/+F9PQAJewN6V3wUwgAAAABJRU5ErkJggg=="
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
          
          </div>
        </div>
        <div>
 <section className='flex justify-start items-center gap-4 pl-7 pb-4'>
          <div className='w-[26px] relative'>
          <Instagram size={26} className='text-secondary absolute -top-[13px] ' />

          </div>
          <div className='w-[26px] relative'>
          <Facebook size={26} className='text-secondary absolute -top-[13px]' />

          </div>
          <div className='flex-1 h-1 bg-secondary rounded-full'/>

        </section>
        </div>
       
      </div>
    </section>
  );
};

export default HeroSection;
