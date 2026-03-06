import React from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';

type Contact = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
};

interface ContactCardProps {
  contact: Contact;
  t: (key: string) => string;
}

export const ContactCard: React.FC<ContactCardProps> = ({ contact, t }) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">{contact.name}</h3>
          <Badge variant={contact.status === 'active' ? 'default' : 'secondary'}>
            {t(`status_${contact.status}`)}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-1">{contact.email}</p>
        <p className="text-xs text-muted-foreground">{contact.role}</p>
      </CardContent>
    </Card>
  );
};

ContactCard.displayName = 'ContactCard';
