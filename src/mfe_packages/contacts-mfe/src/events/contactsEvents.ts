const DOMAIN_ID = 'contacts';

export const CONTACTS_EVENTS = {
  FETCH_REQUESTED: `mfe/${DOMAIN_ID}/fetch-requested`,
  FETCHED: `mfe/${DOMAIN_ID}/fetched`,
  FETCH_FAILED: `mfe/${DOMAIN_ID}/fetch-failed`,
  SEARCH_CHANGED: `mfe/${DOMAIN_ID}/search-changed`,
} as const;

type Contact = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
};

declare module '@hai3/react' {
  interface EventPayloadMap {
    'mfe/contacts/fetch-requested': void;
    'mfe/contacts/fetched': { contacts: Contact[] };
    'mfe/contacts/fetch-failed': { error: string };
    'mfe/contacts/search-changed': { query: string };
  }
}
