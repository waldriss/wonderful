"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession, loginUser, registerUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import {
  LoginFormValues,
  loginSchema,
  RegisterFormValues,
  registerSchema,
} from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import logo from "../../../../public/images/logo.png";

export default function AuthPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [returnUrl, setReturnUrl] = useState("/dashboard/user");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { data: session } = useSession();

  // Set the active tab based on URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    setReturnUrl(params.get("returnUrl") || "/dashboard/user");
    if (tab === "register") {
      setActiveTab("register");
    } else {
      setActiveTab("login");
    }
  }, []);

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Handle login submission
  const onLoginSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      await loginUser(values);
      setSuccess("Connexion réussie ! Redirection en cours...");
      router.push(returnUrl);
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Échec de la connexion. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle register submission
  const onRegisterSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      await registerUser({
        email: values.email,
        password: values.password,
        name: `${values.firstName} ${values.lastName}`.trim(),
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone || undefined,
      });
      router.push("/dashboard/user");
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Échec de l'inscription. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google login
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Google login implementation will go here
      // await signIn.google();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Échec de la connexion Google"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Reset error/success when switching tabs
  useEffect(() => {
    setError(null);
    setSuccess(null);
  }, [activeTab]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.3 },
    },
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-primary-100 via-primary-200 to-primary-100">
      <div className="container mx-auto px-4 pt-40 pb-16">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-12 max-w-6xl mx-auto">
          {/* Left side - Branding */}
          <motion.div
            className="flex-1 text-center lg:text-left"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link href="/home" className="inline-block mb-8">
              <Image
                src={logo.src}
                alt="Wonderful"
                width={180}
                height={60}
                className="mx-auto lg:mx-0"
              />
            </Link>

            <h1 className="text-4xl sm:text-5xl font-sans font-bold mb-4 text-secondary-850">
              Bienvenue chez{" "}
              <span className="text-secondary">Wonderful</span>
            </h1>
            <p className="text-lg text-secondary-850/80 font-sans mb-8 max-w-md">
              Connectez-vous pour accéder à votre espace personnel et profiter
              de nos délicieux repas livrés chez vous.
            </p>

            {/* Features list */}
            <div className="space-y-4 hidden lg:block">
              {[
                "Accédez à vos commandes et abonnements",
                "Personnalisez vos préférences alimentaires",
                "Profitez d'offres exclusives",
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-secondary" />
                  </div>
                  <span className="font-sans text-secondary-850/80">
                    {feature}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right side - Auth Form */}
          <motion.div
            className="w-full max-w-md"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-card rounded-[32px] border-4 border-secondary/5 p-8 shadow-xl shadow-secondary/5">
              {/* Tab Switcher */}
              <div className="flex bg-primary-100 rounded-full p-1 mb-8">
                <button
                  onClick={() => setActiveTab("login")}
                  className={cn(
                    "flex-1 py-3 px-6 rounded-full font-sans font-semibold transition-all duration-300",
                    activeTab === "login"
                      ? "bg-secondary text-white"
                      : "text-secondary-850 hover:text-secondary"
                  )}
                >
                  Connexion
                </button>
                <button
                  onClick={() => setActiveTab("register")}
                  className={cn(
                    "flex-1 py-3 px-6 rounded-full font-sans font-semibold transition-all duration-300",
                    activeTab === "register"
                      ? "bg-secondary text-white"
                      : "text-secondary-850 hover:text-secondary"
                  )}
                >
                  Inscription
                </button>
              </div>

              {/* Error/Success Messages */}
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2 p-4 bg-red-100 border border-red-300 rounded-xl mb-6"
                  >
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <span className="font-sans text-red-800 text-sm">
                      {error}
                    </span>
                  </motion.div>
                )}

                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2 p-4 bg-green-100 border border-green-300 rounded-xl mb-6"
                  >
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="font-sans text-green-800 text-sm">
                      {success}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Forms */}
              <AnimatePresence mode="wait">
                {activeTab === "login" ? (
                  <motion.div
                    key="login"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <Form {...loginForm}>
                      <form
                        onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                        className="space-y-5"
                      >
                        <FormField
                          control={loginForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-sans font-medium text-secondary-850">
                                Email
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary/50" />
                                  <Input
                                    placeholder="votre@email.com"
                                    {...field}
                                    className="h-12 pl-12 rounded-xl border-2 border-secondary/20 focus:border-secondary bg-white/50 font-sans"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage className="font-sans" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-sans font-medium text-secondary-850">
                                Mot de passe
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary/50" />
                                  <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    {...field}
                                    className="h-12 pl-12 pr-12 rounded-xl border-2 border-secondary/20 focus:border-secondary bg-white/50 font-sans"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary/50 hover:text-secondary"
                                  >
                                    {showPassword ? (
                                      <EyeOff className="w-5 h-5" />
                                    ) : (
                                      <Eye className="w-5 h-5" />
                                    )}
                                  </button>
                                </div>
                              </FormControl>
                              <FormMessage className="font-sans" />
                            </FormItem>
                          )}
                        />

                        <div className="flex justify-end">
                          <Link
                            href="/auth/forgot-password"
                            className="text-sm font-sans text-secondary hover:underline"
                          >
                            Mot de passe oublié ?
                          </Link>
                        </div>

                        <Button
                          type="submit"
                          className="w-full h-12"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <span className="animate-spin mr-2">⏳</span>
                              Connexion...
                            </>
                          ) : (
                            <>
                              Se connecter
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="register"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <Form {...registerForm}>
                      <form
                        onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                        className="space-y-5"
                      >
                        <div className="grid grid-cols-2 gap-3">
                          <FormField
                            control={registerForm.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-sans font-medium text-secondary-850">
                                  Prénom
                                </FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/50" />
                                    <Input
                                      placeholder="Jean"
                                      {...field}
                                      className="h-12 pl-10 rounded-xl border-2 border-secondary/20 focus:border-secondary bg-white/50 font-sans"
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage className="font-sans" />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={registerForm.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-sans font-medium text-secondary-850">
                                  Nom
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Dupont"
                                    {...field}
                                    className="h-12 rounded-xl border-2 border-secondary/20 focus:border-secondary bg-white/50 font-sans"
                                  />
                                </FormControl>
                                <FormMessage className="font-sans" />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={registerForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-sans font-medium text-secondary-850">
                                Email
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary/50" />
                                  <Input
                                    placeholder="votre@email.com"
                                    {...field}
                                    className="h-12 pl-12 rounded-xl border-2 border-secondary/20 focus:border-secondary bg-white/50 font-sans"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage className="font-sans" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-sans font-medium text-secondary-850">
                                Mot de passe
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary/50" />
                                  <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    {...field}
                                    className="h-12 pl-12 pr-12 rounded-xl border-2 border-secondary/20 focus:border-secondary bg-white/50 font-sans"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary/50 hover:text-secondary"
                                  >
                                    {showPassword ? (
                                      <EyeOff className="w-5 h-5" />
                                    ) : (
                                      <Eye className="w-5 h-5" />
                                    )}
                                  </button>
                                </div>
                              </FormControl>
                              <FormMessage className="font-sans" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={registerForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-sans font-medium text-secondary-850">
                                Confirmer le mot de passe
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary/50" />
                                  <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    {...field}
                                    className="h-12 pl-12 rounded-xl border-2 border-secondary/20 focus:border-secondary bg-white/50 font-sans"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage className="font-sans" />
                            </FormItem>
                          )}
                        />

                        <p className="text-xs font-sans text-secondary-850/60">
                          En créant un compte, vous acceptez nos{" "}
                          <Link
                            href="/terms"
                            className="text-secondary hover:underline"
                          >
                            conditions d'utilisation
                          </Link>{" "}
                          et notre{" "}
                          <Link
                            href="/privacy"
                            className="text-secondary hover:underline"
                          >
                            politique de confidentialité
                          </Link>
                          .
                        </p>

                        <Button
                          type="submit"
                          className="w-full h-12"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <span className="animate-spin mr-2">⏳</span>
                              Création...
                            </>
                          ) : (
                            <>
                              Créer mon compte
                              <Sparkles className="w-4 h-4" />
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t-2 border-secondary/10" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-card px-4 font-sans text-sm text-secondary-850/50">
                    Ou continuer avec
                  </span>
                </div>
              </div>

              {/* Social Login */}
              <Button
                variant="outline"
                type="button"
                className="w-full h-12 border-2 border-secondary/20 hover:border-secondary hover:bg-secondary/5"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <svg
                  className="mr-2 h-5 w-5"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="font-sans font-medium text-secondary-850">
                  Google
                </span>
              </Button>
            </div>

            {/* Back to home link */}
            <div className="text-center mt-8">
              <Link
                href="/home"
                className="font-sans text-secondary-850/70 hover:text-secondary transition-colors"
              >
                ← Retour à l'accueil
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
