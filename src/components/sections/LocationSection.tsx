'use client';

import { MapPin, Navigation } from 'lucide-react';
import AnimatedSection from '@/components/ui/AnimatedSection';

const locations = [
  {
    title: 'Kediaman Mempelai Putri',
    subtitle: 'Akad Nikah & Resepsi',
    address: 'Dsn. Sedengan Kulon, RT 08 RW 04, Ds. Arjosari, Kec. Rejoso, Kab. Pasuruan',
    mapEmbed:
      'https://www.google.com/maps/embed?pb=!4v1780056358769!6m8!1m7!1sMqRmghA0s2VBwpryjwd-qA!2m2!1d-7.698914225373721!2d112.966883332378!3f26.03395626532972!4f-16.436621674993802!5f0.7820865974627469',
    mapLink: 'https://maps.app.goo.gl/6fG9YTX6ay8NMD678',
  },
  {
    title: 'Kediaman Mempelai Putra',
    subtitle: 'Resepsi',
    address: 'Dsn. Krajan, RT 01 RW 02, Ds. Tebas, Kec. Gondangwetan, Kab. Pasuruan',
    mapEmbed:
      'https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3955.123!2d112.89575840179114!3d-7.7249143086819725!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zN8KwNDMnMjkuNyJTIDExMsKwNTMnNDQuNyJF!5e0!3m2!1sid!2sid',
    mapLink: 'https://maps.app.goo.gl/xo6MvDBBdwBMxMRh7',
  },
];

export default function LocationSection() {
  return (
    <section id="location" className="relative py-20 px-6 bg-earth-50">
      <div className="max-w-lg mx-auto">
        <AnimatedSection>
          <div className="text-center mb-10">
            <p className="text-gold-500 text-sm tracking-[0.3em] uppercase mb-2">
              Lokasi
            </p>
            <h2 className="text-3xl md:text-4xl font-serif text-sage-800 mb-4">
              Peta Lokasi
            </h2>
            <div className="ornament-divider">
              <span className="text-gold-400">✦</span>
            </div>
          </div>
        </AnimatedSection>

        <div className="space-y-8">
          {locations.map((loc, index) => (
            <AnimatedSection key={loc.title} delay={0.2 + index * 0.2}>
              <div className="glass-card overflow-hidden">
                {/* Map Embed */}
                <div className="w-full h-64 md:h-80">
                  <iframe
                    src={loc.mapEmbed}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`Lokasi ${loc.title}`}
                  />
                </div>

                {/* Location Info */}
                <div className="p-6 text-center">
                  <div className="flex items-center justify-center gap-2 text-sage-700 mb-1">
                    <MapPin size={18} className="text-gold-500" />
                    <h3 className="font-serif text-lg">{loc.title}</h3>
                  </div>
                  <p className="text-gold-500 text-xs font-medium tracking-wider uppercase mb-2">
                    {loc.subtitle}
                  </p>
                  <p className="text-sage-500 text-sm mb-5">
                    {loc.address}
                  </p>
                  <a
                    href={loc.mapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full
                      bg-sage-600 text-white text-xs font-medium tracking-wider uppercase
                      hover:bg-sage-700 transition-colors duration-300"
                  >
                    <Navigation size={14} />
                    Buka di Google Maps
                  </a>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
