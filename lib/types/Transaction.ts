import StorageManager from '../StorageManager';
import { CustomUrls } from './OktaAuthOptions';

export interface TransactionManagerOptions {
  storageManager: StorageManager;
  legacyWidgetSupport?: boolean; // default true
  saveNonceCookie?: boolean; // default true
  saveStateCookie?: boolean; // default true
  saveParamsCookie?: boolean; // default true
}

export interface TransactionMetaOptions {
  pkce?: boolean;
  oauth?: boolean;
}

// formerly known as "Redirect OAuth Params"
export interface OAuthTransactionMeta {
  issuer: string;
  redirectUri: string;
  state: string;
  nonce: string;
  responseType: string | string [];
  scopes: string[];
  clientId: string;
  urls: CustomUrls;
  ignoreSignature: boolean;
}

export interface PKCETransactionMeta extends OAuthTransactionMeta {
  codeVerifier: string;
  codeChallengeMethod: string;
  codeChallenge: string;
}

export interface IdxTransactionMeta extends PKCETransactionMeta {
  interactionHandle?: string;
}

export type CustomAuthTransactionMeta = Record<string, string | undefined>;

export type TransactionMeta =
  IdxTransactionMeta |
  PKCETransactionMeta |
  OAuthTransactionMeta |
  CustomAuthTransactionMeta;

function isObjectWithProperties(obj) {
  if (!obj || typeof obj !== 'object' || Object.values(obj).length === 0) {
    return false;
  }
  return true;
}

export function isOAuthTransactionMeta(obj: any): obj is OAuthTransactionMeta {
  if (!isObjectWithProperties(obj)) {
    return false;
  }
  return !!obj.redirectUri || !!obj.responseType;
}

export function isPKCETransactionMeta(obj: any): obj is PKCETransactionMeta {
  if (!isOAuthTransactionMeta(obj)) {
    return false;
  }
  return !!(obj as any).codeVerifier;
}

export function isIdxTransactionMeta(obj: any): obj is IdxTransactionMeta {
  if (!isPKCETransactionMeta(obj)) {
    return false;
  }
  return !!(obj as any).interactionHandle;
}

export function isCustomAuthTransactionMeta(obj: any): obj is CustomAuthTransactionMeta {
  if (!isObjectWithProperties(obj)) {
    return false;
  }
  const isAllStringValues = Object.values(obj).find((value) => (typeof value !== 'string')) === undefined;
  return isAllStringValues;
}

export function isTransactionMeta(obj: any): obj is TransactionMeta {
  if (isOAuthTransactionMeta(obj) || isCustomAuthTransactionMeta(obj)) {
    return true;
  }
  return false;
}
