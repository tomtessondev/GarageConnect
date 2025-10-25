import twilio from 'twilio';

if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
  throw new Error('Twilio credentials are not defined');
}

export const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendWhatsAppMessage(to: string, body: string) {
  try {
    const message = await twilioClient.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: `whatsapp:${to}`,
      body,
    });
    
    console.log(`✅ Envoyé → ${to}`);
    
    return message;
  } catch (error) {
    console.error('❌ Erreur envoi:', error);
    throw error;
  }
}

export async function sendWhatsAppListMessage(
  to: string,
  body: string,
  buttonText: string,
  sections: Array<{
    title: string;
    rows: Array<{ id: string; title: string; description?: string }>;
  }>
) {
  try {
    const message = await twilioClient.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: `whatsapp:${to}`,
      body,
      contentSid: 'HX229f5a04fd0510ce1b071852155d3e15', // Twilio List Message template
      contentVariables: JSON.stringify({
        1: buttonText,
        2: JSON.stringify(sections),
      }),
    });
    
    console.log(`✅ Liste envoyée → ${to}`);
    
    return message;
  } catch (error) {
    console.error('❌ Erreur envoi liste:', error);
    // Fallback to regular message
    return await sendWhatsAppMessage(to, body);
  }
}

export async function sendWhatsAppButtonMessage(
  to: string,
  body: string,
  buttons: Array<{ id: string; title: string }>
) {
  try {
    // WhatsApp Business API buttons (max 3 buttons)
    const buttonPayload = buttons.slice(0, 3).map((btn, index) => ({
      type: 'reply',
      reply: {
        id: btn.id,
        title: btn.title.substring(0, 20), // Max 20 chars
      },
    }));

    const message = await twilioClient.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: `whatsapp:${to}`,
      body,
      contentSid: 'HXb5b62575e6e4ff6129ad7c8efe1f983e', // Twilio Button template
      contentVariables: JSON.stringify({
        1: JSON.stringify(buttonPayload),
      }),
    });
    
    console.log(`✅ Boutons envoyés → ${to}`);
    
    return message;
  } catch (error) {
    console.error('❌ Erreur envoi boutons:', error);
    // Fallback to regular message with numbered options
    const fallbackBody = body + '\n\n' + buttons.map((btn, i) => `${i + 1}. ${btn.title}`).join('\n');
    return await sendWhatsAppMessage(to, fallbackBody);
  }
}
