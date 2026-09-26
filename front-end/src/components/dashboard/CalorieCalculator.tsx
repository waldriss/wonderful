"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calculator,
  X,
  ChevronRight,
  Flame,
  Beef,
  Wheat,
  Droplets,
  Activity,
  User,
  Ruler,
  Weight,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

type Gender = "male" | "female";
type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
type Goal = "lose_fast" | "lose" | "maintain" | "gain" | "gain_fast";

interface CalcInputs {
  age: string;
  weight: string; // kg
  height: string; // cm
  gender: Gender;
  activity: ActivityLevel;
  goal: Goal;
}

interface CalcResults {
  bmr: number;
  tdee: number;
  targetCalories: number;
  proteins: number; // g
  carbs: number; // g
  fats: number; // g
  fiber: number; // g
}

// ─── Constants ───────────────────────────────────────────────────────────────

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const ACTIVITY_LABELS: Record<ActivityLevel, { label: string; description: string }> = {
  sedentary: { label: "Sédentaire", description: "Peu ou pas d'exercice" },
  light: { label: "Légèrement actif", description: "1-3 jours/semaine" },
  moderate: { label: "Modérément actif", description: "3-5 jours/semaine" },
  active: { label: "Très actif", description: "6-7 jours/semaine" },
  very_active: { label: "Extrêmement actif", description: "2x/jour ou travail physique" },
};

const GOAL_ADJUSTMENTS: Record<Goal, number> = {
  lose_fast: -500,
  lose: -250,
  maintain: 0,
  gain: 250,
  gain_fast: 500,
};

const GOAL_LABELS: Record<Goal, { label: string; description: string; color: string }> = {
  lose_fast: { label: "Perte rapide", description: "-0.5 kg/semaine", color: "text-red-600" },
  lose: { label: "Perte modérée", description: "-0.25 kg/semaine", color: "text-orange-500" },
  maintain: { label: "Maintien", description: "Stabiliser le poids", color: "text-blue-500" },
  gain: { label: "Prise de masse", description: "+0.25 kg/semaine", color: "text-green-600" },
  gain_fast: { label: "Prise rapide", description: "+0.5 kg/semaine", color: "text-emerald-700" },
};

// ─── Calculation logic ────────────────────────────────────────────────────────

function calculateBMR(inputs: CalcInputs): number {
  const weight = parseFloat(inputs.weight);
  const height = parseFloat(inputs.height);
  const age = parseInt(inputs.age, 10);
  // Mifflin-St Jeor
  const base = 10 * weight + 6.25 * height - 5 * age;
  return inputs.gender === "male" ? base + 5 : base - 161;
}

function calculate(inputs: CalcInputs): CalcResults | null {
  const age = parseInt(inputs.age, 10);
  const weight = parseFloat(inputs.weight);
  const height = parseFloat(inputs.height);

  if (!age || !weight || !height || age < 10 || age > 120 || weight < 20 || weight > 400 || height < 50 || height > 280) {
    return null;
  }

  const bmr = Math.round(calculateBMR(inputs));
  const tdee = Math.round(bmr * ACTIVITY_MULTIPLIERS[inputs.activity]);
  const targetCalories = Math.max(1200, tdee + GOAL_ADJUSTMENTS[inputs.goal]);

  // Macro split: 30% proteins, 40% carbs, 30% fats
  const proteins = Math.round((targetCalories * 0.3) / 4);
  const carbs = Math.round((targetCalories * 0.4) / 4);
  const fats = Math.round((targetCalories * 0.3) / 9);
  const fiber = Math.round(targetCalories / 100); // ~14g per 1000 kcal

  return { bmr, tdee, targetCalories, proteins, carbs, fats, fiber };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex bg-secondary/10 rounded-full p-1 gap-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "flex-1 py-1.5 rounded-full text-sm font-sans font-medium transition-all duration-200",
            value === opt.value
              ? "bg-secondary text-white shadow-sm"
              : "text-secondary-850/60 hover:text-secondary-850"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function NumberInput({
  label,
  icon: Icon,
  value,
  onChange,
  min,
  max,
  unit,
  placeholder,
}: {
  label: string;
  icon: React.ElementType;
  value: string;
  onChange: (v: string) => void;
  min: number;
  max: number;
  unit: string;
  placeholder: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-sans font-medium text-secondary-850/80 flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5 text-secondary" />
        {label}
      </label>
      <div className="relative">
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-10 px-3 pr-12 bg-white/50 border-2 border-secondary/20 rounded-xl font-sans text-secondary-850 placeholder:text-secondary-850/30 focus:outline-none focus:border-secondary/50 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-sans text-secondary-850/40 font-medium">
          {unit}
        </span>
      </div>
    </div>
  );
}

function MacroCard({
  label,
  value,
  unit,
  color,
  icon: Icon,
  percent,
}: {
  label: string;
  value: number;
  unit: string;
  color: string;
  icon: React.ElementType;
  percent: number;
}) {
  return (
    <div className={cn("rounded-2xl p-4 border-2", color)}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4" />
        <span className="text-sm font-sans font-semibold">{label}</span>
        <span className="ml-auto text-xs font-sans font-medium opacity-70">{percent}%</span>
      </div>
      <p className="text-2xl font-sans font-bold">
        {value}
        <span className="text-sm font-normal ml-1">{unit}</span>
      </p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface CalorieCalculatorProps {
  open: boolean;
  onClose: () => void;
}

export function CalorieCalculator({ open, onClose }: CalorieCalculatorProps) {
  const [step, setStep] = useState<"form" | "results">("form");
  const [inputs, setInputs] = useState<CalcInputs>({
    age: "",
    weight: "",
    height: "",
    gender: "male",
    activity: "moderate",
    goal: "maintain",
  });
  const [results, setResults] = useState<CalcResults | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof CalcInputs, string>>>({});

  const update = <K extends keyof CalcInputs>(key: K, value: CalcInputs[K]) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    const age = parseInt(inputs.age, 10);
    const weight = parseFloat(inputs.weight);
    const height = parseFloat(inputs.height);

    if (!inputs.age || isNaN(age) || age < 10 || age > 120)
      newErrors.age = "Âge invalide (10-120 ans)";
    if (!inputs.weight || isNaN(weight) || weight < 20 || weight > 400)
      newErrors.weight = "Poids invalide (20-400 kg)";
    if (!inputs.height || isNaN(height) || height < 50 || height > 280)
      newErrors.height = "Taille invalide (50-280 cm)";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCalculate = () => {
    if (!validate()) return;
    const res = calculate(inputs);
    if (res) {
      setResults(res);
      setStep("results");
    }
  };

  const handleReset = () => {
    setStep("form");
    setResults(null);
    setInputs({ age: "", weight: "", height: "", gender: "male", activity: "moderate", goal: "maintain" });
    setErrors({});
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative bg-card border-2 border-secondary/20 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b-2 border-secondary/10 px-8 py-5 flex items-center justify-between z-10 rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-secondary/10 rounded-full flex items-center justify-center">
                  <Calculator className="w-4 h-4 text-secondary" />
                </div>
                <div>
                  <h2 className="text-xl font-sans font-bold text-secondary-850">
                    Calculateur de calories
                  </h2>
                  <p className="text-xs text-secondary-850/50 font-sans">
                    Méthode Mifflin-St Jeor
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary/10 transition-colors text-secondary-850/60 hover:text-secondary-850"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-8">
              <AnimatePresence mode="wait">
                {/* ── Step 1 : Form ────────────────────────────────────── */}
                {step === "form" && (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    {/* Gender */}
                    <div className="space-y-2">
                      <label className="text-sm font-sans font-medium text-secondary-850/80 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-secondary" />
                        Sexe
                      </label>
                      <SegmentedControl
                        options={[
                          { value: "male" as Gender, label: "Homme" },
                          { value: "female" as Gender, label: "Femme" },
                        ]}
                        value={inputs.gender}
                        onChange={(v) => update("gender", v)}
                      />
                    </div>

                    {/* Age / Weight / Height */}
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <NumberInput
                          label="Âge"
                          icon={User}
                          value={inputs.age}
                          onChange={(v) => update("age", v)}
                          min={10}
                          max={120}
                          unit="ans"
                          placeholder="25"
                        />
                        {errors.age && (
                          <p className="text-xs text-red-500 font-sans mt-1">{errors.age}</p>
                        )}
                      </div>
                      <div>
                        <NumberInput
                          label="Poids"
                          icon={Weight}
                          value={inputs.weight}
                          onChange={(v) => update("weight", v)}
                          min={20}
                          max={400}
                          unit="kg"
                          placeholder="70"
                        />
                        {errors.weight && (
                          <p className="text-xs text-red-500 font-sans mt-1">{errors.weight}</p>
                        )}
                      </div>
                      <div>
                        <NumberInput
                          label="Taille"
                          icon={Ruler}
                          value={inputs.height}
                          onChange={(v) => update("height", v)}
                          min={50}
                          max={280}
                          unit="cm"
                          placeholder="175"
                        />
                        {errors.height && (
                          <p className="text-xs text-red-500 font-sans mt-1">{errors.height}</p>
                        )}
                      </div>
                    </div>

                    {/* Activity level */}
                    <div className="space-y-2">
                      <label className="text-sm font-sans font-medium text-secondary-850/80 flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-secondary" />
                        Niveau d'activité
                      </label>
                      <div className="grid grid-cols-1 gap-2">
                        {(Object.keys(ACTIVITY_LABELS) as ActivityLevel[]).map((level) => (
                          <button
                            key={level}
                            type="button"
                            onClick={() => update("activity", level)}
                            className={cn(
                              "flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all duration-200 text-left",
                              inputs.activity === level
                                ? "border-secondary bg-secondary/5"
                                : "border-secondary/10 hover:border-secondary/30 bg-white/30"
                            )}
                          >
                            <div>
                              <p className={cn("text-sm font-sans font-semibold", inputs.activity === level ? "text-secondary" : "text-secondary-850")}>
                                {ACTIVITY_LABELS[level].label}
                              </p>
                              <p className="text-xs font-sans text-secondary-850/50">
                                {ACTIVITY_LABELS[level].description}
                              </p>
                            </div>
                            {inputs.activity === level && (
                              <div className="w-5 h-5 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                                <div className="w-2 h-2 bg-white rounded-full" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Goal */}
                    <div className="space-y-2">
                      <label className="text-sm font-sans font-medium text-secondary-850/80 flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-secondary" />
                        Objectif
                      </label>
                      <div className="grid grid-cols-1 gap-2">
                        {(Object.keys(GOAL_LABELS) as Goal[]).map((goal) => (
                          <button
                            key={goal}
                            type="button"
                            onClick={() => update("goal", goal)}
                            className={cn(
                              "flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all duration-200 text-left",
                              inputs.goal === goal
                                ? "border-secondary bg-secondary/5"
                                : "border-secondary/10 hover:border-secondary/30 bg-white/30"
                            )}
                          >
                            <div>
                              <p className={cn("text-sm font-sans font-semibold", inputs.goal === goal ? "text-secondary" : "text-secondary-850")}>
                                {GOAL_LABELS[goal].label}
                              </p>
                              <p className="text-xs font-sans text-secondary-850/50">
                                {GOAL_LABELS[goal].description}
                              </p>
                            </div>
                            <span className={cn("text-xs font-sans font-bold", GOAL_LABELS[goal].color)}>
                              {GOAL_ADJUSTMENTS[goal] === 0
                                ? "±0 kcal"
                                : GOAL_ADJUSTMENTS[goal] > 0
                                ? `+${GOAL_ADJUSTMENTS[goal]} kcal`
                                : `${GOAL_ADJUSTMENTS[goal]} kcal`}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* CTA */}
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCalculate}
                      className="w-full h-12 bg-secondary text-white rounded-full font-sans font-semibold hover:bg-secondary/90 transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      Calculer mes besoins
                      <ChevronRight className="w-4 h-4" />
                    </motion.button>
                  </motion.div>
                )}

                {/* ── Step 2 : Results ─────────────────────────────────── */}
                {step === "results" && results && (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    {/* Main calorie target */}
                    <div className="bg-gradient-to-br from-secondary/10 to-secondary/20 border-2 border-secondary/30 rounded-2xl p-6 text-center">
                      <Flame className="w-8 h-8 text-secondary mx-auto mb-2" />
                      <p className="text-5xl font-sans font-bold text-secondary-850">
                        {results.targetCalories}
                      </p>
                      <p className="text-secondary-850/60 font-sans text-sm mt-1">
                        kcal/jour — {GOAL_LABELS[inputs.goal].label}
                      </p>
                    </div>

                    {/* BMR / TDEE detail */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/40 border-2 border-secondary/10 rounded-2xl p-4 text-center">
                        <p className="text-xs font-sans text-secondary-850/50 mb-1">Métabolisme de base (BMR)</p>
                        <p className="text-2xl font-sans font-bold text-secondary-850">{results.bmr}</p>
                        <p className="text-xs font-sans text-secondary-850/40">kcal/jour au repos</p>
                      </div>
                      <div className="bg-white/40 border-2 border-secondary/10 rounded-2xl p-4 text-center">
                        <p className="text-xs font-sans text-secondary-850/50 mb-1">Dépense totale (TDEE)</p>
                        <p className="text-2xl font-sans font-bold text-secondary-850">{results.tdee}</p>
                        <p className="text-xs font-sans text-secondary-850/40">kcal/jour avec activité</p>
                      </div>
                    </div>

                    {/* Macros */}
                    <div>
                      <p className="text-sm font-sans font-semibold text-secondary-850/70 mb-3">
                        Répartition des macronutriments
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <MacroCard
                          label="Protéines"
                          value={results.proteins}
                          unit="g"
                          percent={30}
                          icon={Beef}
                          color="bg-blue-50 border-blue-200 text-blue-700"
                        />
                        <MacroCard
                          label="Glucides"
                          value={results.carbs}
                          unit="g"
                          percent={40}
                          icon={Wheat}
                          color="bg-yellow-50 border-yellow-200 text-yellow-700"
                        />
                        <MacroCard
                          label="Lipides"
                          value={results.fats}
                          unit="g"
                          percent={30}
                          icon={Droplets}
                          color="bg-green-50 border-green-200 text-green-700"
                        />
                        <MacroCard
                          label="Fibres (recommandé)"
                          value={results.fiber}
                          unit="g"
                          percent={14}
                          icon={Activity}
                          color="bg-orange-50 border-orange-200 text-orange-700"
                        />
                      </div>
                    </div>

                    {/* Visual macro bar */}
                    <div className="space-y-2">
                      <p className="text-xs font-sans text-secondary-850/50">Répartition calorique</p>
                      <div className="h-4 rounded-full overflow-hidden flex">
                        <div className="bg-blue-400 h-full" style={{ width: "30%" }} title="Protéines 30%" />
                        <div className="bg-yellow-400 h-full" style={{ width: "40%" }} title="Glucides 40%" />
                        <div className="bg-green-400 h-full" style={{ width: "30%" }} title="Lipides 30%" />
                      </div>
                      <div className="flex items-center gap-4 text-xs font-sans text-secondary-850/60">
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-blue-400 rounded-full" />Protéines 30%</span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-yellow-400 rounded-full" />Glucides 40%</span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-green-400 rounded-full" />Lipides 30%</span>
                      </div>
                    </div>

                    {/* Profile summary */}
                    <div className="bg-secondary/5 border border-secondary/15 rounded-2xl p-4">
                      <p className="text-xs font-sans font-semibold text-secondary-850/60 mb-2">
                        Basé sur votre profil
                      </p>
                      <div className="flex flex-wrap gap-3 text-xs font-sans text-secondary-850/70">
                        <span className="px-2.5 py-1 bg-white/60 rounded-full border border-secondary/10">
                          {inputs.gender === "male" ? "Homme" : "Femme"}, {inputs.age} ans
                        </span>
                        <span className="px-2.5 py-1 bg-white/60 rounded-full border border-secondary/10">
                          {inputs.weight} kg · {inputs.height} cm
                        </span>
                        <span className="px-2.5 py-1 bg-white/60 rounded-full border border-secondary/10">
                          {ACTIVITY_LABELS[inputs.activity].label}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleReset}
                        className="flex-1 h-11 bg-secondary/10 text-secondary rounded-full font-sans font-semibold hover:bg-secondary/20 transition-colors duration-200 flex items-center justify-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Recalculer
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onClose}
                        className="flex-1 h-11 bg-secondary text-white rounded-full font-sans font-semibold hover:bg-secondary/90 transition-colors duration-200"
                      >
                        Fermer
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
