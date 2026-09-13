import { GeneratorConfig, PasswordStrength, StrengthLevel } from "@/types";

const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUMBERS = "0123456789";
const STANDARD_SYMBOLS = "!@#$%^&*()-_=+[]{}|;:,.<>?";
const COMPLEX_SYMBOLS = "~`!@#$%^&*()-_=+[{]}\\|;:'\",<.>/?";

/**
 * Generate cryptographically secure password based on configuration
 */
export function generatePassword(config: GeneratorConfig): string {
  const { length, complex, symbolsAndCaps, numbersOnly } = config;

  if (numbersOnly) {
    return generateFromCharset(NUMBERS, length);
  }

  let charset = LOWERCASE;

  if (symbolsAndCaps) {
    charset += UPPERCASE;
    charset += complex ? COMPLEX_SYMBOLS : STANDARD_SYMBOLS;
  } else if (complex) {
    charset += UPPERCASE + COMPLEX_SYMBOLS;
  }

  // Always mix in numbers unless explicitly omitted
  charset += NUMBERS;

  let password = "";
  // Ensure at least one character from each active category is present
  const requiredChars: string[] = [];
  requiredChars.push(getRandomChar(LOWERCASE));
  requiredChars.push(getRandomChar(NUMBERS));

  if (symbolsAndCaps || complex) {
    requiredChars.push(getRandomChar(UPPERCASE));
    requiredChars.push(getRandomChar(complex ? COMPLEX_SYMBOLS : STANDARD_SYMBOLS));
  }

  // Fill remaining length from full charset
  const remainingCount = Math.max(0, length - requiredChars.length);
  for (let i = 0; i < remainingCount; i++) {
    password += getRandomChar(charset);
  }

  // Combine and shuffle using Fisher-Yates with CSPRNG
  const combined = (password + requiredChars.join("")).split("");
  return shuffleArray(combined).slice(0, length).join("");
}

function getRandomChar(charset: string): string {
  const randomBuffer = new Uint32Array(1);
  window.crypto.getRandomValues(randomBuffer);
  return charset[randomBuffer[0] % charset.length];
}

function generateFromCharset(charset: string, length: number): string {
  const randomBuffer = new Uint32Array(length);
  window.crypto.getRandomValues(randomBuffer);
  let result = "";
  for (let i = 0; i < length; i++) {
    result += charset[randomBuffer[i] % charset.length];
  }
  return result;
}

function shuffleArray(array: string[]): string[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const randomBuffer = new Uint32Array(1);
    window.crypto.getRandomValues(randomBuffer);
    const j = randomBuffer[0] % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Calculate password entropy in bits and assess strength level
 */
export function calculateStrength(password: string): PasswordStrength {
  if (!password || password.length === 0) {
    return {
      level: "Weak",
      score: 0,
      entropy: 0,
      percent: 0,
      color: "#ef4444",
      feedback: "Enter or generate a password",
    };
  }

  let poolSize = 0;
  if (/[a-z]/.test(password)) poolSize += 26;
  if (/[A-Z]/.test(password)) poolSize += 26;
  if (/[0-9]/.test(password)) poolSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) poolSize += 33;

  if (poolSize === 0) poolSize = 1;

  // Entropy = length * log2(poolSize)
  const entropy = Math.round(password.length * Math.log2(poolSize));

  let level: StrengthLevel = "Weak";
  let score = 1;
  let percent = 25;
  let color = "#ef4444";
  let feedback = "Too easy to crack. Increase length or variety.";

  if (entropy < 40) {
    level = "Weak";
    score = 1;
    percent = 25;
    color = "#ef4444";
    feedback = "Weak: High vulnerability to brute-force.";
  } else if (entropy < 65) {
    level = "Medium";
    score = 2;
    percent = 50;
    color = "#f59e0b";
    feedback = "Medium: Good for casual accounts, but add symbols.";
  } else if (entropy < 90) {
    level = "Strong";
    score = 3;
    percent = 75;
    color = "#10b981";
    feedback = "Strong: Resistant to standard automated attacks.";
  } else {
    level = "Very Strong";
    score = 4;
    percent = 100;
    color = "#06b6d4"; // Cyan/Purple RGB signature
    feedback = "Maximum Security: Impenetrable cryptographic entropy.";
  }

  return {
    level,
    score,
    entropy,
    percent,
    color,
    feedback,
  };
}
