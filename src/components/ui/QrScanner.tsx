'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff } from 'lucide-react';

interface QrScannerProps {
  onScanSuccess: (decodedText: string) => void;
  isPaused: boolean;
}

export default function QrScanner({ onScanSuccess, isPaused }: QrScannerProps) {
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<import('html5-qrcode').Html5Qrcode | null>(null);
  const onScanSuccessRef = useRef(onScanSuccess);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(true);

  // Keep callback ref in sync
  onScanSuccessRef.current = onScanSuccess;

  useEffect(() => {
    let mounted = true;

    const startScanner = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        if (!mounted || !scannerRef.current) return;

        const scannerId = 'qr-scanner-region';

        // Ensure the element exists
        if (!document.getElementById(scannerId)) {
          const div = document.createElement('div');
          div.id = scannerId;
          scannerRef.current.appendChild(div);
        }

        const html5QrCode = new Html5Qrcode(scannerId);
        html5QrCodeRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 220, height: 220 },
            aspectRatio: 1,
          },
          (decodedText) => {
            onScanSuccessRef.current(decodedText);
          },
          () => {
            // QR code scan failure — silent, this fires constantly while scanning
          }
        );

        if (mounted) {
          setIsStarting(false);
          setCameraError(null);
        }
      } catch (err) {
        if (mounted) {
          setIsStarting(false);
          const message = err instanceof Error ? err.message : 'Tidak dapat mengakses kamera';
          setCameraError(message);
        }
      }
    };

    startScanner();

    return () => {
      mounted = false;
      const scanner = html5QrCodeRef.current;
      if (scanner) {
        scanner.stop().catch(() => {});
        scanner.clear();
        html5QrCodeRef.current = null;
      }
    };
  }, []);

  // Pause / resume scanner
  useEffect(() => {
    const scanner = html5QrCodeRef.current;
    if (!scanner) return;

    if (isPaused) {
      scanner.pause(true);
    } else {
      try {
        scanner.resume();
      } catch {
        // Scanner might not be paused yet
      }
    }
  }, [isPaused]);

  return (
    <div className="relative w-full aspect-square max-w-[320px] mx-auto">
      {/* Scanner container */}
      <div
        ref={scannerRef}
        className="w-full h-full rounded-3xl overflow-hidden bg-sage-900/5
          [&_video]:w-full [&_video]:h-full [&_video]:object-cover [&_video]:rounded-3xl
          [&_#qr-scanner-region]:w-full [&_#qr-scanner-region]:h-full
          [&_#qr-shaded-region]:border-none
          [&_img]:hidden"
      />

      {/* Elegant viewfinder overlay */}
      <div className="absolute inset-0 pointer-events-none rounded-3xl">
        {/* Soft border */}
        <div className="absolute inset-0 rounded-3xl border-2 border-white/30" />

        {/* Corner accents */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" fill="none">
          {/* Top-left */}
          <path d="M 5 20 L 5 8 Q 5 5 8 5 L 20 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
          {/* Top-right */}
          <path d="M 80 5 L 92 5 Q 95 5 95 8 L 95 20" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
          {/* Bottom-left */}
          <path d="M 5 80 L 5 92 Q 5 95 8 95 L 20 95" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
          {/* Bottom-right */}
          <path d="M 80 95 L 92 95 Q 95 95 95 92 L 95 80" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
        </svg>

        {/* Scanning line animation */}
        {!isPaused && !cameraError && !isStarting && (
          <div className="scanner-line absolute left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-transparent via-sage-400/60 to-transparent rounded-full" />
        )}
      </div>

      {/* Loading state */}
      {isStarting && !cameraError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-sage-50/80 rounded-3xl backdrop-blur-sm">
          <div className="w-8 h-8 border-2 border-sage-300 border-t-sage-600 rounded-full animate-spin mb-3" />
          <p className="text-sage-500 text-sm">Memulai kamera...</p>
        </div>
      )}

      {/* Error state */}
      {cameraError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-sage-50/90 rounded-3xl backdrop-blur-sm px-6">
          <CameraOff size={32} className="text-sage-400 mb-3" />
          <p className="text-sage-600 text-sm font-medium text-center mb-1">Kamera tidak tersedia</p>
          <p className="text-sage-400 text-xs text-center leading-relaxed">
            Pastikan izin kamera telah diaktifkan di pengaturan browser Anda.
          </p>
        </div>
      )}

      {/* Paused overlay */}
      {isPaused && !cameraError && !isStarting && (
        <div className="absolute inset-0 flex items-center justify-center bg-sage-900/20 rounded-3xl backdrop-blur-[2px]">
          <Camera size={28} className="text-white/70" />
        </div>
      )}
    </div>
  );
}
