import { NextRequest, NextResponse } from 'next/server';
import { handleWhatsAppMessageInteractive } from '@/lib/whatsapp-bot-interactive';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const from = formData.get('From') as string;
    const body = formData.get('Body') as string;
    const messageSid = formData.get('MessageSid') as string;

    const phoneNumber = from ? from.replace('whatsapp:', '') : 'UNKNOWN';

    if (!from || !body) {
      console.error('❌ Données manquantes');
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    // Enregistrer le message entrant
    const user = await prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (user) {
      await prisma.whatsAppConversation.create({
        data: {
          userId: user.id,
          messageText: body,
          direction: 'inbound',
          messageType: 'text',
          twilioMessageSid: messageSid,
        },
      });
    }
    
    // Traiter avec le chatbot interactif
    await handleWhatsAppMessageInteractive(phoneNumber, body);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Erreur webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}
