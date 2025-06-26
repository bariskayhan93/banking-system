import { isValidIbanFormat, normalizeIban, formatIban, validateIbanLength } from './iban.validator';

describe('IBAN Validator', () => {
  describe('isValidIbanFormat', () => {
    it('should accept valid IBANs', () => {
      expect(isValidIbanFormat('DE89370400440532013000')).toBe(true);
      expect(isValidIbanFormat('GB29NWBK60161331926819')).toBe(true);
      expect(isValidIbanFormat('FR1420041010050500013M02606')).toBe(true);
    });

    it('should reject invalid formats', () => {
      expect(isValidIbanFormat('')).toBe(false);
      expect(isValidIbanFormat(null as any)).toBe(false);
      expect(isValidIbanFormat('12345')).toBe(false); // Too short
      expect(isValidIbanFormat('DE')).toBe(false); // Too short
      expect(isValidIbanFormat('DE8937040044053201300012345678901234567890')).toBe(false); // Too long
    });

    it('should handle spaces in IBAN', () => {
      expect(isValidIbanFormat('DE89 3704 0044 0532 0130 00')).toBe(true);
    });

    it('should reject non-alphanumeric characters', () => {
      expect(isValidIbanFormat('DE89-3704-0044-0532-0130-00')).toBe(false);
      expect(isValidIbanFormat('DE89@370400440532013000')).toBe(false);
    });
  });

  describe('normalizeIban', () => {
    it('should remove spaces and uppercase', () => {
      expect(normalizeIban('de89 3704 0044 0532 0130 00')).toBe('DE89370400440532013000');
      expect(normalizeIban('  gb29nwbk60161331926819  ')).toBe('GB29NWBK60161331926819');
    });

    it('should handle empty input', () => {
      expect(normalizeIban('')).toBe('');
    });
  });

  describe('formatIban', () => {
    it('should add spaces every 4 characters', () => {
      expect(formatIban('DE89370400440532013000')).toBe('DE89 3704 0044 0532 0130 00');
      expect(formatIban('GB29NWBK60161331926819')).toBe('GB29 NWBK 6016 1331 9268 19');
    });

    it('should handle empty input', () => {
      expect(formatIban('')).toBe('');
    });
  });

  describe('validateIbanLength', () => {
    it('should validate country-specific lengths', () => {
      expect(validateIbanLength('DE89370400440532013000')).toBe(true); // DE = 22
      expect(validateIbanLength('GB29NWBK60161331926819')).toBe(true); // GB = 22
      expect(validateIbanLength('NL91ABNA0417164300')).toBe(true); // NL = 18
    });

    it('should reject wrong lengths', () => {
      expect(validateIbanLength('DE8937040044053201300')).toBe(false); // 21 instead of 22
      expect(validateIbanLength('GB29NWBK6016133192681')).toBe(false); // 21 instead of 22
    });

    it('should reject unknown country codes', () => {
      expect(validateIbanLength('XX29NWBK60161331926819')).toBe(false);
    });
  });
});
