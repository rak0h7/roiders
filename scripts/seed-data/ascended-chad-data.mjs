import { randomUUID } from "crypto";
import { addDays, format } from "date-fns";

export const DISPLAY_NAME = "Ascended Chad";
export const USERNAME = "ascended_chad";
export const CYCLE_WEEKS = 20;
/** Cycle end aligns with current date in seed (week 20). */
export const CYCLE_END = new Date("2026-06-18");
export const CYCLE_START = addDays(CYCLE_END, -CYCLE_WEEKS * 7);

function uid() {
  return randomUUID();
}

function isoDate(d) {
  return format(d, "yyyy-MM-dd");
}

function mv(markerId, value, unit) {
  return { markerId, value, unit };
}

const BLOODWORK_CHECKPOINTS = [
  {
    week: 0,
    label: "Baseline (Pre-Cycle)",
    totalT: 350,
    freeT: 8,
    e2: 18,
    prolactin: 8,
    hct: 44,
    hgb: 14.5,
    hdl: 55,
    ldl: 110,
    alt: 25,
    ast: 22,
    hscrp: 0.8,
  },
  { week: 2, label: "Week 2 — Test Base", totalT: 700, freeT: 16.5, e2: 25, prolactin: 9, hct: 46, hgb: 14.8, hdl: 50, ldl: 120, alt: 26, ast: 23, hscrp: 0.9 },
  { week: 4, label: "Week 4 — Test Saturation", totalT: 900, freeT: 22.5, e2: 30, prolactin: 9, hct: 47.5, hgb: 15.0, hdl: 48, ldl: 125, alt: 28, ast: 25, hscrp: 1.0 },
  { week: 6, label: "Week 6 — Pre-Tren", totalT: 975, freeT: 25, e2: 32.5, prolactin: 9, hct: 48.5, hgb: 15.2, hdl: 45, ldl: 130, alt: 30, ast: 28, hscrp: 1.1 },
  { week: 7, label: "Week 7 — Tren Intro", totalT: 950, freeT: 24, e2: 30, prolactin: 13.5, hct: 49, hgb: 15.3, hdl: 40, ldl: 140, alt: 32, ast: 30, hscrp: 1.3 },
  { week: 8, label: "Week 8 — Tren Ramp", totalT: 960, freeT: 24, e2: 27.5, prolactin: 20, hct: 50, hgb: 15.5, hdl: 35, ldl: 155, alt: 35, ast: 32, hscrp: 1.6 },
  { week: 9, label: "Week 9 — Prolactin Flag", totalT: 950, freeT: 23, e2: 25, prolactin: 26, hct: 51, hgb: 15.7, hdl: 30, ldl: 170, alt: 36, ast: 33, hscrp: 2.0 },
  { week: 10, label: "Week 10 — Peak Ramp", totalT: 950, freeT: 22, e2: 25, prolactin: 31.5, hct: 52, hgb: 15.9, hdl: 26.5, ldl: 182, alt: 37, ast: 34, hscrp: 2.2 },
  { week: 12, label: "Week 12 — Peak Phase", totalT: 1000, freeT: 26, e2: 25, prolactin: 25, hct: 52.5, hgb: 16.0, hdl: 23.5, ldl: 190, alt: 40, ast: 38, hscrp: 2.5 },
  { week: 14, label: "Week 14 — Peak Hold", totalT: 980, freeT: 25, e2: 24, prolactin: 22, hct: 53.5, hgb: 16.1, hdl: 20, ldl: 192, alt: 41, ast: 39, hscrp: 2.4 },
  { week: 16, label: "Week 16 — Hct Watch", totalT: 950, freeT: 24, e2: 25, prolactin: 20, hct: 54, hgb: 16.2, hdl: 20, ldl: 195, alt: 42, ast: 40, hscrp: 2.3 },
  { week: 18, label: "Week 18 — Peak Physique", totalT: 950, freeT: 24, e2: 25, prolactin: 21.5, hct: 53.5, hgb: 16.1, hdl: 22, ldl: 185, alt: 40, ast: 38, hscrp: 2.2 },
  { week: 19, label: "Week 19 — Tren Taper", totalT: 960, freeT: 25, e2: 31.5, prolactin: 17.5, hct: 52.5, hgb: 16.0, hdl: 28, ldl: 170, alt: 36, ast: 34, hscrp: 1.8 },
  { week: 20, label: "Week 20 — Cycle End", totalT: 950, freeT: 24, e2: 32.5, prolactin: 13.5, hct: 52, hgb: 15.9, hdl: 32, ldl: 160, alt: 32, ast: 30, hscrp: 1.4 },
];

export function buildLabsReports() {
  const now = new Date().toISOString();
  return BLOODWORK_CHECKPOINTS.map((cp) => {
    const date = isoDate(addDays(CYCLE_START, cp.week * 7));
    return {
      id: `report-week-${cp.week}-${date}`,
      name: cp.label,
      date,
      createdAt: now,
      source: "manual",
      values: [
        mv("total-testosterone", cp.totalT, "ng/dL"),
        mv("free-testosterone", cp.freeT, "pg/mL"),
        mv("estradiol", cp.e2, "pg/mL"),
        mv("prolactin", cp.prolactin, "ng/mL"),
        mv("hematocrit", cp.hct, "%"),
        mv("hemoglobin", cp.hgb, "g/dL"),
        mv("hdl", cp.hdl, "mg/dL"),
        mv("ldl", cp.ldl, "mg/dL"),
        mv("alt", cp.alt, "U/L"),
        mv("ast", cp.ast, "U/L"),
        mv("hscrp", cp.hscrp, "mg/L"),
      ],
    };
  });
}

export function buildCycleState() {
  return {
    weeks: CYCLE_WEEKS,
    customWeeks: "",
    startDate: isoDate(CYCLE_START),
    compounds: [
      {
        compoundId: "test-e",
        doseMg: 36,
        frequency: "daily",
        activeWeeks: [1, 20],
        route: "injectable",
      },
      {
        compoundId: "tren-a",
        doseMg: 50,
        frequency: "eod",
        activeWeeks: [7, 8],
        route: "injectable",
      },
      {
        compoundId: "tren-a",
        doseMg: 100,
        frequency: "eod",
        activeWeeks: [9, 10],
        route: "injectable",
      },
      {
        compoundId: "tren-a",
        doseMg: 150,
        frequency: "eod",
        activeWeeks: [11, 18],
        route: "injectable",
      },
      {
        compoundId: "tren-a",
        doseMg: 75,
        frequency: "eod",
        activeWeeks: [19, 19],
        route: "injectable",
      },
      {
        compoundId: "tren-a",
        doseMg: 50,
        frequency: "eod",
        activeWeeks: [20, 20],
        route: "injectable",
      },
      {
        compoundId: "caber",
        doseMg: 0.25,
        frequency: "2x-weekly",
        activeWeeks: [9, 18],
        route: "oral",
      },
      {
        compoundId: "tudca",
        doseMg: 500,
        frequency: "daily",
        activeWeeks: [1, 20],
        route: "oral",
      },
      {
        compoundId: "nac",
        doseMg: 600,
        frequency: "daily",
        activeWeeks: [1, 20],
        route: "oral",
      },
      {
        compoundId: "hcg",
        doseMg: 250,
        frequency: "2x-weekly",
        activeWeeks: [19, 20],
        route: "injectable",
      },
    ],
    compoundModalOpen: false,
    configuringCompoundId: null,
    compoundCategory: "anabolics",
    compoundSearch: "",
    dashboardTab: "calendar",
    view: "dashboard",
    selectedGuideId: null,
    profileModalId: null,
  };
}

function mealFood(id, name, macros, servingLabel = "1 serving") {
  return {
    id,
    name,
    brand: "Ascended Chad Stack",
    servingSize: 1,
    servingUnit: servingLabel,
    servingGrams: 400,
    isCustom: true,
    nutrients: {
      calories: macros.cal,
      protein: macros.p,
      carbs: macros.c,
      fat: macros.f,
      fiber: macros.fiber ?? 8,
      sodium: macros.sodium ?? 400,
    },
  };
}

const CUSTOM_FOODS = [
  mealFood("ac-meal1", "Meal 1 — Oats, Eggs & Berries", { cal: 950, p: 55, c: 120, f: 30 }),
  mealFood("ac-meal2", "Meal 2 — Chicken, Rice & Veg", { cal: 850, p: 70, c: 95, f: 15 }),
  mealFood("ac-meal3", "Meal 3 — Turkey, Rice & Salad", { cal: 950, p: 65, c: 110, f: 25 }),
  mealFood("ac-shake", "Post-Workout — Whey, HBCD, Creatine", { cal: 700, p: 50, c: 120, f: 5 }),
  mealFood("ac-meal4", "Meal 4 — Salmon, Potato & Greens", { cal: 850, p: 60, c: 95, f: 25 }),
  mealFood("ac-meal5", "Meal 5 — Chicken, Rice & Cottage Cheese", { cal: 700, p: 55, c: 80, f: 12 }),
  mealFood("ac-meal6", "Meal 6 — Casein, Oats & Almond Butter", { cal: 400, p: 35, c: 40, f: 15 }),
  mealFood("ac-supps", "Daily Supplement Stack", { cal: 80, p: 2, c: 4, f: 6, fiber: 0, sodium: 120 }, "daily stack"),
  mealFood("ac-refeed", "Sunday Refeed — Sushi / Steak + Rice", { cal: 1100, p: 65, c: 140, f: 35 }),
];

function logEntry(food, meal, servings = 1) {
  return {
    id: uid(),
    foodId: food.id,
    name: food.name,
    brand: food.brand,
    meal,
    servings,
    servingSize: food.servingSize,
    servingUnit: food.servingUnit,
    servingGrams: food.servingGrams,
    nutrients: { ...food.nutrients },
    checked: true,
  };
}

function scaleNutrients(nutrients, factor) {
  const out = {};
  for (const [k, v] of Object.entries(nutrients)) {
    if (typeof v === "number") out[k] = Math.round(v * factor);
  }
  return out;
}

function trainingDayLog(isSunday = false) {
  const byId = Object.fromEntries(CUSTOM_FOODS.map((f) => [f.id, f]));
  const entries = [
    logEntry(byId["ac-meal1"], "breakfast"),
    logEntry(byId["ac-meal2"], "snack"),
    logEntry(byId["ac-meal3"], "lunch"),
    logEntry(byId["ac-shake"], "snack"),
    logEntry(byId["ac-meal4"], "dinner"),
    logEntry(byId["ac-meal5"], "meal5"),
    logEntry(byId["ac-meal6"], "meal6"),
    logEntry(byId["ac-supps"], "snack", 1),
  ];
  if (isSunday) {
    entries.push(logEntry(byId["ac-refeed"], "dinner", 0.5));
  }
  return entries;
}

function restDayLog() {
  const byId = Object.fromEntries(CUSTOM_FOODS.map((f) => [f.id, f]));
  const trim = (food, meal, factor) => {
    const e = logEntry(food, meal);
    e.nutrients = scaleNutrients(food.nutrients, factor);
    return e;
  };
  return [
    trim(byId["ac-meal1"], "breakfast", 1),
    trim(byId["ac-meal2"], "snack", 0.95),
    trim(byId["ac-meal3"], "lunch", 0.9),
    trim(byId["ac-meal4"], "dinner", 0.9),
    trim(byId["ac-meal5"], "meal5", 1),
    trim(byId["ac-meal6"], "meal6", 1),
    logEntry(byId["ac-supps"], "snack", 1),
  ];
}

const WEEKLY_WEIGHTS = [
  60, 61, 62.5, 64, 66, 68, 70, 72, 74, 76, 77, 77.5, 78, 78.5, 79, 79.2, 79.5, 79.8, 80, 80, 80,
];

export function buildNutritionState() {
  const logs = {};
  const journal = {};
  const profile = {
    age: 27,
    sex: "male",
    heightCm: 180.34,
    weightKg: 80,
    activity: "very_active",
    goal: "bulk",
    weightUnit: "kg",
  };

  let dayIndex = 0;
  for (let w = 0; w <= CYCLE_WEEKS; w++) {
    const weekStart = addDays(CYCLE_START, w * 7);
    for (let d = 0; d < 7; d++) {
      const date = isoDate(addDays(weekStart, d));
      if (date > isoDate(CYCLE_END)) continue;
      const dow = addDays(weekStart, d).getDay();
      const isRest = dow === 0;
      const isSunday = dow === 0;
      logs[date] = isRest ? restDayLog() : trainingDayLog(isSunday);
      if (d === 0) {
        journal[date] = {
          weight: WEEKLY_WEIGHTS[w] ?? 80,
          notes:
            w === 0
              ? "Baseline — 60 kg, starting Test 250 mg/wk daily pins."
              : w <= 6
                ? "Test base — steady gain ~0.8 kg/wk. Bro diet locked in."
                : w <= 10
                  ? "Tren ramp — appetite up, prolactin/lipids flagged on labs."
                  : w <= 18
                    ? "Peak phase — 4,700 kcal training days, Sunday refeed."
                    : "Tren taper — holding 80 kg, transitioning to cruise.",
          workoutTitle: isRest ? "Rest / mobility" : "PPL — progressive overload",
        };
      }
      dayIndex++;
    }
  }

  return {
    logs,
    goals: {
      calories: 4700,
      protein: 250,
      fat: 110,
      carbs: 600,
      fiber: 35,
      calcium: 1300,
      iron: 18,
      potassium: 4700,
      sodium: 3500,
      vitaminD: 50,
      vitaminC: 90,
      magnesium: 500,
      zinc: 15,
    },
    profile,
    onboardingComplete: true,
    customFoods: CUSTOM_FOODS,
    favorites: ["ac-meal1", "ac-shake", "ac-meal4"],
    recentFoodIds: ["ac-meal3", "ac-meal2", "ac-meal1", "ac-shake"],
    journal,
    selectedDate: isoDate(CYCLE_END),
    nutritionView: "diary",
    addMealSlot: null,
  };
}

function round5(n) {
  return Math.round(n / 2.5) * 2.5;
}

function makeSets(workingWeight, reps, count = 3) {
  const w = round5(workingWeight);
  const warmup = round5(w * 0.6);
  const sets = [
    { id: uid(), type: "warmup", weight: warmup, reps: 8, completed: true },
  ];
  for (let i = 0; i < count; i++) {
    sets.push({
      id: uid(),
      type: "normal",
      weight: w,
      reps: reps - (i === count - 1 ? 1 : 0),
      completed: true,
    });
  }
  return sets;
}

function exerciseEntry(exerciseId, workingWeight, reps, setCount = 3) {
  return {
    id: uid(),
    exerciseId,
    order: 0,
    sets: makeSets(workingWeight, reps, setCount),
  };
}

const PPL = [
  {
    name: "Push",
    exercises: [
      ["bench-press", 1.0, 5],
      ["ohp", 0.55, 6],
      ["incline-bench", 0.75, 8],
      ["lateral-raise", 0.12, 12],
      ["tricep-pushdown", 0.35, 10],
      ["dip-chest", 0.25, 8],
    ],
  },
  {
    name: "Pull",
    exercises: [
      ["deadlift", 1.0, 5],
      ["barbell-row", 0.6, 8],
      ["pull-up", 0.2, 8],
      ["lat-pulldown", 0.55, 10],
      ["face-pull", 0.2, 15],
      ["barbell-curl", 0.3, 10],
    ],
  },
  {
    name: "Legs",
    exercises: [
      ["squat", 1.0, 5],
      ["rdl", 0.65, 8],
      ["leg-press", 1.4, 10],
      ["leg-ext", 0.45, 12],
      ["leg-curl", 0.35, 12],
      ["calf-raise-standing", 0.5, 15],
    ],
  },
];

function interpolateLift(week, start, end) {
  const t = Math.min(1, week / CYCLE_WEEKS);
  const eased = t * t * (3 - 2 * t);
  return start + (end - start) * eased;
}

function buildRoutines() {
  const now = new Date().toISOString();
  return PPL.map((day) => ({
    id: uid(),
    name: `PPL — ${day.name}`,
    description: `Ascended Chad ${day.name.toLowerCase()} day — compounds + progressive overload`,
    createdAt: now,
    updatedAt: now,
    exercises: day.exercises.map(([exerciseId], order) => ({
      exerciseId,
      order,
      notes: "",
      sets: [
        { type: "warmup", targetReps: 8 },
        { type: "normal", targetReps: 5 },
        { type: "normal", targetReps: 5 },
        { type: "normal", targetReps: 5 },
      ],
    })),
  }));
}

function buildWorkoutHistory(routines) {
  const history = [];
  const routineByName = Object.fromEntries(routines.map((r) => [r.name.replace("PPL — ", ""), r]));
  let pplIndex = 0;
  const startBench = 80;
  const startSquat = 100;
  const startDead = 160;

  for (let w = 0; w <= CYCLE_WEEKS; w++) {
    const sessionsThisWeek = w < 2 ? 4 : w < 6 ? 5 : 6;
    const sessionDays = [1, 2, 3, 4, 5, 6].slice(0, sessionsThisWeek);
    for (const dayOffset of sessionDays) {
      const date = addDays(CYCLE_START, w * 7 + dayOffset);
      if (date > CYCLE_END) continue;

      const week = w + dayOffset / 7;
      const bench = interpolateLift(week, startBench, 135);
      const squat = interpolateLift(week, startSquat, 195);
      const dead = interpolateLift(week, startDead, 255);

      const day = PPL[pplIndex % 3];
      pplIndex++;
      const routine = routineByName[day.name];

      const mainScale =
        day.name === "Push" ? bench : day.name === "Legs" ? squat : dead;

      const startedAt = new Date(date);
      startedAt.setHours(10, 30, 0, 0);
      const completedAt = new Date(startedAt);
      completedAt.setMinutes(completedAt.getMinutes() + 75 + Math.floor(Math.random() * 15));

      const exercises = day.exercises.map(([exerciseId, ratio, reps], order) => {
        const weight =
          exerciseId === "pull-up"
            ? round5(Math.max(0, mainScale * ratio))
            : round5(mainScale * ratio);
        return {
          ...exerciseEntry(exerciseId, weight, reps),
          order,
        };
      });

      const totalVolume = exercises.reduce(
        (sum, ex) => sum + ex.sets.reduce((s, set) => s + set.weight * set.reps, 0),
        0,
      );
      const totalSets = exercises.reduce((sum, ex) => sum + ex.sets.length, 0);

      history.push({
        id: uid(),
        name: `${day.name} — Week ${Math.min(CYCLE_WEEKS, w + 1)}`,
        startedAt: startedAt.toISOString(),
        completedAt: completedAt.toISOString(),
        durationMinutes: 75,
        routineId: routine?.id,
        exercises,
        totalVolume: Math.round(totalVolume),
        totalSets,
        notes:
          w >= 7 && w <= 18
            ? "Peak phase — high carbs pre/intra, Tren appetite leveraged."
            : undefined,
      });
    }
  }

  return history.sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
  );
}

function buildPersonalRecords(history) {
  const map = new Map();
  for (const workout of history) {
    for (const entry of workout.exercises) {
      if (!["squat", "bench-press", "deadlift"].includes(entry.exerciseId)) continue;
      const best = entry.sets
        .filter((s) => s.completed && s.type === "normal")
        .sort((a, b) => b.weight - a.weight || b.reps - a.reps)[0];
      if (!best) continue;
      const e1rm = best.reps === 1 ? best.weight : Math.round(best.weight * (1 + best.reps / 30) * 10) / 10;
      const prev = map.get(entry.exerciseId);
      if (!prev || e1rm > prev.estimated1RM) {
        map.set(entry.exerciseId, {
          exerciseId: entry.exerciseId,
          weight: best.weight,
          reps: best.reps,
          estimated1RM: e1rm,
          achievedAt: workout.completedAt,
          workoutId: workout.id,
        });
      }
    }
  }
  return [...map.values()];
}

export function buildGymState() {
  const routines = buildRoutines();
  const history = buildWorkoutHistory(routines);
  const personalRecords = buildPersonalRecords(history);

  return {
    activeWorkout: null,
    history,
    routines,
    customExercises: [],
    personalRecords,
    restTimer: { active: false, endsAt: null, totalSeconds: 90 },
    defaultRestSeconds: 90,
    weightUnit: "kg",
    gymView: "progress",
    exercisePickerOpen: false,
    editingRoutineId: null,
  };
}

export function buildSettings() {
  return {
    defaultRangeMode: "optimized",
    reducedMotion: false,
    compactSidebar: false,
    theme: {
      preset: "crimson",
      accentPrimary: "#ff2e4a",
      accentSecondary: "#ff6b8a",
      accentTertiary: "#c084fc",
      baseColor: "#07080c",
      elevatedColor: "#0c0e14",
      surfaceColor: "#11141c",
      gradientIntensity: 72,
      glassBlur: 16,
      glassOpacity: 6,
      shadowDepth: 55,
      fontScale: 100,
      borderGlow: true,
      animatedBackground: true,
      showAmbientBackground: true,
      showTopBarSubtitle: true,
      density: "comfortable",
      radiusScale: 1,
      contentWidth: "default",
      paletteHue: 350,
      paletteSaturation: 85,
      paletteLightness: 55,
      customSwatches: ["#ff2e4a", "#ff6b8a", "#c084fc", "#07080c", "#11141c", "#0c0e14"],
      savedPalettes: [],
      fontFamily: "syne",
      displayFontFamily: "syne",
      layoutPreset: "default",
      iconStyle: "rounded",
      iconWeight: "regular",
    },
  };
}

export function buildUserModules() {
  const now = new Date().toISOString();
  return {
    labs: buildLabsReports(),
    cycle: { state: buildCycleState(), version: 0 },
    gym: { state: buildGymState(), version: 0 },
    nutrition: { state: buildNutritionState(), version: 2 },
    settings: buildSettings(),
    updated_at: now,
  };
}