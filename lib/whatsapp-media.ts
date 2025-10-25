import { twilioClient } from './twilio';
import { generatePickupQRCode } from './qrcode-generator';

export async function sendWhatsAppImage(
  phoneNumber: string,
  imageUrl: string,
  caption?: string
) {
  try {
    const message = await twilioClient.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: `whatsapp:${phoneNumber}`,
      mediaUrl: [imageUrl],
      body: caption || '',
    });

    return message;
  } catch (error) {
    console.error('Failed to send WhatsApp image:', error);
    throw error;
  }
}

export async function sendQRCodeWhatsApp(
  phoneNumber: string,
  orderNumber: string,
  orderId: string
) {
  try {
    // Générer le QR code
    const qrBuffer = await generatePickupQRCode(orderNumber, orderId);
    
    // Convertir en base64 pour l'envoi
    const qrBase64 = qrBuffer.toString('base64');
    const qrDataUrl = `data:image/png;base64,${qrBase64}`;

    // Note: Twilio nécessite une URL publique pour les médias
    // En production, uploader sur S3/Cloudinary et utiliser l'URL
    // Pour le MVP, on envoie juste le message avec instructions
    
    const message = `🎫 *QR Code de Retrait*\n\n📦 Commande: ${orderNumber}\n\n✅ Présentez ce QR Code à l'entrepôt pour retirer vos pneus.\n\n📍 Adresse: [Adresse de l'entrepôt]\n⏰ Horaires: Lun-Ven 8h-17h\n\n💡 Astuce: Sauvegardez ce message pour retrouver facilement votre QR Code.`;

    await twilioClient.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: `whatsapp:${phoneNumber}`,
      body: message,
    });

    // TODO: En production, uploader le QR code et l'envoyer comme image
    // const uploadedUrl = await uploadToS3(qrBuffer);
    // await sendWhatsAppImage(phoneNumber, uploadedUrl, message);

    return { success: true, qrCode: qrDataUrl };
  } catch (error) {
    console.error('Failed to send QR code:', error);
    throw error;
  }
}

export async function sendProductImage(
  phoneNumber: string,
  productName: string,
  imageUrl: string,
  price: number
) {
  const caption = `🚗 *${productName}*\n\n💰 Prix: ${price}€\n\nTapez le numéro du produit pour l'ajouter au panier.`;
  
  return sendWhatsAppImage(phoneNumber, imageUrl, caption);
}
