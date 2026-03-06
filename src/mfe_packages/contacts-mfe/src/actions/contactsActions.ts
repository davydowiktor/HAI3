import { eventBus, apiRegistry } from '@hai3/react';
import { CONTACTS_EVENTS } from '../events/contactsEvents';
import { ContactsApiService } from '../api/ContactsApiService';

export function fetchContacts(): void {
  eventBus.emit(CONTACTS_EVENTS.FETCH_REQUESTED);

  const api = apiRegistry.getService(ContactsApiService);
  void api.getContacts().then(
    (contacts) => {
      eventBus.emit(CONTACTS_EVENTS.FETCHED, { contacts });
    },
    (error: Error) => {
      eventBus.emit(CONTACTS_EVENTS.FETCH_FAILED, { error: error.message });
    }
  );
}

export function searchContacts(query: string): void {
  eventBus.emit(CONTACTS_EVENTS.SEARCH_CHANGED, { query });
}
