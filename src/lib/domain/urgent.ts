/**
 * Urgent-situation detection (site plan 7.8). When intake or notes mention an
 * emergency, show a calm panel pointing to people who can help today.
 */
const URGENT_PATTERNS: RegExp[] = [
  /\bin custody\b/i,
  /\b(?:arrested|in jail|detained)\b/i,
  /\bbail hearing\b/i,
  /\bhearing (?:is )?(?:tomorrow|today|this morning|this afternoon)\b/i,
  /\b(?:trial|court) (?:is )?(?:tomorrow|today)\b/i,
  /\b(?:violence|violent|abuse|assault(?:ed)?|threat(?:en|ened|s)?|unsafe|not safe|danger)\b/i,
  /\bsafety\b/i,
  /\beviction (?:today|tomorrow|now)\b/i,
  /\bevicted (?:today|tomorrow)\b/i,
  /\b(?:sheriff|locked out)\b/i,
];

export function detectUrgent(text: string): boolean {
  return URGENT_PATTERNS.some((re) => re.test(text));
}
