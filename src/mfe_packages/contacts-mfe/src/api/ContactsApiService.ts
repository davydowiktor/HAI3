import { BaseApiService, RestProtocol, RestMockPlugin } from '@hai3/react';
import { contactsMockMap } from './mocks';

type Contact = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
};

export class ContactsApiService extends BaseApiService {
  constructor() {
    const restProtocol = new RestProtocol({
      timeout: 30000,
    });

    super({ baseURL: '/api/contacts' }, restProtocol);

    this.registerPlugin(
      restProtocol,
      new RestMockPlugin({
        mockMap: contactsMockMap,
        delay: 300,
      })
    );
  }

  async getContacts(): Promise<Contact[]> {
    return this.protocol(RestProtocol).get<Contact[]>('/list');
  }
}
