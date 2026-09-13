export interface VaultItem {
  id: string;
  title: string;
  username: string;
  password: string; // Plaintext when in decrypted client state; ciphertext in Firestore
  url?: string;
  notes?: string;
  category?: 'login' | 'card' | 'note' | 'identity';
  favorite?: boolean;
  iv?: string; // Base64 AES-GCM IV (12 bytes)
  createdAt: number;
  updatedAt: number;
}

export interface EncryptedVaultItem {
  id: string;
  title: string;
  username: string;
  password: string; // Encrypted Base64
  url?: string;
  notes?: string; // Encrypted Base64
  category?: string;
  favorite?: boolean;
  iv: string; // Base64
  createdAt: number;
  updatedAt: number;
}

export interface SecurityProfile {
  pinSalt: string;
  pinVerifier: string;
  pinVersion: number;
  pinConfigured: boolean;
  vaultSalt?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  isAnonymous?: boolean;
}

export interface GeneratorConfig {
  length: number;
  complex: boolean; // symbols & mixed special sets
  symbolsAndCaps: boolean; // uppercase and symbols
  numbersOnly: boolean; // strictly numbers 0-9
  avoidAmbiguous?: boolean; // avoid l, 1, I, o, 0, O
}

export type StrengthLevel = 'Weak' | 'Medium' | 'Strong' | 'Very Strong';

export interface PasswordStrength {
  level: StrengthLevel;
  score: number; // 0 to 4
  entropy: number;
  percent: number; // 0 to 100
  color: string;
  feedback: string;
}
