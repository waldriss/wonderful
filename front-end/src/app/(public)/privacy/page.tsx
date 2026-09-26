import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-primary-100 pt-40 pb-16">
      <div className="container mx-auto max-w-3xl px-4 space-y-6">
        <h1 className="text-4xl font-sans font-bold text-secondary-850">Politique de confidentialité</h1>
        <p className="text-secondary-850/70 font-sans">
          Wonderful collecte uniquement les donnees necessaires a la gestion des comptes, commandes, abonnements et livraisons.
        </p>
        <p className="text-secondary-850/70 font-sans">
          Les informations personnelles sont utilisees pour fournir le service, securiser l'acces et assurer le suivi client.
        </p>
        <Link href="/auth" className="text-secondary font-sans font-semibold hover:underline">
          Retour a l'authentification
        </Link>
      </div>
    </main>
  );
}
