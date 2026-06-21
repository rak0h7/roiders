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
  {
    id: "hydration-electrolytes-retention",
    title: "Hydration Manipulation: Why More Water Can Mean Less Water Retention",
    tagline:
      "Steady water and electrolyte balance affects day-to-day leanness and recovery — not just \"drink more.\"",
    category: "diet",
    publishedAt: "2026-06-20",
    updatedAt: "2026-06-20",
    sections: [
      {
        body: "Most people treat hydration as an afterthought — drink when thirsty, maybe more on training days. But water and electrolyte intake is one of the more controllable levers for how lean and defined you look day to day, independent of body fat. Some days you look dry and sharp; other days you look puffy and smooth despite eating and training the same. That swing is usually water, not fat, and it's largely manageable.",
      },
      {
        heading: "The core mechanism",
        body: "When water intake increases and stays elevated, the body suppresses antidiuretic hormone (ADH) and shifts toward producing more dilute urine. When intake is brought back down, ADH suppression can persist roughly 24–36 hours — during which total body water can fall faster than the change in intake alone would predict. This is the same physiological lag exploited during competition peak week. You don't need that level of manipulation to benefit from the principle: consistently high water intake, sustained over time, trains the body to stop holding water defensively. The flip side: inconsistent hydration keeps the body in a more defensive, water-retentive state.",
      },
      {
        heading: "Electrolytes are the other half",
        body: "Increasing water without adequate electrolytes doesn't improve hydration — it dilutes you. Plain water with no sodium, potassium, or magnesium often passes through largely unused rather than being retained at the cellular level. Sodium is what kidneys use to regulate fluid; without it, water moves through faster than your body can use it.",
        blocks: [
          {
            heading: "Sodium",
            body: "Sodium is the primary driver of how much water your body holds. A very high-sodium meal causes fast extracellular bloat. Cutting sodium too aggressively isn't the answer either — sodium also helps muscles hold glycogen and water intracellularly, which supports a full, vascular look rather than a flat one.",
          },
          {
            heading: "Potassium",
            body: "Potassium counterbalances sodium through the same hormonal system — aldosterone tends to reabsorb sodium while losing potassium in urine. Potassium helps flush excess water the body doesn't need, including subcutaneous retention that blurs definition. It's harder to get from diet than sodium; potatoes, leafy greens, and fruit are reliable sources.",
          },
          {
            heading: "Magnesium",
            body: "Magnesium supports the sodium-potassium pump and is often under-consumed from diet alone. If you supplement, form matters: magnesium oxide is poorly absorbed compared with citrate or other chelated forms. For hydration and electrolyte balance goals, citrate is generally preferable to oxide at the same labeled dose.",
          },
        ],
      },
      {
        heading: "Why the balance matters (RAAS)",
        body: "Sodium, potassium, and magnesium are tied together by the renin-angiotensin-aldosterone system (RAAS). Large single boluses of water or electrolytes are less effective than spreading intake steadily across the day — a slow supply lets the system regulate around a stable baseline rather than reacting to spikes and troughs.",
      },
      {
        heading: "Hydration, sleep, and recovery",
        body: "Hydration status affects sleep architecture and recovery, not just appearance. Controlled studies in resistance-trained men have reported shifts toward lighter sleep under dehydration, with authors noting that adequate fluid intake may improve sleep efficiency and deeper sleep stages relevant to tissue recovery. If recovery feels inconsistent despite similar training and nutrition, hydration consistency is worth examining.",
      },
      {
        heading: "Compounds that affect fluid balance",
        body: "For anyone using compounds with mineralocorticoid or aromatizing activity, this matters beyond cosmetics. Some anabolic steroids increase sodium reabsorption and potassium excretion, producing extracellular fluid retention; mineralocorticoid-like effects can raise blood pressure through expanded fluid volume. Having sodium and potassium intake dialed in is a meaningful factor in cardiovascular load and how much water retention shows up visibly — not just smoothness in the mirror.",
      },
      {
        heading: "Practical takeaways",
        list: [
          "Drink consistently throughout the day — not in large single boluses",
          "Pair water intake with steady sodium and potassium — plain water alone can dilute rather than hydrate",
          "Keep sodium and potassium roughly balanced; large imbalances drive bloating or flatness",
          "Choose bioavailable magnesium (e.g. citrate) over oxide if supplementing for electrolyte balance",
          "Be especially deliberate if running compounds that affect fluid balance — visible smoothness can signal underlying cardiovascular load",
        ],
      },
    ],
  },
  {
    id: "retatrutide-triple-agonist",
    title: "Retatrutide: The Triple Agonist Reshaping the GLP-1 Landscape",
    tagline:
      "What the triple agonist is, what trials show, side effects, and where it stands regulatorily — investigational only.",
    category: "health",
    seriesOrder: 1,
    publishedAt: "2026-06-20",
    updatedAt: "2026-06-20",
    sections: [
      {
        body: "Retatrutide has moved from a promising early-phase compound to one of the most closely watched investigational drugs in metabolic medicine. With phase 3 data now reading out, it's worth understanding what it is, how it works, what trials actually show, and where it stands from a regulatory and safety perspective. This article is educational reference only — retatrutide is not FDA-approved for any indication as of mid-2026.",
      },
      {
        heading: "What Retatrutide actually is",
        body: "Retatrutide is a once-weekly injectable peptide developed by Eli Lilly that activates three hormone receptors: GLP-1, GIP, and the glucagon receptor — a step beyond semaglutide (GLP-1 only) and tirzepatide (GLP-1 + GIP). LDL reductions observed in trials (roughly 20%) are thought to reflect glucagon receptor activity on PCSK9-related cholesterol clearance, distinct from appetite and glycemic effects.",
        blocks: [
          {
            heading: "GLP-1",
            body: "Slows gastric emptying, increases satiety signaling, boosts insulin release in response to rising glucose, and suppresses glucagon.",
          },
          {
            heading: "GIP",
            body: "Supports blood sugar regulation and, in combination with GLP-1 agonism, appears to potentiate weight-loss effects rather than work against them.",
          },
          {
            heading: "Glucagon receptor",
            body: "In this combined context, glucagon receptor activity is believed to increase energy expenditure and fat oxidation — a mechanistic piece proposed to explain why retatrutide has outpaced single- and dual-agonist compounds in matched-duration comparisons.",
          },
        ],
      },
      {
        heading: "What the trials show",
        body: "Headline efficacy has climbed at each development stage. Phase 2 (obesity, NEJM 2023): up to 24.2% average weight loss at 48 weeks on the highest (12 mg) dose in participants without diabetes; in type 2 diabetes, 16.9% at 36 weeks with meaningful HbA1c improvement. TRIUMPH-4 (obesity with knee osteoarthritis, published December 2025): 28.7% average loss at 68 weeks on 12 mg. TRANSCEND-T2D-1 (type 2 diabetes, phase 3, published March 2026): HbA1c reduced by up to 1.94% from baseline 7.9% (vs 0.81% placebo), dose-dependent across 4 mg, 9 mg, and 12 mg arms; 12 mg arm also lost 16.8% body weight at 40 weeks.",
        list: [
          "TRIUMPH-1 (obesity without diabetes, topline May 2026, 80 weeks, n=2,339): 4 mg → 17.6% loss; 9 mg → 23.7%; 12 mg → 25.0% (up to ~28.3% in some analyses); placebo → 3.9%",
          "In BMI ≥35 participants escalated to maximum tolerated dose for an additional 24 weeks, loss reached up to ~30%",
          "TRIUMPH-2 (obesity + type 2 diabetes) and TRIUMPH-3 (obesity + established cardiovascular disease) expected later in 2026",
        ],
      },
      {
        heading: "Beyond weight loss",
        blocks: [
          {
            heading: "Liver health",
            body: "Incretin-based therapies, including the GLP-1/GIP/glucagon class, have shown reductions in hepatic steatosis and related biomarkers in MASLD contexts — largely through weight loss and improved insulin sensitivity; direct fibrosis outcome data for retatrutide specifically remains limited.",
          },
          {
            heading: "Cardiovascular risk",
            body: "Retatrutide-specific cardiovascular outcome data is still maturing (TRIUMPH-3 will help). The broader GLP-1 class has shown reductions in major adverse cardiovascular events in outcome trials; network meta-analyses generally rank GLP-1-based agents among the most effective pharmacologic weight-loss approaches.",
          },
          {
            heading: "Energy expenditure",
            body: "Reviews on next-generation obesity pharmacology highlight compensatory drops in energy expenditure with appetite-only approaches. Triple agonists are positioned as addressing intake (GLP-1/GIP) and expenditure (glucagon receptor) simultaneously — proposed as one explanation for consistently larger effect sizes versus single- and dual-agonist therapies.",
          },
        ],
      },
      {
        heading: "Side effects and safety",
        body: "Tolerability tracks other incretin therapies, with GI effects dominating. Nausea, vomiting, diarrhea, and constipation are dose-dependent; phase 2 nausea ranged from ~14% at low doses to ~60% at 12 mg, often worst during escalation. Lower starting doses and gradual titration reduce severity.",
        list: [
          "Heart rate: dose-dependent increase of roughly 5–10 bpm, often peaking around week 24 — monitor if you have cardiovascular concerns",
          "Dysesthesia (altered skin sensation): more specific to retatrutide than single-agonist GLP-1 drugs; ~1 in 5 at 9–12 mg in phase 3, usually mild; often resolves after discontinuation",
          "Serious adverse events: relatively rare in phase 2 (~4% vs placebo); pancreatitis, gallbladder issues, and liver enzyme elevation remain class risks warranting medical monitoring",
          "Long-term safety beyond ~1–2 years is still being established as TRIUMPH continues",
        ],
      },
      {
        heading: "Fat grafting and aesthetic procedures",
        body: "A scoping review raised whether GLP-1 receptor agonists — including retatrutide — could theoretically reduce autologous fat graft survival via adipocyte browning, lipolysis, and altered adipose stem-cell differentiation. Retatrutide's glucagon activity was flagged as a particular mechanistic concern. No direct clinical studies in patients on these medications have confirmed graft outcomes; this remains hypothesis-generating, but relevant if planning fat-transfer procedures while using incretin-class compounds.",
      },
      {
        heading: "Regulatory and availability",
        body: "As of mid-2026, retatrutide remains investigational — not approved by the FDA, EMA, or other regulators for any indication. Eli Lilly's TRIUMPH program (5,800+ participants) is expected to support a filing, with industry projections often placing FDA submission in late 2026 and potential approval in 2027–2028 pending remaining data and review. An expanded access (compassionate use) pathway exists for narrow, case-by-case serious-disease scenarios under the investigational name LY3437943 — not general availability.",
      },
      {
        heading: "The bottom line",
        body: "Retatrutide is a mechanistic step beyond single- and dual-agonist GLP-1 therapies, with glucagon receptor activity targeting energy expenditure as well as appetite and glycemic control. Phase 3 weight-loss signals (up to ~28–30% in highest-dose, longest-duration cohorts) are among the largest reported for the class. Tolerability is broadly similar to existing GLP-1 drugs, with GI effects dominant and dysesthesia as a newer class-specific finding. It remains investigational, with full approval likely still a year or more away pending remaining TRIUMPH readouts. Part 2 covers trial dosing structure and clinical monitoring — see retatrutide-dosing-monitoring.",
      },
    ],
  },
  {
    id: "retatrutide-dosing-monitoring",
    title: "Retatrutide: Dosing Structure, Pharmacokinetics, and Clinical Monitoring",
    tagline:
      "Trial titration schedules, PK logic, and what phase 2/3 protocols measured — investigational only.",
    category: "health",
    seriesOrder: 2,
    publishedAt: "2026-06-20",
    updatedAt: "2026-06-20",
    sections: [
      {
        body: "Part 1 covered what retatrutide is, how the triple-agonist mechanism compares to semaglutide and tirzepatide, and what efficacy and safety trials have reported so far. This article focuses on a different question: how controlled studies structured dose escalation and what endpoints investigators monitored — the clinical protocol layer, not a self-administration guide. Practical, anecdotal reference approaches documented in the cycle compound guide serve a separate purpose; this piece is the research counterpart. Retatrutide remains investigational and is not FDA-approved for any indication as of mid-2026.",
      },
      {
        heading: "Titration schedules used in trials",
        body: "Every major retatrutide study used gradual dose escalation rather than fixed high-dose starts. The specific schedules differ by phase, but the pattern is consistent: start low, increase at regular intervals, and cap at protocol-defined maximums (4 mg, 9 mg, or 12 mg in phase 3).",
        blocks: [
          {
            heading: "Phase 2 (NEJM 2023, obesity)",
            body: "Participants escalated through multiple dose levels toward a 12 mg weekly maximum over months. GI tolerability was worst during upward steps — the trial design prioritized reaching therapeutic doses without dropout from nausea and vomiting.",
          },
          {
            heading: "TRIUMPH-1 and TRIUMPH-4 (phase 3)",
            body: "Fixed target-dose arms at 4 mg, 9 mg, and 12 mg weekly, with escalation typically advanced every four weeks until the assigned target was reached. Some cohorts compared a 2 mg starting dose versus 4 mg: lower starts produced meaningfully better early tolerability without changing the trial's efficacy framing at target dose.",
          },
          {
            heading: "Maximum tolerated dose sub-study (TRIUMPH-1)",
            body: "In BMI ≥35 participants, an additional 24-week period allowed escalation to each individual's maximum tolerated dose rather than a fixed cap. This cohort drove the highest reported losses (up to ~30%) — a protocol choice about dose ceiling, not a separate compound.",
          },
        ],
        list: [
          "Typical escalation cadence in phase 3: dose increases approximately every 4 weeks",
          "Target dose arms: 4 mg, 9 mg, and 12 mg weekly at steady state",
          "2 mg vs 4 mg starting comparison: lower start improved early GI tolerability in trial data",
        ],
      },
      {
        heading: "Why titration matters mechanistically",
        body: "Retatrutide's GI profile is dose-dependent. Phase 2 reported nausea in roughly 14% of participants at lower doses versus ~60% at 12 mg — concentrated during escalation windows. GLP-1 receptor agonism slows gastric emptying and increases central satiety signaling; rapid exposure spikes tend to produce more nausea and vomiting than the same dose reached gradually, when some receptor-level adaptation has occurred.",
        blocks: [
          {
            heading: "Exposure vs adaptation",
            body: "Trial sponsors chose multi-week escalation intervals partly to let participants adapt between steps. The goal in protocols was not to minimize total drug exposure but to reduce peak-exposure GI events that cause discontinuation.",
          },
          {
            heading: "Informal strategies (guide context)",
            body: "The same tolerability logic underpins anecdotal reference approaches in the compound guide — for example, starting around 0.25 mg three times per week and titrating slowly. Those patterns are not trial replication; they reflect practical GI management observed outside formal protocols. Part 1's efficacy numbers apply to trial-defined regimens, not informal micro-titration schedules.",
          },
        ],
      },
      {
        heading: "Pharmacokinetics",
        body: "Retatrutide was developed as a once-weekly subcutaneous injection — matching the dosing cadence of semaglutide and tirzepatide in approved obesity protocols, though the molecules are not comparable on a milligram basis. Steady-state concentrations build over the titration period: each dose increase adds exposure until the protocol target is reached, rather than achieving full steady state from day one.",
        list: [
          "Once-weekly injection in all major trials — frequency driven by peptide PK supporting sustained receptor engagement",
          "Steady-state at a given dose level develops over several weeks of repeated dosing; trials account for this by holding each step ~4 weeks before escalating",
          "Compared to semaglutide (GLP-1 only, weekly titration from 0.25 mg toward 1–2.4 mg): same weekly philosophy, different receptor scope and mg scale",
          "Compared to tirzepatide (GLP-1 + GIP, weekly steps from 2.5 mg toward 15 mg): same escalation logic, adds glucagon receptor activity retatrutide uniquely includes",
        ],
      },
      {
        heading: "Dose-for-dose comparison against tirzepatide and semaglutide",
        body: "Part 1 noted retatrutide's larger matched-duration weight-loss signals versus single- and dual-agonist comparators. From a dosing perspective, the more important point is that milligram amounts are not interchangeable across molecules — each peptide has distinct receptor binding profiles, half-lives, and trial-defined targets.",
        list: [
          "12 mg retatrutide in phase 2/3 trials is not equivalent to 12 mg tirzepatide or 2.4 mg semaglutide in potency or receptor coverage",
          "Efficacy comparisons use trial-defined regimens at steady state — not matched mg amounts",
          "Tirzepatide's approved obesity ladder (2.5 → 5 → 7.5 → 10 → 15 mg weekly) and semaglutide's (0.25 → 0.5 → 1 → 2.4 mg weekly) are separate scales from retatrutide's 4 / 9 / 12 mg phase 3 arms",
          "Cross-molecule decisions belong in clinical care with approved agents — not mg translation tables",
        ],
      },
      {
        heading: "Clinical monitoring considerations",
        body: "TRIUMPH and phase 2 protocols collected safety data on predefined schedules. The following reflects what trials measured and why — not a personal monitoring checklist.",
        blocks: [
          {
            heading: "Cardiovascular",
            body: "Protocols tracked heart rate because phase 2 showed a dose-dependent increase of roughly 5–10 bpm, often peaking around week 24 — likely linked to glucagon receptor activity on top of GLP-1/GIP effects. TRIUMPH-3 (obesity with established cardiovascular disease) will add outcome-level CV data retatrutide-specific programs still lack.",
          },
          {
            heading: "Pancreatic",
            body: "Pancreatitis remains a class concern for incretin therapies. Trial safety labs included lipase and amylase monitoring in line with GLP-1 program standards; serious pancreatic events were rare in phase 2 (~4% SAE rate overall vs placebo) but remain a regulatory review focus.",
          },
          {
            heading: "Hepatic",
            body: "Liver enzyme elevations were reported and tracked. Weight-loss-mediated improvements in hepatic steatosis markers are a secondary interest in MASLD-related endpoints — distinct from watching for hepatotoxicity signals during escalation.",
          },
          {
            heading: "Gallbladder",
            body: "GLP-1 class drugs have established associations with gallbladder-related events, likely related to rapid weight loss and altered bile handling. Retatrutide trials captured biliary adverse events as part of standard incretin safety surveillance.",
          },
          {
            heading: "Renal",
            body: "Protocols monitored kidney function because large, rapid weight loss combined with GI fluid loss (vomiting, diarrhea) can affect hydration status and renal perfusion markers in any obesity trial — a general safety consideration, not retatrutide-specific nephrotoxicity. (General lab-reading context: kidney-markers-hydration in Health & labs.)",
          },
        ],
      },
      {
        heading: "Combination and co-therapy in the literature",
        body: "Retatrutide trials did not combine it with other GLP-1, GIP, or glucagon receptor agonists — triple agonism already saturates those pathways, and stacking would add GI and cardiovascular risk without trial justification.",
        list: [
          "No published retatrutide protocol adds semaglutide, tirzepatide, or other incretin agonists concurrently",
          "TRANSCEND-T2D-1 enrolled type 2 diabetes participants on background insulin or insulin-sensitizing therapy; hypoglycemia monitoring was part of trial safety because retatrutide improves glycemic control on top of existing diabetes treatment",
          "Combination framing in the literature is limited to protocol-defined background meds — not discretionary stacking",
        ],
      },
      {
        heading: "Regulatory and access status",
        body: "As of mid-2026, retatrutide (LY3437943) remains investigational — not FDA-, EMA-, or otherwise approved. Eli Lilly's TRIUMPH program (5,800+ participants across obesity and T2D indications) is expected to support regulatory filing, with industry projections often placing submission in late 2026 and potential approval in 2027–2028 pending remaining readouts. Expanded access exists only for narrow, case-by-case serious-disease scenarios — not general availability.",
      },
      {
        heading: "Trial protocols vs guide reference",
        body: "Controlled trials used once-weekly dosing with protocol-fixed escalation every ~4 weeks to 4, 9, or 12 mg targets. The compound guide documents informal, anecdotal approaches — including more frequent micro-doses at lower starting amounts — aimed at GI tolerability in practice. Both layers help compound understanding: trials define efficacy and safety evidence regulators review; the guide captures practical reference patterns common in bodybuilding contexts. Neither replaces medical supervision, and investigational status applies regardless of which framing you read.",
      },
      {
        heading: "The bottom line",
        body: "Retatrutide trial design centers on slow weekly escalation, dose-dependent GI management, and structured safety surveillance across cardiovascular, pancreatic, hepatic, biliary, and renal endpoints. Pharmacokinetics support once-weekly dosing with steady-state reached over the titration window — a different mg scale from semaglutide or tirzepatide, not a direct swap. For mechanism and headline efficacy, start with Part 1; for anecdotal titration and awareness notes, see the Retatrutide compound guide in cycle references.",
      },
    ],
  },
  {
    id: "reverse-diet-after-cut",
    title: "Reverse Dieting After a Cut: Finding Maintenance Without Regaining Fat",
    tagline:
      "The phase after your cut often matters more than the cut itself — add calories back deliberately, not reactively.",
    category: "diet",
    publishedAt: "2026-06-20",
    updatedAt: "2026-06-20",
    sections: [
      {
        body: "Most people treat the end of a cut as a finish line — drop the deficit, eat normally again, and hope the scale stays put. That reactive approach is why so many people regain a meaningful chunk of what they lost within weeks. Reverse dieting is the opposite: a deliberate, gradual increase in calories until you find your new maintenance, giving your body time to adapt before you ask it to hold a new body composition long-term.",
      },
      {
        heading: "Why jumping to maintenance fails",
        body: "During a prolonged deficit, total daily energy expenditure drops — not just from less body mass, but from metabolic adaptation, reduced NEAT, and hormonal shifts that increase hunger and decrease satiety signaling. Your pre-cut maintenance number is almost never your post-cut maintenance number. Jumping straight to what you used to eat often overshoots actual needs, producing rapid scale rebound that is partly water and glycogen but also real fat regain if the overshoot persists.",
        list: [
          "Each pound of fat lost lowers maintenance by roughly 10 calories — a 20 lb cut might mean ~200 fewer calories at true maintenance",
          "Ghrelin tends to rise and leptin tends to fall coming out of a deficit, increasing appetite at the worst possible moment",
          "Glycogen and associated water refill quickly when carbs return — expect several pounds on the scale that are not fat",
        ],
      },
      {
        heading: "What reverse dieting actually is",
        body: "Reverse dieting means adding calories back in small, consistent steps — typically 50–150 calories per week depending on how aggressive the cut was and how lean you finished — while watching your weekly average scale weight. The goal is to climb toward maintenance slowly enough that weight stabilizes rather than spikes. You are not trying to stay at deficit-level leanness forever; you are trying to land at a sustainable maintenance intake without overshooting into a surplus.",
      },
      {
        heading: "A practical reverse protocol",
        blocks: [
          {
            heading: "Step 1: Estimate your target",
            body: "Start from your current intake at the end of the cut. Add back roughly 10 calories per pound of fat lost as a ballpark for where maintenance likely sits — then plan to reach that number over several weeks, not in one jump.",
          },
          {
            heading: "Step 2: Add calories weekly",
            body: "Increase by 50–100 calories per week if you finished lean (under ~15% body fat for men, proportionally higher for women). Heavier finishers or those who ran longer, more aggressive cuts can often tolerate 100–150 per week. Prioritize carbs first — they refill glycogen, support training performance, and are usually what got cut hardest.",
          },
          {
            heading: "Step 3: Read the trend, not daily noise",
            body: "Weigh daily if you want, but decide on weekly averages. If average weight rises more than ~0.5–1 lb/week after the initial glycogen rebound settles, you are probably adding too fast. If weight keeps dropping, add another increment.",
          },
          {
            heading: "Step 4: Hold at maintenance",
            body: "When weekly averages flatten for 2–3 consecutive weeks, you have likely found maintenance. Stay there — not in a surplus — for a meaningful period before considering a bulk. The body defends prior settling points; accepting a new normal takes time.",
          },
        ],
      },
      {
        heading: "How long should maintenance last?",
        body: "A common mistake is reverse dieting for two weeks and immediately entering a surplus. For most people who ran a serious cut, 4–12 weeks at true maintenance is a reasonable minimum before a bulk — longer if you finished very lean or the cut was long. This phase is where hormonal adaptation partially normalizes and you prove you can hold the new composition without constant restriction. Skipping it usually means the next cut or bulk starts from an unstable baseline.",
      },
      {
        heading: "On-cycle context",
        body: "Enhanced phases can blunt some muscle loss during a cut and accelerate strength recovery during a reverse, but they do not remove metabolic adaptation or hunger rebound. Coming off a cut into a blast without a maintenance phase often produces fast scale gain from glycogen, intramuscular water, and appetite — which feels like progress but can mask unnecessary fat accrual if surplus starts too early. A disciplined reverse at maintenance, even on cycle, sets up a cleaner bulk.",
      },
      {
        heading: "Signs you are moving too fast",
        list: [
          "Weekly average weight climbing more than ~1 lb/week after the first 1–2 weeks post-cut",
          "Waist measurement rising faster than scale alone would suggest",
          "Constant hunger despite adding calories — may mean increments are too small and psychological restriction remains",
          "Strength recovering but body composition visibly softening week over week",
        ],
      },
      {
        heading: "The bottom line",
        body: "Reverse dieting is not a gimmick — it is the maintenance-finding phase that the cutting series points to but rarely gets enough attention. Add calories back on a schedule, watch weekly trends, expect initial water weight, and hold at maintenance long enough for your body to accept the new normal. The cut gets you lean; the reverse determines whether you stay there.",
      },
    ],
  },
  {
    id: "bulking-without-tracking",
    title: "Bulking Without a Food Diary: Principles That Still Work",
    tagline:
      "Educational reference — surplus discipline without apps, same philosophy as cutting without tracking.",
    category: "diet",
    publishedAt: "2026-06-20",
    updatedAt: "2026-06-20",
    sections: [
      {
        heading: "Surplus still rules",
        body: "Muscle gain requires sustained energy surplus over time. Without tracking apps, use consistent meal structure, portion templates, and weekly scale trends (same time, same conditions) to judge whether you are actually gaining. The goal is controlled surplus — enough to support progression, not enough to accumulate unnecessary fat.",
      },
      {
        heading: "Rate of gain: the dial that matters",
        body: "A practical target for most natural lifters is roughly 0.25–0.5% of body weight per week — about 0.5–1 lb/week for a 200 lb person. Faster gains rarely produce proportionally more muscle; they mostly add fat. Enhanced lifters can often tolerate slightly faster rates because anabolic signaling improves nutrient partitioning, but the same principle applies — runaway scale increases are not \"more gains,\" they are more cleanup later.",
        list: [
          "Under ~0.25%/week for multiple weeks with stalled lifts — surplus is probably too small",
          "Over ~1%/week consistently — surplus is almost certainly too large unless you are very underweight",
          "Use waist measurement alongside scale: rising waist with flat strength often means fat, not muscle",
        ],
      },
      {
        heading: "Protein anchor",
        list: [
          "Keep protein at roughly 0.7–1g per pound of body weight — similar to a cut, not dramatically lower",
          "A palm-sized lean protein source every meal is a workable template without weighing food",
          "Do not slash protein to make room for more junk calories — protein supports the surplus you actually want",
        ],
      },
      {
        heading: "Carbs and fats: where surplus lives",
        body: "Once protein is set, surplus calories come from carbs and fats. Carbs fuel training volume and recovery; fats are calorie-dense and easy to over-add without noticing. A simple approach: add one carb-focused meal or snack around training first (extra rice, potatoes, oats, fruit), then adjust fats (olive oil, nuts, whole eggs) if scale trend is still flat after 2–3 weeks.",
      },
      {
        heading: "Meal structure without math",
        list: [
          "Eat on a schedule — irregular eating makes surplus harder to judge",
          "Anchor each meal with protein, then add starch or fruit for carbs",
          "Liquid calories (shakes, milk, juice) are efficient for hard gainers but easy to overshoot — use deliberately",
          "Keep hyper-palatable foods from dominating — they add calories without improving training quality",
          "Weigh weekly, not daily — day-to-day fluctuation from sodium and glycogen obscures the trend",
        ],
      },
      {
        heading: "On-cycle considerations",
        body: "Enhanced bulks can produce faster strength and scale gains with less perceived effort, which tempts people into excessive surplus. Orals and high-dose tren do not need aggressive bulking to work — they need adequate protein, training progression, and cardiovascular health support. A moderate surplus on cycle often yields better composition than eating everything in sight because \"I'm on gear.\"",
      },
      {
        heading: "When to get structured",
        body: "If scale weight stalls for 3+ weeks while lifts are flat, or if waist rises without strength gains for 2+ weeks, blind eating is failing. Short 2-week tracking audits — or a dietitian consult — beat guessing. The same trigger logic applies as cutting without tracking, just inverted: you need evidence you are in surplus, not deficit.",
      },
      {
        heading: "The bottom line",
        body: "Bulking without a diary is viable if you respect trends, anchor protein, add surplus deliberately around training, and accept that enhanced or not, most extra scale weight beyond ~0.5%/week is fat. Patience and portion templates beat reactive binge eating.",
      },
    ],
  },
  {
    id: "refeeds-diet-breaks",
    title: "Refeeds and Diet Breaks: When a Pause Helps Your Cut",
    tagline:
      "Structured higher-calorie days are not cheat meals — they are tools with specific jobs in a long deficit.",
    category: "diet",
    publishedAt: "2026-06-20",
    updatedAt: "2026-06-20",
    sections: [
      {
        body: "Long cuts eventually hit a wall — hunger climbs, training feels flat, sleep suffers, and willpower frays. Two structured tools address different problems: refeed days (short, carb-focused surplus within an ongoing cut) and diet breaks (multi-day return to maintenance calories). Both are often confused with cheat meals or untracked binge days. They are not the same thing, and using them correctly matters more than using them often.",
      },
      {
        heading: "Refeed days vs diet breaks vs cheat meals",
        blocks: [
          {
            heading: "Refeed day",
            body: "Typically 24 hours at maintenance or a modest surplus, with calories coming primarily from carbohydrates while protein stays high and fat stays relatively low. Purpose: refill muscle glycogen, improve training performance and mood, and provide a psychological reset without exiting the cut.",
          },
          {
            heading: "Diet break",
            body: "Usually 3–14 days at estimated maintenance calories — not a surplus. Purpose: reduce cumulative deficit stress, partially normalize hunger hormones, and break up very long cuts. Research on intermittent dieting (e.g. MATADOR-style approaches) suggests diet breaks can improve long-term fat loss and adherence versus continuous aggressive restriction for some people.",
          },
          {
            heading: "Cheat meal",
            body: "Untracked, often hyper-palatable, and frequently much larger than a structured refeed. Can help adherence for some people when planned, but unplanned cheat spirals are one of the most common ways cuts fail. A refeed is structured; a cheat meal is optional and separate.",
          },
        ],
      },
      {
        heading: "What refeeds actually do",
        body: "The physiological case for refeeds centers on glycogen restoration and short-term leptin bumps from increased carbohydrate intake. The effect on metabolic rate from a single refeed is modest and temporary — do not expect a refeed to \"restart your metabolism.\" What refeeds reliably improve is training quality, perceived energy, and diet adherence over the following days. For many people, that is worth more than any hormonal theory.",
        list: [
          "Carb-focused refeeds refill glycogen and pull water into muscle — expect scale to jump 2–4 lbs, mostly not fat",
          "Training sessions after a refeed often feel noticeably better if glycogen was depleted",
          "Psychological relief from restriction can restore adherence for the rest of the week",
        ],
      },
      {
        heading: "When to use a refeed",
        list: [
          "Cuts longer than 6–8 weeks with declining training performance or persistent fatigue",
          "Very low carb intake for extended periods — glycogen depletion is affecting workouts",
          "Body fat still comfortably above essential levels — refeeds are less necessary early in a high-fat cut",
          "Generally avoid frequent refeeds when already very lean (sub-12% men) — diet breaks or maintenance phases are usually more appropriate",
        ],
      },
      {
        heading: "Structuring a refeed without tracking",
        body: "If you are not using apps, think in templates rather than exact grams. Keep protein similar to a normal day. Shift calories toward starches and fruit — rice, potatoes, oats, bread, bananas — and keep fats moderate for that day. Eat to satisfaction within that structure rather than treating it as a free-for-all. One day at maintenance with carb emphasis is the target; three days of uncontrolled eating is not a refeed.",
      },
      {
        heading: "Diet breaks: who benefits most",
        body: "Diet breaks shine for people running long cuts (12+ weeks), those who started with higher body fat and used aggressive deficits early, or anyone showing clear signs of cumulative fatigue — poor sleep, irritability, stalled scale trend despite consistent adherence, and declining gym performance across multiple weeks. A 1–2 week break at maintenance does not erase progress; it often makes the next deficit phase more productive.",
      },
      {
        heading: "On-cycle context",
        body: "Enhanced cuts can preserve performance longer than natural cuts, which sometimes means people skip refeeds when they still need them psychologically — or use refeeds when fat loss is already fast from compounds and additional calories just slow the cut. If running orals or appetite-suppressing compounds, structured refeeds may matter less physiologically but can still help adherence. If running nothing and training hard in a deep deficit, refeeds are more practically useful.",
      },
      {
        heading: "Common mistakes",
        list: [
          "Turning a refeed into a high-fat binge — fat does not refill glycogen and adds calories without the training benefit",
          "Refeeding too often — weekly refeeds on a moderate cut often just slow fat loss without improving adherence",
          "Expecting the scale to drop immediately after — water weight from glycogen takes days to settle",
          "Using diet breaks as an excuse to bulk — maintenance means maintenance, not surplus",
        ],
      },
      {
        heading: "The bottom line",
        body: "Refeeds and diet breaks are precision tools for long cuts, not mandatory rituals. Use carb-focused refeeds when glycogen and adherence need a reset; use diet breaks when cumulative deficit fatigue is real. Neither replaces the reverse diet and maintenance phase after the cut ends — they just make getting there more sustainable.",
      },
    ],
  },
  {
    id: "bloodwork-timing-basics",
    title: "Bloodwork Timing: When to Draw Labs on and Off Cycle",
    tagline:
      "The same marker means different things depending on when you drew it — timing is part of the result.",
    category: "health",
    seriesOrder: 1,
    publishedAt: "2026-06-20",
    updatedAt: "2026-06-20",
    sections: [
      {
        body: "Bloodwork is only useful if you know why you drew it and what phase you are in. A mid-blast estradiol reading tells a different story than a trough reading on TRT. A liver panel drawn the morning after a heavy leg day can look worse than the same panel drawn mid-week. This series covers how to read individual markers on cycle — starting with when to actually pull blood.",
      },
      {
        heading: "Baseline before you start",
        body: "The most valuable labs you will ever have are the ones taken before any exogenous hormones. Baseline establishes your personal normal — not population reference ranges on a PDF, but what your body looked like untrained by compounds. At minimum, a pre-cycle draw should cover hormones (total and free testosterone, estradiol, LH, FSH), a CBC, a metabolic panel with liver enzymes, lipids, and kidney markers. If you have prior labs from a physical, use those — but recognize that lifestyle, sleep, and training state at draw time still matter.",
        list: [
          "Draw fasted, morning, hydrated normally — same conditions you will use for all future comparisons",
          "Avoid drawing within 48 hours of an unusually heavy training session if liver enzymes are on the panel",
          "Note every compound, dose, and pin date in your log so results are interpretable later",
        ],
      },
      {
        heading: "Mid-cycle checkpoints",
        body: "For most blasts, two mid-cycle draws are a reasonable default: one at weeks 4–6 (early enough to catch rising hematocrit, lipids, and liver stress) and one near the end before PCT or cruise transition. Short 6-week orals-only runs may need only a single mid-point draw. Longer runs (16+ weeks) or stacks with 19-nors benefit from a third draw around the midpoint.",
        blocks: [
          {
            heading: "Trough vs peak timing",
            body: "Injectable esters have peaks and troughs. Drawing on pin day before injection captures a trough; drawing 24–48 hours after a pin captures closer to peak. Neither is wrong — but compare like with like every time. TRT users on stable weekly or twice-weekly protocols should pick one consistent offset from injection and stick to it.",
          },
          {
            heading: "Orals and liver",
            body: "If orals are in the stack, do not wait until week 8 for the first liver check. ALT and AST can move quickly on methylated compounds. An early draw at week 2–3 plus a follow-up at week 6 is a conservative approach for oral-inclusive blasts.",
          },
        ],
      },
      {
        heading: "Post-cycle and PCT",
        body: "Post-cycle labs confirm whether the axis is recovering — not whether you \"passed PCT.\" Draw 4–6 weeks after your last suppressive pin (longer for deca and other long esters) and again 4–6 weeks after PCT ends if markers were still suppressed. Comparing to baseline answers the only question that matters: are LH, FSH, and testosterone trending back toward your pre-cycle values?",
      },
      {
        heading: "How often on TRT or cruise",
        body: "Stable TRT or cruise doses still need periodic monitoring — hematocrit, lipids, estradiol, and PSA (where applicable) do not stay fixed forever. Twice yearly is a common minimum for stable protocols; quarterly for the first year or after any dose change. Treat dose adjustments like a new baseline: recheck affected markers 6–8 weeks after the change.",
      },
      {
        heading: "Practical draw-day checklist",
        list: [
          "Fasted 8–12 hours (water is fine)",
          "Normal hydration — not dehydrated, not over-hydrated",
          "Same time of day as prior draws when possible",
          "Consistent offset from last injection for injectables",
          "No new supplements or medications in the 48 hours before draw unless that is the new normal",
          "Log pin dates, orals, training load, and sleep for the week surrounding the draw",
        ],
      },
      {
        heading: "What to watch on labs",
        body: "Roiders Club uses optimal targets calibrated for health on a minimal cycle — not lab-reference ranges and not \"bro optimal.\" Flags are monitoring prompts: yellow means worth watching and correlating with symptoms; strict thresholds mean stop-and-assess territory. A single out-of-range value is a reason to retest under controlled conditions, not a diagnosis.",
      },
      {
        heading: "The bottom line",
        body: "Timing is not a footnote — it is part of the test. Baseline before you start, consistent draw conditions throughout, and phase-appropriate checkpoints (mid-blast, pre-PCT, post-recovery) turn random lab numbers into a usable trend. The rest of this series walks through the markers that move most often on cycle.",
      },
    ],
  },
  {
    id: "liver-enzymes-on-cycle",
    title: "Liver Enzymes on Cycle: ALT, AST, and When to Pause",
    tagline:
      "Orals move ALT and AST fast — but training, dehydration, and non-liver stress can muddy the picture.",
    category: "health",
    seriesOrder: 2,
    publishedAt: "2026-06-20",
    updatedAt: "2026-06-20",
    sections: [
      {
        heading: "What ALT and AST actually reflect",
        body: "ALT (alanine aminotransferase) and AST (aspartate aminotransferase) are enzymes released when liver cells — and, to a lesser extent, muscle tissue — are stressed or damaged. On cycle, the first question is always: orals in the stack? Methylated oral AAS are hepatotoxic by design; injectables alone rarely produce dramatic enzyme spikes unless something else is contributing.",
      },
      {
        heading: "Oral AAS: expect movement",
        body: "17-alpha-alkylated orals (methylated steroids, many designer orals) pass through the liver on first pass and predictably raise ALT and AST. Mild elevations on moderate doses are common; the question is magnitude, trajectory, and symptoms — not whether enzymes moved at all. Stacking multiple orals, running orals for 8+ weeks, or combining orals with other hepatotoxic drugs (certain NSAIDs, high-dose acetaminophen, heavy alcohol) compounds risk nonlinearly.",
        list: [
          "Draw liver enzymes at least once mid-oral run — earlier if dose is high or history of sensitivity",
          "Rising enzymes week over week matter more than a single static elevation",
          "Jaundice, dark urine, persistent right-upper-quadrant pain, or unexplained nausea are clinical red flags regardless of numbers",
        ],
      },
      {
        heading: "Injectables and non-oral causes",
        body: "Testosterone and most injectable AAS are not first-pass liver toxins in the same way orals are. If ALT and AST are elevated on an injectable-only stack, look elsewhere first: a heavy training session within 48–72 hours (especially eccentric-heavy work), significant muscle damage, dehydration, viral illness, or medications. AST tends to rise more with muscle breakdown than ALT; an AST-predominant spike after leg day is a different conversation than both enzymes climbing steadily on week 4 of an oral.",
      },
      {
        heading: "Reading the numbers in context",
        body: "Roiders Club optimal targets for ALT and AST reflect health on a very minimal cycle — not the lab's wide reference range. Values in the caution band warrant retesting under controlled conditions (no heavy training for 3 days, normal hydration, no alcohol) before changing protocol. Strict-threshold flags mean stop orals, remove other hepatotoxic inputs, and involve a clinician if symptoms accompany the rise or retest confirms the trend.",
        blocks: [
          {
            heading: "ALT-predominant elevation",
            body: "More specific to hepatocellular stress. On orals, ALT often leads. Persistent ALT rise without oral exposure deserves medical workup — do not assume \"it's just the gear.\"",
          },
          {
            heading: "AST-predominant elevation",
            body: "Broader tissue distribution — muscle, heart, liver. Correlate with training timing. If AST is high but ALT is normal and you deadlifted yesterday, retest before reacting.",
          },
        ],
      },
      {
        heading: "Support compounds: realistic expectations",
        body: "TUDCA, NAC, and milk thistle are commonly discussed as liver support. Evidence for TUDCA reducing oral-induced enzyme rises is real but not a license to extend toxic oral runs. Support compounds may blunt enzyme peaks — they do not eliminate hepatotoxicity. If enzymes climb despite support, the answer is dose reduction or cessation, not more supplements.",
      },
      {
        heading: "When to pause orals",
        list: [
          "Enzymes above caution band on retest under controlled draw conditions",
          "Any strict-threshold flag with or without symptoms",
          "Symptoms of liver dysfunction even if enzymes look \"acceptable\"",
          "Week-over-week rise without a non-liver explanation",
        ],
      },
      {
        heading: "The bottom line",
        body: "Liver enzymes on cycle are a trend and context problem. Orals will move them; injectables usually should not dramatically. Train timing, hydration, and draw consistency matter. Retest before panicking, escalate when trends or symptoms demand it, and treat strict flags as a pause signal — not a number to rationalize away.",
      },
    ],
  },
  {
    id: "hematocrit-rbc",
    title: "Hematocrit and RBC: Testosterone, Viscosity, and What to Do",
    tagline:
      "Elevated hematocrit is one of the most predictable testosterone side effects — and one of the most ignored.",
    category: "health",
    seriesOrder: 3,
    publishedAt: "2026-06-20",
    updatedAt: "2026-06-20",
    sections: [
      {
        heading: "Why hematocrit rises on testosterone",
        body: "Testosterone stimulates erythropoiesis — red blood cell production — through erythropoietin upregulation. Higher hematocrit (HCT) and hemoglobin mean thicker blood, higher oxygen-carrying capacity, and increased cardiovascular load from viscosity. This is dose-dependent and cumulative: many men see gradual HCT creep over months on TRT or blast doses, especially without mitigation habits.",
      },
      {
        heading: "Reading the CBC",
        body: "Hematocrit is the percentage of blood volume occupied by red cells. Hemoglobin (HGB) and red blood cell count (RBC) move together. Roiders Club optimal HCT targets sit below the levels where viscosity-related risk rises sharply — caution and strict bands flag when monitoring intensity should increase. A single high reading warrants retest; a sustained upward trend over multiple draws is the real signal.",
        list: [
          "Dehydration concentrates HCT — normalize hydration before drawing and before reacting",
          "Living at altitude raises baseline HCT — compare to your own trend, not sea-level bro charts",
          "Sleep apnea can independently raise RBC indices — worth ruling out if HCT climbs despite low dose",
        ],
      },
      {
        heading: "Symptoms and cardiovascular load",
        body: "Many men run elevated HCT asymptomatically until they do not. Headaches (especially morning), flushing, elevated blood pressure, shortness of breath on exertion, and fatigue can correlate with high viscosity — but symptoms are unreliable alone. Pair how you feel with BP trends and repeated CBCs. Chest pain, severe headache, or neurological symptoms are emergency territory regardless of last lab date.",
      },
      {
        heading: "Mitigation that actually moves the needle",
        list: [
          "Regular cardio — Zone 2 work multiple times per week is the most underused HCT tool",
          "Consistent hydration and electrolyte balance (see hydration article in Diet category)",
          "Donating blood or therapeutic phlebotomy — clinical decision based on sustained elevation",
          "Dose reduction if HCT remains high despite lifestyle mitigation",
          "Avoid stacking multiple erythropoiesis-stimulating factors (test + high-altitude training camps + dehydration) without monitoring",
        ],
      },
      {
        heading: "Therapeutic phlebotomy",
        body: "When HCT stays above caution range despite cardio, hydration, and dose review, therapeutic blood donation or prescription phlebotomy is a standard clinical option on TRT. Frequency varies — some men need donation every 8–12 weeks; others stabilize with lifestyle alone. This is a conversation with a clinician who knows you are on testosterone, not a DIY schedule based on one lab.",
      },
      {
        heading: "Compounds beyond testosterone",
        body: "Testosterone is the primary driver in most stacks, but any compound that raises RBC production or concentrates blood through fluid shifts can worsen the picture. Trenbolone does not raise HCT through the same EPO pathway as testosterone but can still affect BP and cardiovascular stress. Orals and AI-driven E2 crashes do not lower HCT directly — do not chase HCT with inappropriate ancillary changes.",
      },
      {
        heading: "The bottom line",
        body: "Hematocrit is predictable, dose-related, and manageable if you monitor it. Draw CBCs on schedule, retest dehydrated spikes, run cardio, stay hydrated, and escalate to phlebotomy or dose adjustment when trends stay high. Ignoring HCT because you feel fine is how manageable problems become urgent ones.",
      },
    ],
  },
  {
    id: "estradiol-symptoms-not-numbers",
    title: "Estradiol: Symptoms Matter More Than a Target Number",
    tagline:
      "E2 labs are useful — but chasing a single pg/mL value causes more problems than it solves.",
    category: "health",
    seriesOrder: 4,
    publishedAt: "2026-06-20",
    updatedAt: "2026-06-20",
    sections: [
      {
        body: "Estradiol (E2) might be the most over-interpreted marker in performance pharmacology. Forums treat it like a thermostat with a single correct setting. In practice, estradiol exists in a range where men feel and function well, individual sensitivity varies, assay type matters, and the cost of driving E2 too low is often worse than letting it sit moderately elevated. Labs inform the picture; symptoms and trends complete it.",
      },
      {
        heading: "Why E2 is not one number",
        body: "Sensitive LC/MS assays and standard immunoassays can disagree meaningfully. SHBG, obesity, liver function, and aromatizing compound dose all shift the testosterone-to-estradiol ratio. Drawing on a testosterone peak vs trough changes the reading. A single E2 value without injection timing, compound list, and symptom log is half a data point.",
        list: [
          "Use the same lab and assay method for trend comparisons when possible",
          "Note pin timing relative to draw — peak aromatization reads higher",
          "Total testosterone context matters: high T with proportionally high E2 is a different scenario than low T with mid-range E2",
        ],
      },
      {
        heading: "High E2: what people actually notice",
        body: "Elevated estradiol on aromatizing compounds can present as water retention, sensitive nipples, mood volatility, or reduced libido — but many men run elevated E2 without gynecomastia symptoms. Water retention overlaps with sodium intake, carbohydrate load, and compound-specific mineralocorticoid effects (not purely E2). Treat symptoms and trends, not a number in isolation.",
        list: [
          "Nipple sensitivity or tissue changes — act early, not after weeks of ignoring",
          "Excessive water retention affecting BP or comfort",
          "Mood symptoms that track with dose increases rather than life stress alone",
        ],
      },
      {
        heading: "Low E2: the under-discussed problem",
        body: "Aggressive aromatase inhibitor use has left a generation of men with crashed E2 — joint pain, fatigue, depression, lipid worsening, and sexual dysfunction. Low E2 is not \"dry and aesthetic\"; it is physiologically miserable and counterproductive for muscle and mood. If you are on an AI and feel awful despite \"good\" labs, consider that your labs might be lying (assay timing) or that you have overshot.",
        list: [
          "Achy joints and sudden loss of training tolerance",
          "Depressed mood or flat affect disproportionate to context",
          "Libido collapse despite adequate androgen levels",
          "Lipids worsening after AI introduction",
        ],
      },
      {
        heading: "Aromatase inhibitors: default should be none",
        body: "AIs are not a mandatory cycle accessory. Many men on moderate testosterone doses never need them. Starting an AI preemptively \"to be safe\" is how low-E2 problems begin. If symptoms warrant intervention, dose the lowest effective amount and reassess with symptoms plus repeat labs — not a blanket protocol copied from a forum.",
      },
      {
        heading: "Roiders Club optimal range framing",
        body: "App optimal E2 targets reflect health on a minimal cycle — a band where most men function well, not a mandate to nail 30 pg/mL. Caution and strict flags prompt closer monitoring; they are not orders to slam an AI. Correlate flags with nipple symptoms, BP, mood, and injection timing before changing anything.",
      },
      {
        heading: "When to escalate",
        body: "Progressive gyno tissue changes, persistent high BP with symptoms, or inability to find a tolerable E2 balance after conservative AI adjustments belong in clinical care — not incremental bro-protocol tweaks. SERMs for acute gyno symptoms are a medical decision.",
      },
      {
        heading: "The bottom line",
        body: "Estradiol is a range, not a bullseye. Draw consistently, log symptoms honestly, avoid preemptive AI use, and treat low E2 as seriously as high E2. The number on the page is a clue — how you feel, how tissue responds, and how trends move over time is the actual management problem.",
      },
    ],
  },
  {
    id: "kidney-markers-hydration",
    title: "Kidney Markers: Creatinine, BUN, and Hydration Effects",
    tagline:
      "Creatinine moves with muscle mass and hydration — context matters as much as the value.",
    category: "health",
    seriesOrder: 5,
    publishedAt: "2026-06-20",
    updatedAt: "2026-06-20",
    sections: [
      {
        body: "Kidney panels get less attention than hormones and liver enzymes until something looks off. Creatinine, BUN (urea), and eGFR are routine on metabolic panels — and they are routinely misread by people who treat a single creatinine bump as kidney failure or a high-BUN reading as proof of inadequate protein. Both markers are sensitive to hydration, muscle mass, and training load. This article covers how to read them on cycle without unnecessary panic.",
      },
      {
        heading: "Creatinine: not just kidney function",
        body: "Creatinine is a breakdown product of muscle creatine phosphate. More muscle mass generally means higher baseline creatinine — a 220 lb lifter with significant lean mass will run higher than a sedentary reference population. Creatinine also rises with dehydration (concentrated blood) and can fall with over-hydration. eGFR is estimated from creatinine, age, and sex — it inherits all the same context problems.",
        list: [
          "High muscle mass raises baseline creatinine — trend matters more than one comparison to lab ranges",
          "Dehydration artificially elevates creatinine; over-hydration can dilute it",
          "Very high protein intake can modestly increase BUN without kidney injury",
        ],
      },
      {
        heading: "BUN and the protein question",
        body: "Blood urea nitrogen reflects protein metabolism and hydration status. High BUN with normal creatinine often points to dehydration, high protein intake, or GI blood loss — not primary kidney disease. Low BUN is less commonly discussed but can appear with liver dysfunction or very low protein intake. Read BUN alongside creatinine as a ratio pattern, not in isolation.",
      },
      {
        heading: "Hydration: the silent confounder",
        body: "Kidney markers and hydration are tightly linked — the same steady water and electrolyte habits that affect day-to-day water retention (covered in the hydration article under Diet & body comp) also affect whether creatinine and BUN look artificially stressed on draw day. Drawing blood after a morning coffee-only fast, post-sauna, or mid-cut dehydration spike is a recipe for a scary PDF that normalizes on retest.",
        blocks: [
          {
            heading: "Before your draw",
            body: "Hydrate normally for 24 hours before the test — not extreme water loading, not intentional dehydration. Fasted does not mean dry.",
          },
          {
            heading: "On-cycle fluid shifts",
            body: "Aromatizing compounds, sodium-heavy diets, and certain steroids with mineralocorticoid activity change extracellular fluid. Kidney markers can move indirectly through hemoconcentration. Pair labs with blood pressure and how you actually drank that week.",
          },
        ],
      },
      {
        heading: "What actually stresses kidneys on cycle",
        body: "Exogenous testosterone and most injectables are not direct nephrotoxins in the way methylated orals are hepatotoxins. Kidney risk on cycle is more often indirect: sustained high blood pressure, rhabdomyolysis from extreme training, NSAID overuse, dehydration, or pre-existing kidney disease unmasked by hemodynamic stress. Oral AAS plus NSAIDs plus dehydration is a combination worth avoiding — not because creatinine will always spike, but because the margin for error shrinks.",
        list: [
          "Monitor BP alongside kidney markers — hypertension is a primary kidney stressor",
          "Limit chronic NSAID use, especially with orals and dehydration",
          "Extreme training with inadequate recovery can raise creatinine via muscle breakdown — correlate with CK if available",
        ],
      },
      {
        heading: "When to retest vs escalate",
        body: "A single creatinine or eGFR flag without symptoms, with a plausible dehydration or training explanation, deserves a retest under controlled hydration and no heavy training for 48–72 hours. Persistent elevation across multiple draws, rising trend, proteinuria on urinalysis, or symptoms (edema, reduced urine output, fatigue disproportionate to training) warrant medical evaluation — not forum dosing changes.",
      },
      {
        heading: "Roiders Club optimal framing",
        body: "App optimal kidney targets assume adequate hydration and typical muscle mass for active men. Values outside optimal on a single draw are monitoring prompts. Combine with the hydration article's practical habits — consistent fluids, balanced sodium and potassium — before assuming kidney injury.",
      },
      {
        heading: "The bottom line",
        body: "Creatinine and BUN are context-heavy markers. Muscle mass, hydration, protein intake, and training all move them. Draw under consistent conditions, retest before catastrophizing, manage blood pressure and NSAID exposure, and escalate when trends persist or symptoms appear. Kidney health on cycle is mostly about indirect stressors — not a mysterious gear side effect you cannot influence.",
      },
    ],
  },
];