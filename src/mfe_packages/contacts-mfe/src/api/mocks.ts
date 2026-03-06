import type { MockMap } from '@hai3/react';

type Contact = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
};

const MOCK_CONTACTS: Contact[] = [
  { id: '1', name: 'Alice Johnson', email: 'alice@example.com', role: 'Engineer', status: 'active' },
  { id: '2', name: 'Bob Smith', email: 'bob@example.com', role: 'Designer', status: 'active' },
  { id: '3', name: 'Carol Williams', email: 'carol@example.com', role: 'Manager', status: 'inactive' },
  { id: '4', name: 'David Brown', email: 'david@example.com', role: 'Engineer', status: 'active' },
  { id: '5', name: 'Eva Martinez', email: 'eva@example.com', role: 'Product', status: 'active' },
  { id: '6', name: 'Frank Lee', email: 'frank@example.com', role: 'Designer', status: 'inactive' },
];

export const contactsMockMap: MockMap = {
  'GET /api/contacts/list': (): Contact[] => MOCK_CONTACTS,
};
