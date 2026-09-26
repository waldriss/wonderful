const dietTypeLabels: Record<string, string> = {
  BALANCED: "Équilibré",
  balanced: "Équilibré",
  HIGH_PROTEIN: "Riche en protéines",
  highprotein: "Riche en protéines",
  HIGHPROTEIN: "Riche en protéines",
  LOW_CARB: "Faible en glucides",
  low_carb: "Faible en glucides",
  lowcarb: "Faible en glucides",
  KETO: "Keto",
  keto: "Keto",
  VEGETARIAN: "Végétarien",
  vegetarian: "Végétarien",
  VEGAN: "Végétalien",
  vegan: "Végétalien",
};

export function formatDietTypeLabel(value: string): string {
  return dietTypeLabels[value] ?? value;
}

const categoryLabels: Record<string, string> = {
  PLATS: "Plats",
  BOISSONS: "Boissons",
  DESSERTS: "Desserts",
  SNACKS: "Snacks",
};

const orderStatusLabels: Record<string, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  PREPARING: "En préparation",
  IN_TRANSIT: "En transit",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
  pending: "En attente",
  confirmed: "Confirmée",
  preparing: "En préparation",
  in_transit: "En transit",
  delivered: "Livrée",
  cancelled: "Annulée",
};

const subscriptionPlanTypeLabels: Record<string, string> = {
  MONTHLY: "mensuelle",
  QUARTERLY: "trimestrielle",
  ANNUAL: "annuelle",
  CUSTOM: "personnalisée",
};

const rewardTypeLabels: Record<string, string> = {
  POINTS: "points",
  DISCOUNT_PERCENTAGE: "% de réduction",
  DISCOUNT_FIXED: "DA de réduction",
  FREE_DELIVERY: "livraison gratuite",
};

export function formatCategoryLabel(value: string): string {
  return categoryLabels[value] ?? value;
}

export function formatOrderStatusLabel(value: string): string {
  return orderStatusLabels[value] ?? value;
}

export function formatSubscriptionPlanTypeLabel(value: string): string {
  return subscriptionPlanTypeLabels[value] ?? value.toLowerCase();
}

export function formatRewardTypeLabel(value: string): string {
  return rewardTypeLabels[value] ?? value;
}
