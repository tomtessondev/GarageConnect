import QRCode from 'qrcode';

export async function generateQRCode(data: string): Promise<Buffer> {
  try {
    // Générer le QR code en buffer
    const qrBuffer = await QRCode.toBuffer(data, {
      errorCorrectionLevel: 'H',
      type: 'png',
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    return qrBuffer;
  } catch (error) {
    console.error('QR Code generation error:', error);
    throw error;
  }
}

export async function generateQRCodeDataURL(data: string): Promise<string> {
  try {
    const dataURL = await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'H',
      width: 400,
      margin: 2,
    });

    return dataURL;
  } catch (error) {
    console.error('QR Code data URL generation error:', error);
    throw error;
  }
}

export async function generatePickupQRCode(orderNumber: string, orderId: string): Promise<Buffer> {
  const qrData = JSON.stringify({
    type: 'pickup',
    orderNumber,
    orderId,
    timestamp: new Date().toISOString(),
  });

  return generateQRCode(qrData);
}
