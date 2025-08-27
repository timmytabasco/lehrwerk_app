// backend/middleware/spamGuard.js
import validator from "validator";

/**
 * Basic Spam Guard:
 * - Honeypot: req.body.hp muss leer sein
 * - Form-Age: clientTS muss >= 3s alt sein
 * - Plausibilitätschecks: Längen + simple URL-Limits
 */
export default function spamGuard(required = []) {
  return (req, res, next) => {
    const b = req.body || {};

    // 1) Pflichtfelder
    for (const f of required) {
      if (!b[f] || String(b[f]).trim() === "") {
        return res.status(400).json({ error: "Pflichtfelder fehlen." });
      }
    }

    // 2) Honeypot (unsichtbares Feld "hp" muss leer sein)
    if (typeof b.hp !== "undefined" && String(b.hp).trim() !== "") {
      return res.status(200).json({ success: true }); // leise "ok"
    }

    // 3) Form-Age (clientTS = ms since epoch beim Rendern)
    const now = Date.now();
    const clientTS = Number(b.ts || 0);
    if (!clientTS || isNaN(clientTS) || now - clientTS < 3000 || now - clientTS > 20 * 60 * 1000) {
      return res.status(400).json({ error: "Ungültige Formularzeit." });
    }

    // 4) Plausibilität / Limits
    const fieldStr = (x) => (typeof x === "string" ? x : "");
    const name = fieldStr(b.name);
    const email = fieldStr(b.email);
    const phone = fieldStr(b.phone);
    const message = fieldStr(b.message);
    const date = fieldStr(b.date);
    const time = fieldStr(b.time);

    // Längen
    if (name.length > 100 || email.length > 200 || phone.length > 40 || message.length > 2000) {
      return res.status(400).json({ error: "Feld zu lang." });
    }

    // E-Mail grob prüfen
    if (email && !validator.isEmail(email)) {
      return res.status(400).json({ error: "E-Mail ungültig." });
    }

    // Max. 2 Links im Freitext
    const urlLike = (message.match(/https?:\/\/|www\./gi) || []).length;
    if (urlLike > 2) {
      return res.status(400).json({ error: "Zu viele Links." });
    }

    next();
  };
}
