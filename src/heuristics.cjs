// CommonJS duplicate of the heuristics dictionary
const HARDCODED_PATTERNS = [
  /(?:A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/g,
  /[sr]k_(?:live|test)_[a-zA-Z0-9]{24,99}/g,
  /gh[pasu]_[a-zA-Z0-9]{36}/g,
  /AIza[0-9A-Za-z\-_]{35}/g,
  /xox[pboa]-[0-9]{10,13}-[0-9]{10,13}-[a-zA-Z0-9]{24,32}/g
];

module.exports = { HARDCODED_PATTERNS };