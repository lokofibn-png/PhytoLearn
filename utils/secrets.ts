
export enum SecretType {
  SKIP_LESSON = 'SKIP_LESSON',
  FULL_SKIP = 'FULL_SKIP',
  ANTIGRAVITY = 'ANTIGRAVITY',
  ZEN = 'ZEN',
  LIFE = 'LIFE',
  FSOCIETY = 'FSOCIETY',
  HELLO_WORLD = 'HELLO_WORLD',
  SERBIA = 'SERBIA',
  ENABLE_MENTOR = 'ENABLE_MENTOR',
  NONE = 'NONE'
}

// Base64 encoded secrets to hide them from source code search
// "enable_pair_finish" -> ZW5hYmxlX3BhaXJfZmluaXNo

const SECRETS: Record<string, SecretType> = {
    'c2tpcF9sZXNzb25fZGV2X2ZpcmU=': SecretType.SKIP_LESSON,
    'ZnVsbGxlc3NvbnNraXAuZGV2': SecretType.FULL_SKIP,
    'aW1wb3J0IGFudGlncmF2aXR5': SecretType.ANTIGRAVITY,
    'aW1wb3J0IHRoaXM=': SecretType.ZEN,
    'NDI=': SecretType.LIFE,
    'ZnNvY2lldHk=': SecretType.FSOCIETY,
    'aGVsbG8gd29ybGQ=': SecretType.HELLO_WORLD,
    'c2VyYmlh': SecretType.SERBIA,
    'ZW5hYmxlX3BhaXJfZmluaXNo': SecretType.ENABLE_MENTOR
};

export const checkSecret = (input: string): SecretType => {
    try {
        // Normalize input: trim
        const normalized = input.trim(); 
        
        // Try exact match (e.g. for case sensitive passwords if needed)
        let encoded = btoa(normalized);
        if (SECRETS[encoded]) return SECRETS[encoded];
        
        // Try lowercase match (most cheats are case-insensitive)
        encoded = btoa(normalized.toLowerCase());
        if (SECRETS[encoded]) return SECRETS[encoded];

        return SecretType.NONE;
    } catch (e) {
        return SecretType.NONE;
    }
};

export const decodeSecretId = (type: SecretType): string => {
    switch(type) {
        case SecretType.HELLO_WORLD: return 'HELLO_WORLD';
        case SecretType.SERBIA: return 'SERBIA';
        case SecretType.ENABLE_MENTOR: return 'ENABLE_MENTOR';
        default: return type;
    }
};