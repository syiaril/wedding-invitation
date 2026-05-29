'use client';

import { Heart } from 'lucide-react';
import AnimatedSection from '@/components/ui/AnimatedSection';

const stories = [
  {
    date: 'November 2024',
    title: 'Pertama Bertemu',
    description:
      'Takdir mempertemukan kami melalui dunia maya. Sebuah sapaan sederhana di media sosial yang tak disangka menjadi awal dari kisah indah ini.',
    icon: '💫',
  },
  {
    date: 'Januari 2025',
    title: 'Mulai Dekat',
    description:
      'Dari teman menjadi sahabat, kami mulai sering menghabiskan waktu bersama dan berbagi cerita.',
    icon: '💕',
  },
  {
    date: 'Mei 2026',
    title: 'Lamaran',
    description:
      'Dengan diiringi doa dan restu keluarga, kami siap melangkah ke jenjang yang lebih serius.',
    icon: '💍',
  },
  {
    date: 'Oktober 2026',
    title: 'Pernikahan',
    description:
      'In Shaa Allah, kami akan menyatukan langkah dalam ikatan suci pernikahan.',
    icon: '🕌',
  },
];

export default function LoveStorySection() {
  return (
    <section id="love-story" className="relative py-20 px-6 bg-sage-50 overflow-hidden">
      <div className="max-w-lg mx-auto">
        <AnimatedSection>
          <div className="text-center mb-12">
            <p className="text-gold-500 text-sm tracking-[0.3em] uppercase mb-2">
              Our Journey
            </p>
            <h2 className="text-3xl md:text-4xl font-serif text-sage-800 mb-4">
              Love Story
            </h2>
            <div className="ornament-divider">
              <span className="text-gold-400">
                <Heart size={16} fill="currentColor" />
              </span>
            </div>
          </div>
        </AnimatedSection>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-sage-200 md:-translate-x-px" />

          <div className="space-y-10">
            {stories.map((story, index) => (
              <AnimatedSection
                key={story.title}
                delay={0.1 + index * 0.15}
                direction={index % 2 === 0 ? 'left' : 'right'}
              >
                <div className="relative flex items-start gap-6 md:gap-0">
                  {/* Dot on timeline */}
                  <div className="relative z-10 flex-shrink-0 w-12 h-12 rounded-full
                    bg-white border-2 border-sage-300 flex items-center justify-center
                    text-lg shadow-md md:absolute md:left-1/2 md:-translate-x-1/2">
                    {story.icon}
                  </div>

                  {/* Content card */}
                  <div className={`flex-1 glass-card p-5
                    md:w-[calc(50%-40px)]
                    ${index % 2 === 0 ? 'md:mr-auto md:pr-8' : 'md:ml-auto md:pl-8'}
                  `}>
                    <span className="text-gold-500 text-xs font-medium tracking-wider uppercase">
                      {story.date}
                    </span>
                    <h3 className="text-lg font-serif text-sage-800 mt-1 mb-2">
                      {story.title}
                    </h3>
                    <p className="text-sage-600 text-sm leading-relaxed">
                      {story.description}
                    </p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
