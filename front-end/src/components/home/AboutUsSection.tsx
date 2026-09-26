import React from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import Image from "next/image";
import chef from "../../../public/images/chef.png";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { CircleArrowOutUpRightIcon } from "lucide-react";
const AboutUsSection = () => {
  return (
    <section className="py-16 sm:py-24 bg-primary-100 overflow-hidden">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl sm:text-5xl font-bold font-sans tracking-widest text-center mb-4 text-secondary">
          A propos de nous
        </h2>
        <div className="mx-auto w-24  h-[6px] rounded-full bg-secondary mb-2"></div>

        <div className="relative flex flex-col  items-center justify-center gap-10 lg:gap-16  ">
          <div className="h-full w-full absolute pt-36 ">
            <div className="bg-primary-200  rounded-[100px] h-full w-full " />
          </div>

          {/* Chef Illustration Area */}
          <div className="w-full z-2 lg:w-1/3 flex justify-center ">
            <div className="relative group">
              <div className="relative z-10 ">
                {/* Placeholder for chef illustration */}
                <Image
                  className=" w-sm"
                  src={chef.src}
                  alt=""
                  width={chef.width}
                  height={chef.height}
                />
              </div>
            </div>
          </div>

          {/* About Us Content - Three columns */}
          <div className="w-full  z-2 px-16 ">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-center md:text-left">
              {[
                "Manger sain, se faire plaisir et être livré sans attendre—what else ? Notre mission est de vous offrir des repas équilibrés et savoureux, préparés avec passion.",
                "Nous sélectionnons rigoureusement nos ingrédients auprès de producteurs locaux pour garantir fraîcheur et qualité. Chaque plat est une célébration des saveurs authentiques.",
                "Notre équipe de chefs talentueux met tout son savoir-faire pour créer des expériences culinaires uniques, livrées directement chez vous ou au bureau.",
              ].map((text, index) => (
                <div
                  key={index}
                  className={`px-6 ${
                    index !== 0 && "border-l-2"
                  } border-secondary/50 `}
                >
                  <p className="text-secondary-850 text-center font-sans text-lg  ">
                    {text}
                  </p>
                </div>
              ))}
            </div>
            <div className="text-center mt-10 mb-10">
              <Link
                href="/boutique"
                className={cn(buttonVariants(), "text-base  py-5 !px-5 ")}
              >
                Voir le menu
                <CircleArrowOutUpRightIcon className="size-4 stroke-[2.8] text-secondary" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUsSection;
