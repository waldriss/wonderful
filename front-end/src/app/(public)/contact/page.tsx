"use client";

import React, { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  CircleArrowOutUpRightIcon,
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  Headphones,
  Building2,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Types
interface ContactInfo {
  icon: React.ReactNode;
  title: string;
  content: string;
  link?: string;
}

interface SocialLink {
  icon: React.ReactNode;
  name: string;
  url: string;
  color: string;
}

interface SupportOption {
  icon: React.ReactNode;
  title: string;
  description: string;
  action: string;
  link: string;
}

// Data
const contactInfo: ContactInfo[] = [
  {
    icon: <Mail className="w-6 h-6" />,
    title: "Email",
    content: "contact@wonderful.fr",
    link: "mailto:contact@wonderful.fr",
  },
  {
    icon: <Phone className="w-6 h-6" />,
    title: "Téléphone",
    content: "+33 1 23 45 67 89",
    link: "tel:+33123456789",
  },
  {
    icon: <MapPin className="w-6 h-6" />,
    title: "Adresse",
    content: "123 Rue de la Gastronomie, 75001 Paris",
    link: "https://maps.google.com",
  },
  {
    icon: <Clock className="w-6 h-6" />,
    title: "Horaires",
    content: "Lun - Ven: 9h - 18h",
  },
];

const socialLinks: SocialLink[] = [
  {
    icon: <Instagram className="w-5 h-5" />,
    name: "Instagram",
    url: "https://instagram.com/wonderful",
    color: "hover:bg-pink-500",
  },
  {
    icon: <Facebook className="w-5 h-5" />,
    name: "Facebook",
    url: "https://facebook.com/wonderful",
    color: "hover:bg-blue-600",
  },
  {
    icon: <Twitter className="w-5 h-5" />,
    name: "Twitter",
    url: "https://twitter.com/wonderful",
    color: "hover:bg-sky-500",
  },
  {
    icon: <Linkedin className="w-5 h-5" />,
    name: "LinkedIn",
    url: "https://linkedin.com/company/wonderful",
    color: "hover:bg-blue-700",
  },
];

const supportOptions: SupportOption[] = [
  {
    icon: <MessageSquare className="w-8 h-8" />,
    title: "Chat en direct",
    description:
      "Discutez avec notre équipe en temps réel pour une assistance immédiate.",
    action: "Démarrer le chat",
    link: "#chat",
  },
  {
    icon: <Headphones className="w-8 h-8" />,
    title: "Support téléphonique",
    description:
      "Appelez-nous pour parler directement à un conseiller client.",
    action: "Appeler maintenant",
    link: "tel:+33123456789",
  },
  {
    icon: <Building2 className="w-8 h-8" />,
    title: "Partenariats",
    description:
      "Vous êtes une entreprise ? Découvrez nos offres sur mesure.",
    action: "En savoir plus",
    link: "/abonnement",
  },
];

import { useSubmitContact } from "@/lib/api/contact";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(
    null
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const submitContact = useSubmitContact();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      await submitContact.mutateAsync(formData);
      setSubmitStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }

    // Reset status after 5 seconds
    setTimeout(() => setSubmitStatus(null), 5000);
  };

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
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-sans font-bold mb-6 text-secondary-850">
              Parlons <span className="text-secondary">ensemble</span>
            </h1>
            <p className="text-lg sm:text-xl text-secondary-850/80 font-sans max-w-2xl mx-auto">
              Une question, une suggestion, un partenariat ? Notre équipe est là
              pour vous accompagner. N'hésitez pas à nous contacter !
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-card rounded-[24px] border-4 border-secondary/5 p-6 text-center hover:border-secondary/20 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-4 text-secondary">
                  {info.icon}
                </div>
                <h3 className="font-sans font-bold text-secondary-850 mb-2">
                  {info.title}
                </h3>
                {info.link ? (
                  <a
                    href={info.link}
                    className="font-sans text-secondary-850/70 hover:text-secondary transition-colors"
                  >
                    {info.content}
                  </a>
                ) : (
                  <p className="font-sans text-secondary-850/70">
                    {info.content}
                  </p>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto">
            {/* Contact Form */}
            <motion.div
              className="flex-1"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl sm:text-3xl font-sans font-bold text-secondary-850 mb-2">
                Envoyez-nous un message
              </h2>
              <p className="font-sans text-secondary-850/70 mb-8">
                Remplissez le formulaire ci-dessous et nous vous répondrons dans
                les plus brefs délais.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="font-sans font-medium text-secondary-850"
                    >
                      Nom complet
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Votre nom"
                      required
                      className="h-12 rounded-xl border-2 border-secondary/20 focus:border-secondary bg-white/50 font-sans"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="font-sans font-medium text-secondary-850"
                    >
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="votre@email.com"
                      required
                      className="h-12 rounded-xl border-2 border-secondary/20 focus:border-secondary bg-white/50 font-sans"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="subject"
                    className="font-sans font-medium text-secondary-850"
                  >
                    Sujet
                  </Label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full h-12 rounded-xl border-2 border-secondary/20 bg-white/50 font-sans px-4 text-sm text-secondary-850 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-colors"
                  >
                    <option value="">Sélectionnez un sujet</option>
                    <option value="general">Question générale</option>
                    <option value="order">Commande / Livraison</option>
                    <option value="subscription">Abonnement</option>
                    <option value="partnership">Partenariat</option>
                    <option value="feedback">Suggestion / Feedback</option>
                    <option value="other">Autre</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="message"
                    className="font-sans font-medium text-secondary-850"
                  >
                    Message
                  </Label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Votre message..."
                    required
                    rows={6}
                    className="w-full rounded-xl border-2 border-secondary/20 bg-white/50 font-sans px-4 py-3 text-sm text-secondary-850 placeholder:text-secondary-850/40 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-colors resize-none"
                  />
                </div>

                <AnimatePresence mode="wait">
                  {submitStatus === "success" && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2 p-4 bg-green-100 border border-green-300 rounded-xl"
                    >
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-sans text-green-800">
                        Message envoyé avec succès ! Nous vous répondrons rapidement.
                      </span>
                    </motion.div>
                  )}

                  {submitStatus === "error" && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2 p-4 bg-red-100 border border-red-300 rounded-xl"
                    >
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <span className="font-sans text-red-800">
                        Une erreur est survenue. Veuillez réessayer.
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      Envoyer le message
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            </motion.div>

            {/* Side Info */}
            <motion.div
              className="lg:w-[400px]"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* Map placeholder */}
              <div className="bg-card rounded-[28px] border-4 border-secondary/5 overflow-hidden mb-6">
                <div className="h-[200px] bg-gradient-to-br from-primary-200 to-primary-300 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-secondary mx-auto mb-2" />
                    <p className="font-sans text-secondary-850/70 text-sm">
                      123 Rue de la Gastronomie
                      <br />
                      75001 Paris, France
                    </p>
                  </div>
                </div>
                <div className="p-4">
                  <a
                    href="https://maps.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 text-secondary font-sans font-medium hover:underline"
                  >
                    Voir sur Google Maps
                    <CircleArrowOutUpRightIcon className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Social Links */}
              <div className="bg-card rounded-[28px] border-4 border-secondary/5 p-6">
                <h3 className="font-sans font-bold text-secondary-850 mb-4">
                  Suivez-nous
                </h3>
                <div className="flex gap-3">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary transition-all duration-300 hover:text-white",
                        social.color
                      )}
                      aria-label={social.name}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Support Options Section */}
      <section className="py-16" id="support">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl sm:text-5xl font-bold font-sans tracking-widest text-center mb-4 text-secondary">
            Besoin d'aide ?
          </h2>
          <div className="mx-auto w-24 h-[6px] rounded-full bg-secondary mb-12"></div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {supportOptions.map((option, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-card rounded-[28px] border-4 border-secondary/5 p-8 text-center hover:border-secondary/20 transition-all duration-300 group"
              >
                <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-6 text-secondary group-hover:bg-secondary group-hover:text-white transition-colors">
                  {option.icon}
                </div>
                <h3 className="text-xl font-sans font-bold text-secondary-850 mb-2">
                  {option.title}
                </h3>
                <p className="font-sans text-secondary-850/70 mb-6">
                  {option.description}
                </p>
                <Link
                  href={option.link}
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "border-2 border-secondary text-secondary hover:bg-secondary hover:text-white"
                  )}
                >
                  {option.action}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-[#F07D82] to-[#ED676D] rounded-[40px] p-8 sm:p-12">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl sm:text-3xl font-sans font-bold text-white mb-4">
                  Questions fréquentes
                </h3>
                <p className="font-sans text-white/90 text-lg">
                  Consultez notre FAQ pour trouver rapidement des réponses à vos
                  questions les plus courantes.
                </p>
              </div>
              <Link
                href="/abonnement#faq"
                className="inline-flex items-center justify-center gap-2 bg-white text-secondary hover:bg-white/90 px-6 py-3 rounded-full font-sans font-semibold transition-colors whitespace-nowrap"
              >
                Voir la FAQ
                <CircleArrowOutUpRightIcon className="w-4 h-4 stroke-[2.8]" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Locations Section */}
      <section className="py-16 sm:py-24" id="locations">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl sm:text-5xl font-bold font-sans tracking-widest text-center mb-4 text-secondary">
            Nos adresses
          </h2>
          <div className="mx-auto w-24 h-[6px] rounded-full bg-secondary mb-12"></div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                name: "Siège social",
                address: "123 Rue de la Gastronomie",
                city: "75001 Paris",
                phone: "+33 1 23 45 67 89",
              },
              {
                name: "Cuisine centrale",
                address: "45 Avenue des Saveurs",
                city: "93100 Montreuil",
                phone: "+33 1 98 76 54 32",
              },
              {
                name: "Point de retrait",
                address: "78 Boulevard Gourmand",
                city: "75011 Paris",
                phone: "+33 1 11 22 33 44",
              },
            ].map((location, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-card rounded-[28px] border-4 border-secondary/5 p-6 hover:border-secondary/20 transition-all duration-300"
              >
                <h3 className="text-lg font-sans font-bold text-secondary mb-3">
                  {location.name}
                </h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                    <p className="font-sans text-secondary-850/80 text-sm">
                      {location.address}
                      <br />
                      {location.city}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-secondary" />
                    <a
                      href={`tel:${location.phone.replace(/\s/g, "")}`}
                      className="font-sans text-secondary-850/80 text-sm hover:text-secondary transition-colors"
                    >
                      {location.phone}
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
