import { AuthSdkError } from './errors';
import { REDIRECT_NONCE_COOKIE_NAME, REDIRECT_OAUTH_PARAMS_NAME, REDIRECT_STATE_COOKIE_NAME } from './constants';
import StorageManager from './StorageManager';
import {
  StorageProvider,
  TransactionMeta,
  isTransactionMeta,
  isOAuthTransactionMeta,
  PKCETransactionMeta,
  OAuthTransactionMeta,
  TransactionMetaOptions,
  TransactionManagerOptions,
  CookieStorage
} from './types';
import { RawIdxResponse, isRawIdxResponse } from './idx/types/idx-js';
import { warn } from './util';

export default class TransactionManager {
  options: TransactionManagerOptions;
  storageManager: StorageManager;
  legacyWidgetSupport: boolean;
  saveNonceCookie: boolean;
  saveStateCookie: boolean;
  saveParamsCookie: boolean;

  constructor(options: TransactionManagerOptions) {
    this.storageManager = options.storageManager;
    this.legacyWidgetSupport = options.legacyWidgetSupport === false ? false : true;
    this.saveNonceCookie = options.saveNonceCookie === false ? false : true;
    this.saveStateCookie = options.saveStateCookie === false ? false : true;
    this.saveParamsCookie = options.saveParamsCookie === false ? false : true;
    this.options = options;
  }

  clear(options: TransactionMetaOptions = {}) {
    const transactionStorage: StorageProvider = this.storageManager.getTransactionStorage();
    transactionStorage.clearStorage();

    const idxStateStorage: StorageProvider = this.storageManager.getIdxResponseStorage();
    idxStateStorage?.clearStorage();

    if (!this.legacyWidgetSupport) {
      return;
    }

    // This is for compatibility with older versions of the signin widget. OKTA-304806
    if (options.oauth) {
      this.clearLegacyOAuthParams();
    }

    if (options.pkce) {
      this.clearLegacyPKCE();
    }
  }

  // eslint-disable-next-line complexity
  save(meta: TransactionMeta, options: TransactionMetaOptions = {}) {
    // There must be only one transaction executing at a time.
    // Before saving, check to see if a transaction is already stored.
    // An existing transaction indicates a concurrency/race/overlap condition

    let storage: StorageProvider = this.storageManager.getTransactionStorage();
    const obj = storage.getStorage();
    if (isTransactionMeta(obj)) {
      // eslint-disable-next-line max-len
      warn('a saved auth transaction exists in storage. This may indicate another auth flow is already in progress.');
    }

    storage.setStorage(meta);

    if (!options.oauth) {
      return;
    }
  
    if (this.saveNonceCookie || this.saveStateCookie || this.saveParamsCookie) {
      const cookieStorage: CookieStorage = this.storageManager.getStorage({ storageType: 'cookie' }) as CookieStorage;

      if (this.saveParamsCookie) {
        const { 
          responseType,
          state,
          nonce,
          scopes,
          clientId,
          urls,
          ignoreSignature
        } = meta;
        const oauthParams = {
          responseType,
          state,
          nonce,
          scopes,
          clientId,
          urls,
          ignoreSignature
        };
        cookieStorage.setItem(REDIRECT_OAUTH_PARAMS_NAME, JSON.stringify(oauthParams), null);
      }

      if (this.saveNonceCookie && meta.nonce) {
        // Set nonce cookie for servers to validate nonce in id_token
        cookieStorage.setItem(REDIRECT_NONCE_COOKIE_NAME, meta.nonce, null);
      }

      if (this.saveStateCookie && meta.state) {
        // Set state cookie for servers to validate state
        cookieStorage.setItem(REDIRECT_STATE_COOKIE_NAME, meta.state, null);
      }
    }
  }

  exists(options: TransactionMetaOptions = {}): boolean {
    try {
      const meta: TransactionMeta = this.load(options);
      return !!meta;
    } catch {
      return false;
    }
  }

  // load transaction meta from storage
  load(options: TransactionMetaOptions = {}): TransactionMeta {
    let storage: StorageProvider = this.storageManager.getTransactionStorage();
    let meta = storage.getStorage();
    if (isTransactionMeta(meta)) {
      // if we have meta in the new location, there is no need to go further
      return meta;
    }

    if (!this.legacyWidgetSupport) {
      return null;
    }

    // This is for compatibility with older versions of the signin widget. OKTA-304806
    if (options.oauth) {
      try {
        const oauthParams = this.loadLegacyOAuthParams();
        Object.assign(meta, oauthParams);
      } finally {
        this.clearLegacyOAuthParams();
      }
    }

    if (options.pkce) {
      try {
        const pkceMeta: PKCETransactionMeta = this.loadLegacyPKCE();
        Object.assign(meta, pkceMeta);
      } finally {
        this.clearLegacyPKCE();
      }
    }

    if (isTransactionMeta(meta)) {
      return meta;
    }
    return null;
  }

  // This is for compatibility with older versions of the signin widget. OKTA-304806
  clearLegacyPKCE(): void {
    // clear storages
    let storage: StorageProvider;

    if (this.storageManager.storageUtil.testStorageType('localStorage')) {
      storage = this.storageManager.getLegacyPKCEStorage({ storageType: 'localStorage' });
      storage.clearStorage();
    }

    if (this.storageManager.storageUtil.testStorageType('sessionStorage')) {
      storage = this.storageManager.getLegacyPKCEStorage({ storageType: 'sessionStorage' });
      storage.clearStorage();
    }
  }

  loadLegacyPKCE(): PKCETransactionMeta {
    let storage: StorageProvider;
    let obj;
    
    // Try reading from localStorage first.
    if (this.storageManager.storageUtil.testStorageType('localStorage')) {
      storage = this.storageManager.getLegacyPKCEStorage({ storageType: 'localStorage' });
      obj = storage.getStorage();
      if (obj && obj.codeVerifier) {
        return obj;
      }
    }

    // If meta is not valid, read from sessionStorage. This is expected for more recent versions of the widget.
    if (this.storageManager.storageUtil.testStorageType('sessionStorage')) {
      storage = this.storageManager.getLegacyPKCEStorage({ storageType: 'sessionStorage' });
      obj = storage.getStorage();
      if (obj && obj.codeVerifier) {
        return obj;
      }
    }

    // If meta is not valid, throw an exception to avoid misleading server-side error
    // The most likely cause of this error is trying to handle a callback twice
    // eslint-disable-next-line max-len
    throw new AuthSdkError('Could not load PKCE codeVerifier from storage. This may indicate the auth flow has already completed or multiple auth flows are executing concurrently.', null);
  }

  clearLegacyOAuthParams(): void {
    // clear storages
    let storage: StorageProvider;

    if (this.storageManager.storageUtil.testStorageType('sessionStorage')) {
      storage = this.storageManager.getLegacyOAuthParamsStorage({ storageType: 'sessionStorage' });
      storage.clearStorage();
    }

    if (this.storageManager.storageUtil.testStorageType('cookie')) {
      storage = this.storageManager.getLegacyOAuthParamsStorage({ storageType: 'cookie' });
      storage.clearStorage();
    }
  }

  loadLegacyOAuthParams(): OAuthTransactionMeta {
    let storage: StorageProvider;
    let oauthParams;
  
    // load first from session storage
    if (this.storageManager.storageUtil.testStorageType('sessionStorage')) {
      storage = this.storageManager.getLegacyOAuthParamsStorage({ storageType: 'sessionStorage' });
      oauthParams = storage.getStorage();
    }
    if (isOAuthTransactionMeta(oauthParams)) {
      return oauthParams;
    }

    // try to load from cookie
    if (this.storageManager.storageUtil.testStorageType('cookie')) {
      storage = this.storageManager.getLegacyOAuthParamsStorage({ storageType: 'cookie' });
      oauthParams = storage.getStorage();
    }

    if (isOAuthTransactionMeta(oauthParams)) {
      return oauthParams;
    }


    throw new AuthSdkError('Unable to retrieve OAuth redirect params from storage');

    // Something is there but we don't recognize it
    // throw new AuthSdkError('Unable to parse the ' + REDIRECT_OAUTH_PARAMS_NAME + ' value from storage');
  }

  saveIdxResponse(idxResponse: RawIdxResponse): void {
    const storage: StorageProvider = this.storageManager.getIdxResponseStorage();
    if (!storage) {
      return;
    }
    storage.setStorage(idxResponse);
  }

  loadIdxResponse(): RawIdxResponse {
    const storage: StorageProvider = this.storageManager.getIdxResponseStorage();
    if (!storage) {
      return null;
    }
    const idxResponse = storage.getStorage();
    if (!isRawIdxResponse(idxResponse)) {
      return null;
    }
    return idxResponse;
  }
}