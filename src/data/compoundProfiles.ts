import { COMPOUNDS, type CompoundCategory } from "@/data/compounds";
import type { CompoundProfile } from "@/lib/compoundProfileTypes";
import { OMA_COMPOUND_PROFILES } from "@/data/omaCompoundProfiles";
import { OMA_COMPOUNDS } from "@/data/omaCompounds";

const STEROID_GUIDE_PROFILES: CompoundProfile[] = [
  {
    id: "core-concepts",
    title: "Steroid Family Tree",
    route: "concept",
    tagline: "How injectables and orals group up by structure — and what that means for sides and bloodwork.",
    compoundIds: [],
    sections: [
      {
        heading: "Testosterone Derivatives",
        body: "These convert to estrogen through aromatase. Most can also be 5-alpha reduced into DHT, which drives androgenic effects like hair loss and prostate activity.",
      },
      {
        heading: "Dihydrotestosterone (DHT) Derivatives",
        body: "Generally do not aromatize and usually cannot be 5-alpha reduced further (Boldenone is a small exception — trace conversion to DHB). Several in this family act mildly anti-estrogenic on their own, including Primobolan and EQ.",
      },
      {
        heading: "19-Nortestosterone (Nandrolone) Derivatives",
        body: "Convert to a very weak estrogen. 5-alpha reduction yields a much less androgenic metabolite (nandrolone → DHN). They carry progestogenic activity, which can raise prolactin and make you more sensitive to estrogen-driven gyno.",
      },
    ],
  },
  {
    id: "testosterone",
    title: "Testosterone",
    aliases: ["Test E", "Test C", "Test P", "Sustanon"],
    route: "injectable",
    tagline: "The baseline anabolic — everything else gets compared back to this.",
    compoundIds: ["test-e", "test-c", "test-p", "test-sus", "test-trt", "test-tne"],
    sections: [
      {
        heading: "How to Use / Receptors",
        body: "Classic AAS. Hits androgen receptors (AR) throughout the body. It is the primary male sex hormone and the reference point for potency and side-effect profiles.",
      },
      { heading: "Aromatization?", body: "Yes — it is the main feedstock for aromatase, which turns it into estradiol (E2). How much converts varies a lot person to person; body fat tends to push conversion up." },
      {
        heading: "Blood Markers Impacted",
        blocks: [
          { heading: "Hormones", body: "Suppresses LH and FSH hard, shutting down natural production. Drops SHBG, which bumps free testosterone, estradiol, and DHT on paper." },
          { heading: "Lipids", body: "Usually nudges LDL up and HDL down." },
          { heading: "Cardiovascular", body: "Often raises hematocrit (red blood cells) — keep an eye on CBC. Blood pressure can climb too, partly through estrogen." },
          { heading: "Other", body: "Injectable test rarely moves liver enzymes much; PSA can tick up." },
          { heading: "TSH", body: "Most AAS pull TSH down; test does it clearly, which can make free T4/T3 look higher on labs even if you feel fine." },
          { heading: "DHEA/Pregnanolone", body: "Long runs (including TRT) can drain neurosteroids like DHEA and pregnenolone — sometimes linked to flat libido. HCG or low-dose DHEA/pregnenolone helps some guys." },
        ],
      },
      {
        heading: "Dosage Ranges",
        list: [
          "TRT / replacement: 70 – 250 mg/week",
          "First cycle: 300 – 500 mg/week",
          "Intermediate / advanced: 500 – 1000+ mg/week",
        ],
      },
      { heading: "General Safety Profile", body: "The most studied AAS by a mile. Nearly every cycle uses it as a base. Risk scales with dose — low TRT is different from a gram blast." },
      {
        heading: "Odd/Unique Effects",
        list: [
          "Other compounds are usually rated against testosterone as the reference.",
          "Ester choice (enanthate, cypionate, propionate, sustanon) only changes release speed — not the core effect profile. Enanthate works for most people; daily prop can feel smoother.",
          "At high doses, cypionate clearance can be rate-limited, so serum levels may land lower than enanthate at the same mg/week.",
        ],
      },
    ],
  },
  {
    id: "boldenone",
    title: "Boldenone (Equipoise / EQ)",
    route: "injectable",
    tagline: "Slow, steady compound — endurance, appetite, and vascularity over time.",
    compoundIds: ["eq", "eq-c", "eq-a"],
    sections: [
      { heading: "How to Use / Receptors", body: "Testosterone-family compound that binds AR. The long undecylenate ester takes weeks to fully saturate — plan long cycles (16–20+ weeks) or start it from day one." },
      { heading: "Aromatization?", body: "Technically yes, but weakly — mostly toward estrone rather than estradiol. Some metabolites behave like mild aromatase inhibitors, so E2 often drops when EQ is run 1:1 with test." },
      {
        heading: "Blood Markers Impacted",
        blocks: [
          { heading: "Cardiovascular", body: "Famous for pushing hematocrit and RBC up. Lipids can take a hit too." },
          { heading: "Hormones", body: "Many users see estrogen trend downward on EQ." },
        ],
      },
      { heading: "Dosage Ranges", list: ["Beginner / intermediate: 200 – 600 mg/week", "Advanced: 600 – 1000 mg/week"] },
      { heading: "General Safety Profile", body: "Often called mild, but the hematocrit rise is a real cardiovascular concern — monitor CBC. Some guys add low-dose aspirin; kidney protection (e.g. SGLT2s) comes up in longer runs." },
      { heading: "Odd/Unique Effects", list: ["Hunger usually goes up noticeably.", "Gains tend to be hard and vascular but slow to show.", "Short cycles under ~12 weeks rarely get the full payoff from the long ester."] },
      { heading: "Deep dives", body: "Articles: boldenone-mechanism-dosing (Part 1 — RBC, esters, dosing) and boldenone-estrogen-bloodwork (Part 2 — estrogen paradox, labs, harm reduction)." },
    ],
  },
  {
    id: "dhb",
    title: "DHB (Dihydroboldenone)",
    route: "injectable",
    tagline: "Boldenone's 5-alpha reduced cousin — strong on paper, rough in practice.",
    compoundIds: ["dhb"],
    sections: [
      { heading: "Aromatization?", body: "No." },
      { heading: "5-alpha Reduction?", body: "No — it is already 5-alpha reduced." },
      { heading: "Practical take", body: "High PIP, middling payoff, and plenty of easier options exist. Most people are better off skipping it unless you already know you respond well." },
      {
        heading: "Blood Markers Impacted",
        blocks: [
          { heading: "Hormones", body: "Suppresses natural testosterone. No estrogen conversion." },
          { heading: "Lipids", body: "Likely hurts cholesterol (LDL up, HDL down), though maybe a bit less than harsher AAS." },
          { heading: "Cardiovascular", body: "Blood pressure can creep up mildly." },
          { heading: "Other", body: "Some report liver stress (possibly carrier-related). Prostate load can resemble short-ester test." },
        ],
      },
      { heading: "Dosage Ranges", list: ["300 – 1000+ mg/week"] },
      { heading: "General Safety Profile", body: "Anabolic on paper with relatively quiet sides aside from low-estrogen symptoms and brutal post-injection pain. GSO brews often hurt less than other carriers." },
      { heading: "Odd/Unique Effects", body: "Think primo without the 1-methyl group — so it does not work orally. Structurally it mirrors the boldenone → DHB relationship that testosterone has with DHT." },
    ],
  },
  {
    id: "nandrolone",
    title: "Nandrolone (Deca / NPP)",
    route: "injectable",
    tagline: "Joint-friendly bulk builder with a long list of hormonal caveats.",
    compoundIds: ["deca", "deca-d", "npp"],
    sections: [
      { heading: "How to Use / Receptors", body: "19-nor derivative with solid AR binding plus real progestogenic activity." },
      { heading: "Aromatization?", body: "Very little — do not assume low E2 means you are in the clear." },
      {
        heading: "Blood Markers Impacted",
        blocks: [
          { heading: "Lipids", body: "Typically worsens cholesterol." },
          { heading: "Cardiovascular", body: "Can raise blood pressure." },
          { heading: "Hormones", body: "Prolactin can climb, especially with higher estrogen — classic deca dick territory." },
        ],
      },
      { heading: "Dosage Ranges", list: ["Deca (long ester): 400 – 1000 mg/week", "NPP (short ester): 200 – 500 mg/week"] },
      { heading: "General Safety Profile", body: "Easy on the liver for an injectable, but prolactin, lipids, and long-term cardiac changes (worse with GH in the mix) are genuine concerns. Not something I would recommend casually." },
      {
        heading: "Odd/Unique Effects",
        list: [
          "Joint comfort and lubrication are the main reason people run it (evidence is largely anecdotal).",
          "Water retention can show up at higher doses.",
          "Finasteride or dutasteride can paradoxically worsen hair loss with nandrolone.",
          "Very suppressive with a long decanoate tail — PCT is a grind.",
        ],
      },
      { heading: "Deep dives", body: "Articles: nandrolone-in-bodybuilding (lean mass data from bodybuilder trials, real-world stacking, product quality, harms, and research gaps)." },
    ],
  },
  {
    id: "trenbolone",
    title: "Trenbolone (Tren)",
    route: "injectable",
    tagline: "Maximum recomp power with maximum collateral damage if you are not careful.",
    compoundIds: ["tren-a", "tren-e"],
    sections: [
      { heading: "How to Use / Receptors", body: "19-nor with off-the-charts AR affinity and strong progestogenic action." },
      { heading: "Aromatization?", body: "No direct aromatization — gyno risk still exists through prolactin and progesterone pathways." },
      { heading: "Blood Markers Impacted", body: "Hits almost everything: HDL tanks, blood pressure and heart rate jump, kidneys and liver take strain." },
      { heading: "Dosage Ranges", list: ["Conservative: 30 – 75 mg/week", "Experienced: 75 – 300 mg/week", "500+ mg/week: rarely worth the damage"] },
      { heading: "General Safety Profile", body: "Poor overall safety margin — cardiovascular, lipid, and neurological sides stack fast. Some data suggests accelerated amyloid buildup with heavy use." },
      {
        heading: "Odd/Unique Effects",
        list: [
          "Tren cough right after the pin.",
          "Night sweats, insomnia, anxiety — the usual tren brain package.",
          "Cardio endurance often falls off a cliff.",
          "Mood swings, jealousy, and unpredictable libido.",
          "Strong bump to IGF-1 and satellite-cell activity.",
        ],
      },
      { heading: "Recommended Support", body: "Sleep hygiene (melatonin if needed), cardio support (cardarine/PPAR agonists where legal), NAC or glutathione, anti-inflammatory diet, thyroid labs if energy crashes." },
      { heading: "Deep dives", body: "Articles: trenbolone-mechanism-dosing (Part 1 — mechanism, esters, low-dose philosophy) and trenbolone-harm-reduction (Part 2 — prolactin ladder, sleep/neuro tiers)." },
    ],
  },
  {
    id: "yk11",
    title: "YK11",
    aliases: ["YK-11"],
    route: "injectable",
    tagline: "Partial AR agonist / steroidal SARM — partitioning hype with a serious CNS liability and no human safety data.",
    compoundIds: ["yk11"],
    sections: [
      { heading: "How to Use / Receptors", body: "Steroidal selective androgen receptor modulator (SARM) marketed as a myostatin inhibitor. Acts as a partial AR agonist — binds the receptor, can displace DHT, but activates downstream signaling weakly. Experience reports flag heavy hypothalamic/CNS AR binding; not a full androgen like testosterone or tren." },
      { heading: "Aromatization?", body: "No aromatization pathway described in available literature." },
      { heading: "Blood Markers Impacted", body: "Endogenous testosterone suppression is expected. Lipid/HDL risk is plausible but poorly characterized in humans. Preclinical rat data show hippocampal oxidative stress and neuroinflammation — functional markers (sleep, irritability, headache, cognition) may matter as much as standard labs." },
      { heading: "Dosage Ranges", list: ["Reported floor: 10 mg/day (injectable)", "Reported ceiling: 50 mg/day", "Titrate +10 mg only after a plateau — experience reports only, not clinical guidance"] },
      { heading: "General Safety Profile", body: "No human efficacy or safety trials. Rat studies at anabolic-equivalent exposures show mitochondrial dysfunction, BDNF/TrkB/CREB downregulation, neuroinflammation, and impaired memory consolidation. Megadose anecdotes (100–200 mg/day; gram single-day exposures) describe severe CNS intolerance and multi-day recovery — treat as documented failure modes, not exploration targets." },
      {
        heading: "Odd/Unique Effects",
        list: [
          "Nutrient partitioning / caloric flexibility at maintenance — myostatin-inhibition theory, not established human outcome",
          "Not a site-enhancement compound",
          "Transient irritability 1–2 hours post-injection reported",
          "Pinning not required pre-workout — not an injectable-oral timing drug",
          "DHT displacement: knocks DHT off AR in brain and peripheral tissue, activates weakly — CNS downside is the main concern",
        ],
      },
      { heading: "Deep dives", body: "Article: yk11-mechanism-dosing — mechanism, injectable framing, CNS safety, and literature touchpoints." },
    ],
  },
  {
    id: "masteron",
    title: "Masteron (Drostanolone)",
    route: "injectable",
    tagline: "Cosmetic hardener and mild anti-estrogen — not a mass builder at sane doses.",
    compoundIds: ["mast-e", "mast-p"],
    sections: [
      { heading: "How to Use / Receptors", body: "DHT derivative with AR binding. Anabolic effect is modest until you push toward ~1 g/week." },
      { heading: "Aromatization?", body: "No. Acts a bit like a SERM at the receptor level — limits estrogenic symptoms without always dropping serum E2." },
      {
        heading: "Blood Markers Impacted",
        blocks: [
          { heading: "Lipids", body: "Can still ding cholesterol." },
          { heading: "Hormones", body: "Often feels anti-estrogenic in practice." },
        ],
      },
      { heading: "Dosage Ranges", body: "All over the map — many run it 1:1 with testosterone for look, not size." },
      { heading: "General Safety Profile", body: "Organs usually tolerate it fine; hairline and skin androgenicity are the main complaints." },
      {
        heading: "Odd/Unique Effects",
        list: [
          "Dry, hard, vascular look when you are already lean.",
          "5-AR inhibitors will not save your hair — it is already DHT-shaped.",
          "Shows best under ~12% body fat.",
          "Can shift mineral balance and reduce water retention.",
        ],
      },
    ],
  },
  {
    id: "primobolan",
    title: "Primobolan (Methenolone)",
    route: "injectable",
    tagline: "Mild, expensive, and usually easy on bloodwork — lean gains without the bloat.",
    compoundIds: ["primo-e"],
    sections: [
      { heading: "How to Use / Receptors", body: "DHT-family injectable with straightforward AR activity." },
      { heading: "Aromatization?", body: "No. Metabolites can pull serum E2 down — often 25–50% when run 1:1 with testosterone." },
      { heading: "Blood Markers Impacted", body: "Among the gentlest AAS on lipids, liver, and general labs at moderate doses." },
      { heading: "Dosage Ranges", list: ["Men (injectable): 200 – 1000 mg/week"] },
      { heading: "Note", body: "Roughly as anabolic as testosterone mg-for-mg. A 1:1 test ratio often looks better and needs less AI." },
      { heading: "General Safety Profile", body: "Excellent track record for tolerability — downside is cost and counterfeit risk." },
      { heading: "Odd/Unique Effects", list: ["Slow, clean lean tissue with minimal water.", "Strength gains are modest.", "Popular for cruises and cutting blocks."] },
    ],
  },
  {
    id: "ment",
    title: "Ment (Trestolone)",
    route: "injectable",
    tagline: "Potent 19-nor studied for male contraception — not beginner-friendly.",
    compoundIds: ["ment"],
    sections: [
      { heading: "How to Use / Receptors", body: "Synthetic 19-nor with high AR potency and heavy progestogenic signaling." },
      { heading: "Aromatization?", body: "No classic aromatization, but it can form a potent methyl-estrogen through other paths — aromasin-style AIs may not behave like they do on test." },
      {
        heading: "Blood Markers Impacted",
        blocks: [
          { heading: "Cardiovascular", body: "Blood pressure often rises noticeably." },
          { heading: "Lipids", body: "Typical AAS lipid pattern." },
          { heading: "Hormones", body: "Extremely suppressive to natural production." },
        ],
      },
      { heading: "Dosage Ranges", list: ["Low: 10 – 40 mg/week", "Moderate: 35 – 140 mg/week", "High: 140+ mg/week"] },
      { heading: "General Safety Profile", body: "Powerful but thin long-term human data. Side management is tricky because estrogen and progesterone pathways both light up." },
      { heading: "Odd/Unique Effects", list: ["Gyno risk is high even without aromatizing like test.", "Feels neurotoxic for some guys without a test base.", "Crushes fertility and HPTA recovery."] },
    ],
  },
  {
    id: "anadrol",
    title: "Anadrol (Oxymetholone)",
    route: "oral",
    tagline: "Fast mass and strength — also fast liver and blood pressure stress.",
    compoundIds: ["anadrol"],
    sections: [
      { heading: "How to Use / Receptors", body: "Oral DHT derivative with AR activity plus non-AR mechanisms that add to the punch." },
      { heading: "Aromatization?", body: "Does not aromatize like test, but still drives estrogenic sides (water, gyno) through other routes — treat it like it can bloat you." },
      {
        heading: "Blood Markers Impacted",
        blocks: [
          { heading: "Liver", body: "Very hepatotoxic — ALT/AST can spike hard." },
          { heading: "Cardiovascular", body: "Blood pressure and lipids both get hammered." },
          { heading: "Other", body: "RBC/hematocrit can jump significantly." },
        ],
      },
      { heading: "Dosage Ranges", list: ["25 – 150 mg/day (4–8 weeks max; past 150 mg/day gains usually flatten)"] },
      { heading: "General Safety Profile", body: "Harsh oral — short runs, real liver support (TUDCA/NAC), and frequent labs." },
      { heading: "Odd/Unique Effects", list: ["Strength and scale weight move quickly — much of it is water and glycogen.", "Appetite and gut comfort can actually get worse for some users."] },
    ],
  },
  {
    id: "cheque-drops",
    title: "Cheque Drops (Mibolerone)",
    route: "oral",
    tagline: "Micro-dose pre-fight androgen — not a muscle-building tool.",
    compoundIds: [],
    sections: [
      { heading: "How to Use / Receptors", body: "17α-alkylated 7α-methyl nandrolone analog. Extremely AR-active with very little SHBG binding." },
      { heading: "Aromatization?", body: "No." },
      { heading: "Progestogenic?", body: "Yes." },
      { heading: "5-alpha Reduction?", body: "No." },
      {
        heading: "Blood Markers Impacted",
        blocks: [
          { heading: "Liver", body: "Acute liver failure risk at misuse doses." },
          { heading: "Lipids", body: "Severe negative shift." },
          { heading: "Cardiovascular", body: "Blood pressure can spike quickly." },
        ],
      },
      { heading: "Dosage Ranges", list: ["200–250 mcg/day sublingually (1–2 weeks max, event-only)"] },
      { heading: "General Safety Profile", body: "Only makes sense for very short, event-specific use. Terrible choice for hypertrophy goals." },
      { heading: "Odd/Unique Effects", list: ["Sharp aggression and focus — onset ~30 minutes, wears off in a few hours.", "Originally a veterinary estrus suppressant, not designed for human physique use."] },
    ],
  },
  {
    id: "anavar",
    title: "Anavar (Oxandrolone)",
    route: "oral",
    tagline: "Milder oral for hardness and fat loss — still rough on HDL.",
    compoundIds: ["anavar"],
    sections: [
      { heading: "How to Use / Receptors", body: "Oral DHT derivative with standard AR binding." },
      { heading: "Aromatization?", body: "No. Drops SHBG sharply, which can change how free hormones read on labs." },
      {
        heading: "Blood Markers Impacted",
        blocks: [
          { heading: "Lipids", body: "HDL often gets crushed — one of the harsher orals on lipids despite the mild reputation." },
          { heading: "Liver", body: "Hepatotoxic, but usually lighter than superdrol or halo." },
        ],
      },
      { heading: "Dosage Ranges", list: ["25 – 80 mg/day (6–8 weeks). 25 mg/day works for many people."] },
      { heading: "General Safety Profile", body: "Safer than most orals, but lipid damage is still real — plan bloodwork." },
      { heading: "Odd/Unique Effects", list: ["Low water retention — clean, tight look.", "Helps midsection fat loss for a lot of users.", "Pumps can get painful and limit training.", "Relatively kinder to hair than many DHT orals."] },
    ],
  },
  {
    id: "winstrol",
    title: "Winstrol (Stanozolol)",
    route: "oral",
    tagline: "Contest dryness — at the cost of joints, lipids, and tendons.",
    compoundIds: ["winstrol", "winstrol-inj"],
    sections: [
      { heading: "How to Use / Receptors", body: "DHT derivative — oral or injectable suspension, same core profile." },
      { heading: "Aromatization?", body: "No." },
      {
        heading: "Blood Markers Impacted",
        blocks: [
          { heading: "Lipids", body: "Very hard on HDL and overall cholesterol." },
          { heading: "Liver", body: "Hepatotoxic — 17α-alkylated." },
          { heading: "Other", body: "Tendon brittleness and joint dryness are common complaints." },
        ],
      },
      { heading: "Dosage Ranges", list: ["25–100 mg/day oral, or ~50 mg EOD injectable."] },
      { heading: "General Safety Profile", body: "Best reserved for short prep phases — lipids and connective tissue need respect." },
      { heading: "Odd/Unique Effects", list: ["Very dry, grainy look when lean.", "Joint pain and painful pumps are frequent.", "Pulls water out — muscles can feel flat or tight."] },
    ],
  },
  {
    id: "dianabol",
    title: "Dianabol (Methandrostenolone)",
    route: "oral",
    tagline: "Old-school kickstart oral — fast size, fast water, fast estrogen.",
    compoundIds: ["dbol"],
    sections: [
      { heading: "How to Use / Receptors", body: "Oral testosterone derivative with strong AR activity." },
      { heading: "Aromatization?", body: "Yes — converts heavily to methyl-estradiol, so AI planning matters." },
      {
        heading: "Blood Markers Impacted",
        blocks: [
          { heading: "Liver", body: "Moderately hepatotoxic." },
          { heading: "Estrogen", body: "High water retention and gyno risk." },
          { heading: "Blood Pressure", body: "Can rise quickly from water and estrogen." },
        ],
      },
      { heading: "Dosage Ranges", list: ["25 – 50 mg/day."] },
      { heading: "General Safety Profile", body: "Rough on estrogen management and liver — usually a short front-load, not a marathon oral." },
      { heading: "Odd/Unique Effects", list: ["Weight and strength jump fast — much of it is glycogen and water.", "Classic puffy, full look."] },
    ],
  },
  {
    id: "halotestin",
    title: "Halotestin (Fluoxymesterone)",
    route: "oral",
    tagline: "Strength and aggression oral — brutal on liver and blood pressure.",
    compoundIds: ["halo"],
    sections: [
      { heading: "How to Use / Receptors", body: "Oral test derivative with high AR binding — built for androgenic punch, not lean mass." },
      { heading: "Aromatization?", body: "No." },
      {
        heading: "Blood Markers Impacted",
        blocks: [
          { heading: "Liver", body: "Among the most hepatotoxic orals." },
          { heading: "Lipids", body: "Very unfavorable shift." },
          { heading: "Blood Pressure", body: "Can spike to dangerous territory quickly." },
        ],
      },
      { heading: "Dosage Ranges", list: ["10 – 50 mg/day (2–4 weeks max)."] },
      { heading: "General Safety Profile", body: "Poor margin for error — aggressive liver support and short duration only." },
      { heading: "Odd/Unique Effects", list: ["Strength and aggression surge without much hypertrophy.", "Dense, hard look on stage.", "Irritability and mood volatility are common — plan accordingly."] },
    ],
  },
  {
    id: "turinabol",
    title: "Turinabol (Tbol)",
    route: "oral",
    tagline: "Middle-ground oral — drier than dbol, gentler than var on lipids (still not free).",
    compoundIds: ["turinabol"],
    sections: [
      { heading: "How to Use / Receptors", body: "Chlorinated dianabol analog — AR-mediated gains without aromatization." },
      { heading: "Aromatization?", body: "No." },
      {
        heading: "Blood Markers Impacted",
        blocks: [
          { heading: "Liver", body: "Hepatotoxic, but typically lighter than dbol or sdrol." },
          { heading: "Lipids", body: "HDL drops, though often less than anavar at similar doses." },
        ],
      },
      { heading: "Dosage Ranges", list: ["30 – 60 mg/day (6–8 weeks)."] },
      { heading: "General Safety Profile", body: "Middle of the oral pack — still needs liver support and lipid checks." },
      { heading: "Odd/Unique Effects", list: ["Steady lean gains without much water.", "Aldosterone synthase inhibition can cause cramps in some users."] },
    ],
  },
  {
    id: "superdrol",
    title: "Superdrol (Methyldrostanolone)",
    route: "oral",
    tagline: "Fast dry gains — double-methyl oral with a short runway.",
    compoundIds: ["sdrol"],
    sections: [
      { heading: "How to Use / Receptors", body: "Oral DHT derivative — often described as oral masteron, very AR-selective." },
      { heading: "Aromatization?", body: "No." },
      {
        heading: "Blood Markers Impacted",
        blocks: [
          { heading: "Liver", body: "Extremely hepatotoxic (C-17 and C-2 methyl groups)." },
          { heading: "Lipids", body: "HDL suppression is severe." },
          { heading: "Blood Pressure", body: "Often climbs noticeably." },
        ],
      },
      { heading: "Dosage Ranges", list: ["10 – 30 mg/day (3–4 weeks max; 2 weeks is safer for many)"] },
      { heading: "General Safety Profile", body: "Hard oral — lethargy and appetite crash are common. Treat it like a sprint, not a season." },
      { heading: "Odd/Unique Effects", list: ["Rapid dry strength and scale weight.", "Nickname killerdrol exists for a reason — respect the toxicity."] },
    ],
  },
  {
    id: "proviron",
    title: "Proviron (Mesterolone)",
    route: "oral",
    tagline: "Support oral — frees up testosterone, mild AI edge, cosmetic finish.",
    compoundIds: ["proviron"],
    sections: [
      { heading: "How to Use / Receptors", body: "Oral DHT analog that binds SHBG hard, bumping free testosterone on labs and in tissue." },
      { heading: "Aromatization?", body: "No — mild aromatase inhibition at useful doses." },
      { heading: "Blood Markers Impacted", body: "Quiet at low doses; high doses can still stress lipids." },
      { heading: "Dosage Ranges", list: ["25 – 100 mg/day."] },
      { heading: "General Safety Profile", body: "Not 17α-alkylated — liver-friendly. Main issues are androgenic: hair, skin, mood." },
      { heading: "Odd/Unique Effects", list: ["Not a mass builder on its own.", "Libido and mood often improve.", "May support bone density.", "Higher doses tighten look and vascularity pre-show."] },
    ],
  },
];

export const COMPOUND_PROFILES: CompoundProfile[] = [
  ...STEROID_GUIDE_PROFILES,
  ...OMA_COMPOUND_PROFILES,
];

const COMPOUND_CATEGORY_BY_ID = new Map<string, CompoundCategory>([
  ...OMA_COMPOUNDS.map((c) => [c.id, c.category] as const),
  ...COMPOUNDS.map((c) => [c.id, c.category] as const),
]);

const PROFILE_BY_ID = Object.fromEntries(COMPOUND_PROFILES.map((p) => [p.id, p]));
const PROFILE_BY_COMPOUND = new Map<string, CompoundProfile>();
for (const profile of COMPOUND_PROFILES) {
  for (const cid of profile.compoundIds) {
    PROFILE_BY_COMPOUND.set(cid, profile);
  }
}

export function getProfileById(id: string): CompoundProfile | undefined {
  return PROFILE_BY_ID[id];
}

export function getProfileForCompound(compoundId: string): CompoundProfile | undefined {
  return PROFILE_BY_COMPOUND.get(compoundId);
}

export function listInjectableProfiles(): CompoundProfile[] {
  return STEROID_GUIDE_PROFILES.filter((p) => p.route === "injectable");
}

export function listOralProfiles(): CompoundProfile[] {
  return STEROID_GUIDE_PROFILES.filter((p) => p.route === "oral");
}

export function listConceptProfiles(): CompoundProfile[] {
  return COMPOUND_PROFILES.filter((p) => p.route === "concept");
}

export function listGuideProfilesByCategory(category: CompoundCategory): CompoundProfile[] {
  return OMA_COMPOUND_PROFILES.filter((p) =>
    p.compoundIds.some((id) => COMPOUND_CATEGORY_BY_ID.get(id) === category)
  );
}