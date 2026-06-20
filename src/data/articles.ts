import type { Article } from "@/lib/articleTypes";

export const ARTICLES: Article[] = [
  {
    id: "pct-basics",
    title: "PCT Basics: Timing, Goals, and What to Monitor",
    tagline: "Post-cycle therapy is about recovery — not a magic reset button.",
    category: "gear",
    publishedAt: "2026-06-01",
    updatedAt: "2026-06-19",
    sections: [
      {
        heading: "What PCT is for",
        body: "Post-cycle therapy (PCT) aims to restart your natural testosterone axis after suppressive compounds clear. The goal is not to maintain cycle-level performance — it is to recover endogenous production, stabilize mood and energy, and retain as much lean mass as practical while health markers normalize.",
      },
      {
        heading: "When to start",
        body: "Timing depends on ester half-life and what you ran. Short esters often allow an earlier start; long esters (e.g. deca, long testosterone esters) need longer clearance before SERMs make sense. Starting too early can be ineffective; starting too late prolongs a crashed state.",
        list: [
          "Know the half-life of every compound on your stack",
          "Wait for suppressive androgens to clear — not just the last pin date",
          "Use bloodwork (LH, FSH, total/free T) when available to confirm axis status",
        ],
      },
      {
        heading: "Common approaches",
        body: "Most protocols center on SERMs (e.g. tamoxifen, clomiphene) to stimulate LH/FSH. AIs are generally not a default PCT drug — estrogen plays a role in axis recovery. Support compounds (liver, lipids, sleep) are adjuncts, not substitutes for proper SERM timing.",
      },
      {
        heading: "What to watch on labs",
        list: [
          "Total and free testosterone trending back toward your baseline range",
          "LH and FSH rising from suppressed values",
          "Estradiol — avoid crushing E2 during recovery",
          "Lipids and liver enzymes if orals were in the blast",
        ],
      },
      {
        heading: "Realistic expectations",
        body: "Full recovery can take weeks to months depending on cycle length and compounds. Blasts with 19-nors or very long runs often need more patience. If markers stay flat after a reasonable PCT window, that is a clinical conversation — not something to brute-force with higher SERM doses alone.",
      },
    ],
  },
  {
    id: "training-volume-on-cycle",
    title: "Training Volume on Cycle: More Is Not Always Better",
    tagline: "Enhanced recovery changes what you can tolerate — not what you must do.",
    category: "training",
    publishedAt: "2026-06-05",
    updatedAt: "2026-06-19",
    sections: [
      {
        heading: "Why recovery feels unlimited",
        body: "Androgens improve muscle protein synthesis and recovery between sessions. Many lifters interpret that as license to double volume overnight. The risk is joint stress, CNS fatigue, and junk volume that does not scale with quality.",
      },
      {
        heading: "Practical volume guidelines",
        list: [
          "Add sets gradually — 10–20% more per mesocycle, not per week",
          "Keep most work 1–3 reps from failure on compounds",
          "Prioritize progression on key lifts over exercise variety",
          "Deload when performance stalls across multiple sessions",
        ],
      },
      {
        heading: "Intensity vs volume",
        body: "On cycle, moderate volume with solid intensity often beats extreme volume with sloppy form. Track weekly hard sets per muscle group and RPE. If sleep, blood pressure, or joints degrade, volume is the first dial to turn down.",
      },
      {
        heading: "Cardio and health",
        body: "Do not drop conditioning entirely — hematocrit, blood pressure, and lipids benefit from regular low-impact cardio. Two to four sessions per week of Zone 2 work pairs well with heavy lifting without eating into recovery.",
      },
    ],
  },
  {
    id: "cutting-without-tracking",
    title: "Cutting Without a Food Diary: Principles That Still Work",
    tagline: "Educational reference — not a substitute for medical nutrition advice or the removed food-logging module.",
    category: "diet",
    publishedAt: "2026-06-10",
    updatedAt: "2026-06-19",
    sections: [
      {
        heading: "Calorie deficit still rules",
        body: "Fat loss requires sustained energy deficit. Without tracking apps, use portion templates, consistent meal structure, and weekly scale trends (same time, same conditions) to judge direction.",
      },
      {
        heading: "Protein anchor",
        list: [
          "Aim for a protein serving every meal — palm-sized lean source as a rough guide",
          "Keep protein stable while trimming carbs and fats first",
          "Do not slash protein to chase faster scale drops",
        ],
      },
      {
        heading: "On-cycle considerations",
        body: "Enhanced phases can preserve lean mass in a deficit better than natural cuts, but they do not remove the need for deficit discipline. Aggressive cuts while running orals or high tren doses compound liver, lipid, and mood stress.",
      },
      {
        heading: "When to get structured",
        body: "If weight stalls for 2–3 weeks, sleep is poor, or strength craters, blind restriction is failing. At that point structured tracking (even short 2-week audits) or dietitian input beats guessing.",
      },
    ],
  },
  {
    id: "lipid-panel-primer",
    title: "Lipid Panel Primer: HDL, LDL, and On-Cycle Context",
    tagline: "How to read a standard lipid panel when gear is in the picture.",
    category: "health",
    publishedAt: "2026-06-15",
    updatedAt: "2026-06-19",
    sections: [
      {
        heading: "The usual suspects",
        body: "A typical panel includes total cholesterol, LDL-C, HDL-C, and triglycerides. Oral AAS, trenbolone, and neglecting cardio often crush HDL and raise LDL. Injectable testosterone alone can still shift lipids — dose and duration matter.",
      },
      {
        heading: "HDL matters",
        list: [
          "Very low HDL is a cardiovascular risk signal, not a badge of a 'hardcore' cycle",
          "Fish oil, fiber, cardio, and reducing oral load can help — but primary fix is compound selection",
          "Repeat fasted panels for trend, not one-off panic",
        ],
      },
      {
        heading: "Triglycerides and diet",
        body: "High triglycerides often reflect refined carbs, alcohol, or poor insulin sensitivity. Pair lab trends with body comp and fasting glucose when available.",
      },
      {
        heading: "When to escalate",
        body: "Persistent extreme LDL, symptomatic blood pressure, or chest-related symptoms belong with a clinician — not in a Discord bro-science thread. Use Roiders Club flags as monitoring prompts, not diagnoses.",
      },
    ],
  },
  {
    id: "why-cut-what-to-expect",
    title: "Why Cut, and What to Actually Expect",
    tagline: "Health and aesthetics both matter — but realistic timelines beat arbitrary deadlines.",
    category: "diet",
    seriesOrder: 1,
    publishedAt: "2026-06-20",
    updatedAt: "2026-06-20",
    sections: [
      {
        heading: "Why Cut At All?",
        body: "There are really two reasons to diet down, and they're not the same conversation.",
        blocks: [
          {
            heading: "Reason one: health",
            body: "If you're sitting at a genuinely unhealthy body fat percentage, your hormones are taking the hit. Bloodwork at that level of body fat usually tells the story before symptoms do.",
          },
          {
            heading: "Reason two: aesthetics",
            body: "You simply want to look leaner.",
          },
          {
            heading: "On insulin sensitivity claims",
            body: "A quick note on the \"but does it actually matter\" question — you'll see a lot of claims like \"you need to be at X% body fat to be insulin sensitive.\" There's mechanistic truth there, but mechanism isn't the same as significance. Research comparing trained obese individuals against leaner counterparts has found smaller differences in some metabolic markers than the discourse suggests. None of that means body fat doesn't matter — it just means the \"you're cooked at 25%\" framing oversells the data. The honest position: a lower, healthier body fat range is generally better, but it's not some binary switch.",
          },
        ],
      },
      {
        heading: "Set Realistic Expectations",
        body: "People consistently underestimate how much fat they need to lose. The difference between \"soft\" and \"lean enough to see ab definition and vascularity\" is often 30–40+ pounds, not the 10–15 most people picture in their head.",
        list: [
          "Don't rush it — how fast you can cut is governed by how much fat you actually have to work with",
          "Someone carrying more fat has a much higher ceiling for an aggressive deficit than someone who's already relatively lean",
          "Going in with a realistic timeline, rather than an arbitrary deadline, makes the whole process far less stressful and far more sustainable",
        ],
      },
    ],
  },
  {
    id: "how-fast-should-you-lose-weight",
    title: "How Fast Should You Lose Weight on a Cut?",
    tagline: "Match your deficit to your body fat — pushing past the physiological ceiling costs muscle, not time.",
    category: "diet",
    seriesOrder: 2,
    publishedAt: "2026-06-20",
    updatedAt: "2026-06-20",
    sections: [
      {
        heading: "The Physiological Ceiling",
        body: "Older starvation-study data (the Ancel Keys-era research most of this field draws from) puts the maximum fat oxidation rate at roughly 30–40 calories per pound of body fat per day. So someone carrying 50 lbs of fat has a much higher ceiling for an aggressive deficit than someone carrying 15 lbs. This data comes from extreme conditions, not voluntary dieting, so treat it as a directional estimate rather than gospel — but it tracks with what's observed in practice: leaner people simply can't sustain the same size deficit that heavier people can.",
      },
      {
        heading: "Two General Deficit Tiers",
        body: "The more fat you're carrying, the harder you can push the deficit early on. As you lean out and your fat stores shrink, that same deficit becomes proportionally larger relative to what your body can actually mobilize — at which point you should pull back rather than grinding through a deficit your body can no longer support efficiently.",
        list: [
          "~500 cal/day or less — under 1 lb/week — best for standard, sustainable cutting",
          "~1,000 cal/day — ~1.5+ lb/week — best suited when you're carrying higher body fat and have more fat to draw from",
        ],
      },
      {
        heading: "A Simpler Way to Estimate Your Weekly Rate",
        body: "Rather than reverse-engineering it from fat mass, a widely used estimate is to lose 1–1.5% of total body weight per week. Take your body weight and multiply by 0.01 (1%). A 180 lb person could reasonably target ~1.8 lbs/week. Since a pound of fat is roughly 3,500 calories, that works out to a daily deficit in the 600–900 calorie range for most people in that scenario — adjust within the 1–1.5% window based on how much fat you're carrying and how the scale is actually trending.",
      },
      {
        heading: "The Bottom Line",
        body: "Match your deficit size to your starting body fat. Heavier individuals can run a larger deficit early on without much downside; leaner individuals need to be more conservative. As the cut progresses and body fat drops, scale the deficit back rather than holding it constant — your body simply has less to give the leaner you get.",
      },
    ],
  },
  {
    id: "how-to-structure-macros",
    title: "How to Structure Your Macros for Cutting",
    tagline: "Protein anchors muscle; fat sets a floor; carbs flex with your deficit and fuel training.",
    category: "diet",
    seriesOrder: 3,
    publishedAt: "2026-06-20",
    updatedAt: "2026-06-20",
    sections: [
      {
        heading: "Protein: 0.8g Per Pound of Body Weight",
        body: "This is the standard recommendation for most people on a cut (about 1.6 g/kg), and it holds even though \"just eat more protein to protect muscle\" gets repeated constantly online. Protein doesn't need to spike just because you're cutting, unless you're running a very aggressive deficit (1,000+ calories/day), where pushing it slightly higher is reasonable insurance. For anyone running a standard deficit, bumping protein further has a real cost — your total calories are already restricted, so extra protein calories are coming directly out of your carbs, and carbs are what's fueling your training performance. \"Just eat more protein, there's no downside\" isn't true. The downside is a flatter, weaker training session.",
      },
      {
        heading: "Fat: 0.3–0.5g Per Pound of Body Weight",
        body: "For most people this lands somewhere around 30–60g of fat per day while cutting. Yes, that's low relative to maintenance — that's expected on a deficit, and it's part of why fish oil supplementation becomes more relevant while cutting (covered in the training and supplementation article).",
      },
      {
        heading: "Carbs: Whatever's Left",
        body: "Carbs get whatever calories remain once protein and fat are set. This is intentional — carbs are the flexible macro, and they should absorb most of the deficit's calorie reduction rather than protein or fat. This is also why pre- and intra-workout carb timing matters more while cutting: with fewer total carbs to work with, where you place them in your day matters more than it does at maintenance.",
      },
      {
        heading: "Putting It Together",
        body: "For a 180 lb person: protein ~144g/day, fat ~55–90g/day, carbs from remaining calories after protein and fat are accounted for. This structure holds across most standard deficits. The only real adjustment point is pushing protein slightly higher if you're running a more aggressive cut — otherwise, stick with the ratios above and let carbs flex with your total calorie target.",
      },
    ],
  },
  {
    id: "meal-timing-carbs-training",
    title: "Meal Timing and Carbs Around Training While Cutting",
    tagline: "With fewer carbs overall, placement around sessions matters more than at maintenance.",
    category: "diet",
    seriesOrder: 4,
    publishedAt: "2026-06-20",
    updatedAt: "2026-06-20",
    sections: [
      {
        heading: "Pre-Workout Carbs",
        body: "Aim for roughly 30–60g of carbs before training. Keep it simple and easily digestible — rice, rice cakes, cream of rice. If you train later in the day, one of your regular meals can simply double as this pre-workout carb load, rather than treating it as a separate addition to your day.",
        blocks: [
          {
            heading: "How Much Can Your Body Actually Digest?",
            body: "Research on carb absorption during exercise suggests the body can process around 60g of carbs per hour from glucose-only sources. Pairing glucose with a fructose source (honey, fruit, orange juice) can push that absorption rate up toward 90g/hour, since glucose and fructose use separate transport pathways in the gut. This matters if you're working with a short window before training and want to maximize how much you can realistically take in and use.",
          },
        ],
      },
      {
        heading: "Intra-Workout Carbs",
        body: "Not everyone needs these. If your sessions are short and you feel fine throughout, skip it entirely. They're more useful if you're training at high frequency, running longer sessions, or consistently feel gassed by the end of a workout. The point of pre- and intra-workout carbohydrate isn't replenishing glycogen — that's handled by your meals across the prior day(s), not by what you eat immediately before or during a single session. The actual purpose is maintaining stable blood glucose through the session. If you do use intra-workout carbs, 20–40g sipped gradually throughout the session (every few minutes, or every set) is a reasonable range.",
        blocks: [
          {
            heading: "Carbohydrate Mouth Rinsing",
            body: "This is a real, studied technique: swishing a carb solution in your mouth for 10–15 seconds without swallowing it. Oral carb receptors signal the brain in a way that can improve perceived effort and performance, and this effect doesn't show up with non-carb sweet solutions in placebo-controlled trials — it's specifically the carbohydrate being sensed, not just sweetness. If you don't want to add extra calories during a session, this is a way to get some of the performance benefit without consuming anything.",
          },
        ],
      },
      {
        heading: "Carb Cycling",
        body: "Higher carbs on training days, lower on rest days — this is mostly overrated for the average person. It's not harmful, and some people use it because it makes high-hunger days more manageable, but it's not some hidden performance lever you're missing out on. Keeping carbs roughly consistent day to day works fine for most people, and it's simpler to plan around.",
      },
      {
        heading: "The Bigger Picture",
        body: "None of this changes your total daily carb target — it's about placement, not amount. The goal is making sure the carbs you do have available are positioned where they'll actually support your training, rather than getting evenly (and less usefully) spread across meals that don't need them as much.",
      },
    ],
  },
  {
    id: "tdee-step-counts",
    title: "Understanding TDEE and Step Counts for Fat Loss",
    tagline: "Steps expand your calorie budget without cutting food further — but returns diminish past a point.",
    category: "diet",
    seriesOrder: 5,
    publishedAt: "2026-06-20",
    updatedAt: "2026-06-20",
    sections: [
      {
        heading: "The Four Components of TDEE",
        body: "Total Daily Energy Expenditure (TDEE) is the number that ultimately determines your deficit — but most people misunderstand what actually makes up that number, and end up overestimating how much control they have over it.",
        list: [
          "BMR (Basal Metabolic Rate): the calories your body burns just existing — the largest single piece of the pie",
          "NEAT (Non-Exercise Activity Thermogenesis): fidgeting, posture, unconscious movement — things you don't actively control",
          "TEF (Thermic Effect of Food): the energy cost of digesting what you eat — whole, minimally processed foods generally cost more energy to digest than something like oil or candy",
          "EAT (Exercise Activity Thermogenesis): calories burned through deliberate exercise — lower-rep, lower-volume resistance training burns less than people assume",
        ],
      },
      {
        heading: "Step Counts and TDEE Maxing",
        body: "Pushing your step count up is one of the more effective ways to create extra room in your calorie budget without cutting food further. Roughly 10,000 steps ≈ 300–500 calories; 20,000 steps ≈ 600–800 calories. A reasonable target is 10,000–20,000 steps/day, with 25,000 as a practical ceiling for most people. Think of your daily calories as a budget. Higher steps means a bigger budget — more room for food, easier to hit micronutrient targets, less restrictive overall.",
      },
      {
        heading: "Why You Can't Just Push Steps Infinitely Higher",
        body: "The reason not to keep climbing is the constrained total energy expenditure model: as activity climbs toward roughly double your BMR, your body starts compensating by quietly dialing down NEAT — less fidgeting, slightly slower background processes — so each additional step burns less than the steps before it. Activity calories aren't infinitely additive; the body actively works to stay efficient. This is why someone walking 35,000–40,000 steps a day isn't necessarily burning proportionally more than someone walking 20,000 — the body adjusts other processes downward to compensate.",
      },
      {
        heading: "The Practical Takeaway",
        body: "Use steps as a genuine lever to ease your deficit, but don't treat it as something to maximize without limit. 10,000–20,000 steps a day is a strong, sustainable target. Beyond that, you're fighting your body's own efficiency mechanisms more than you're gaining anything meaningful.",
      },
    ],
  },
  {
    id: "food-choices-dieting",
    title: "Food Choices That Make Dieting Easier",
    tagline: "Same calories can feel completely different depending on satiety and food environment.",
    category: "diet",
    seriesOrder: 6,
    publishedAt: "2026-06-20",
    updatedAt: "2026-06-20",
    sections: [
      {
        heading: "Vegetables: Eat Them",
        body: "Concerns about oxalates and phytates in vegetables are vastly overstated relative to the nutritional benefit, and vegetables are one of the easier ways to hit your micronutrient targets while dieting. There's no real reason to avoid them on a cut, and plenty of reason to lean into them.",
      },
      {
        heading: "Potatoes Are King",
        body: "Potatoes are arguably the single most satiating common food, consistently ranking at the top of satiety-index research — ahead of rice, pasta, and most other carb sources. Boiled potatoes specifically tend to be the standout. If you're struggling with hunger on a cut, swapping some carb sources for potatoes is a simple, low-effort change that can make a real difference in how full you feel. Rice and pasta are still perfectly fine — this isn't an exclusion, just a reason to include more potatoes where it makes sense.",
      },
      {
        heading: "Watch Out for Hyper-Palatable Foods",
        body: "Hyper-palatable foods — heavily processed items engineered to be easy to overconsume (chips, candy, processed snacks and desserts) — are a major reason diets fail even when the macros look fine on paper. These foods provide minimal nutrition but are specifically formulated to bypass normal satiety signals, so a small serving does almost nothing to satisfy hunger and instead increases cravings for more. Reducing hyper-palatable food intake tends to reduce overall hunger and improve diet adherence, independent of total calories.",
      },
      {
        heading: "Practical Eating Habits That Help",
        list: [
          "Use smaller utensils — it slows down how fast you eat, which gives satiety signals time to catch up",
          "Chew more deliberately — research on chewing suggests it can reduce self-reported hunger and food intake",
          "Drink water with meals — it naturally spaces out eating and adds volume",
          "Control your food environment — removing easy, hyper-palatable options removes a lot of the daily willpower tax",
          "Build in something to look forward to — a small, planned indulgence that fits your calories can make the rest of the diet far easier to sustain",
          "Plan meals ahead of time rather than improvising around your remaining calories each day",
        ],
      },
      {
        heading: "The Bigger Picture",
        body: "None of this is about eating \"perfectly.\" It's about making choices that work with your hunger instead of against it, so the deficit feels sustainable rather than like a constant fight.",
      },
    ],
  },
  {
    id: "training-deficit-progression-maintenance",
    title: "Training, Deficit Progression, and What Happens After Your Cut",
    tagline: "Small training tweaks, trend-based deficits, and patient maintenance determine whether results stick.",
    category: "diet",
    seriesOrder: 7,
    publishedAt: "2026-06-20",
    updatedAt: "2026-06-20",
    sections: [
      {
        heading: "Does Training Need to Change on a Cut?",
        body: "Largely, no — your split, exercises, and overall structure shouldn't be overhauled just because you're dieting. A few things can reasonably flex.",
        blocks: [
          {
            heading: "Frequency",
            body: "If you're consistently feeling beat up and regressing across sessions, dropping frequency slightly (e.g., a 6x/week split down to 4x) can help, while keeping the actual split and exercise selection the same.",
          },
          {
            heading: "Rep ranges",
            body: "If a particular exercise feels especially taxing late in a cut, shifting toward a lower rep range (with a rep or two in reserve) can make sets more manageable without compromising the stimulus.",
          },
          {
            heading: "Exercise efficiency",
            body: "Swapping movements that require heavy loading and long warm-ups (like an SLDL) for less setup-intensive alternatives (like a back extension), or switching from plate-loaded to pin-loaded machines, can meaningfully cut session time and reduce fatigue — without changing the training effect much.",
          },
          {
            heading: "On increasing frequency",
            body: "Some people choose to increase frequency slightly during a cut, reasoning that more frequent stimulus reduces atrophy risk in a calorie-restricted state. In practice, this is largely unnecessary — the atrophy risk from missing a session or two is minor enough that it's not worth restructuring your split over.",
          },
        ],
      },
      {
        heading: "Supplementation Worth Considering",
        list: [
          "Omega-3s (fish oil): become more important on a cut because dietary fat intake is intentionally low",
          "Magnesium glycinate and Vitamin D3: consistently among the most commonly under-consumed micronutrients",
          "Multivitamin: not essential, but reasonable as insurance if you're not confident you're hitting micronutrient targets",
        ],
      },
      {
        heading: "Should Your Deficit Increase as You Get Leaner?",
        body: "The common logic — as you lose fat, maintenance drops, so you'd need to keep cutting calories to hold the same deficit — is true in principle but overstated in practice. A reasonable estimate is that each pound of fat lost lowers maintenance by roughly 10 calories, so losing 10 lbs might lower maintenance by around 100 calories. The more useful framing: start with a more aggressive deficit when you have more fat to work with, and let that deficit naturally become less aggressive by tracking your average scale weight trend and adjusting your rate of loss (using a 1–1.5% bodyweight/week target) as you go.",
      },
      {
        heading: "Are You Missing Out on Muscle Growth While Cutting?",
        body: "If your lifts are progressing, that's a strong sign you're also progressing muscle while in a deficit — for most people in a moderate deficit, simultaneous fat loss and muscle gain (or at minimum, muscle retention with some growth) is achievable. Strength loss becomes more expected only at very low body fat levels (sub-10%, prep-stage territory), where being that lean is itself a physiologically stressful state the body isn't built to maintain long-term.",
      },
      {
        heading: "What to Do After the Cut",
        body: "This is the part that gets the least attention, despite often being harder than the cut itself.",
        list: [
          "Reverse slowly — gradually increase calories and track average scale weight week to week until it stabilizes; that's your new maintenance",
          "Using ~10 calories of maintenance per pound of fat lost, you can ballpark new maintenance and jump most of the way there, then fine-tune",
          "Expect maintaining your new body composition to be harder than losing the weight — your body defends a prior settling range and can take months to accept a new normal",
          "Hunger hormones (ghrelin and leptin) shift during and after a diet in ways that increase hunger once you reintroduce more food",
          "Spend a genuinely extended period at maintenance before even considering a surplus — that phase is what determines whether results stick",
        ],
      },
      {
        heading: "The Bottom Line",
        body: "Training doesn't need major changes on a cut — small adjustments for fatigue and efficiency are usually enough. Your deficit doesn't need to be constantly recalculated — follow the trend, not the math. And once the cut ends, give maintenance the same patience and respect you gave the diet itself.",
      },
    ],
  },
];