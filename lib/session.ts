/**************************************************
 * Session()
 * Defines the structure of a user session, including the JWT, user ID, and expiration timestamp.
 **************************************************/
export interface Session {
  jwt: string;
  userId: string;
  expiresAt: number;
}

const SESSION_KEY = 'pfap_session';
const THIRTY_MINUTES = 30 * 60 * 1000;

/**************************************************
 * createSession()
 * Constructs a new session object with the provided JWT and user ID.
 * Sets the expiresAt timestamp to 30 minutes from the current time.
 **************************************************/
export function createSession(jwt: string, userId: string): Session {
  return {
    jwt,
    userId,
    expiresAt: Date.now() + THIRTY_MINUTES,
  };
}

/**************************************************
 * saveSession()
 * Saves the session object to sessionStorage under a predefined key.
 **************************************************/
export function saveSession(session: Session): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

/**************************************************
 * clearSession()
 * if the session exists removes session
 **************************************************/
export function clearSession(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(SESSION_KEY);
}

/**************************************************
 * getSession()
 * - Retrieves the current session from sessionStorage.
 * - Validates the structure and types of the session data.
 * - Checks if the session has expired based on the expiresAt timestamp.
 **************************************************/
export function getSession(): Session | null {
  if (typeof window === 'undefined') return null;

  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<Session>;
    if (
      typeof parsed.jwt !== 'string' ||
      typeof parsed.userId !== 'string' ||
      typeof parsed.expiresAt !== 'number'
    ) {
      clearSession();
      return null;
    }

    if (parsed.expiresAt <= Date.now()) {
      clearSession();
      return null;
    }

    return parsed as Session;
  } catch {
    clearSession();
    return null;
  }
}//end of getSession

/**************************************************
 * getToken()
 * Convenience function to retrieve just the JWT from the current session.
 **************************************************/
export function getToken(): string | null {
  return getSession()?.jwt ?? null;
}


