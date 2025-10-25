import { prisma } from './prisma';
import { sendWhatsAppMessage } from './twilio';
import { stripe } from './stripe';

interface UserSession {
  step: 'welcome' | 'search_width' | 'search_height' | 'search_diameter' | 'viewing_results' | 'cart' | 'checkout' | 'payment';
  searchCriteria?: {
    width?: number;
    height?: number;
    diameter?: number;
  };
  cart?: {
    productId: string;
    quantity: number;
  }[];
  lastResults?: any[];
}

// Stocker les sessions utilisateur en mémoire (en production, utiliser Redis)
const userSessions = new Map<string, UserSession>();

export async function handleWhatsAppMessage(phoneNumber: string, message: string) {
  // Récupérer ou créer la session
  let session = userSessions.get(phoneNumber);
  if (!session) {
    session = { step: 'welcome', cart: [] };
    userSessions.set(phoneNumber, session);
  }

  // Récupérer ou créer l'utilisateur
  let user = await prisma.user.findUnique({
    where: { phoneNumber },
  });

  if (!user) {
    user = await prisma.user.create({
      data: { phoneNumber },
    });
  }

  const lowerMessage = message.toLowerCase().trim();

  // Commandes globales
  if (lowerMessage === 'menu' || lowerMessage === 'aide' || lowerMessage === 'help') {
    return await sendMenu(phoneNumber);
  }

  if (lowerMessage === 'panier' || lowerMessage === 'cart') {
    return await showCart(phoneNumber, session);
  }

  if (lowerMessage === 'recherche' || lowerMessage === 'search') {
    session.step = 'search_width';
    session.searchCriteria = {};
    userSessions.set(phoneNumber, session);
    return await sendWhatsAppMessage(
      phoneNumber,
      '🔍 *Recherche de pneus*\n\nQuelle est la *largeur* du pneu ?\n(Ex: 195, 205, 215...)'
    );
  }

  // Gestion selon l'étape
  switch (session.step) {
    case 'welcome':
      return await handleWelcome(phoneNumber, session);

    case 'search_width':
      return await handleSearchWidth(phoneNumber, message, session);

    case 'search_height':
      return await handleSearchHeight(phoneNumber, message, session);

    case 'search_diameter':
      return await handleSearchDiameter(phoneNumber, message, session);

    case 'viewing_results':
      return await handleResultSelection(phoneNumber, message, session);

    case 'cart':
      return await handleCartAction(phoneNumber, message, session);

    case 'checkout':
      return await handleCheckout(phoneNumber, message, session, user);

    default:
      return await sendMenu(phoneNumber);
  }
}

async function handleWelcome(phoneNumber: string, session: UserSession) {
  const welcomeMessage = `🚗 *Bienvenue chez GarageConnect !*

Je suis votre assistant pour trouver et acheter vos pneus en Guadeloupe.

*Comment puis-je vous aider ?*

1️⃣ Rechercher des pneus
2️⃣ Voir mon panier
3️⃣ Mes commandes

Tapez le numéro de votre choix ou "menu" pour plus d'options.`;

  session.step = 'welcome';
  userSessions.set(phoneNumber, session);
  
  return await sendWhatsAppMessage(phoneNumber, welcomeMessage);
}

async function handleSearchWidth(phoneNumber: string, message: string, session: UserSession) {
  const width = parseInt(message);
  
  if (isNaN(width) || width < 100 || width > 400) {
    return await sendWhatsAppMessage(
      phoneNumber,
      '❌ Largeur invalide. Veuillez entrer un nombre entre 100 et 400.\n\nEx: 195, 205, 215...'
    );
  }

  session.searchCriteria!.width = width;
  session.step = 'search_height';
  userSessions.set(phoneNumber, session);

  return await sendWhatsAppMessage(
    phoneNumber,
    `✅ Largeur: ${width}\n\nQuelle est la *hauteur* du pneu ?\n(Ex: 55, 60, 65...)`
  );
}

async function handleSearchHeight(phoneNumber: string, message: string, session: UserSession) {
  const height = parseInt(message);
  
  if (isNaN(height) || height < 30 || height > 90) {
    return await sendWhatsAppMessage(
      phoneNumber,
      '❌ Hauteur invalide. Veuillez entrer un nombre entre 30 et 90.\n\nEx: 55, 60, 65...'
    );
  }

  session.searchCriteria!.height = height;
  session.step = 'search_diameter';
  userSessions.set(phoneNumber, session);

  return await sendWhatsAppMessage(
    phoneNumber,
    `✅ Hauteur: ${height}\n\nQuel est le *diamètre* du pneu ?\n(Ex: 15, 16, 17...)`
  );
}

async function handleSearchDiameter(phoneNumber: string, message: string, session: UserSession) {
  const diameter = parseInt(message);
  
  if (isNaN(diameter) || diameter < 13 || diameter > 22) {
    return await sendWhatsAppMessage(
      phoneNumber,
      '❌ Diamètre invalide. Veuillez entrer un nombre entre 13 et 22.\n\nEx: 15, 16, 17...'
    );
  }

  session.searchCriteria!.diameter = diameter;

  // Rechercher les pneus
  const products = await prisma.product.findMany({
    where: {
      width: session.searchCriteria!.width,
      height: session.searchCriteria!.height,
      diameter: session.searchCriteria!.diameter,
    },
    orderBy: [
      { isOverstock: 'desc' },
      { stockQuantity: 'desc' },
      { priceRetail: 'asc' },
    ],
  });

  if (products.length === 0) {
    session.step = 'welcome';
    userSessions.set(phoneNumber, session);
    
    return await sendWhatsAppMessage(
      phoneNumber,
      `❌ Aucun pneu trouvé pour ${session.searchCriteria!.width}/${session.searchCriteria!.height}R${session.searchCriteria!.diameter}\n\nTapez "recherche" pour une nouvelle recherche.`
    );
  }

  // Afficher les résultats
  session.lastResults = products;
  session.step = 'viewing_results';
  userSessions.set(phoneNumber, session);

  let resultMessage = `🎯 *${products.length} pneu(x) trouvé(s)*\n\n`;
  resultMessage += `Dimensions: ${session.searchCriteria!.width}/${session.searchCriteria!.height}R${session.searchCriteria!.diameter}\n\n`;

  products.forEach((product, index) => {
    const promo = product.isOverstock ? `🔥 -${product.discountPercent}% ` : '';
    const stock = product.stockQuantity > 0 ? `✅ ${product.stockQuantity} en stock` : '⏳ Sur commande';
    
    resultMessage += `*${index + 1}. ${product.brand} ${product.model}*\n`;
    resultMessage += `${promo}${product.priceRetail}€ | ${stock}\n\n`;
  });

  resultMessage += `\n📝 *Pour ajouter au panier:*\nTapez le numéro + quantité\nEx: "1 4" pour 4 pneus du produit 1\n\n`;
  resultMessage += `Tapez "panier" pour voir votre panier`;

  return await sendWhatsAppMessage(phoneNumber, resultMessage);
}

async function handleResultSelection(phoneNumber: string, message: string, session: UserSession) {
  const parts = message.trim().split(' ');
  const productIndex = parseInt(parts[0]) - 1;
  const quantity = parts.length > 1 ? parseInt(parts[1]) : 4;

  if (isNaN(productIndex) || !session.lastResults || productIndex < 0 || productIndex >= session.lastResults.length) {
    return await sendWhatsAppMessage(
      phoneNumber,
      '❌ Numéro de produit invalide. Veuillez réessayer.\n\nEx: "1 4" pour 4 pneus du produit 1'
    );
  }

  if (isNaN(quantity) || quantity < 1 || quantity > 20) {
    return await sendWhatsAppMessage(
      phoneNumber,
      '❌ Quantité invalide (1-20). Veuillez réessayer.\n\nEx: "1 4" pour 4 pneus'
    );
  }

  const product = session.lastResults[productIndex];
  
  // Ajouter au panier
  if (!session.cart) session.cart = [];
  
  const existingItem = session.cart.find(item => item.productId === product.id);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    session.cart.push({ productId: product.id, quantity });
  }

  userSessions.set(phoneNumber, session);

  const total = session.cart.reduce((sum, item) => {
    const prod = session.lastResults!.find(p => p.id === item.productId);
    return sum + (prod ? Number(prod.priceRetail) * item.quantity : 0);
  }, 0);

  return await sendWhatsAppMessage(
    phoneNumber,
    `✅ *Ajouté au panier !*\n\n${product.brand} ${product.model}\nQuantité: ${quantity}\nPrix: ${Number(product.priceRetail) * quantity}€\n\n🛒 Total panier: ${total.toFixed(2)}€\n\n*Options:*\n• Tapez un autre numéro pour ajouter\n• "panier" pour voir le panier\n• "commander" pour finaliser`
  );
}

async function showCart(phoneNumber: string, session: UserSession) {
  if (!session.cart || session.cart.length === 0) {
    return await sendWhatsAppMessage(
      phoneNumber,
      '🛒 *Votre panier est vide*\n\nTapez "recherche" pour trouver des pneus.'
    );
  }

  let cartMessage = '🛒 *Votre Panier*\n\n';
  let total = 0;

  for (const item of session.cart) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
    });

    if (product) {
      const subtotal = Number(product.priceRetail) * item.quantity;
      total += subtotal;
      
      cartMessage += `• ${product.brand} ${product.model}\n`;
      cartMessage += `  ${item.quantity} pneus × ${product.priceRetail}€ = ${subtotal}€\n\n`;
    }
  }

  const totalTTC = total * 1.2;
  cartMessage += `*Sous-total:* ${total.toFixed(2)}€\n`;
  cartMessage += `*TVA (20%):* ${(total * 0.2).toFixed(2)}€\n`;
  cartMessage += `*Total TTC:* ${totalTTC.toFixed(2)}€\n\n`;
  cartMessage += `📝 Tapez "commander" pour finaliser\n`;
  cartMessage += `Ou "vider" pour vider le panier`;

  session.step = 'cart';
  userSessions.set(phoneNumber, session);

  return await sendWhatsAppMessage(phoneNumber, cartMessage);
}

async function handleCartAction(phoneNumber: string, message: string, session: UserSession) {
  const lowerMessage = message.toLowerCase().trim();

  if (lowerMessage === 'commander' || lowerMessage === 'commander') {
    session.step = 'checkout';
    userSessions.set(phoneNumber, session);
    
    return await sendWhatsAppMessage(
      phoneNumber,
      '📋 *Finalisation de la commande*\n\nVoulez-vous ajouter votre email pour recevoir la confirmation ?\n\nTapez votre email ou "non" pour continuer sans email.'
    );
  }

  if (lowerMessage === 'vider') {
    session.cart = [];
    session.step = 'welcome';
    userSessions.set(phoneNumber, session);
    
    return await sendWhatsAppMessage(
      phoneNumber,
      '✅ Panier vidé.\n\nTapez "recherche" pour une nouvelle recherche.'
    );
  }

  return await sendWhatsAppMessage(
    phoneNumber,
    'Tapez "commander" pour finaliser ou "vider" pour vider le panier.'
  );
}

async function handleCheckout(phoneNumber: string, message: string, session: UserSession, user: any) {
  const lowerMessage = message.toLowerCase().trim();
  
  // Créer la commande
  if (!session.cart || session.cart.length === 0) {
    return await sendWhatsAppMessage(phoneNumber, '❌ Votre panier est vide.');
  }

  // Calculer le total
  let totalAmount = 0;
  const orderItems = [];

  for (const item of session.cart) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
    });

    if (product) {
      const subtotal = Number(product.priceRetail) * item.quantity;
      totalAmount += subtotal;
      
      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.priceRetail,
        subtotal,
      });
    }
  }

  // Générer le numéro de commande
  const year = new Date().getFullYear();
  const orderCount = await prisma.order.count();
  const orderNumber = `GC-${year}-${String(orderCount + 1).padStart(4, '0')}`;

  // Créer la commande
  const order = await prisma.order.create({
    data: {
      userId: user.id,
      orderNumber,
      totalAmount,
      items: {
        create: orderItems,
      },
      pickupTracking: {
        create: {},
      },
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  // Créer le Payment Intent Stripe
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(totalAmount * 1.2 * 100), // TTC en centimes
    currency: 'eur',
    metadata: {
      orderId: order.id,
      orderNumber: order.orderNumber,
    },
    automatic_payment_methods: {
      enabled: true,
    },
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { stripePaymentIntentId: paymentIntent.id },
  });

  // Vider le panier
  session.cart = [];
  session.step = 'welcome';
  userSessions.set(phoneNumber, session);

  const totalTTC = totalAmount * 1.2;
  const paymentLink = `${process.env.NEXT_PUBLIC_APP_URL}/order/${order.id}`;

  const confirmationMessage = `✅ *Commande créée !*\n\n📦 *${orderNumber}*\n\n💰 *Total: ${totalTTC.toFixed(2)}€ TTC*\n\n🔗 *Lien de paiement:*\n${paymentLink}\n\n📱 Cliquez sur le lien pour payer en ligne de manière sécurisée avec Stripe.\n\nAprès paiement, vous recevrez un QR Code pour retirer vos pneus à l'entrepôt sous 24h.\n\nTapez "menu" pour revenir au menu principal.`;

  return await sendWhatsAppMessage(phoneNumber, confirmationMessage);
}

async function sendMenu(phoneNumber: string) {
  const menuMessage = `📋 *Menu Principal*\n\n1️⃣ Rechercher des pneus\n2️⃣ Voir mon panier\n3️⃣ Mes commandes\n\n*Commandes disponibles:*\n• "recherche" - Nouvelle recherche\n• "panier" - Voir le panier\n• "menu" - Afficher ce menu\n\nQue souhaitez-vous faire ?`;

  return await sendWhatsAppMessage(phoneNumber, menuMessage);
}
