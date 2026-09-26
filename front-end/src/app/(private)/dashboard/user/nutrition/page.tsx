"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { 
  Flame, 
  Target, 
  TrendingUp, 
  Apple,
  Droplet,
  Wheat,
  Activity,
  Calculator,
  Calendar,
  ChevronRight,
  Loader2
} from "lucide-react";
import { useNutrition } from "@/lib/api/users";
import { CalorieCalculator } from "@/components/dashboard/CalorieCalculator";

const DAYS_SHORT = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const CALORIE_GOAL = 2000;
const PROTEIN_GOAL = 150;
const CARBS_GOAL = 250;
const FATS_GOAL = 67;
const FIBER_GOAL = 25;

export default function NutritionPage() {
  const [showCalculator, setShowCalculator] = useState(false);
  const [period, setPeriod] = useState<'week' | 'month' | 'all'>('week');
  const { data: nutrition, isLoading } = useNutrition(period);

  // Derive today and weekly data from API
  const todayNutrition = (() => {
    if (!nutrition?.daily?.length) {
      return { calories: 0, caloriesGoal: CALORIE_GOAL, proteins: 0, proteinsGoal: PROTEIN_GOAL, carbs: 0, carbsGoal: CARBS_GOAL, fats: 0, fatsGoal: FATS_GOAL, fiber: 0, fiberGoal: FIBER_GOAL };
    }
    const summary = nutrition.summary;
    return {
      calories: summary.avgCalories,
      caloriesGoal: CALORIE_GOAL,
      proteins: summary.avgProteins,
      proteinsGoal: PROTEIN_GOAL,
      carbs: summary.avgCarbs,
      carbsGoal: CARBS_GOAL,
      fats: summary.avgFats,
      fatsGoal: FATS_GOAL,
      fiber: summary.avgFiber,
      fiberGoal: FIBER_GOAL,
    };
  })();

  const weeklyData = (() => {
    if (!nutrition?.daily?.length) return [];
    return nutrition.daily.slice(-7).map((d) => ({
      day: DAYS_SHORT[new Date(d.date).getDay()],
      calories: d.calories,
      goal: CALORIE_GOAL,
    }));
  })();

  const recentMeals = (() => {
    if (!nutrition?.daily?.length) return [];
    const latest = nutrition.daily[nutrition.daily.length - 1];
    return [{
      name: "Moyenne journalière",
      calories: latest.calories,
      time: "",
      proteins: latest.proteins,
      carbs: latest.carbs,
      fats: latest.fats,
    }];
  })();

  const getPercentage = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-sans font-bold text-secondary-850">
            Nutrition & Objectifs
          </h1>
          <p className="text-secondary-850/60 font-sans mt-1">
            Suivez votre apport quotidien et atteignez vos objectifs
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCalculator(!showCalculator)}
          className="h-10 px-5 bg-secondary text-white rounded-full font-sans font-semibold hover:bg-secondary/90 transition-colors duration-200 flex items-center gap-2"
        >
          <Calculator className="w-4 h-4" />
          Calculateur
        </motion.button>
      </div>

      {/* Calories Today Card - Hero */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="bg-gradient-to-br from-secondary/10 to-secondary/20 border-2 border-secondary/30 rounded-3xl p-8"
      >
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Circular Progress */}
          <div className="relative">
            <svg className="w-48 h-48 transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="rgba(237,103,109,0.1)"
                strokeWidth="12"
                fill="none"
              />
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="#ED676D"
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 88}`}
                strokeDashoffset={`${2 * Math.PI * 88 * (1 - todayNutrition.calories / todayNutrition.caloriesGoal)}`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Flame className="w-8 h-8 text-secondary mb-2" />
              <p className="text-4xl font-bold font-sans text-secondary-850">
                {todayNutrition.calories}
              </p>
              <p className="text-sm text-secondary-850/60 font-sans">
                / {todayNutrition.caloriesGoal} kcal
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex-1 w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-sans font-bold text-secondary-850">
                Aujourd'hui
              </h2>
              <span className="text-sm font-sans text-secondary-850/60">
                {Math.round(getPercentage(todayNutrition.calories, todayNutrition.caloriesGoal))}% de l'objectif
              </span>
            </div>

            <div className="space-y-4">
              {/* Proteins */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    <span className="font-sans font-medium text-secondary-850">Protéines</span>
                  </div>
                  <span className="font-sans text-sm text-secondary-850/70">
                    {todayNutrition.proteins}g / {todayNutrition.proteinsGoal}g
                  </span>
                </div>
                <div className="h-2 bg-secondary/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${getPercentage(todayNutrition.proteins, todayNutrition.proteinsGoal)}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="h-full bg-blue-500 rounded-full"
                  />
                </div>
              </div>

              {/* Carbs */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                    <span className="font-sans font-medium text-secondary-850">Glucides</span>
                  </div>
                  <span className="font-sans text-sm text-secondary-850/70">
                    {todayNutrition.carbs}g / {todayNutrition.carbsGoal}g
                  </span>
                </div>
                <div className="h-2 bg-secondary/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${getPercentage(todayNutrition.carbs, todayNutrition.carbsGoal)}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="h-full bg-yellow-500 rounded-full"
                  />
                </div>
              </div>

              {/* Fats */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <span className="font-sans font-medium text-secondary-850">Lipides</span>
                  </div>
                  <span className="font-sans text-sm text-secondary-850/70">
                    {todayNutrition.fats}g / {todayNutrition.fatsGoal}g
                  </span>
                </div>
                <div className="h-2 bg-secondary/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${getPercentage(todayNutrition.fats, todayNutrition.fatsGoal)}%` }}
                    transition={{ duration: 1, delay: 0.4 }}
                    className="h-full bg-green-500 rounded-full"
                  />
                </div>
              </div>

              {/* Fiber */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full" />
                    <span className="font-sans font-medium text-secondary-850">Fibres</span>
                  </div>
                  <span className="font-sans text-sm text-secondary-850/70">
                    {todayNutrition.fiber}g / {todayNutrition.fiberGoal}g
                  </span>
                </div>
                <div className="h-2 bg-secondary/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${getPercentage(todayNutrition.fiber, todayNutrition.fiberGoal)}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-orange-500 rounded-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Weekly Progress */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.1 }}
        className="bg-card border-2 border-secondary/10 rounded-3xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary-200 rounded-full flex items-center justify-center">
            <Calendar className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="text-xl font-sans font-bold text-secondary-850">Progression de la semaine</h3>
            <p className="text-sm text-secondary-850/60 font-sans">Votre apport calorique quotidien</p>
          </div>
        </div>

        <div className="flex items-end justify-between gap-2 h-48">
          {weeklyData.map((day, index) => {
            const height = (day.calories / day.goal) * 100;
            const isToday = index === weeklyData.length - 1;
            
            return (
              <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                <div className="relative w-full h-full flex flex-col justify-end">
                  {/* Goal line */}
                  <div className="absolute top-0 left-0 right-0 h-px bg-secondary/30 z-10" />
                  
                  {/* Bar */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`w-full rounded-t-lg ${
                      isToday 
                        ? 'bg-secondary' 
                        : day.calories > day.goal 
                        ? 'bg-orange-400' 
                        : 'bg-green-400'
                    }`}
                  />
                </div>
                <div className="text-center">
                  <p className={`text-xs font-sans font-medium ${
                    isToday ? 'text-secondary' : 'text-secondary-850/60'
                  }`}>
                    {day.day}
                  </p>
                  <p className="text-xs font-sans text-secondary-850/50">
                    {day.calories}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Recent Meals & Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Meals */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
          className="bg-card border-2 border-secondary/10 rounded-3xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                <Apple className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <h3 className="text-lg font-sans font-bold text-secondary-850">Repas d'aujourd'hui</h3>
                <p className="text-xs text-secondary-850/60 font-sans">
                  {recentMeals.length} repas enregistrés
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-secondary font-sans text-sm font-medium flex items-center gap-1"
            >
              Voir tout
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>

          <div className="space-y-3">
            {recentMeals.map((meal, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-center gap-4 p-4 bg-white/30 rounded-xl border border-secondary/10"
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-sans font-semibold text-secondary-850">{meal.name}</h4>
                    <span className="text-xs font-sans text-secondary-850/50">{meal.time}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-sans text-secondary-850/60">
                    <span>{meal.proteins}g P</span>
                    <span>{meal.carbs}g G</span>
                    <span>{meal.fats}g L</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-sans font-bold text-secondary">{meal.calories}</p>
                  <p className="text-xs font-sans text-secondary-850/50">kcal</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Goals */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
          className="bg-card border-2 border-secondary/10 rounded-3xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Target className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-sans font-bold text-secondary-850">Mes Objectifs</h3>
              <p className="text-xs text-secondary-850/60 font-sans">Objectifs personnalisés</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border-2 border-green-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-sans font-semibold text-green-800">Perte de poids</span>
                <span className="text-xs font-sans font-medium text-green-600">Actif</span>
              </div>
              <p className="text-sm text-green-700 font-sans mb-3">
                Objectif: -500 kcal/jour
              </p>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-xs font-sans text-green-700">
                  -2.3 kg ce mois-ci
                </span>
              </div>
            </div>

            <div className="p-4 bg-white/30 rounded-xl border border-secondary/10">
              <h4 className="font-sans font-semibold text-secondary-850 mb-2">Recommandations</h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm font-sans text-secondary-850/70">
                  <Activity className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
                  <span>Augmenter l'apport en protéines (+25g)</span>
                </li>
                <li className="flex items-start gap-2 text-sm font-sans text-secondary-850/70">
                  <Droplet className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Boire plus d'eau (1.5L minimum)</span>
                </li>
                <li className="flex items-start gap-2 text-sm font-sans text-secondary-850/70">
                  <Wheat className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <span>Augmenter les fibres (+7g)</span>
                </li>
              </ul>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full h-10 bg-secondary text-white rounded-full font-sans font-semibold hover:bg-secondary/90 transition-colors duration-200"
            >
              Modifier mes objectifs
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Calorie Calculator Modal */}
      <CalorieCalculator open={showCalculator} onClose={() => setShowCalculator(false)} />
    </motion.div>
  );
}
