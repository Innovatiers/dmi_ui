import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { DEV_USERS, findDevUser } from './devUsers';
import { setIdentity, useIdentity } from './session';

const SIGNED_OUT = '';

/**
 * Development-only identity choice (DEC-04 interim, until the sign-in flow exists): picks one of the API's
 * development test users, sent as `X-Dev-User`. Rendered only in a development build (`import.meta.env.DEV`).
 */
export function DevRoleSwitcher() {
  const { t } = useTranslation();
  const id = useId();
  const identity = useIdentity();
  return (
    <div className="cw-dev-switcher">
      <label htmlFor={id}>{t('devAuth.label')}</label>
      <select
        id={id}
        value={identity?.subject ?? SIGNED_OUT}
        onChange={(event) => {
          setIdentity(findDevUser(event.target.value) ?? null);
        }}
      >
        <option value={SIGNED_OUT}>{t('devAuth.signedOut')}</option>
        {DEV_USERS.map((user) => (
          <option key={user.subject} value={user.subject}>
            {t('devAuth.user', {
              subject: user.subject,
              roles: user.roles.map((role) => t(`roles.${role}`)).join(', '),
            })}
          </option>
        ))}
      </select>
      <span className="cw-dev-switcher__note">{t('devAuth.note')}</span>
    </div>
  );
}
