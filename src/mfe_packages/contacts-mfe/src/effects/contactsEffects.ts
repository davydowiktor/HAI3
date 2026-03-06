import { eventBus, type AppDispatch } from '@hai3/react';
import { setContacts, setLoading, setSearchQuery } from '../slices/contactsSlice';
import { CONTACTS_EVENTS } from '../events/contactsEvents';

export function initContactsEffects(dispatch: AppDispatch): void {
  eventBus.on(CONTACTS_EVENTS.FETCH_REQUESTED, () => {
    dispatch(setLoading(true));
  });

  eventBus.on(CONTACTS_EVENTS.FETCHED, (payload) => {
    dispatch(setContacts(payload.contacts));
  });

  eventBus.on(CONTACTS_EVENTS.FETCH_FAILED, () => {
    dispatch(setLoading(false));
  });

  eventBus.on(CONTACTS_EVENTS.SEARCH_CHANGED, (payload) => {
    dispatch(setSearchQuery(payload.query));
  });
}
