import React from "react";

const quickStart = [
  {
    title: "1. Login",
    desc: "Masuk memakai access code yang diberikan admin. Jangan bagikan access code ke player lain.",
  },
  {
    title: "2. Cek ID Card",
    desc: "Buka ID Card untuk melihat rank, pathway, currency, inventory, quest record, dan prestige.",
  },
  {
    title: "3. Ikuti Quest / Event",
    desc: "Quest dan event menjadi sumber utama perkembangan karakter, currency, reward, dan peluang mendapat Familiar Signal.",
  },
  {
    title: "4. Rawat Familiar",
    desc: "Jika sudah memiliki familiar, rawat mood, energy, dan bond XP agar familiar tumbuh dan berevolusi.",
  },
];

const guideSections = [
  {
    eyebrow: "Core Feature",
    title: "ID Card",
    body: "ID Card adalah identitas utama karakter. Semua data penting seperti rank, pathway, currency, skill, inventory, dan quest record akan terlihat di sini.",
    points: [
      "Currency memakai sistem resmi: 1 Gold = 1000 Silver, 1 Silver = 100 Bronze.",
      "Quest record akan memengaruhi prestige dan leaderboard.",
      "Data ID Card dapat diperbarui oleh admin setelah quest / event selesai.",
    ],
  },
  {
    eyebrow: "Familiar System",
    title: "Moon Familiar",
    body: "Familiar adalah companion hidup yang memiliki mood, energy, bond, memory, personality, dan stage. Mereka bukan sekadar pet, tetapi partner kecil yang ikut berkembang bersama owner.",
    points: [
      "Mood menunjukkan keadaan emosional familiar.",
      "Energy menunjukkan stamina familiar.",
      "Bond XP menunjukkan kedekatan familiar dengan owner.",
      "Stage familiar dapat naik ketika bond XP mencapai batas tertentu.",
    ],
  },
  {
    eyebrow: "Discovery",
    title: "Familiar Encounter",
    body: "Familiar tidak langsung muncul begitu saja. Player perlu mendapatkan Familiar Signal dari quest, event, atau keputusan admin.",
    points: [
      "Jika mendapat Familiar Signal, buka halaman Familiar Encounter.",
      "Baca bonding task yang muncul.",
      "Tulis bonding report sesuai situasi RP.",
      "Admin akan menilai report dan dapat approve familiar agar terikat ke player.",
    ],
  },
  {
    eyebrow: "Care System",
    title: "Care Actions",
    body: "Setelah familiar terikat, player dapat melakukan care action untuk menjaga mood, energy, dan bond.",
    points: [
      "Feed: membantu mood dan energy.",
      "Care: membantu mood dan bond.",
      "Train: meningkatkan bond, tetapi mengurangi energy.",
      "Rest: memulihkan energy familiar.",
    ],
  },
  {
    eyebrow: "Roleplay Economy",
    title: "Fortune Hall",
    body: "Fortune Hall adalah fitur hiburan roleplay berbasis sistem Lunaria. Semua angka dan currency di dalamnya hanya bagian dari dunia RP, bukan uang nyata.",
    points: [
      "Gunakan fitur ini sebagai hiburan komunitas.",
      "Jangan spam permainan.",
      "Ikuti batasan dan aturan yang ditentukan admin.",
    ],
  },
  {
    eyebrow: "Roleplay Market",
    title: "Royal Treasure",
    body: "Royal Treasure adalah sistem aset fiksi dalam dunia Lunaria. Harga dapat naik dan turun berdasarkan aturan roleplay yang ditentukan admin.",
    points: [
      "Ini bukan investasi dunia nyata.",
      "Profit dan rugi hanya berlaku di currency roleplay.",
      "Admin dapat mengatur perubahan harga untuk menjaga ekonomi tetap seimbang.",
    ],
  },
];

const rules = [
  "Jangan membagikan access code ke orang lain.",
  "Jangan mengubah data karakter tanpa izin admin.",
  "Jangan spam tombol care, fortune, atau fitur lain.",
  "Familiar Signal tidak menjamin langsung mendapat familiar. Admin tetap menilai bonding report.",
  "Pet / familiar yang terlihat sederhana tetap bisa berkembang lewat bond dan stage.",
  "Keputusan admin untuk quest, reward, dan familiar bersifat final.",
];

export default function PlayerGuidePage() {
  return (
    <main className="relative space-y-6 overflow-hidden text-slate-100">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.10),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.20),transparent_38%),linear-gradient(135deg,#02030a,#050615_48%,#02030a)]" />

      <section className="relative overflow-hidden rounded-[38px] border border-amber-300/20 bg-gradient-to-br from-[#070812]/95 via-[#050716]/95 to-violet-950/70 p-6 shadow-[0_0_90px_rgba(245,158,11,0.12)] md:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.14),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.20),transparent_40%)]" />

        <div className="relative z-10">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-300">
            Lunaria Player Handbook
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] text-white md:text-6xl">
            Player Guide
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
            Panduan singkat untuk memahami cara memakai web Lunaria, mulai dari
            ID Card, quest, currency, familiar, encounter, sampai fitur ekonomi
            roleplay.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {quickStart.map((item) => (
          <GuideCard key={item.title} title={item.title} desc={item.desc} />
        ))}
      </section>

      <section className="rounded-[34px] border border-emerald-300/20 bg-black/35 p-6">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-300">
          Quick Start
        </p>

        <h2 className="mt-3 text-3xl font-black tracking-[-0.03em] text-white">
          Alur Dasar Player
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <StepCard number="01" title="Login" />
          <StepCard number="02" title="Cek ID Card" />
          <StepCard number="03" title="Ikut Quest" />
          <StepCard number="04" title="Update Data" />
        </div>

        <p className="mt-5 text-sm leading-7 text-slate-400">
          Setelah quest selesai, player biasanya mengirim hasil / laporan ke
          admin. Admin akan memperbarui ID Card, reward, quest record, atau
          membuka akses fitur tertentu jika diperlukan.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {guideSections.map((section) => (
          <section
            key={section.title}
            className="rounded-[34px] border border-white/10 bg-black/35 p-6"
          >
            <p className="text-xs font-black uppercase tracking-[0.28em] text-amber-300">
              {section.eyebrow}
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-[-0.03em] text-white">
              {section.title}
            </h2>

            <p className="mt-4 text-sm leading-7 text-slate-300">
              {section.body}
            </p>

            <div className="mt-5 space-y-3">
              {section.points.map((point) => (
                <div
                  key={point}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                >
                  <p className="text-sm leading-6 text-slate-300">{point}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </section>

      <section className="rounded-[34px] border border-sky-300/20 bg-black/35 p-6">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-sky-300">
          Bonding Report Format
        </p>

        <h2 className="mt-3 text-3xl font-black tracking-[-0.03em] text-white">
          Contoh Laporan Familiar Encounter
        </h2>

        <div className="mt-6 rounded-[26px] border border-white/10 bg-white/[0.04] p-5">
          <p className="text-sm leading-7 text-slate-300">
            Aku mendekat pelan tanpa membuat gerakan kasar. Di dekat akar pohon,
            aku meletakkan makanan kecil dan menunggu familiar itu memilih
            sendiri untuk mendekat. Aku tidak memaksanya, hanya tetap diam agar
            ia merasa aman.
          </p>
        </div>

        <p className="mt-4 text-sm leading-7 text-slate-400">
          Laporan tidak harus panjang. Yang penting jelas, sesuai suasana RP,
          dan menunjukkan cara karakter mencoba membangun kepercayaan dengan
          familiar.
        </p>
      </section>

      <section className="rounded-[34px] border border-red-300/20 bg-black/35 p-6">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-red-300">
          Rules
        </p>

        <h2 className="mt-3 text-3xl font-black tracking-[-0.03em] text-white">
          Aturan Utama Player
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
          {rules.map((rule) => (
            <div
              key={rule}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
            >
              <p className="text-sm leading-6 text-slate-300">{rule}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[34px] border border-amber-300/20 bg-gradient-to-br from-amber-400/10 to-violet-400/10 p-6">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-amber-300">
          PWA Install
        </p>

        <h2 className="mt-3 text-3xl font-black tracking-[-0.03em] text-white">
          Cara Menjadikan Web seperti Aplikasi
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <InstallStep
            title="Android"
            desc="Buka web di Chrome, tekan menu titik tiga, lalu pilih Add to Home Screen / Install App."
          />
          <InstallStep
            title="iPhone"
            desc="Buka web di Safari, tekan Share, lalu pilih Add to Home Screen."
          />
          <InstallStep
            title="Desktop"
            desc="Buka web di Chrome atau Edge, klik ikon install di address bar jika tersedia."
          />
        </div>
      </section>
    </main>
  );
}

function GuideCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-black/35 p-5">
      <p className="text-lg font-black text-white">{title}</p>
      <p className="mt-3 text-sm leading-6 text-slate-400">{desc}</p>
    </div>
  );
}

function StepCard({ number, title }: { number: string; title: string }) {
  return (
    <div className="rounded-[24px] border border-emerald-300/20 bg-emerald-400/10 p-5">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-300">
        {number}
      </p>
      <p className="mt-3 text-lg font-black text-white">{title}</p>
    </div>
  );
}

function InstallStep({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-black/25 p-5">
      <p className="text-lg font-black text-white">{title}</p>
      <p className="mt-3 text-sm leading-6 text-slate-400">{desc}</p>
    </div>
  );
              }
