import QRCode from "qrcode";

interface QrPaymentInput {
  iban: string | null;
  amount: number;
  currency?: string;
  variableSymbol?: string | null;
  message?: string | null;
}

/**
 * Builds a Czech "QR Platba" (SPD 1.0) payment string.
 * @see https://qr-platba.cz/pro-vyvojare/specifikace-formatu/
 */
export function buildSpdString({
  iban,
  amount,
  currency = "CZK",
  variableSymbol,
  message,
}: QrPaymentInput): string | null {
  if (!iban) return null;
  const parts = [
    "SPD*1.0",
    `ACC:${iban.replace(/\s+/g, "")}`,
    `AM:${amount.toFixed(2)}`,
    `CC:${currency}`,
  ];
  if (variableSymbol) parts.push(`X-VS:${variableSymbol}`);
  if (message) parts.push(`MSG:${message.slice(0, 60)}`);
  return parts.join("*");
}

/**
 * Renders a payment string as a QR-code PNG data URI (server-side).
 */
export async function qrDataUri(payload: string): Promise<string> {
  return QRCode.toDataURL(payload, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 220,
    color: { dark: "#1A1D23", light: "#FFFFFF" },
  });
}
