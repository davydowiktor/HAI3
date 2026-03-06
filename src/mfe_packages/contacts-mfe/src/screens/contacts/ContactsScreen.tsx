import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { ChildMfeBridge } from '@hai3/react';
import { useAppSelector } from '@hai3/react';
import { HAI3_SHARED_PROPERTY_LANGUAGE } from '@hai3/react';
import { Skeleton } from '../../components/ui/skeleton';
import { Card, CardContent } from '../../components/ui/card';
import { useScreenTranslations } from '../../shared/useScreenTranslations';
import { fetchContacts, searchContacts } from '../../actions/contactsActions';
import { SearchBar } from './components/SearchBar';
import { ContactsList } from './components/ContactsList';

const languageModules = import.meta.glob('./i18n/*.json') as Record<
  string,
  () => Promise<{ default: Record<string, string> }>
>;

interface ContactsScreenProps {
  bridge: ChildMfeBridge;
}

export const ContactsScreen: React.FC<ContactsScreenProps> = ({ bridge }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [language, setLanguage] = useState<string>('en');

  const { t, loading: translationsLoading } = useScreenTranslations(languageModules, bridge);

  const contacts = useAppSelector((state) => state['contacts/list'].items);
  const dataLoading = useAppSelector((state) => state['contacts/list'].loading);
  const searchQuery = useAppSelector((state) => state['contacts/list'].searchQuery);

  useEffect(() => {
    const initialLang = bridge.getProperty(HAI3_SHARED_PROPERTY_LANGUAGE);
    if (initialLang && typeof initialLang.value === 'string') {
      setLanguage(initialLang.value);
    }

    const languageUnsubscribe = bridge.subscribeToProperty(
      HAI3_SHARED_PROPERTY_LANGUAGE,
      (property) => {
        if (typeof property.value === 'string') {
          setLanguage(property.value);
          const rootNode = containerRef.current?.getRootNode();
          if (rootNode && 'host' in rootNode) {
            const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
            const direction = rtlLanguages.includes(property.value) ? 'rtl' : 'ltr';
            (rootNode.host as HTMLElement).dir = direction;
          }
        }
      }
    );

    return () => {
      languageUnsubscribe();
    };
  }, [bridge]);

  useEffect(() => {
    fetchContacts();
  }, []);

  const filteredContacts = useMemo(() => {
    if (!searchQuery) return contacts;
    const query = searchQuery.toLowerCase();
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        c.role.toLowerCase().includes(query)
    );
  }, [contacts, searchQuery]);

  if (translationsLoading) {
    return (
      <div ref={containerRef} className="p-8">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-4 w-72 mb-6" />
        <Skeleton className="h-9 w-full mb-6" />
        <div className="grid gap-3">
          <Card><CardContent className="p-4"><Skeleton className="h-16 w-full" /></CardContent></Card>
          <Card><CardContent className="p-4"><Skeleton className="h-16 w-full" /></CardContent></Card>
          <Card><CardContent className="p-4"><Skeleton className="h-16 w-full" /></CardContent></Card>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="p-8" data-language={language}>
      <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
      <p className="text-muted-foreground mb-6">{t('description')}</p>

      <SearchBar
        value={searchQuery}
        onChange={searchContacts}
        placeholder={t('search_placeholder')}
      />

      {dataLoading ? (
        <div className="grid gap-3">
          <Card><CardContent className="p-4"><Skeleton className="h-16 w-full" /></CardContent></Card>
          <Card><CardContent className="p-4"><Skeleton className="h-16 w-full" /></CardContent></Card>
        </div>
      ) : (
        <ContactsList
          contacts={filteredContacts}
          t={t}
          emptyMessage={t('no_contacts')}
        />
      )}

      <p className="text-xs text-muted-foreground mt-4">
        {t('total_count')}: {filteredContacts.length}
      </p>
    </div>
  );
};

ContactsScreen.displayName = 'ContactsScreen';
