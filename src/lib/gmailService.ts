import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';
import { EmailLog } from '../types';

// Google Workspace / Gmail OAuth Scopes
export const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.compose'
];

const gmailProvider = new GoogleAuthProvider();
GMAIL_SCOPES.forEach((scope) => {
  gmailProvider.addScope(scope);
});
gmailProvider.setCustomParameters({
  prompt: 'select_account'
});

// IN-MEMORY CACHE FOR ACCESS TOKEN (MANDATORY: NEVER STORE IN LOCALSTORAGE)
let cachedGmailAccessToken: string | null = null;
let connectedGmailUser: { email: string; displayName: string; photoURL?: string } | null = null;

// Auth state listener to clear token on sign-out
onAuthStateChanged(auth, (user) => {
  if (!user) {
    cachedGmailAccessToken = null;
    connectedGmailUser = null;
  }
});

/**
 * Connect Google/Gmail Account using popup and request Gmail scopes
 */
export async function connectGmailAccount(): Promise<{ email: string; accessToken: string }> {
  try {
    const result = await signInWithPopup(auth, gmailProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);

    if (!credential?.accessToken) {
      throw new Error('Failed to obtain Google access token for Gmail.');
    }

    cachedGmailAccessToken = credential.accessToken;
    connectedGmailUser = {
      email: result.user.email || '',
      displayName: result.user.displayName || 'Google Account',
      photoURL: result.user.photoURL || undefined
    };

    return {
      email: result.user.email || '',
      accessToken: cachedGmailAccessToken
    };
  } catch (error: any) {
    console.error('Gmail OAuth connection error:', error);
    throw error;
  }
}

export function getGmailAccessToken(): string | null {
  return cachedGmailAccessToken;
}

export function getConnectedGmailUser() {
  return connectedGmailUser;
}

export function disconnectGmail(): void {
  cachedGmailAccessToken = null;
  connectedGmailUser = null;
}

/**
 * Send email via Gmail API or Backend Mail Dispatcher (handles Gmail, Outlook, Hotmail, Yahoo, etc.)
 */
export async function sendEmail({
  to,
  subject,
  htmlBody,
  textBody,
  type = 'custom',
  orderId
}: {
  to: string;
  subject: string;
  htmlBody?: string;
  textBody?: string;
  type?: EmailLog['type'];
  orderId?: string;
}): Promise<{ success: boolean; messageId?: string; provider?: string; error?: string }> {
  try {
    const response = await fetch('/api/email/dispatch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to,
        subject,
        htmlBody,
        textBody,
        type,
        orderId,
        googleAccessToken: cachedGmailAccessToken
      })
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Failed to send email:', error);
    return { success: false, error: error.message || 'Email dispatch failed' };
  }
}

/**
 * Send automated order confirmation receipt
 */
export async function sendOrderConfirmationEmail(
  order: any,
  customerEmail: string,
  customerName?: string
): Promise<{ success: boolean; messageId?: string; provider?: string }> {
  try {
    const response = await fetch('/api/email/send-order-receipt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order,
        customerEmail,
        customerName,
        googleAccessToken: cachedGmailAccessToken
      })
    });

    const data = await response.json();
    return data;
  } catch (err: any) {
    console.error('Order confirmation email error:', err);
    return { success: false };
  }
}

/**
 * Send automated courier dispatch & tracking update email
 */
export async function sendTrackingUpdateEmail(
  orderId: string,
  trackingNumber: string,
  carrier: string,
  customerEmail: string,
  customerName?: string
): Promise<{ success: boolean; messageId?: string; provider?: string }> {
  try {
    const response = await fetch('/api/email/send-tracking-update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId,
        trackingNumber,
        carrier,
        customerEmail,
        customerName,
        googleAccessToken: cachedGmailAccessToken
      })
    });

    const data = await response.json();
    return data;
  } catch (err: any) {
    console.error('Tracking update email error:', err);
    return { success: false };
  }
}

/**
 * Fetch dispatched emails history log
 */
export async function getEmailHistory(): Promise<EmailLog[]> {
  try {
    const res = await fetch('/api/email/history');
    const data = await res.json();
    return data.emails || [];
  } catch (err) {
    console.warn('Could not fetch email history:', err);
    return [];
  }
}
