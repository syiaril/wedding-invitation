'use client';

import { Calendar, Clock, MapPin, Video } from 'lucide-react';
import AnimatedSection from '@/components/ui/AnimatedSection';

const events = [
  {
    title: 'Akad Nikah',
    day: 'Minggu',
    date: '18 Oktober 2026',
    time: '08:00 WIB - Selesai',
    venue: 'Kediaman Mempelai Putri',
    address: 'Dsn. Sedengan Kulon, RT 08 RW 04, Ds. Arjosari, Kec. Rejoso, Kab. Pasuruan',
    calendarUrl: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Akad+Nikah+Nandar+%26+Salsa&dates=20261018T000000Z/20261018T040000Z&details=Akad+Nikah+Nandar+%26+Salsa&location=Dsn.+Sedengan+Kulon+Ds.+Arjosari+Kec.+Rejoso+Kab.+Pasuruan`,
  },
  {
    title: 'Resepsi - Mempelai Putri',
    day: 'Minggu',
    date: '18 Oktober 2026',
    time: 'Bebas',
    venue: 'Kediaman Mempelai Putri',
    address: 'Dsn. Sedengan Kulon, RT 08 RW 04, Ds. Arjosari, Kec. Rejoso, Kab. Pasuruan',
    calendarUrl: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Resepsi+Nandar+%26+Salsa+(Mempelai+Putri)&dates=20261018T000000Z/20261018T120000Z&details=Resepsi+Pernikahan+Nandar+%26+Salsa&location=Dsn.+Sedengan+Kulon+Ds.+Arjosari+Kec.+Rejoso+Kab.+Pasuruan`,
  },
  {
    title: 'Resepsi - Mempelai Putra',
    day: 'Jumat - Sabtu',
    date: '23 - 24 Oktober 2026',
    time: 'Bebas',
    venue: 'Kediaman Mempelai Putra',
    address: 'Dsn. Krajan, RT 01 RW 02, Ds. Tebas, Kec. Gondangwetan, Kab. Pasuruan',
    calendarUrl: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Resepsi+Nandar+%26+Salsa+(Mempelai+Putra)&dates=20261023T000000Z/20261024T120000Z&details=Resepsi+Pernikahan+Nandar+%26+Salsa&location=Dsn.+Krajan+Ds.+Tebas+Kec.+Gondangwetan+Kab.+Pasuruan`,
  },
];

export default function EventSection() {
  return (
    <section id="event" className="relative py-20 px-6 bg-sage-50 overflow-hidden">
      <div className="max-w-lg mx-auto">
        <AnimatedSection>
          <div className="text-center mb-12">
            <p className="text-gold-500 text-sm tracking-[0.3em] uppercase mb-2">
              Save The Date
            </p>
            <h2 className="text-3xl md:text-4xl font-serif text-sage-800 mb-4">
              Waktu &amp; Tempat
            </h2>
            <div className="ornament-divider">
              <span className="text-gold-400">✦</span>
            </div>
          </div>
        </AnimatedSection>

        <div className="space-y-6">
          {events.map((event, index) => (
            <AnimatedSection key={event.title} delay={0.2 + index * 0.2}>
              <div className="glass-card p-6 md:p-8 text-center relative overflow-hidden">
                {/* Decorative corner */}
                <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
                  <div className="w-full h-full border-t-2 border-r-2 border-gold-400 rounded-tr-2xl" />
                </div>
                <div className="absolute bottom-0 left-0 w-20 h-20 opacity-10">
                  <div className="w-full h-full border-b-2 border-l-2 border-gold-400 rounded-bl-2xl" />
                </div>

                <h3 className="text-2xl font-serif text-sage-800 mb-4">
                  {event.title}
                </h3>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-center gap-2 text-sage-600">
                    <Calendar size={16} className="text-gold-500" />
                    <span className="text-sm">
                      {event.day}, {event.date}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sage-600">
                    <Clock size={16} className="text-gold-500" />
                    <span className="text-sm">{event.time}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sage-600">
                    <MapPin size={16} className="text-gold-500" />
                    <div>
                      <p className="text-sm font-medium">{event.venue}</p>
                      <p className="text-xs text-sage-400">{event.address}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-2">
                  <a
                    href={event.calendarUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full
                      bg-sage-600 text-white text-xs font-medium tracking-wider uppercase
                      hover:bg-sage-700 transition-colors duration-300"
                  >
                    <Calendar size={14} />
                    Save to Calendar
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
