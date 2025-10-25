import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsAppMessage } from '@/lib/twilio';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const sendMessageSchema = z.object({
  phoneNumber: z.string(),
  message: z.string(),
  orderId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, message, orderId } = sendMessageSchema.parse(body);

    // Envoyer le message
    const twilioMessage = await sendWhatsAppMessage(phoneNumber, message);

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (user) {
      // Enregistrer la conversation
      await prisma.whatsAppConversation.create({
        data: {
          userId: user.id,
          orderId: orderId || null,
          messageText: message,
          direction: 'outbound',
          messageType: 'text',
          twilioMessageSid: twilioMessage.sid,
        },
      });
    }

    return NextResponse.json({ success: true, messageSid: twilioMessage.sid });
  } catch (error) {
    console.error('Send WhatsApp message error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
