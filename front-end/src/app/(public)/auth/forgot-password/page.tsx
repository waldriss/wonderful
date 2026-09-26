import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mot de passe oublié",
};

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen bg-primary-100 pt-40 pb-16">
      <div className="container mx-auto max-w-2xl px-4">
        <div className="rounded-3xl border-2 border-secondary/10 bg-card p-8 space-y-4">
          <h1 className="text-3xl font-sans font-bold text-secondary-850">Mot de passe oublié</h1>
          <p className="text-secondary-850/70 font-sans">
            La reinitialisation automatique n'etait pas encore exposee en interface. Cette page remplace la 404 et oriente
            l'utilisateur vers le support ou la connexion.
          </p>
          <div className="flex gap-4 text-sm font-sans font-semibold">
            <Link href="/auth" className="text-secondary hover:underline">Retour a la connexion</Link>
            <Link href="/contact" className="text-secondary hover:underline">Contacter le support</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
