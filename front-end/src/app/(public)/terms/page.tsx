import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Conditions d'utilisation",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-primary-100 pt-40 pb-16">
      <div className="container mx-auto max-w-3xl px-4 space-y-6">
        <h1 className="text-4xl font-sans font-bold text-secondary-850">Conditions d'utilisation</h1>
        <p className="text-secondary-850/70 font-sans">
          Cette page regroupe les conditions generales d'utilisation de Wonderful. Le contenu legal detaille pourra etre complete,
          mais la route n'est plus cassée et reste accessible depuis les formulaires publics.
        </p>
        <p className="text-secondary-850/70 font-sans">
          En utilisant la plateforme, vous acceptez les regles d'utilisation du service, la gestion des commandes, des comptes,
          des abonnements et des interactions avec l'equipe Wonderful.
        </p>
        <Link href="/auth" className="text-secondary font-sans font-semibold hover:underline">
          Retour a l'authentification
        </Link>
      </div>
    </main>
  );
}
