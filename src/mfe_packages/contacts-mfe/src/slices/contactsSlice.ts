import { createSlice, type ReducerPayload } from '@hai3/react';

type Contact = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
};

type ContactsState = {
  items: Contact[];
  loading: boolean;
  searchQuery: string;
};

const initialState: ContactsState = {
  items: [],
  loading: false,
  searchQuery: '',
};

const { slice, setContacts, setLoading, setSearchQuery } = createSlice({
  name: 'contacts/list',
  initialState,
  reducers: {
    setContacts(state, action: ReducerPayload<Contact[]>) {
      state.items = action.payload;
      state.loading = false;
    },
    setLoading(state, action: ReducerPayload<boolean>) {
      state.loading = action.payload;
    },
    setSearchQuery(state, action: ReducerPayload<string>) {
      state.searchQuery = action.payload;
    },
  },
});

export const contactsSlice = slice;
export { setContacts, setLoading, setSearchQuery };

declare module '@hai3/react' {
  interface RootState {
    'contacts/list': ContactsState;
  }
}
