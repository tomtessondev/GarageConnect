import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('\n⚠️  ========== POST SUR RACINE / ==========');
  console.log('  URL:', request.url);
  console.log('  Headers:', Object.fromEntries(request.headers));
  
  try {
    const formData = await request.formData();
    console.log('  FormData:', Object.fromEntries(formData));
    console.log('\n❌ ERREUR: Twilio appelle "/" au lieu de "/api/whatsapp/webhook"');
    console.log('   → Corrigez l\'URL dans Twilio Console !');
    console.log('   → URL correcte: https://thick-roses-unite.loca.lt/api/whatsapp/webhook');
    console.log('==========================================\n');
  } catch (error) {
    console.error('Erreur lecture formData:', error);
  }
  
  return NextResponse.json({ 
    error: 'Wrong endpoint',
    message: 'Please configure Twilio webhook to: /api/whatsapp/webhook'
  }, { status: 400 });
}
