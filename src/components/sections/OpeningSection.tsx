'use client';

import Image from 'next/image';
import AnimatedSection from '@/components/ui/AnimatedSection';
import { COUPLE_PHOTO } from '@/lib/assets';

export default function OpeningSection() {
  return (
    <section id="opening" className="relative py-20 px-6 bg-earth-50 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 max-w-lg mx-auto text-center">
        {/* Greeting */}
        <AnimatedSection>
          <p className="text-sage-600 font-serif text-lg mb-1">
            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم
          </p>
          <p className="text-sage-500 text-sm mb-6">Bismillahirrahmanirrahim</p>
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
          <p className="text-sage-700 font-serif text-xl mb-2">
            Assalamualaikum Warahmatullahi Wabarakatuh
          </p>
        </AnimatedSection>

        {/* Quran Verse */}
        <AnimatedSection delay={0.3}>
          <div className="my-8 px-4 py-6 glass-card">
            <p className="text-sage-700 font-serif italic text-sm leading-relaxed mb-3">
              &ldquo;Wahai manusia! Bertakwalah kepada Tuhanmu yang telah menciptakan
              kamu dari diri yang satu (Adam), dan (Allah) menciptakan pasangannya (Hawa)
              dari (diri)-nya; dan dari keduanya Allah memperkembangbiakkan laki-laki dan
              perempuan yang banyak.&rdquo;
            </p>
            <p className="text-gold-500 text-xs font-medium tracking-wider uppercase">
              — QS. An-Nisa 4:1
            </p>
          </div>
        </AnimatedSection>

        {/* Couple Photo */}
        <AnimatedSection delay={0.4}>
          <div className="my-10 flex justify-center">
            <div className="w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden
              border-4 border-gold-400/40 shadow-xl shadow-sage-200/50 relative">
              <Image
                src={COUPLE_PHOTO}
                alt="Nandar & Salsa"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 192px, 224px"
              />
            </div>
          </div>
        </AnimatedSection>

        {/* Couple Profiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
          {/* Groom */}
          <AnimatedSection delay={0.5} direction="left">
            <div className="text-center">
              <div className="text-gold-400 text-2xl mb-2">♂</div>
              <h3
                className="text-3xl text-sage-800 mb-2"
                style={{ fontFamily: 'Great Vibes, cursive' }}
              >
                Muhammad Asmunandar, S.Ak
              </h3>
              <p className="text-sage-600 text-sm font-serif mb-1">
                Putra dari
              </p>
              <p className="text-sage-700 text-sm">
                Bpk. Darip & Ibu Asliha
              </p>
            </div>
          </AnimatedSection>

          {/* Bride */}
          <AnimatedSection delay={0.6} direction="right">
            <div className="text-center">
              <div className="text-gold-400 text-2xl mb-2">♀</div>
              <h3
                className="text-3xl text-sage-800 mb-2"
                style={{ fontFamily: 'Great Vibes, cursive' }}
              >
                Salasatin Ismiah, S.Si
              </h3>
              <p className="text-sage-600 text-sm font-serif mb-1">
                Putri dari
              </p>
              <p className="text-sage-700 text-sm">
                Bpk. Sakroni & Ibu Suminah
              </p>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
