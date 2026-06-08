"use client";

import React, { useMemo, useState } from "react";

const races = ["Human", "Elf", "Fairy", "Feyling", "Furry", "Dwarf"];
const pathways = ["Warrior", "Mystic", "Shadow", "Nature"];

export default function LunariaRegistrationPage() {
  const [form, setForm] = useState({
    name: "",
    race: "Human",
    pathway: "Warrior",
    skill1: "",
    skill2: "",
    inventory1: "",
    inventory2: "",
    inventory3: "",
    notes: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const previewText = useMemo(() => {
    return `╔══════════════════════╗
* ADVENTURER'S GUILD LICENSE
╚══════════════════════╝
*Name :* ${form.name || "-"}
*Race :* ${form.race}
*Guild Rank :* INITIATE
*Pathway :* ${form.pathway}
*Misi :* Pending Registration
━━━━━━━━━━━━━━━━━━
*Primary Skills*
1. ${form.skill1 || "-"}
2. ${form.skill2 || "-"}
━━━━━━━━━━━━━━━━━━
*Inventory*
1. ${form.inventory1 || "-"}
2. ${form.inventory2 || "-"}
3. ${form.inventory3 || "-"}
━━━━━━━━━━━━━━━━━━
*Currency*
- Gold : 0
- Silver : 10
- Bronze : 0
━━━━━━━━━━━━━━━━━━
Registered Guild :
Adventurer's Guild of Aethelgard

Status :
Pending Approval`;
  }, [form]);

  const updateField = (
    key: keyof typeof form,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);

    setTimeout(() => {
      setSubmitted(false);
    }, 2500);
  };

  return (
    <main className="space-y-6 text-slate-100">
      <section className="rounded-[28px] border border-amber-500/20 bg-gradient-to-br from-black via-slate-950 to-violet-950/60 p-6 shadow-[0_0_45px_rgba(245,158,11,0.10)]">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-amber-300">
          New Adventurer Registry
        </p>

        <div className="mt-3 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h1 className="text-3xl font-black text-white md:text-4xl">
              Registration
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              Form pendaftaran karakter untuk masuk ke sistem Lunaria. Setelah
              submit, data akan masuk ke admin panel untuk approval dan
              pembuatan login code.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 px-5 py-3 text-sm font-bold uppercase tracking-[0.18em] text-amber-300">
            Default Rank: Initiate
          </div>
        </div>
      </section>

      {submitted ? (
        <section className="rounded-[24px] border border-emerald-400/25 bg-emerald-400/10 p-5 text-emerald-200 shadow-[0_0_30px_rgba(52,211,153,0.08)]">
          <p className="text-sm font-bold">
            Registration submitted. Status: Pending Admin Approval.
          </p>
        </section>
      ) : null}

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <form
          onSubmit={handleSubmit}
          className="xl:col-span-7 rounded-[32px] border border-white/10 bg-black/35 p-6 shadow-[0_0_45px_rgba(15,23,42,0.45)]"
        >
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.26em] text-amber-300">
              Character Information
            </p>
            <h2 className="mt-2 text-2xl font-black text-white">
              Adventurer Data
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Character Name">
              <input
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Example: Aether Veyl"
                className="lunaria-input"
                required
              />
            </Field>

            <Field label="Race">
              <select
                value={form.race}
                onChange={(e) => updateField("race", e.target.value)}
                className="lunaria-input"
              >
                {races.map((race) => (
                  <option key={race} value={race}>
                    {race}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Pathway">
              <select
                value={form.pathway}
                onChange={(e) => updateField("pathway", e.target.value)}
                className="lunaria-input"
              >
                {pathways.map((pathway) => (
                  <option key={pathway} value={pathway}>
                    {pathway}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Character Photo">
              <div className="flex h-[50px] items-center rounded-2xl border border-dashed border-amber-400/30 bg-black/25 px-4 text-sm text-slate-500">
                Upload photo will be connected later
              </div>
            </Field>
          </div>

          <div className="mt-6">
            <p className="mb-4 text-xs uppercase tracking-[0.26em] text-amber-300">
              Primary Skills
            </p>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Skill 1">
                <input
                  value={form.skill1}
                  onChange={(e) => updateField("skill1", e.target.value)}
                  placeholder="Example: Arcane Thread"
                  className="lunaria-input"
                  required
                />
              </Field>

              <Field label="Skill 2">
                <input
                  value={form.skill2}
                  onChange={(e) => updateField("skill2", e.target.value)}
                  placeholder="Example: Silent Ember"
                  className="lunaria-input"
                  required
                />
              </Field>
            </div>
          </div>

          <div className="mt-6">
            <p className="mb-4 text-xs uppercase tracking-[0.26em] text-amber-300">
              Starting Inventory
            </p>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Field label="Inventory 1">
                <input
                  value={form.inventory1}
                  onChange={(e) => updateField("inventory1", e.target.value)}
                  placeholder="Item 1"
                  className="lunaria-input"
                />
              </Field>

              <Field label="Inventory 2">
                <input
                  value={form.inventory2}
                  onChange={(e) => updateField("inventory2", e.target.value)}
                  placeholder="Item 2"
                  className="lunaria-input"
                />
              </Field>

              <Field label="Inventory 3">
                <input
                  value={form.inventory3}
                  onChange={(e) => updateField("inventory3", e.target.value)}
                  placeholder="Item 3"
                  className="lunaria-input"
                />
              </Field>
            </div>
          </div>

          <div className="mt-6">
            <Field label="Admin Notes / Character Notes">
              <textarea
                value={form.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                placeholder="Optional notes for admin approval..."
                className="lunaria-input min-h-[130px] resize-none py-4"
              />
            </Field>
          </div>

          <div className="mt-6 rounded-3xl border border-amber-400/20 bg-amber-500/10 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-amber-300">
              Registration Rule
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Player belum bisa login setelah registrasi. Admin harus approve
              data dulu, lalu sistem akan membuat access code untuk login.
            </p>
          </div>

          <button
            type="submit"
            className="mt-6 w-full rounded-2xl border border-amber-400/30 bg-gradient-to-r from-amber-600/30 via-amber-500/20 to-violet-600/20 px-5 py-4 text-sm font-black uppercase tracking-[0.22em] text-amber-200 shadow-[0_0_28px_rgba(245,158,11,0.10)] transition hover:border-amber-300/50 hover:bg-amber-500/20"
          >
            Submit Registration
          </button>
        </form>

        <aside className="xl:col-span-5">
          <div className="sticky top-24 rounded-[32px] border border-amber-400/25 bg-[#070812] p-5 shadow-[0_0_50px_rgba(245,158,11,0.12)]">
            <div className="rounded-[26px] border border-amber-400/20 bg-black/35 p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-amber-300">
                Live ID Card Preview
              </p>

              <div className="mt-5 flex flex-col items-center text-center">
                <div className="flex h-28 w-28 items-center justify-center rounded-[28px] border border-amber-400/30 bg-gradient-to-br from-slate-900 via-black to-violet-950 text-4xl">
                  🧙
                </div>

                <h2 className="mt-5 text-2xl font-black text-white">
                  {form.name || "Unnamed Adventurer"}
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  {form.race} • {form.pathway}
                </p>

                <div className="mt-4 flex flex-wrap justify-center gap-3">
                  <span className="rounded-full border border-slate-400/30 bg-slate-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-200">
                    Initiate
                  </span>

                  <span className="rounded-full border border-violet-400/30 bg-violet-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-violet-200">
                    {form.pathway}
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <CurrencyBox label="Gold" value="0" color="text-amber-300" />
                <CurrencyBox label="Silver" value="10" color="text-slate-200" />
                <CurrencyBox label="Bronze" value="0" color="text-orange-300" />
              </div>

              <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-center">
                <p className="text-xs uppercase tracking-[0.22em] text-emerald-300">
                  Pending Approval
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-amber-300">
                WhatsApp Copy Preview
              </p>

              <pre className="mt-4 max-h-[420px] overflow-auto whitespace-pre-wrap rounded-2xl border border-white/10 bg-black/35 p-4 text-xs leading-5 text-slate-300">
                {previewText}
              </pre>
            </div>
          </div>
        </aside>
      </section>

      <style jsx>{`
        .lunaria-input {
          width: 100%;
          border-radius: 1rem;
          border: 1px solid rgba(245, 158, 11, 0.18);
          background: rgba(0, 0, 0, 0.28);
          padding: 0.85rem 1rem;
          color: rgb(241, 245, 249);
          outline: none;
          transition: 180ms ease;
        }

        .lunaria-input::placeholder {
          color: rgb(100, 116, 139);
        }

        .lunaria-input:focus {
          border-color: rgba(245, 158, 11, 0.45);
          box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
        }

        select.lunaria-input option {
          background: #070812;
          color: white;
        }
      `}</style>
    </main>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function CurrencyBox({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-center">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-black ${color}`}>{value}</p>
    </div>
  );
}
