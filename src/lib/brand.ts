/**
 * Working product name. Not chosen yet (site plan open question 8): trademark
 * and domain checks are still to do. Change it in one place with
 * NEXT_PUBLIC_PRODUCT_NAME.
 */
export const PRODUCT_NAME = process.env.NEXT_PUBLIC_PRODUCT_NAME || "ReadyFile";

export const FOOTER_DISCLAIMER = `${PRODUCT_NAME} provides legal information and organization tools. It is not a law firm and does not provide legal advice. For advice about your situation, speak to a lawyer or licensed paralegal.`;

export const APP_BADGE = "Legal information, not legal advice.";

export const SIGNUP_ACK = `I understand ${PRODUCT_NAME} is an organization tool that provides legal information, not legal advice, and is not a law firm. No lawyer-client relationship is created.`;

export const EXPORT_DISCLAIMER = `Prepared by the user with ${PRODUCT_NAME} from user-supplied documents. AI-assisted. Not legal advice. Not reviewed by a lawyer unless stated.`;

export const EXPORT_CHECK_NOTICE =
  "Before you file anything with a court, check every fact against its source page. Courts in Ontario expect you to confirm that what you file is accurate.";

export const REFUSAL_COPY =
  "I can't tell you what to do in your case or predict how it will go. I can show you what your documents say, explain the general process with links to official sources, and help you write questions for a lawyer.";

export const GUIDE_BOX =
  "General information about Ontario court process. It may not fit your situation.";

export const OFFICIAL_LINK_NOTE = "Official source. Read it yourself and check it is current before relying on it.";
