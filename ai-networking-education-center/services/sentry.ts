import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

export const initializeSentry = (): void => {
  if (!import.meta.env.VITE_SENTRY_DSN) {
    console.warn('Sentry DSN not configured; error logging disabled');
    return;
  }

  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    integrations: [
      new BrowserTracing(),
    ],
    tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
    beforeSend(event, hint) {
      if (import.meta.env.MODE !== 'production') {
        console.error('Sentry event:', hint.originalException);
      }
      return event;
    },
  });
};

export const captureException = (error: unknown): void => {
  Sentry.captureException(error);
};

export const captureMessage = (message: string, level: Sentry.SeverityLevel = 'info'): void => {
  Sentry.captureMessage(message, level);
};
