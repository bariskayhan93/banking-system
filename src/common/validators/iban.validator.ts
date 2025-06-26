import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsValidIban(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidIban',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return typeof value === 'string' && isValidIbanFormat(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid IBAN format`;
        },
      },
    });
  };
}

export function isValidIbanFormat(iban: string): boolean {
  if (!iban || typeof iban !== 'string') {
    return false;
  }

  // Remove spaces and convert to uppercase
  const normalizedIban = iban.replace(/\s/g, '').toUpperCase();

  // Check length (15-34 characters for different countries)
  if (normalizedIban.length < 15 || normalizedIban.length > 34) {
    return false;
  }

  // Check if it starts with 2 letters (country code) followed by 2 digits (check digits)
  const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/;
  if (!ibanRegex.test(normalizedIban)) {
    return false;
  }

  // Validate checksum using mod-97 algorithm
  return validateIbanChecksum(normalizedIban);
}

function validateIbanChecksum(iban: string): boolean {
  // Move first 4 characters to the end
  const rearranged = iban.slice(4) + iban.slice(0, 4);

  // Replace letters with numbers (A=10, B=11, ..., Z=35)
  let numericString = '';
  for (const char of rearranged) {
    if (/[A-Z]/.test(char)) {
      numericString += (char.charCodeAt(0) - 55).toString();
    } else {
      numericString += char;
    }
  }

  // Calculate mod 97
  return mod97(numericString) === 1;
}

function mod97(numericString: string): number {
  let remainder = 0;
  for (let i = 0; i < numericString.length; i++) {
    remainder = (remainder * 10 + parseInt(numericString[i], 10)) % 97;
  }
  return remainder;
}

// Utility function to format IBAN with spaces for display
export function formatIban(iban: string): string {
  if (!iban) return iban;
  const normalized = iban.replace(/\s/g, '').toUpperCase();
  return normalized.replace(/(.{4})/g, '$1 ').trim();
}

// Utility function to normalize IBAN for storage
export function normalizeIban(iban: string): string {
  if (!iban) return iban;
  return iban.replace(/\s/g, '').toUpperCase();
}

// Country-specific IBAN length validation
const IBAN_LENGTHS: Record<string, number> = {
  AD: 24,
  AE: 23,
  AL: 28,
  AT: 20,
  AZ: 28,
  BA: 20,
  BE: 16,
  BG: 22,
  BH: 22,
  BR: 29,
  BY: 28,
  CH: 21,
  CR: 22,
  CY: 28,
  CZ: 24,
  DE: 22,
  DK: 18,
  DO: 28,
  EE: 20,
  EG: 29,
  ES: 24,
  FI: 18,
  FO: 18,
  FR: 27,
  GB: 22,
  GE: 22,
  GI: 23,
  GL: 18,
  GR: 27,
  GT: 28,
  HR: 21,
  HU: 28,
  IE: 22,
  IL: 23,
  IS: 26,
  IT: 27,
  JO: 30,
  KW: 30,
  KZ: 20,
  LB: 28,
  LC: 32,
  LI: 21,
  LT: 20,
  LU: 20,
  LV: 21,
  MC: 27,
  MD: 24,
  ME: 22,
  MK: 19,
  MR: 27,
  MT: 31,
  MU: 30,
  NL: 18,
  NO: 15,
  PK: 24,
  PL: 28,
  PS: 29,
  PT: 25,
  QA: 29,
  RO: 24,
  RS: 22,
  SA: 24,
  SE: 24,
  SI: 19,
  SK: 24,
  SM: 27,
  TN: 24,
  TR: 26,
  UA: 29,
  VG: 24,
  XK: 20,
};

export function validateIbanLength(iban: string): boolean {
  const normalized = normalizeIban(iban);
  const countryCode = normalized.substring(0, 2);
  const expectedLength = IBAN_LENGTHS[countryCode];

  return expectedLength ? normalized.length === expectedLength : false;
}
