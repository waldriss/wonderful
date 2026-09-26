# 🎨 Design System - Guide Complet

## Table des matières
1. [Palette de couleurs](#palette-de-couleurs)
2. [Typographie](#typographie)
3. [Composants UI](#composants-ui)
4. [Layouts & Spacing](#layouts--spacing)
5. [Animations](#animations)
6. [Structure de fichiers](#structure-de-fichiers)

---

## 🌈 Palette de couleurs

### Couleurs principales

```tsx
// Primary (Jaune chaud - pour accents et éléments secondaires)
primary-50:  #FFFEFC
primary-100: #FFF6E2  // Background clair
primary-200: #FEE7B0  // Background moyen
primary-300: #FDD87E  // Primary principal
primary-400: #FCC94C
primary-500: #FBBA1A
primary-600: #DF9F03
primary-700: #AC7B03
primary-800: #7A5702
primary-900: #483301

// Secondary (Rouge-Rose - pour CTA et éléments importants)
secondary-50:  #FBD9DB
secondary-100: #F8C2C5
secondary-200: #F29599
secondary-300: #ED676D  // Secondary principal
secondary-400: #E83941
secondary-500: #D51922
secondary-600: #A7141A
secondary-700: #7A0E13
secondary-800: #4C090C
secondary-850: #4B0A0C  // Texte foncé
secondary-900: #1E0405

// Neutrals
background: #ffffff
foreground: #252525
card: #fff3d9  // Crème doux
```

### Usage des couleurs

| Élément | Couleur | Classe Tailwind |
|---------|---------|-----------------|
| Background principal | primary-100 | `bg-primary-100` |
| Background secondaire | primary-200 | `bg-primary-200` |
| Cards | card (#fff3d9) | `bg-card` |
| Texte principal | secondary-850 | `text-secondary-850` |
| Texte secondaire | secondary-850/70 | `text-secondary-850/70` |
| CTA / Boutons | secondary | `bg-secondary text-white` |
| Bordures subtiles | secondary/5 | `border-secondary/5` |
| Bordures moyennes | secondary/20 | `border-secondary/20` |
| Bordures fortes | secondary/40 | `border-secondary/40` |

---

## 📝 Typographie

### Font Family
- **Principal**: Fredoka (`font-sans`)
- **Monospace**: Geist Mono (`font-mono`)

### Hiérarchie

```tsx
// Headings
h1: text-4xl sm:text-5xl lg:text-6xl font-sans font-semibold
h2: text-3xl sm:text-5xl font-bold font-sans tracking-widest
h3: text-2xl sm:text-3xl font-sans font-semibold
h4: text-xl font-sans font-medium

// Body
body-large: text-base sm:text-xl font-sans
body: text-base font-sans
body-small: text-sm font-sans

// Labels
label: text-sm font-sans font-medium
caption: text-xs font-sans
```

---

## 🧩 Composants UI

### 1. Cards

#### Card Standard
```tsx
<div className="bg-card border-2 border-secondary/5 rounded-2xl p-6 hover:border-secondary/20 transition-colors duration-200">
  {/* Contenu */}
</div>
```

#### Card avec dégradé
```tsx
<div className="bg-gradient-to-b from-primary-100 to-primary-200 border-2 border-secondary/10 rounded-3xl p-6">
  {/* Contenu */}
</div>
```

#### Card interactive (hover effect)
```tsx
<motion.div 
  className="bg-card border-2 border-secondary/5 rounded-2xl p-6 cursor-pointer"
  whileHover={{ scale: 1.02, borderColor: "rgba(237,103,109,0.2)" }}
  transition={{ duration: 0.2 }}
>
  {/* Contenu */}
</motion.div>
```

### 2. Boutons

#### Bouton Primary (CTA principal)
```tsx
<button className="h-12 px-6 bg-secondary text-white rounded-full font-sans font-semibold hover:bg-secondary/90 transition-colors duration-200 flex items-center gap-2">
  Texte du bouton
  <Icon className="w-4 h-4" />
</button>
```

#### Bouton Outline
```tsx
<button className="h-12 px-6 border-2 border-secondary bg-transparent text-secondary rounded-full font-sans font-semibold hover:bg-secondary/5 transition-colors duration-200">
  Texte du bouton
</button>
```

#### Bouton Ghost
```tsx
<button className="h-12 px-6 bg-transparent text-secondary hover:bg-primary-100 rounded-full font-sans font-medium transition-colors duration-200">
  Texte du bouton
</button>
```

### 3. Inputs

#### Input standard
```tsx
<input 
  type="text"
  className="w-full h-12 px-4 rounded-full border-2 border-secondary/40 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20 bg-transparent text-secondary-850 font-sans transition-colors duration-200"
  placeholder="Placeholder..."
/>
```

#### Input avec icon
```tsx
<div className="relative">
  <input 
    type="text"
    className="w-full h-12 pl-12 pr-4 rounded-full border-2 border-secondary/40 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20 bg-transparent text-secondary-850 font-sans"
    placeholder="Rechercher..."
  />
  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-secondary w-5 h-5" />
</div>
```

### 4. Badges / Tags

#### Badge standard
```tsx
<span className="px-3 py-1 rounded-full text-xs font-sans font-medium bg-secondary/20 text-secondary border border-secondary/30">
  Sans gluten
</span>
```

#### Badge avec icon
```tsx
<span className="px-3 py-1 rounded-full text-xs font-sans font-medium bg-primary-200/50 text-secondary-850 border border-primary-200 flex items-center gap-1">
  <Clock className="w-3 h-3" />
  15 min
</span>
```

### 5. Selectors

#### Dropdown
```tsx
<button className="h-12 px-5 border-2 border-secondary/10 bg-[#fbd9c9] rounded-full flex items-center gap-2 text-secondary font-sans font-medium hover:border-secondary transition-colors duration-200">
  <span>Sélection</span>
  <ChevronDown className="h-4 w-4" />
</button>
```

#### Pill Selector
```tsx
<button className="px-4 py-1 rounded-full border-2 border-secondary/80 text-secondary font-sans font-medium hover:bg-secondary hover:text-white transition-all duration-150">
  Option
</button>
```

### 6. Sections

#### Section avec background
```tsx
<section className="py-16 sm:py-24 bg-primary-100 overflow-hidden">
  <div className="container mx-auto px-4">
    {/* Contenu */}
  </div>
</section>
```

#### Section avec dégradé
```tsx
<section className="py-16 sm:py-24 bg-gradient-to-b from-primary-100 to-primary-200 overflow-hidden">
  <div className="container mx-auto px-4">
    {/* Contenu */}
  </div>
</section>
```

---

## 📐 Layouts & Spacing

### Container
```tsx
<div className="container mx-auto px-4">
  {/* max-width avec padding responsive */}
</div>
```

### Spacing vertical
```tsx
py-16 sm:py-24  // Sections
py-8 sm:py-12   // Sous-sections
py-4 sm:py-6    // Groupes
```

### Grid layouts
```tsx
// 2 colonnes responsive
grid grid-cols-1 md:grid-cols-2 gap-6

// 3 colonnes responsive
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6

// 4 colonnes responsive
grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4
```

### Flexbox patterns
```tsx
// Centré horizontal et vertical
flex items-center justify-center

// Space between
flex items-center justify-between

// Column avec gap
flex flex-col gap-4

// Row responsive
flex flex-col md:flex-row gap-6
```

---

## ✨ Animations

### Framer Motion - Configurations courantes

#### Fade in avec slide
```tsx
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: "easeOut" }
}

<motion.div {...fadeInUp}>
  {/* Contenu */}
</motion.div>
```

#### Scale hover
```tsx
<motion.div
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  transition={{ duration: 0.15, ease: "easeOut" }}
>
  {/* Contenu */}
</motion.div>
```

#### Spring animations
```tsx
const springVariants = {
  hidden: { 
    scale: 0.8, 
    opacity: 0 
  },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25
    }
  }
}
```

#### Stagger children
```tsx
const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

<motion.div variants={container} initial="hidden" animate="visible">
  {items.map((item, i) => (
    <motion.div key={i} variants={item}>
      {/* Contenu */}
    </motion.div>
  ))}
</motion.div>
```

### Transitions CSS
```tsx
// Standard
transition-colors duration-200

// Hover rapide
transition-all duration-150

// Smooth & slow
transition-all duration-300 ease-in-out
```

---

## 📁 Structure de fichiers

### Organisation recommandée

```
front-end/src/
├── app/
│   ├── (public)/           # Routes publiques
│   │   ├── home/
│   │   │   └── page.tsx
│   │   ├── boutique/
│   │   │   └── page.tsx
│   │   ├── about/
│   │   │   └── page.tsx
│   │   └── contact/
│   │       └── page.tsx
│   ├── (private)/          # Routes protégées
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   └── profile/
│   │       └── page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
│
├── components/
│   ├── ui/                 # Composants de base (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   └── ...
│   │
│   ├── common/             # Composants partagés
│   │   ├── Navigation.tsx
│   │   ├── Footer.tsx
│   │   └── NavSpacer.tsx
│   │
│   ├── layout/             # Layouts spécifiques
│   │   ├── MainLayout.tsx
│   │   └── DashboardLayout.tsx
│   │
│   ├── home/               # Composants page Home
│   │   ├── HeroSection.tsx
│   │   ├── AboutUsSection.tsx
│   │   ├── ProductsSection.tsx
│   │   ├── ServicesSection.tsx
│   │   ├── FAQSection.tsx
│   │   └── Navbar.tsx
│   │
│   ├── shop/               # Composants page Boutique
│   │   ├── ProductCard.tsx
│   │   ├── CartDrawer.tsx
│   │   ├── SearchInput.tsx
│   │   ├── CategorySelector.tsx
│   │   ├── SortSelector.tsx
│   │   ├── MobileFilterToggle.tsx
│   │   └── filters/
│   │       ├── FilterSection.tsx
│   │       ├── FilterGroup.tsx
│   │       ├── RangeSlider.tsx
│   │       ├── CheckboxGroup.tsx
│   │       ├── PillSelector.tsx
│   │       ├── CardSelector.tsx
│   │       ├── RatingFilter.tsx
│   │       └── ToggleSwitch.tsx
│   │
│   ├── dashboard/          # Composants Dashboard
│   │   ├── DashboardNav.tsx
│   │   ├── DashboardClient.tsx
│   │   └── ProfileClient.tsx
│   │
│   ├── abonnement/         # Composants Abonnement
│   │   ├── Stepper.tsx
│   │   ├── Step1SubscriptionType.tsx
│   │   ├── Step2ProductSelection.tsx
│   │   ├── Step3DeliveryInfo.tsx
│   │   ├── Step4ClientInfo.tsx
│   │   ├── Step5ThankYou.tsx
│   │   └── types.ts
│   │
│   └── auth/               # Composants Auth
│       ├── AuthTabs.tsx
│       ├── LoginForm.tsx
│       ├── SignupForm.tsx
│       ├── LogoutButton.tsx
│       └── ProtectedRoute.tsx
│
├── lib/
│   ├── utils.ts            # Utilitaires généraux (cn, etc.)
│   ├── auth.ts             # Better-auth configuration
│   ├── session.ts          # Session management
│   └── validations/        # Schémas Zod
│       ├── auth.ts
│       ├── product.ts
│       └── order.ts
│
├── hooks/
│   ├── useAuth.ts
│   ├── useCart.ts
│   └── useProducts.ts
│
├── store/                  # Zustand stores
│   ├── cartStore.ts
│   ├── authStore.ts
│   └── uiStore.ts
│
└── types/
    ├── product.ts
    ├── user.ts
    └── order.ts
```

### Règles de nommage

#### Fichiers
- **Composants React**: PascalCase (ex: `ProductCard.tsx`)
- **Utilitaires**: camelCase (ex: `utils.ts`)
- **Types/Interfaces**: camelCase (ex: `product.ts`)
- **Constantes**: UPPER_CASE (ex: `API_URLS.ts`)

#### Composants
```tsx
// ✅ Bon - PascalCase
export function ProductCard() {}
export const HeroSection = () => {}

// ❌ Mauvais
export function productCard() {}
export const hero_section = () => {}
```

#### Variables et fonctions
```tsx
// ✅ Bon - camelCase
const userProfile = {}
const fetchProducts = async () => {}

// ❌ Mauvais
const UserProfile = {}
const FetchProducts = async () => {}
```

---

## 🎯 Best Practices

### 1. Composants réutilisables
Extraire les patterns répétés dans des composants dédiés :

```tsx
// components/ui/Section.tsx
export function Section({ 
  children, 
  variant = "default" 
}: { 
  children: React.ReactNode
  variant?: "default" | "gradient"
}) {
  const bgClass = variant === "gradient" 
    ? "bg-gradient-to-b from-primary-100 to-primary-200"
    : "bg-primary-100"
    
  return (
    <section className={`py-16 sm:py-24 ${bgClass} overflow-hidden`}>
      <div className="container mx-auto px-4">
        {children}
      </div>
    </section>
  )
}
```

### 2. Grouper les variants
Utiliser `cva` (class-variance-authority) pour gérer les variants :

```tsx
import { cva } from "class-variance-authority"

const buttonVariants = cva(
  "h-12 px-6 rounded-full font-sans font-semibold transition-colors duration-200 flex items-center gap-2",
  {
    variants: {
      variant: {
        primary: "bg-secondary text-white hover:bg-secondary/90",
        outline: "border-2 border-secondary bg-transparent text-secondary hover:bg-secondary/5",
        ghost: "bg-transparent text-secondary hover:bg-primary-100"
      },
      size: {
        sm: "h-10 px-4 text-sm",
        md: "h-12 px-6 text-base",
        lg: "h-14 px-8 text-lg"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md"
    }
  }
)
```

### 3. Performance animations
```tsx
// ✅ Bon - animations optimisées
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.2 }}
>

// ❌ Mauvais - animations trop lentes
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 1.5 }}
>
```

### 4. Responsive design
Toujours penser mobile-first :

```tsx
// ✅ Bon - mobile first
className="text-base sm:text-lg md:text-xl"
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"

// ❌ Éviter - desktop first nécessite plus d'overrides
className="text-xl md:text-lg sm:text-base"
```

---

## 📋 Checklist pour nouvelle page

Lors de la création d'une nouvelle page, vérifier :

- [ ] Structure de dossier respectée (`app/(public|private)/page-name/`)
- [ ] Composants dans `components/page-name/`
- [ ] Palette de couleurs respectée
- [ ] Typographie cohérente (font-sans)
- [ ] Bordures arrondies (rounded-2xl, rounded-full)
- [ ] Transitions et animations fluides (duration-150 à 300)
- [ ] Responsive (mobile-first)
- [ ] Accessibilité (aria-labels, focus states)
- [ ] Performance (lazy loading si nécessaire)

---

## 🚀 Commandes rapides

### Créer un nouveau composant
```bash
# Component simple
touch src/components/feature-name/ComponentName.tsx

# Component avec types
touch src/components/feature-name/ComponentName.tsx
touch src/components/feature-name/types.ts
```

### Structure complète feature
```bash
mkdir -p src/components/feature-name
touch src/components/feature-name/index.tsx
touch src/components/feature-name/Component1.tsx
touch src/components/feature-name/Component2.tsx
touch src/components/feature-name/types.ts
```

---

## 📚 Ressources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Radix UI Primitives](https://www.radix-ui.com/)

---

**Dernière mise à jour**: 6 décembre 2025
