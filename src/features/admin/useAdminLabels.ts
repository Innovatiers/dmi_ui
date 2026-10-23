import { useTranslation } from 'react-i18next';
import {
  GRANT_SCOPE_NAMES,
  MEMBERSHIP_STATUS_NAMES,
  ROLE_NAMES,
  TENANT_STATUS_NAMES,
  nameOf,
} from '../../api/governance';

/** Labels for the API's integer enum values on the administration screens; unknown values get an "unknown" label. */
export function useAdminLabels() {
  const { t } = useTranslation();
  const role = (value: number) => {
    const name = nameOf(ROLE_NAMES, value);
    return name ? t(`roles.${name}`) : t('roles.unknown');
  };
  const grantScope = (value: number) => {
    const name = nameOf(GRANT_SCOPE_NAMES, value);
    return name ? t(`grantScope.${name}`) : t('grantScope.unknown');
  };
  const membershipStatus = (value: number) => {
    const name = nameOf(MEMBERSHIP_STATUS_NAMES, value);
    return name ? t(`membershipStatus.${name}`) : t('membershipStatus.unknown');
  };
  const tenantStatus = (value: number) => {
    const name = nameOf(TENANT_STATUS_NAMES, value);
    return name ? t(`tenantStatus.${name}`) : t('tenantStatus.unknown');
  };
  return { t, role, grantScope, membershipStatus, tenantStatus };
}
