// Hardcoded patterns to catch standard API keys even without a .env file
export const HARDCODED_PATTERNS = [
    // AWS Access Key ID
    /(?:A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/g,
    // Stripe Secret & Restricted Keys
    /[sr]k_(?:live|test)_[a-zA-Z0-9]{24,99}/g,
    // GitHub Personal Access Tokens
    /gh[pasu]_[a-zA-Z0-9]{36}/g,
    // Google / GCP API Keys
    /AIza[0-9A-Za-z\-_]{35}/g,
    // Slack Tokens
    /xox[pboa]-[0-9]{10,13}-[0-9]{10,13}-[a-zA-Z0-9]{24,32}/g
];