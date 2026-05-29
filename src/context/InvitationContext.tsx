'use client';

import React, { createContext, useContext, useState } from 'react';

interface InvitationContextType {
  isOpen: boolean;
  guestName: string;
  openInvitation: () => void;
}

const InvitationContext = createContext<InvitationContextType>({
  isOpen: false,
  guestName: 'Tamu Undangan',
  openInvitation: () => {},
});

export function InvitationProvider({
  children,
  guestName,
}: {
  children: React.ReactNode;
  guestName: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const openInvitation = () => {
    setIsOpen(true);
  };

  return (
    <InvitationContext.Provider value={{ isOpen, guestName, openInvitation }}>
      {children}
    </InvitationContext.Provider>
  );
}

export const useInvitation = () => useContext(InvitationContext);
