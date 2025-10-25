import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { sendWhatsAppMessage } from '@/lib/twilio';
import { sendQRCodeWhatsApp } from '@/lib/whatsapp-media';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  // Gérer l'événement
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const orderId = paymentIntent.metadata.orderId;

    if (orderId) {
      // Récupérer la commande avec l'utilisateur
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          user: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (order) {
        // Mettre à jour le statut de la commande
        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: 'paid',
          },
        });

        // Mettre à jour le pickup tracking
        await prisma.pickupTracking.update({
          where: { orderId },
          data: {
            status: 'pending',
          },
        });

        // Envoyer notification de paiement confirmé
        const totalTTC = Number(order.totalAmount) * 1.2;
        const confirmMessage = `✅ *Paiement confirmé !*\n\n📦 Commande: ${order.orderNumber}\n💰 Montant: ${totalTTC.toFixed(2)}€ TTC\n\n🎫 Vous allez recevoir votre QR Code de retrait dans quelques instants...`;
        
        await sendWhatsAppMessage(order.user.phoneNumber, confirmMessage);

        // Envoyer le QR Code
        await sendQRCodeWhatsApp(
          order.user.phoneNumber,
          order.orderNumber,
          order.id
        );

        // Envoyer les instructions de retrait
        const pickupMessage = `📍 *Instructions de retrait*\n\n🏢 Adresse: [Adresse de l'entrepôt]\n📍 GPS: [Coordonnées GPS]\n\n⏰ Horaires:\nLun-Ven: 8h00 - 17h00\nSam: 8h00 - 12h00\n\n📝 Documents à apporter:\n• Votre QR Code (ci-dessus)\n• Pièce d'identité\n\n💡 Vos pneus seront prêts sous 24h.\n\nTapez "commandes" pour voir vos commandes.`;

        await sendWhatsAppMessage(order.user.phoneNumber, pickupMessage);

        console.log(`✅ Payment succeeded and notifications sent for order ${orderId}`);
      }
    }
  }

  return NextResponse.json({ received: true });
}
