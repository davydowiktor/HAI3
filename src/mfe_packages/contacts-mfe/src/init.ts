import { createHAI3, registerSlice, apiRegistry, effects, mock } from '@hai3/react';
import { contactsSlice } from './slices/contactsSlice';
import { initContactsEffects } from './effects/contactsEffects';
import { ContactsApiService } from './api/ContactsApiService';

apiRegistry.register(ContactsApiService);
apiRegistry.initialize();

const mfeApp = createHAI3().use(effects()).use(mock()).build();

registerSlice(contactsSlice, initContactsEffects);

export { mfeApp };
