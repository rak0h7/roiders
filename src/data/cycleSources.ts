export type SourceContactKind = "telegram" | "whatsapp" | "email" | "url";

export type SourceContact = {
  label: string;
  value: string;
  href: string;
  kind: SourceContactKind;
};

export type CycleSource = {
  id: string;
  name: string;
  subtitle?: string;
  contacts: SourceContact[];
  notes?: string[];
};

function wa(digits: string): string {
  return `https://wa.me/${digits.replace(/\D/g, "")}`;
}

export const CYCLE_SOURCES: CycleSource[] = [
  {
    id: "wwb",
    name: "Wansheng Biotechnology (WWB)",
    subtitle: "WWB official rep",
    contacts: [
      { kind: "telegram", label: "Telegram", value: "@Cavan221", href: "https://t.me/Cavan221" },
      { kind: "whatsapp", label: "WhatsApp (Cavan)", value: "+1 (840) 220 7435", href: wa("18402207435") },
      { kind: "whatsapp", label: "WhatsApp (Cavan No. 2)", value: "+1 (614) 390 8060", href: wa("16143908060") },
      { kind: "whatsapp", label: "WhatsApp (Gary)", value: "+1 (912) 996 6694", href: wa("19129966694") },
      { kind: "whatsapp", label: "WhatsApp (Gary No. 2)", value: "+34 685 7157 02", href: wa("34685715702") },
      { kind: "whatsapp", label: "WhatsApp (Harlan)", value: "+1 (912) 577 6269", href: wa("19125776269") },
      { kind: "whatsapp", label: "WhatsApp (Tom)", value: "+1 (904) 343 6763", href: wa("19043436763") },
      { kind: "whatsapp", label: "WhatsApp (Daisy)", value: "+44 7928 317187", href: wa("447928317187") },
      { kind: "whatsapp", label: "WhatsApp (Angel)", value: "+1 (716) 228 9214", href: wa("17162289214") },
      { kind: "whatsapp", label: "WhatsApp (Angel No. 2)", value: "+1 (702) 245 7124", href: wa("17022457124") },
      {
        kind: "email",
        label: "Identity verification",
        value: "wslabus@gmail.com",
        href: "mailto:wslabus@gmail.com",
      },
    ],
    notes: [
      "WWB is not a group or website. Any groups claiming to be WWB are fake.",
      "Do not message multiple reps at the same time. Send one message and wait patiently for a reply.",
    ],
  },
  {
    id: "pct-zone",
    name: "PCT.ZONE",
    subtitle: "USA / EU / UK / INT generic pharma",
    contacts: [{ kind: "url", label: "Website", value: "pct.zone", href: "https://pct.zone" }],
  },
  {
    id: "ruo-bio",
    name: "ruo.bio",
    contacts: [{ kind: "url", label: "Website", value: "ruo.bio", href: "https://ruo.bio" }],
  },
  {
    id: "algorx",
    name: "ALGORX",
    subtitle: "Online telehealth · bloodwork panels · TRT",
    contacts: [{ kind: "url", label: "Website", value: "algorx.ai", href: "https://algorx.ai/" }],
    notes: [
      "Online telehealth clinic with pre-made bloodwork panels and online TRT.",
    ],
  },
  {
    id: "opti-usa",
    name: "Opti USA DOMESTIC",
    subtitle: "HGH · injectables · tablets · peptides · misc",
    contacts: [{ kind: "url", label: "Website", value: "optiusa.io", href: "https://optiusa.io" }],
  },
  {
    id: "nexus-pharma",
    name: "Nexus Pharma",
    contacts: [{ kind: "url", label: "Website", value: "nexuspharma.to", href: "https://nexuspharma.to/" }],
  },
];