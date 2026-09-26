"use client"
import React from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { ChevronDown, ChevronUp, CircleArrowOutUpRightIcon } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';


interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const FAQSection = () => {
  const initialFaqItems: FAQItem[] = [
    {
      id: 1,
      question: 'Quels types de plats proposez-vous ?',
      answer: 'Nous proposons une large variété de plats inspirés des cuisines du monde, avec un accent sur les ingrédients frais et de saison. Options végétariennes, végétaliennes et sans gluten disponibles.',
    },
    {
      id: 2,
      question: 'Comment fonctionne le service de livraison ?',
      answer: 'Vous pouvez commander directement sur notre site. Nous livrons dans un rayon de 15km autour de notre cuisine centrale. Les frais de livraison varient selon la distance.',
    },
    {
      id: 3,
      question: 'Proposez-vous des abonnements repas ?',
      answer: 'Oui, nous avons des formules d\'abonnement hebdomadaires et mensuelles flexibles pour les particuliers et les entreprises. Contactez-nous pour un devis personnalisé.',
    },
    {
      id: 4,
      question: 'Vos emballages sont-ils écologiques ?',
      answer: 'Nous nous engageons pour la durabilité. Nos emballages sont majoritairement recyclables ou compostables. Nous cherchons constamment à améliorer notre impact environnemental.',
    }
  ];

  return (
    <section className="py-16 sm:py-24 bg-primary-100">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-center">
          {/* Left side - Heading, Contact, Decorative */}
          <div className="w-full lg:w-[40%]  flex-col  flex-1">
            <h2 className="inline-block text-secondary  font-sans font-bold tracking-widest mb-10 text-3xl sm:text-5xl">
              Réponses<br />
              aux Questions
              <div className={`mx-auto w-24 mt-4 h-[6px] rounded-full bg-secondary`}/>
            </h2>
          
            
            <p className="text-secondary-850/90 sm:text-xl font-sans font-normal mb-8 leading-relaxed">
              Vous avez d'autres interrogations ? N'hésitez pas à nous contacter directement. Notre équipe est là pour vous aider.
            </p>
            
            <Link href="/contact" 
                  className={cn(buttonVariants(),"text-base  py-5 !px-5 ")} 
                >
                  Contactez Nous 
                  <CircleArrowOutUpRightIcon  className="size-4 stroke-[2.8] text-secondary" />
                </Link>
            
            
          </div>
          
          {/* Right side - FAQ Accordion */}
          <div className="w-full lg:w-[60%]">
            <Accordion type="single" collapsible className="space-y-4">
              {initialFaqItems.map((item) => (
                <AccordionItem 
                  key={item.id} 
                  value={item.id.toString()} 
                  className="bg-card rounded-[32px]  duration-300 overflow-hidden !border-[3px] border-secondary/5"
                >
                  <AccordionTrigger 
                    className="flex justify-between items-center cursor-pointer w-full text-left p-5 sm:p-6 focus:outline-none [&[data-state=open]>span]:text-secondary [&[data-state=closed]>span]:text-secondary-850 no-underline"
                  >
                    <span className="font-medium font-sans text-secondary-850 text-base sm:text-lg">
                      {item.question}
                    </span>
                    <span className="flex-shrink-0">
                      {/* Using the existing ChevronIcons but hidden when accordion styling takes over */}
                      <ChevronUp  className="w-5 h-5 sm:w-6 sm:h-6 text-secondary flex-shrink-0 hidden" />
                      <ChevronDown className="w-5 h-5 sm:w-10 sm:h-10 text-secondary flex-shrink-0 hidden" />
                    </span>
                  </AccordionTrigger>
                  
                  <AccordionContent className="px-5 sm:px-6 pb-5 font-sans text-secondary-850/60 text-sm sm:text-base leading-relaxed">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
