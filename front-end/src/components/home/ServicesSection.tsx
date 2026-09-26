import React from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import particuliers from "../../../public/images/particuliers.png";
import entreprises from "../../../public/images/entreprises.png";
import evenements from "../../../public/images/evenements.png";
import salles from "../../../public/images/salles.png";

interface ServiceCardProps {
  title: string;
  description: string;
  bgColorClass: string;
  textColorClass: string;
  buttonText: string;
  illustrationPlaceholder: string;
  illustrationBgClass: string;
  decorativeElement?: React.ReactNode;
  isLarge?: boolean;
  titleColorClass: string;
  lineColorClass: string;
  image: any; // Using any for simplicity, but could be more specific with StaticImageData
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  title,
  description,
  bgColorClass,
  textColorClass,
  buttonText,
  illustrationPlaceholder,
  illustrationBgClass,
  decorativeElement,
  isLarge = false,
  titleColorClass,
  lineColorClass,
  image
}) => {
  return (
    <div
      className={`${bgColorClass} rounded-[52px] px-8 py-7 relative overflow-hidden  sm:min-h-[460px] flex flex-col ${
        isLarge ? "justify-start" : "items-center text-center"
      }`}
    >
      <div className={`${isLarge ? "max-w-[55%]" : "max-w-[95%]"}`}>
        <h3
          className={`inline-block text-2xl sm:text-4xl font-sans font-semibold tracking-wider mb-2 ${titleColorClass}`}
        >
          {title}
          <div className={`mx-auto w-16 mt-[6px] h-[6px] rounded-full ${lineColorClass}`}/>
        </h3>
        <p
          className={`text-sm sm:text-lg font-sans font-medium mb-3 ${textColorClass} opacity-80 `}
        >
          {description}
        </p>

        <Button className="px-5">{buttonText}</Button>
      </div>

      {/* Image placement based on card size */}
      <div
        className={`absolute -bottom-2 ${
          isLarge ? "right-4 w-[45%]" : "left-1/2 -translate-x-1/2 w-[60%]"
        } flex justify-center items-end`}
      >
        <Image 
          src={image} 
          alt={title}
          className={`object-contain ${isLarge ? 'h-auto max-h-[280px]' : 'h-auto max-h-[240px]'}`}
          priority={false}
        />
      </div>
    </div>
  );
};

const ServicesSection = () => {
  const services: ServiceCardProps[] = [
    {
      title: "Entreprises",
      description:
        "Solutions de repas sur mesure pour vos équipes. Boostez la productivité avec des déjeuners sains et délicieux livrés au bureau.",
      bgColorClass: "from-[#FEF3D6] to-[#FEECC2] bg-gradient-to-b",
      textColorClass: "text-secondary-850",
      titleColorClass: "text-secondary",
      lineColorClass: "bg-secondary",
      buttonText: "Devis gratuit",
      illustrationPlaceholder: "Meeting Food",
      illustrationBgClass: "bg-rose-100",
      decorativeElement: <span className="text-rose-200">🏢</span>,
      isLarge: true,
      image: entreprises,
    },
    {
      title: "Événements",
      description:
        "Service traiteur pour vos événements professionnels ou privés. Cocktails, buffets, repas assis – nous créons des moments mémorables.",
      bgColorClass: "from-[#F07D82] to-[#ED676D] bg-gradient-to-b",
      textColorClass: "text-primary-100",
      titleColorClass: "text-primary",
      lineColorClass: "bg-primary",
      buttonText: "Nos offres",
      illustrationPlaceholder: "Party Catering",
      illustrationBgClass: "bg-rose-300",
      decorativeElement: <span className="text-rose-200">🎉</span>,
      isLarge: false,
      image: evenements,
    },
    {
      title: "Particuliers",
      description:
        "Abonnements repas hebdomadaires ou commandes ponctuelles. Simplifiez votre quotidien avec nos plats frais, livrés chez vous.",
      bgColorClass: "from-[#FEF3D6] to-[#FEECC2] bg-gradient-to-b",
      textColorClass: "text-secondary-850",
      titleColorClass: "text-secondary",
      lineColorClass: "bg-secondary",
      buttonText: "Découvrir",
      illustrationPlaceholder: "Home Delivery",
      illustrationBgClass: "bg-rose-300",
      decorativeElement: <span className="text-rose-200">🏠</span>,
      isLarge: false,
      image: particuliers,
    },
    {
      title: "Salles",
      description:
        "Location de salles équipées pour vos réunions, séminaires ou événements, avec option traiteur pour une organisation clé en main.",
      bgColorClass: "from-[#F07D82] to-[#ED676D] bg-gradient-to-b",
      textColorClass: "text-primary-100",
      titleColorClass: "text-primary",
      lineColorClass: "bg-primary",
      buttonText: "Voir les salles",
      illustrationPlaceholder: "Venue Rental",
      illustrationBgClass: "bg-rose-100",
      decorativeElement: <span className="text-rose-200">🚪</span>,
      isLarge: true,
      image: salles,
    },
  ];

  return (
    <section className="pt-26 pb-32 bg-primary-100 ">
      <div className="container px-4 mx-auto ">
        <h2 className="text-3xl sm:text-5xl font-bold font-sans tracking-widest text-center mb-4 text-secondary">
          Nos services
        </h2>
        <div className="mx-auto w-24 h-[6px] rounded-full bg-secondary mb-14"></div>

        {/* First row - left card is larger */}
        <div className="grid grid-cols-12 gap-6 sm:gap-8 mb-6 sm:mb-8">
          <div className="col-span-12 md:col-span-7">
            <ServiceCard {...services[0]} />
          </div>
          <div className="col-span-12 md:col-span-5">
            <ServiceCard {...services[1]} />
          </div>
        </div>

        {/* Second row - right card is larger */}
        <div className="grid grid-cols-12 gap-6 sm:gap-8">
          <div className="col-span-12 md:col-span-5">
            <ServiceCard {...services[2]} />
          </div>
          <div className="col-span-12 md:col-span-7">
            <ServiceCard {...services[3]} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
