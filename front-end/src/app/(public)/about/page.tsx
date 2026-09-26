"use client";

import React from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  CircleArrowOutUpRightIcon,
  Heart,
  Leaf,
  Users,
  Award,
  Target,
  Sparkles,
  ChefHat,
  Truck,
  Clock,
  Star,
} from "lucide-react";
import { motion } from "framer-motion";
import chef from "../../../../public/images/chef.png";

// Types
interface TeamMember {
  name: string;
  role: string;
  description: string;
  image?: string;
}

interface Value {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  bgColor: string;
}

interface Milestone {
  year: string;
  title: string;
  description: string;
}

interface Stat {
  value: string;
  label: string;
  icon: React.ReactNode;
}

// Data
const teamMembers: TeamMember[] = [
  {
    name: "L'Équipe Cuisine",
    role: "Chefs & Créateurs",
    description:
      "Nos chefs talentueux imaginent et préparent chaque jour des recettes qui allient tradition et modernité, pour éveiller vos papilles.",
  },
  {
    name: "L'Équipe Nutrition",
    role: "Experts Bien-être",
    description:
      "Nos nutritionnistes veillent à l'équilibre de chaque plat pour que santé rime avec plaisir dans toutes vos assiettes.",
  },
  {
    name: "L'Équipe Livraison",
    role: "Ambassadeurs du Goût",
    description:
      "Nos livreurs passionnés apportent vos repas avec soin et ponctualité, pour que chaque déjeuner soit un moment de bonheur.",
  },
  {
    name: "L'Équipe Support",
    role: "À votre écoute",
    description:
      "Notre équipe bienveillante est là pour vous accompagner et répondre à toutes vos questions avec le sourire.",
  },
];

const values: Value[] = [
  {
    icon: <Heart className="w-8 h-8" />,
    title: "Passion",
    description:
      "Chaque plat est une déclaration d'amour à la gastronomie. Nos chefs mettent tout leur cœur dans vos assiettes pour vous offrir des moments de pur bonheur culinaire.",
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
  {
    icon: <Leaf className="w-8 h-8" />,
    title: "Qualité & Fraîcheur",
    description:
      "Nous sélectionnons rigoureusement nos ingrédients auprès de producteurs locaux. Des produits frais, de saison, pour des plats qui ont du goût et du sens.",
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    icon: <Award className="w-8 h-8" />,
    title: "Excellence",
    description:
      "De la conception des recettes à la livraison finale, nous visons l'excellence à chaque étape. Votre satisfaction est notre plus belle récompense.",
    color: "text-primary-500",
    bgColor: "bg-primary-100",
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: "Bienveillance",
    description:
      "Nous créons des liens authentiques avec nos clients, nos producteurs et notre équipe. Wonderful, c'est une grande famille unie par l'amour de la bonne cuisine.",
    color: "text-[#9f8ad4]",
    bgColor: "bg-[#9f8ad4]/10",
  },
];

const milestones: Milestone[] = [
  {
    year: "La vision",
    title: "L'étincelle Wonderful",
    description:
      "Tout commence par une passion commune : révolutionner la pause déjeuner en alliant plaisir, santé et praticité. L'idée Wonderful est née !",
  },
  {
    year: "Les débuts",
    title: "Lancement officiel",
    description:
      "Wonderful ouvre ses portes avec une petite équipe passionnée et un menu soigneusement conçu de plats savoureux et équilibrés.",
  },
  {
    year: "La croissance",
    title: "L'expansion commence",
    description:
      "Face au succès grandissant, nous élargissons notre zone de livraison et enrichissons notre carte avec des créations innovantes.",
  },
  {
    year: "L'innovation",
    title: "Abonnements personnalisés",
    description:
      "Lancement de nos formules d'abonnement flexibles pour vous permettre de profiter de Wonderful selon vos envies et votre rythme.",
  },
  {
    year: "L'engagement",
    title: "Producteurs locaux",
    description:
      "Nous renforçons nos partenariats avec des producteurs locaux pour garantir fraîcheur, qualité et soutien de l'économie locale.",
  },
  {
    year: "Aujourd'hui",
    title: "Une communauté fidèle",
    description:
      "Des milliers de clients nous font confiance chaque jour. Wonderful est devenu plus qu'un service : c'est un art de vivre !",
  },
];

const stats: Stat[] = [
  {
    value: "10K+",
    label: "Clients satisfaits",
    icon: <Users className="w-6 h-6" />,
  },
  {
    value: "50+",
    label: "Plats au menu",
    icon: <ChefHat className="w-6 h-6" />,
  },
  {
    value: "30km",
    label: "Zone de livraison",
    icon: <Truck className="w-6 h-6" />,
  },
  {
    value: "30min",
    label: "Temps de livraison moyen",
    icon: <Clock className="w-6 h-6" />,
  },
];

const AboutPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-primary-100 via-primary-200 to-primary-100">
      {/* Hero Section */}
      <section className="pt-52 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div
              className="flex-1 text-center lg:text-left"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-sans font-bold mb-6 text-secondary-850">
                Bienvenue chez <span className="text-secondary">Wonderful</span>
              </h1>
              <p className="text-lg sm:text-xl text-secondary-850/80 font-sans max-w-xl mb-8">
                Plus qu'un service de livraison, Wonderful est une passion pour la bonne cuisine, 
                une aventure humaine et un engagement pour votre bien-être quotidien.
              </p>
              <Link
                href="/boutique"
                className={cn(buttonVariants(), "text-base py-5 !px-5")}
              >
                Découvrir nos plats
                <CircleArrowOutUpRightIcon className="size-4 stroke-[2.8] text-secondary" />
              </Link>
            </motion.div>

            <motion.div
              className="flex-1 flex justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-secondary/20 rounded-full blur-3xl" />
                <Image
                  src={chef.src}
                  alt="Notre équipe"
                  width={chef.width}
                  height={chef.height}
                  className="relative z-10 max-w-md"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Presentation Section */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-20 h-20 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-6">
                <Target className="w-10 h-10 text-secondary" />
              </div>
              <h2 className="text-3xl sm:text-5xl font-bold font-sans tracking-widest text-center mb-4 text-secondary">
                Présentation de Wonderful
              </h2>
              <div className="mx-auto w-24 h-[6px] rounded-full bg-secondary mb-8"></div>
              <p className="text-lg sm:text-xl font-sans text-secondary-850/80 leading-relaxed mb-6">
                <strong className="text-secondary">Wonderful</strong> est né d'une vision simple : transformer les pauses déjeuner et les repas du quotidien en moments de pur plaisir gourmand. Nous sommes bien plus qu'un service de livraison de repas. Nous sommes une communauté de passionnés qui croit que bien manger devrait être facile, savoureux et accessible à tous.
              </p>
              <p className="text-lg font-sans text-secondary-850/70 leading-relaxed">
                Chaque jour, notre équipe de chefs talentueux et de nutritionnistes travaille main dans la main pour créer des plats qui allient équilibre nutritionnel et explosion de saveurs. Des ingrédients frais et locaux, des recettes créatives inspirées de nos racines et des saveurs du monde, et un service impeccable : voilà la recette Wonderful.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl sm:text-5xl font-bold font-sans tracking-widest text-center mb-4 text-secondary">
            Nos valeurs
          </h2>
          <div className="mx-auto w-24 h-[6px] rounded-full bg-secondary mb-12"></div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {values.map((value, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-card rounded-[28px] border-4 border-secondary/5 p-6 text-center hover:border-secondary/20 transition-all duration-300"
              >
                <div
                  className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4",
                    value.bgColor
                  )}
                >
                  <span className={value.color}>{value.icon}</span>
                </div>
                <h3 className="text-xl font-sans font-bold text-secondary-850 mb-2">
                  {value.title}
                </h3>
                <p className="font-sans text-secondary-850/70 text-sm">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Objectif Section */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-r from-[#F07D82] to-[#ED676D] rounded-[32px] p-8 sm:p-12 text-white"
            >
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold mb-3">Notre objectif</h3>
                  <p className="text-lg text-white/90 leading-relaxed">
                    Rendre l'alimentation saine et savoureuse accessible à tous, sans compromis sur le goût ni sur la qualité. Nous voulons révolutionner votre façon de manger au quotidien en vous offrant des repas qui vous font du bien au corps et à l'esprit, tout en vous faisant gagner un temps précieux.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-[#F07D82] to-[#ED676D] rounded-[40px] p-8 sm:p-12 text-center">
            <Sparkles className="w-12 h-12 text-white/80 mx-auto mb-4" />
            <h2 className="text-2xl sm:text-4xl font-sans font-bold text-white mb-4">
              Envie de rejoindre l'aventure Wonderful ?
            </h2>
            <p className="font-sans text-white/90 text-lg mb-8 max-w-2xl mx-auto">
              Que vous soyez client, partenaire ou talent passionné, nous serions ravis de vous accueillir dans notre communauté.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/abonnement"
                className="inline-flex items-center justify-center gap-2 bg-white text-secondary hover:bg-white/90 px-6 py-3 rounded-full font-sans font-semibold transition-colors"
              >
                S'abonner maintenant
                <CircleArrowOutUpRightIcon className="size-4 stroke-[2.8]" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-white text-white hover:bg-white/10 px-6 py-3 rounded-full font-sans font-semibold transition-colors"
              >
                Nous contacter
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
