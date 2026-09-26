// Types pour le système d'abonnement

export type SubscriptionType = 'monthly' | 'quarterly' | 'annual' | 'custom';

export type DeliveryDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export type PaymentMethod = 'cash' | 'card';

export type ProductCategory = 'meals' | 'drinks' | 'desserts';

export interface ProductItem {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  quantity: number;
  price: number;
  image: string;
}

export interface DeliverySchedule {
  days: DeliveryDay[];
  location: string | null;
  address: string;
  timeSlot: string | null;
  paymentMethod: PaymentMethod | null;
}

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  notes?: string;
  password?: string;
}

export interface SubscriptionData {
  subscriptionType: SubscriptionType;
  selectedPlanId: string | null;
  selectedPlanName: string | null;
  selectedProducts: ProductItem[];
  deliverySchedule: DeliverySchedule;
  customerInfo: CustomerInfo;
}

export interface StepProps {
  data: SubscriptionData;
  updateData: (updates: Partial<SubscriptionData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

// Produits disponibles (mock data)
export const availableProducts = {
  meals: [
    { id: 'meal-1', name: 'Safy Délicieux', description: 'Plat traditionnel revisité', price: 8.50, image: '/images/card.png' },
    { id: 'meal-2', name: 'Yassa Poulet', description: 'Poulet mariné aux oignons', price: 9.50, image: '/images/card.png' },
    { id: 'meal-3', name: 'Thieboudienne', description: 'Riz au poisson et légumes', price: 11.00, image: '/images/card.png' },
    { id: 'meal-4', name: 'Mafé Royal', description: 'Viande sauce arachide', price: 9.00, image: '/images/card.png' },
    { id: 'meal-5', name: 'Pasta Pesto', description: 'Pâtes fraîches au basilic', price: 7.50, image: '/images/card.png' },
    { id: 'meal-6', name: 'Bowl Buddha', description: 'Légumes grillés, quinoa', price: 8.50, image: '/images/card.png' },
  ],
  drinks: [
    { id: 'drink-1', name: 'Jus de Bissap', description: 'Hibiscus frais', price: 3.50, image: '/images/card.png' },
    { id: 'drink-2', name: 'Jus de Gingembre', description: 'Gingembre et citron', price: 3.50, image: '/images/card.png' },
    { id: 'drink-3', name: 'Smoothie Mangue', description: 'Mangue, banane, lait de coco', price: 4.50, image: '/images/card.png' },
    { id: 'drink-4', name: 'Detox Green', description: 'Épinards, pomme, concombre', price: 4.00, image: '/images/card.png' },
  ],
  desserts: [
    { id: 'dessert-1', name: 'Fondant Chocolat', description: 'Cœur coulant', price: 4.50, image: '/images/card.png' },
    { id: 'dessert-2', name: 'Pastels Sucrés', description: 'Beignets traditionnels', price: 3.50, image: '/images/card.png' },
    { id: 'dessert-3', name: 'Fruit Bowl', description: 'Fruits frais de saison', price: 4.00, image: '/images/card.png' },
    { id: 'dessert-4', name: 'Energy Balls', description: 'Dattes, amandes, cacao', price: 3.00, image: '/images/card.png' },
  ],
};

export const subscriptionOptions = [
  {
    id: 'monthly' as SubscriptionType,
    name: 'Mensuel',
    description: 'Abonnement renouvelé chaque mois',
    price: 49,
    discount: 0,
    badge: null,
  },
  {
    id: 'quarterly' as SubscriptionType,
    name: 'Trimestriel',
    description: '3 mois d\'engagement',
    price: 132,
    discount: 10,
    badge: '-10%',
  },
  {
    id: 'annual' as SubscriptionType,
    name: 'Annuel',
    description: '12 mois d\'engagement',
    price: 470,
    discount: 20,
    badge: '-20%',
  },
];

export const daysOfWeek: { id: DeliveryDay; label: string }[] = [
  { id: 'monday', label: 'Lundi' },
  { id: 'tuesday', label: 'Mardi' },
  { id: 'wednesday', label: 'Mercredi' },
  { id: 'thursday', label: 'Jeudi' },
  { id: 'friday', label: 'Vendredi' },
  { id: 'saturday', label: 'Samedi' },
  { id: 'sunday', label: 'Dimanche' },
];

export const deliveryTimeSlots = [
  { id: 'morning', label: 'Matin', time: '8h - 12h' },
  { id: 'noon', label: 'Midi', time: '12h - 14h' },
  { id: 'afternoon', label: 'Après-midi', time: '14h - 18h' },
  { id: 'evening', label: 'Soir', time: '18h - 21h' },
];

export const initialSubscriptionData: SubscriptionData = {
  subscriptionType: 'monthly',
  selectedPlanId: null,
  selectedPlanName: null,
  selectedProducts: [],
  deliverySchedule: {
    days: [],
    location: null,
    address: '',
    timeSlot: null,
    paymentMethod: null,
  },
  customerInfo: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
  },
};
