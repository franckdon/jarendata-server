import { env } from "../../config/env";
import { AppError } from "../../utils/appError";

type SendTextMessageParams = {
  provider: "META" | "TWILIO" | "MOCK";
  accessToken?: string | null;
  phoneNumberId?: string | null;
  to: string;
  body: string;
};

export const sendWhatsAppTextMessage = async ({
  provider,
  accessToken,
  phoneNumberId,
  to,
  body,
}: SendTextMessageParams) => {
  if (provider === "MOCK") {
    return {
      success: true,
      providerMessageId: `mock_${Date.now()}`,
      raw: {
        mock: true,
        to,
        body,
      },
      errorMessage: null,
    };
  }

  if (provider === "TWILIO") {
    return {
      success: false,
      providerMessageId: null,
      raw: {
        provider: "TWILIO",
        message: "Twilio non encore implémenté",
      },
      errorMessage: "Twilio non encore implémenté",
    };
  }

  if (!accessToken || !phoneNumberId) {
    throw new AppError("Configuration META WhatsApp incomplète", 400);
  }

  const url = `https://graph.facebook.com/${env.whatsappGraphApiVersion}/${phoneNumberId}/messages`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: {
        preview_url: false,
        body,
      },
    }),
  });

  const json = await response.json();

  if (!response.ok) {
    return {
      success: false,
      providerMessageId: null,
      raw: json,
      errorMessage:
        json?.error?.message || "Erreur lors de l’envoi WhatsApp META",
    };
  }

  return {
    success: true,
    providerMessageId: json?.messages?.[0]?.id || null,
    raw: json,
    errorMessage: null,
  };
};