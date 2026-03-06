import React from 'react';
import { ContactCard } from './ContactCard';

type Contact = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
};

interface ContactsListProps {
  contacts: Contact[];
  t: (key: string) => string;
  emptyMessage: string;
}

export const ContactsList: React.FC<ContactsListProps> = ({ contacts, t, emptyMessage }) => {
  if (contacts.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {contacts.map((contact) => (
        <ContactCard key={contact.id} contact={contact} t={t} />
      ))}
    </div>
  );
};

ContactsList.displayName = 'ContactsList';
