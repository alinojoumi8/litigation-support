/**
 * Authority lookup.
 *
 * Legal sources shown in the product come only from this curated,
 * human-maintained list (site plan 7.2 rule 2), never from model output.
 * Every entry links to an official source. Anything not found here is shown
 * with "Verify before filing" and a CanLII search link, never as a citation.
 *
 * Entries were compiled from general knowledge and the project's research
 * notes; each needs checking against the official page before public launch
 * (see docs/lawyer-review-register.md).
 */

export interface Authority {
  id: string;
  title: string;
  /** Short reference text. Allowed to pass the citation guard. */
  citation: string;
  jurisdiction: "Ontario" | "Canada (federal)";
  url: string;
  publisher: string;
  note: string;
}

export const CURATED_AUTHORITIES: readonly Authority[] = [
  {
    id: "rcp",
    title: "Rules of Civil Procedure",
    citation: "R.R.O. 1990, Reg. 194",
    jurisdiction: "Ontario",
    url: "https://www.ontario.ca/laws/regulation/900194",
    publisher: "Ontario e-Laws",
    note: "Rules for civil cases in the Superior Court of Justice.",
  },
  {
    id: "rcp-30-1",
    title: "Deemed undertaking (Rules of Civil Procedure, rule 30.1.01)",
    citation: "r. 30.1.01",
    jurisdiction: "Ontario",
    url: "https://www.ontario.ca/laws/regulation/900194",
    publisher: "Ontario e-Laws",
    note: "Limits on using evidence obtained through discovery outside the case. Read the current rule text.",
  },
  {
    id: "rcp-4-1",
    title: "Duty of expert (Rules of Civil Procedure, rule 4.1.01)",
    citation: "r. 4.1.01",
    jurisdiction: "Ontario",
    url: "https://www.ontario.ca/laws/regulation/900194",
    publisher: "Ontario e-Laws",
    note: "Experts owe a duty to the court to be fair, objective and non-partisan. Read the current rule text.",
  },
  {
    id: "scc-rules",
    title: "Rules of the Small Claims Court",
    citation: "O. Reg. 258/98",
    jurisdiction: "Ontario",
    url: "https://www.ontario.ca/laws/regulation/980258",
    publisher: "Ontario e-Laws",
    note: "Rules for cases in the Small Claims Court.",
  },
  {
    id: "cja",
    title: "Courts of Justice Act",
    citation: "R.S.O. 1990, c. C.43",
    jurisdiction: "Ontario",
    url: "https://www.ontario.ca/laws/statute/90c43",
    publisher: "Ontario e-Laws",
    note: "Sets up Ontario's courts, including the Small Claims Court.",
  },
  {
    id: "limitations",
    title: "Limitations Act, 2002",
    citation: "S.O. 2002, c. 24, Sched. B",
    jurisdiction: "Ontario",
    url: "https://www.ontario.ca/laws/statute/02l24",
    publisher: "Ontario e-Laws",
    note: "Time limits for starting many civil claims. Ask a lawyer how it applies to you.",
  },
  {
    id: "oreg-384-24",
    title: "O. Reg. 384/24 (amendments to the Rules of Civil Procedure)",
    citation: "O. Reg. 384/24",
    jurisdiction: "Ontario",
    url: "https://www.ontario.ca/laws/regulation/r24384",
    publisher: "Ontario e-Laws",
    note: "Added certification that authorities cited in factums are authentic. Verify current wording.",
  },
  {
    id: "smallclaims-guide",
    title: "Small claims court: suing someone",
    citation: "Ontario Small Claims Court guides",
    jurisdiction: "Ontario",
    url: "https://www.ontario.ca/page/suing-someone-small-claims-court",
    publisher: "Government of Ontario",
    note: "Official plain-language guide to starting a Small Claims case.",
  },
  {
    id: "smallclaims-sued",
    title: "Small claims court: being sued",
    citation: "Ontario Small Claims Court guide: being sued",
    jurisdiction: "Ontario",
    url: "https://www.ontario.ca/page/being-sued-small-claims-court",
    publisher: "Government of Ontario",
    note: "Official plain-language guide for defendants in Small Claims Court.",
  },
  {
    id: "scj-small-claims",
    title: "Superior Court of Justice: Small Claims Court",
    citation: "Superior Court of Justice Small Claims information",
    jurisdiction: "Ontario",
    url: "https://www.ontariocourts.ca/scj/areas-of-law/small-claims-court/",
    publisher: "Superior Court of Justice",
    note: "Court information and notices for Small Claims Court.",
  },
  {
    id: "ontariocourts-scj",
    title: "Superior Court of Justice: civil rules and practice directions",
    citation: "Superior Court of Justice civil information",
    jurisdiction: "Ontario",
    url: "https://www.ontariocourts.ca/scj/filing-procedures/rules/civil/",
    publisher: "Superior Court of Justice",
    note: "Rules, practice directions and notices for civil matters.",
  },
  {
    id: "scj-criminal",
    title: "Superior Court of Justice: criminal",
    citation: "Superior Court of Justice criminal information",
    jurisdiction: "Ontario",
    url: "https://www.ontariocourts.ca/scj/areas-of-law/criminal/",
    publisher: "Superior Court of Justice",
    note: "Court information and practice directions for criminal matters.",
  },
  {
    id: "ocj",
    title: "Ontario Court of Justice",
    citation: "Ontario Court of Justice",
    jurisdiction: "Ontario",
    url: "https://www.ontariocourts.ca/ocj/",
    publisher: "Ontario Court of Justice",
    note: "Most criminal cases in Ontario start in this court.",
  },
  {
    id: "lao-duty-counsel",
    title: "Legal Aid Ontario: duty counsel",
    citation: "Legal Aid Ontario duty counsel",
    jurisdiction: "Ontario",
    url: "https://www.legalaid.on.ca/duty-counsel/",
    publisher: "Legal Aid Ontario",
    note: "Lawyers at many courthouses who can give some free help on the day.",
  },
  {
    id: "scj-ai-pd",
    title: "Superior Court of Justice: practice directions on the use of AI",
    citation: "SCJ AI practice directions",
    jurisdiction: "Ontario",
    url: "https://www.ontariocourts.ca/scj/news/new-practice-directions-on-the-responsible-use-of-artificial-intelligence-in-court-proceedings/",
    publisher: "Superior Court of Justice",
    note: "Read the directions in full before relying on any summary of them.",
  },
  {
    id: "steps-to-justice",
    title: "Steps to Justice",
    citation: "CLEO Steps to Justice",
    jurisdiction: "Ontario",
    url: "https://stepstojustice.ca/",
    publisher: "Community Legal Education Ontario (CLEO)",
    note: "Plain-language legal information for Ontario.",
  },
  {
    id: "lao",
    title: "Legal Aid Ontario",
    citation: "Legal Aid Ontario",
    jurisdiction: "Ontario",
    url: "https://www.legalaid.on.ca/",
    publisher: "Legal Aid Ontario",
    note: "Legal aid, duty counsel and help in urgent situations.",
  },
  {
    id: "lso-referral",
    title: "Law Society Referral Service",
    citation: "LSO Referral Service",
    jurisdiction: "Ontario",
    url: "https://lso.ca/public-resources/finding-a-lawyer-or-paralegal/law-society-referral-service",
    publisher: "Law Society of Ontario",
    note: "Finds a lawyer or licensed paralegal for a free consultation of up to 30 minutes.",
  },
  {
    id: "criminal-hub",
    title: "Ontario Criminal Digital Disclosure Hub",
    citation: "Ontario Criminal Digital Disclosure Hub",
    jurisdiction: "Ontario",
    url: "https://www.criminaljusticehub.jus.gov.on.ca/doc/en/SelfRepApplicationForm.pdf",
    publisher: "Government of Ontario",
    note: "Self-represented application form for digital disclosure. It sets conditions on how disclosure may be used.",
  },
];

export interface AuthorityLookup {
  /** Find a curated authority by id or citation text. */
  find(query: string): Authority | null;
  /** Citation strings allowed through the citation guard. */
  allowList(): string[];
}

export class CuratedAuthorityLookup implements AuthorityLookup {
  constructor(private readonly list: readonly Authority[] = CURATED_AUTHORITIES) {}

  find(query: string): Authority | null {
    const q = query.trim().toLowerCase();
    return (
      this.list.find((a) => a.id === q || a.citation.toLowerCase() === q || a.title.toLowerCase() === q) ?? null
    );
  }

  allowList(): string[] {
    return this.list.map((a) => a.citation);
  }
}

/** A search link on CanLII. This is not a citation; it lets the user look for themselves. */
export function canliiSearchUrl(text: string): string {
  return `https://www.canlii.org/en/#search/text=${encodeURIComponent(text)}`;
}

export interface AuthorityView {
  kind: "verified-link" | "verify-before-filing";
  label: string;
  url: string;
  note: string;
}

/** How to show any legal reference: an official link, or "verify before filing". */
export function viewAuthority(query: string, lookup: AuthorityLookup = new CuratedAuthorityLookup()): AuthorityView {
  const hit = lookup.find(query);
  if (hit) {
    return {
      kind: "verified-link",
      label: hit.title,
      url: hit.url,
      note: "Official source. Read it yourself and check it is current before relying on it.",
    };
  }
  return {
    kind: "verify-before-filing",
    label: query,
    url: canliiSearchUrl(query),
    note: "Not in our checked list. Verify before filing: search CanLII or ask a lawyer.",
  };
}

export function authorityById(id: string): Authority {
  const a = CURATED_AUTHORITIES.find((x) => x.id === id);
  if (!a) throw new Error(`Unknown authority id: ${id}`);
  return a;
}
