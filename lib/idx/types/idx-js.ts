// TODO: remove when idx-js provides type information

export interface IdxAuthenticatorMethod {
  type: string;
}
export interface IdxAuthenticator {
  displayName: string;
  id: string;
  key: string;
  methods: IdxAuthenticatorMethod[];
  type: string;
  settings?: {
    complexity?: unknown;
    age?: unknown;
  };
}

export interface IdxForm {
  value: IdxRemediationValue[];
}

export interface IdxOption {
  value: string | { form: IdxForm };
  label: string;
  relatesTo?: IdxAuthenticator;
}

export interface IdpConfig {
  id: string;
  name: string;
}

export interface IdxRemediationValue {
  name: string;
  type?: string;
  required?: boolean;
  secret?: boolean;
  value?: string;
  label?: string;
  form?: IdxForm;
  options?: IdxOption[];
  messages?: IdxMessages;
  minLength?: number;
  maxLength?: number;
}

export interface IdxRemediation {
  name: string;
  label?: string;
  value?: IdxRemediationValue[];
  relatesTo?: {
    type?: string;
    value: IdxAuthenticator;
  };
  idp?: IdpConfig;
  href?: string;
  method?: string;
  type?: string;
}

export interface IdxMessage {
  message: string;
  class: string;
  i18n: {
    key: string;
    params?: unknown[];
  };
}

export interface IdxMessages {
  type: 'array';
  value: IdxMessage[];
}

// JSON response from the server
export interface RawIdxResponse {
  version: string;
  stateHandle: string;
  intent?: string;
  expiresAt?: string;
  remediation?: {
    type: 'array';
    value: IdxRemediation[];
  };
  messages?: IdxMessages;
}

export function isRawIdxResponse(obj: any): obj is RawIdxResponse {
  return obj && obj.version;
}


export interface IdxActions {
  [key: string]: Function;
}

// Object returned from idx-js
export interface IdxResponse {
  proceed: (remediationName: string, params: unknown) => Promise<IdxResponse>;
  neededToProceed: IdxRemediation[];
  rawIdxState: RawIdxResponse;
  interactionCode?: string;
  actions: IdxActions;
  toPersist: {
    interactionHandle?: string;
  };
}
