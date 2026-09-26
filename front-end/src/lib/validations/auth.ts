import * as z from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email requis" })
    .email("Veuillez entrer un email valide"),
  password: z
    .string()
    .min(1, { message: "Mot de passe requis" })
    .min(8, { message: "Le mot de passe doit contenir au moins 8 caractères" }),
});

export const registerSchema = z.object({
  firstName: z
    .string()
    .min(1, { message: "Prénom requis" })
    .max(50, { message: "Prénom trop long" }),
  lastName: z
    .string()
    .min(1, { message: "Nom requis" })
    .max(50, { message: "Nom trop long" }),
  email: z
    .string()
    .min(1, { message: "Email requis" })
    .email("Veuillez entrer un email valide"),
  phone: z
    .string()
    .optional(),
  password: z
    .string()
    .min(1, { message: "Mot de passe requis" })
    .min(8, { message: "Le mot de passe doit contenir au moins 8 caractères" }),
  confirmPassword: z
    .string()
    .min(1, { message: "Confirmation du mot de passe requise" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
