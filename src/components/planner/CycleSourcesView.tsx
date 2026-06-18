"use client";

import { CYCLE_SOURCES, type SourceContact } from "@/data/cycleSources";
import { Panel } from "@/components/ui/Panel";
import { ui } from "@/lib/ui";
import { cn } from "@/lib/utils";
import { AlertTriangle, ExternalLink, Link2, Mail, MessageCircle, Send } from "lucide-react";

function contactIcon(kind: SourceContact["kind"]) {
  switch (kind) {
    case "telegram":
      return Send;
    case "whatsapp":
      return MessageCircle;
    case "email":
      return Mail;
    default:
      return ExternalLink;
  }
}

function ContactRow({ contact }: { contact: SourceContact }) {
  const Icon = contactIcon(contact.kind);
  return (
    <a
      href={contact.href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        ui.cardInner,
        "flex items-center justify-between gap-3 px-3 py-2.5 transition hover:border-[var(--protocol)]/35 hover:bg-[var(--bg-hover)]"
      )}
    >
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--muted)]">{contact.label}</p>
        <p className="truncate text-sm text-[var(--foreground)]">{contact.value}</p>
      </div>
      <Icon className="h-4 w-4 shrink-0 text-[var(--protocol)]" />
    </a>
  );
}

export function CycleSourcesView() {
  return (
    <div className="space-y-4">
      <Panel className={ui.cardPad}>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--protocol)]/30 bg-[var(--protocol-dim)]">
            <Link2 className="h-5 w-5 text-[var(--protocol)]" />
          </div>
          <div>
            <h2 className={ui.sectionTitle}>Verified sources</h2>
            <p className={ui.sectionSub}>
              Official contact channels and suppliers. Premium access only — treat rep contacts respectfully.
            </p>
          </div>
        </div>
      </Panel>

      {CYCLE_SOURCES.map((source) => (
        <Panel key={source.id} className={ui.cardPad}>
          <div className="mb-4">
            <h3 className="font-display text-base font-semibold text-[var(--foreground)]">{source.name}</h3>
            {source.subtitle ? <p className="mt-0.5 text-xs text-[var(--muted)]">{source.subtitle}</p> : null}
          </div>

          <div className="space-y-2">
            {source.contacts.map((contact) => (
              <ContactRow key={`${source.id}-${contact.label}-${contact.value}`} contact={contact} />
            ))}
          </div>

          {source.notes?.length ? (
            <div className="mt-4 space-y-2 rounded-[var(--radius-md)] border border-[var(--warning)]/25 bg-[var(--warning)]/5 p-3">
              {source.notes.map((note) => (
                <p key={note} className="flex items-start gap-2 text-xs leading-relaxed text-[var(--muted)]">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--warning)]" />
                  <span>{note}</span>
                </p>
              ))}
            </div>
          ) : null}
        </Panel>
      ))}
    </div>
  );
}