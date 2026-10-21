import { useTranslation } from 'react-i18next';
import type { ModuleDefinition } from '../modules';
import { StatusMessage } from '../components/StatusMessage';

export interface ModulePlaceholderPageProps {
  readonly module: ModuleDefinition;
}

/** Temporary page for modules whose screens are delivered in later stories. */
export function ModulePlaceholderPage({ module }: ModulePlaceholderPageProps) {
  const { t } = useTranslation();
  return (
    <section aria-labelledby="module-title">
      <h1 id="module-title">{t(`modules.${module.id}`)}</h1>
      <StatusMessage tone="info">{t('placeholder.notAvailable')}</StatusMessage>
    </section>
  );
}
