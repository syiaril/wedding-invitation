'use client';

import { useState } from 'react';
import { Copy, Gift, Send } from 'lucide-react';
import AnimatedSection from '@/components/ui/AnimatedSection';
import Toast from '@/components/ui/Toast';

const bankAccounts = [
  {
    bank: 'BCA',
    accountNumber: '0892042665',
    accountName: 'Muhammad Asmunandar',
    color: 'from-blue-600 to-blue-800',
  },
  {
    bank: 'JATIM',
    accountNumber: '1913033333',
    accountName: 'Muhammad Asmunandar',
    color: 'from-yellow-600 to-yellow-800',
  },
  {
    bank: 'BSI',
    accountNumber: '7258700435',
    accountName: 'Salasatin Ismiah',
    color: 'from-emerald-600 to-emerald-800',
  },
  {
    bank: 'ShopeePay',
    accountNumber: '083852538623',
    accountName: 'Salasatin Ismiah',
    color: 'from-orange-500 to-orange-700',
  },
];

const recipients = [
  {
    id: 'groom',
    label: 'Mempelai Putra',
    name: 'Asmunandar',
    phone: '6285730008802',
  },
  {
    id: 'bride',
    label: 'Mempelai Putri',
    name: 'Salasatin',
    phone: '6283852538623',
  },
] as const;

type RecipientId = (typeof recipients)[number]['id'];

export default function GiftSection() {
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [nominal, setNominal] = useState('');
  const [senderName, setSenderName] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState<RecipientId>('groom');

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Clipboard API unavailable in this context
    }
    setToastMessage(`${label} berhasil disalin!`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const handleGiftConfirm = () => {
    const target = recipients.find((r) => r.id === selectedRecipient) || recipients[0];
    const message = `Halo ${target.name}! 🎁\n\nSaya *${senderName || 'Tamu'}* ingin mengkonfirmasi hadiah sebesar *Rp ${nominal || '0'}*.\n\nSemoga menjadi berkah untuk Asmunandar & Salasatin. Aamiin 🤲`;
    const waUrl = `https://wa.me/${target.phone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <section id="gift" className="relative py-20 px-6 bg-earth-50 overflow-hidden">
      <div className="max-w-lg mx-auto">
        <AnimatedSection>
          <div className="text-center mb-12">
            <p className="text-gold-500 text-sm tracking-[0.3em] uppercase mb-2">
              Wedding Gift
            </p>
            <h2 className="text-3xl md:text-4xl font-serif text-crimson-800 mb-4">
              Hadiah Pernikahan
            </h2>
            <div className="ornament-divider">
              <span className="text-gold-400">
                <Gift size={16} />
              </span>
            </div>
            <p className="text-crimson-500 text-sm max-w-sm mx-auto">
              Doa restu Anda merupakan karunia yang sangat berarti bagi kami.
              Namun jika Anda ingin memberikan tanda kasih, kami menyediakan informasi berikut.
            </p>
          </div>
        </AnimatedSection>

        {/* Bank Account Cards */}
        <div className="space-y-4 mb-10">
          {bankAccounts.map((account, index) => (
            <AnimatedSection key={account.bank} delay={0.2 + index * 0.15}>
              <div className="glass-card p-5 relative overflow-hidden">
                {/* Decorative gradient strip */}
                <div className={`absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b ${account.color}`} />

                <div className="pl-4">
                  <p className="text-crimson-500 text-xs tracking-wider uppercase mb-1">
                    Bank {account.bank}
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-crimson-800 text-xl font-mono font-bold tracking-wider">
                        {account.accountNumber}
                      </p>
                      <p className="text-crimson-500 text-sm mt-0.5">
                        a.n. {account.accountName}
                      </p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(account.accountNumber, `No. Rek ${account.bank}`)}
                      className="w-10 h-10 rounded-full bg-crimson-100 hover:bg-crimson-200
                        flex items-center justify-center transition-colors duration-200"
                      aria-label={`Copy ${account.bank} account number`}
                    >
                      <Copy size={16} className="text-crimson-600" />
                    </button>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* Gift Confirmation Form */}
        <AnimatedSection delay={0.5}>
          <div className="glass-card p-6">
            <h3 className="text-lg font-serif text-crimson-800 text-center mb-4">
              Konfirmasi Hadiah
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nama Pengirim"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-crimson-50 border border-crimson-200
                  text-crimson-800 text-sm placeholder:text-crimson-400
                  focus:outline-none focus:ring-2 focus:ring-crimson-400/50 focus:border-crimson-400
                  transition-all duration-200"
              />
              <input
                type="text"
                placeholder="Nominal (contoh: 500.000)"
                value={nominal}
                onChange={(e) => setNominal(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-crimson-50 border border-crimson-200
                  text-crimson-800 text-sm placeholder:text-crimson-400
                  focus:outline-none focus:ring-2 focus:ring-crimson-400/50 focus:border-crimson-400
                  transition-all duration-200"
              />
              <div>
                <p className="text-xs text-crimson-600 mb-1.5 font-medium">
                  Konfirmasi Kepada:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {recipients.map((recipient) => {
                    const isSelected = selectedRecipient === recipient.id;
                    return (
                      <button
                        key={recipient.id}
                        type="button"
                        onClick={() => setSelectedRecipient(recipient.id)}
                        className={`py-2 px-3 rounded-xl text-xs font-medium transition-all duration-200 border flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                          isSelected
                            ? 'bg-crimson-600 text-white border-crimson-600 shadow-sm'
                            : 'bg-crimson-50/70 text-crimson-700 border-crimson-200 hover:bg-crimson-100/70'
                        }`}
                      >
                        <span>{recipient.label}</span>
                        <span className={`text-[11px] ${isSelected ? 'text-crimson-100' : 'text-crimson-500'}`}>
                          ({recipient.name})
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <button
                onClick={handleGiftConfirm}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl
                  bg-crimson-600 text-white text-sm font-medium tracking-wider
                  hover:bg-crimson-700 transition-colors duration-300"
              >
                <Send size={16} />
                Konfirmasi via WhatsApp
              </button>
              <p className="text-xs text-crimson-500 text-center mt-3">
                *Mohon lampirkan screenshot bukti transfer saat mengirim pesan WhatsApp.
              </p>
            </div>
          </div>
        </AnimatedSection>
      </div>

      <Toast message={toastMessage} isVisible={showToast} />
    </section>
  );
}
