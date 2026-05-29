'use client';

import React, { createContext, useContext, useRef, useState, useCallback } from 'react';
import { MUSIC_URL } from '@/lib/assets';

interface MusicContextType {
  isPlaying: boolean;
  play: () => void;
  pause: () => void;
  toggle: () => void;
}

const MusicContext = createContext<MusicContextType>({
  isPlaying: false,
  play: () => {},
  pause: () => {},
  toggle: () => {},
});

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const play = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(MUSIC_URL);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.5;
    }
    audioRef.current.play().then(() => {
      setIsPlaying(true);
    }).catch(() => {
      // Autoplay blocked by browser
    });
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  return (
    <MusicContext.Provider value={{ isPlaying, play, pause, toggle }}>
      {children}
    </MusicContext.Provider>
  );
}

export const useMusic = () => useContext(MusicContext);
