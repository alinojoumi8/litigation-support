import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { checkFile, safeFilename } from "@/lib/files";
import { parseEmail } from "@/lib/ocr/email";
import { paginate } from "@/lib/ocr";

const enc = new TextEncoder();

describe("password hashing", () => {
  it("verifies the right password and rejects the wrong one", async () => {
    const h = await hashPassword("a calm sentence for testing");
    expect(h.startsWith("scrypt$")).toBe(true);
    expect(await verifyPassword("a calm sentence for testing", h)).toBe(true);
    expect(await verifyPassword("a calm sentence for testinG", h)).toBe(false);
    expect(await verifyPassword("anything", null)).toBe(false);
    expect(await verifyPassword("anything", "garbage")).toBe(false);
  });

  it("salts every hash", async () => {
    expect(await hashPassword("same password here")).not.toBe(await hashPassword("same password here"));
  });
});

describe("upload validation", () => {
  const max = 1024 * 1024;
  it("accepts allowlisted types whose content matches", () => {
    expect(checkFile("a.pdf", enc.encode("%PDF-1.4 ..."), max)).toMatchObject({ ok: true, kind: "pdf" });
    expect(checkFile("a.png", new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0]), max)).toMatchObject({ ok: true, kind: "png" });
    expect(checkFile("note.txt", enc.encode("hello"), max)).toMatchObject({ ok: true, kind: "text" });
    expect(checkFile("mail.eml", enc.encode("From: a\n\nbody"), max)).toMatchObject({ ok: true, kind: "email" });
  });

  it("rejects disguised, scriptable, empty and oversized files", () => {
    expect(checkFile("fake.pdf", enc.encode("MZ not a pdf"), max).ok).toBe(false);
    expect(checkFile("x.svg", enc.encode("<svg onload=alert(1)>"), max).ok).toBe(false);
    expect(checkFile("x.html", enc.encode("<script>"), max).ok).toBe(false);
    expect(checkFile("bin.txt", new Uint8Array([0x00, 0x01, 0x02]), max).ok).toBe(false);
    expect(checkFile("empty.pdf", new Uint8Array(), max).ok).toBe(false);
    expect(checkFile("big.txt", new Uint8Array(max + 1).fill(65), max).ok).toBe(false);
  });

  it("makes safe file names", () => {
    expect(safeFilename("../../etc/passwd")).toBe("passwd");
    expect(safeFilename("C:\\Users\\me\\Invoice #1042 <final>.pdf")).toBe("Invoice _1042 _final_.pdf");
  });
});

describe("email parsing", () => {
  it("reads headers, multipart text, quoted-printable and attachments", () => {
    const raw = [
      "From: Jordan Example <j@example.invalid>",
      "To: Avery Sample <a@example.invalid>",
      "Date: Mon, 2 Jun 2025 16:40:00 -0400",
      "Subject: =?UTF-8?Q?Invoice_1042?=",
      'Content-Type: multipart/mixed; boundary="b1"',
      "",
      "--b1",
      "Content-Type: text/plain; charset=utf-8",
      "Content-Transfer-Encoding: quoted-printable",
      "",
      "Please see the attached quote. Total =2412,400.00.",
      "--b1",
      'Content-Type: application/pdf; name="quote.pdf"',
      'Content-Disposition: attachment; filename="quote.pdf"',
      "Content-Transfer-Encoding: base64",
      "",
      "JVBERi0=",
      "--b1--",
    ].join("\r\n");
    const { meta, text } = parseEmail(raw);
    expect(meta.subject).toBe("Invoice 1042");
    expect(meta.attachments).toEqual(["quote.pdf"]);
    expect(text).toContain("Total $12,400.00.");
    expect(text).toContain("Attachments listed: quote.pdf");
  });

  it("splits long text into pages at paragraph breaks and on form feeds", () => {
    const para = "x".repeat(1200);
    expect(paginate([para, para, para].join("\n\n"), 3000)).toHaveLength(2);
    expect(paginate("page one\fpage two")).toEqual(["page one", "page two"]);
  });
});
