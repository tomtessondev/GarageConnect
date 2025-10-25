import { prisma } from './prisma';
import { sendWhatsAppMessage } from './twilio';
import { stripe } from './stripe';
import { setSession, getSession } from './session-storage';
import { sendQRCodeWhatsApp } from './whatsapp-media';

interface UserSession {
  step: 'welcome' | 'select_width' | 'select_height' | 'select_diameter' | 'viewing_results' | 'cart' | 'checkout' | 'view_orders';
  searchCriteria?: {
    width?: number;
    height?: number;
    diameter?: number;
  };
  availableOptions?: {
    widths?: number[];
    heights?: number[];
    diameters?: number[];
  };
  cart?: {
    productId: string;
    quantity: number;
  }[];
  lastResults?: any[];
}

export async function handleWhatsAppMessageInteractive(phoneNumber: string, message: string) {
  console.log(`💬 ${phoneNumber}: ${message}`);
  
  let session: UserSession | null = await getSession(`session:${phoneNumber}`);
  
  if (!session) {
    session = { step: 'welcome', cart: [] };
  }

  let user = await prisma.user.findUnique({
    where: { phoneNumber },
  });

  if (!user) {
    user = await prisma.user.create({
      data: { phoneNumber },
    });
  }

  const lowerMessage = message.toLowerCase().trim();

  // Commandes globales (sauf si on est en pleine sélection)
  const isInSelection = ['select_width', 'select_height', 'select_diameter', 'viewing_results'].includes(session.step);
  
  if (!isInSelection) {
    if (lowerMessage === 'menu' || lowerMessage === 'aide') {
      return await sendMenu(phoneNumber, session);
    }

    if (lowerMessage === 'panier') {
      return await showCart(phoneNumber, session);
    }

    if (lowerMessage === 'recherche' || lowerMessage === '1') {
      return await startSearch(phoneNumber, session);
    }

    if (lowerMessage === 'commandes' || lowerMessage === '3') {
      return await showOrderHistory(phoneNumber, user.id, session);
    }
  }

  // Commandes globales toujours disponibles
  if (lowerMessage === 'menu' || lowerMessage === 'aide') {
    return await sendMenu(phoneNumber, session);
  }

  if (lowerMessage === 'panier') {
    return await showCart(phoneNumber, session);
  }

  // Gestion selon l'étape
  switch (session.step) {
    case 'welcome':
      return await handleWelcome(phoneNumber, message, session);
    case 'select_width':
      return await handleWidthSelection(phoneNumber, message, session);
    case 'select_height':
      return await handleHeightSelection(phoneNumber, message, session);
    case 'select_diameter':
      return await handleDiameterSelection(phoneNumber, message, session);
    case 'viewing_results':
      return await handleResultSelection(phoneNumber, message, session);
    case 'cart':
      return await handleCartAction(phoneNumber, message, session);
    case 'checkout':
      return await handleCheckout(phoneNumber, message, session, user);
    case 'view_orders':
      return await handleOrderAction(phoneNumber, message, session, user);
    default:
      return await sendMenu(phoneNumber, session);
  }
}

async function handleWelcome(phoneNumber: string, message: string, session: UserSession) {
  const lowerMessage = message.toLowerCase().trim();
  
  if (lowerMessage === '1' || lowerMessage === 'recherche') {
    return await startSearch(phoneNumber, session);
  }

  if (lowerMessage === '2' || lowerMessage === 'panier') {
    return await showCart(phoneNumber, session);
  }

  if (lowerMessage === '3' || lowerMessage === 'commandes') {
    const user = await prisma.user.findUnique({
      where: { phoneNumber },
    });
    if (user) {
      return await showOrderHistory(phoneNumber, user.id, session);
    }
  }

  const welcomeMessage = `🚗 *Bienvenue chez GarageConnect !*

Votre assistant pneus en Guadeloupe 🇬🇵

*MENU PRINCIPAL*
1️⃣ Rechercher pneus
2️⃣ Mon panier
3️⃣ Mes commandes

💡 _Tapez le numéro de votre choix_`;

  session.step = 'welcome';
  await setSession(`session:${phoneNumber}`, session);
  
  return await sendWhatsAppMessage(phoneNumber, welcomeMessage);
}

async function startSearch(phoneNumber: string, session: UserSession) {
  // Récupérer toutes les largeurs disponibles
  const widths = await prisma.product.findMany({
    where: { stockQuantity: { gt: 0 } },
    select: { width: true },
    distinct: ['width'],
    orderBy: { width: 'asc' },
  });

  const availableWidths = widths.map(p => p.width);

  // Compter les modèles pour chaque largeur
  const widthCounts = await Promise.all(
    availableWidths.map(async (width) => {
      const products = await prisma.product.findMany({
        where: {
          width,
          stockQuantity: { gt: 0 },
        },
        select: { model: true },
        distinct: ['model'],
      });
      return { width, count: products.length };
    })
  );

  session.step = 'select_width';
  session.searchCriteria = {};
  session.availableOptions = { widths: availableWidths };
  await setSession(`session:${phoneNumber}`, session);

  let message = `🔍 *RECHERCHE DE PNEUS*\n\n`;
  message += `📏 *Sélectionnez la LARGEUR*\n\n`;
  
  widthCounts.forEach((item, index) => {
    message += `${index + 1}. ${item.width}mm (${item.count} modèles)\n`;
  });
  
  message += `\n💡 Tapez le numéro`;

  console.log(`✅ Envoi liste largeurs (${availableWidths.length} options)`);
  return await sendWhatsAppMessage(phoneNumber, message);
}

async function handleWidthSelection(phoneNumber: string, message: string, session: UserSession) {
  const choice = parseInt(message) - 1;
  
  console.log(`🔍 Choix largeur: ${message} (index: ${choice})`);
  console.log(`📊 Options dispo:`, session.availableOptions?.widths);
  
  if (isNaN(choice) || !session.availableOptions?.widths || choice < 0 || choice >= session.availableOptions.widths.length) {
    return await sendWhatsAppMessage(
      phoneNumber,
      `❌ Choix invalide\n\n💡 Tapez un numéro entre 1 et ${session.availableOptions?.widths?.length || 0}`
    );
  }

  const selectedWidth = session.availableOptions.widths[choice];
  session.searchCriteria!.width = selectedWidth;

  // Récupérer les hauteurs disponibles pour cette largeur
  const heights = await prisma.product.findMany({
    where: {
      width: selectedWidth,
      stockQuantity: { gt: 0 },
    },
    select: { height: true },
    distinct: ['height'],
    orderBy: { height: 'asc' },
  });

  const availableHeights = heights.map(p => p.height);
  
  // Compter les modèles pour chaque hauteur
  const heightCounts = await Promise.all(
    availableHeights.map(async (height) => {
      const products = await prisma.product.findMany({
        where: {
          width: selectedWidth,
          height,
          stockQuantity: { gt: 0 },
        },
        select: { model: true },
        distinct: ['model'],
      });
      return { height, count: products.length };
    })
  );

  session.availableOptions!.heights = availableHeights;
  session.step = 'select_height';
  await setSession(`session:${phoneNumber}`, session);

  let responseMessage = `✅ *Largeur: ${selectedWidth}mm*\n\n`;
  responseMessage += `📐 *Sélectionnez la HAUTEUR*\n\n`;
  
  heightCounts.forEach((item, index) => {
    responseMessage += `${index + 1}. ${item.height} (${item.count} modèles)\n`;
  });
  
  responseMessage += `\n💡 Tapez le numéro`;

  console.log(`✅ Largeur ${selectedWidth} → ${availableHeights.length} hauteurs`);
  return await sendWhatsAppMessage(phoneNumber, responseMessage);
}

async function handleHeightSelection(phoneNumber: string, message: string, session: UserSession) {
  const choice = parseInt(message) - 1;
  
  if (isNaN(choice) || !session.availableOptions?.heights || choice < 0 || choice >= session.availableOptions.heights.length) {
    return await sendWhatsAppMessage(
      phoneNumber,
      `❌ Choix invalide\n\n💡 _Tapez un numéro entre 1 et ${session.availableOptions?.heights?.length || 0}_`
    );
  }

  const selectedHeight = session.availableOptions.heights[choice];
  session.searchCriteria!.height = selectedHeight;

  // Récupérer les diamètres disponibles
  const diameters = await prisma.product.findMany({
    where: {
      width: session.searchCriteria!.width,
      height: selectedHeight,
      stockQuantity: { gt: 0 },
    },
    select: { diameter: true },
    distinct: ['diameter'],
    orderBy: { diameter: 'asc' },
  });

  const availableDiameters = diameters.map(p => p.diameter);
  session.availableOptions!.diameters = availableDiameters;
  session.step = 'select_diameter';
  await setSession(`session:${phoneNumber}`, session);

  let responseMessage = `🔍 *RECHERCHE EN COURS*\n\n`;
  responseMessage += `✅ Largeur: ${session.searchCriteria!.width}mm\n`;
  responseMessage += `✅ Hauteur: ${selectedHeight}\n\n`;
  responseMessage += `⭕ *Sélectionnez le DIAMÈTRE*\n\n`;
  
  availableDiameters.forEach((diameter, index) => {
    responseMessage += `${index + 1}. R${diameter}\n`;
  });
  
  responseMessage += `\n💡 Tapez le numéro`;

  console.log(`✅ Hauteur ${selectedHeight} → ${availableDiameters.length} diamètres dispo`);
  return await sendWhatsAppMessage(phoneNumber, responseMessage);
}

async function handleDiameterSelection(phoneNumber: string, message: string, session: UserSession) {
  const choice = parseInt(message) - 1;
  
  if (isNaN(choice) || !session.availableOptions?.diameters || choice < 0 || choice >= session.availableOptions.diameters.length) {
    return await sendWhatsAppMessage(
      phoneNumber,
      `❌ Choix invalide\n\n💡 _Tapez un numéro entre 1 et ${session.availableOptions?.diameters?.length || 0}_`
    );
  }

  const selectedDiameter = session.availableOptions.diameters[choice];
  session.searchCriteria!.diameter = selectedDiameter;

  // Rechercher les pneus
  const products = await prisma.product.findMany({
    where: {
      width: session.searchCriteria!.width,
      height: session.searchCriteria!.height,
      diameter: selectedDiameter,
      stockQuantity: { gt: 0 },
    },
    orderBy: [
      { isOverstock: 'desc' },
      { priceRetail: 'asc' },
    ],
  });

  session.lastResults = products;
  session.step = 'viewing_results';
  await setSession(`session:${phoneNumber}`, session);

  const dimension = `${session.searchCriteria!.width}/${session.searchCriteria!.height}R${selectedDiameter}`;
  
  let resultMessage = `🎯 *${products.length} PNEU(X) TROUVÉ(S)*\n\n`;
  resultMessage += `🔍 *RECHERCHE TERMINÉE*\n`;
  resultMessage += `✅ Largeur: ${session.searchCriteria!.width}mm\n`;
  resultMessage += `✅ Hauteur: ${session.searchCriteria!.height}\n`;
  resultMessage += `✅ Diamètre: R${selectedDiameter}\n\n`;

  products.forEach((product, index) => {
    const promo = product.isOverstock ? `🔥 -${product.discountPercent}% ` : '';
    
    resultMessage += `*${index + 1}. ${product.brand} ${product.model}*\n`;
    resultMessage += `   ${promo}${product.priceRetail}€ • ${product.stockQuantity} dispo\n\n`;
  });
  
  resultMessage += `🛒 *AJOUTER AU PANIER*\n`;
  resultMessage += `💡 Tapez: numéro + quantité\n`;
  resultMessage += `   Ex: "1 4" pour 4 pneus n°1\n\n`;
  resultMessage += `📝 Ou "panier" pour voir votre panier`;

  console.log(`✅ ${products.length} pneus trouvés pour ${dimension}`);
  return await sendWhatsAppMessage(phoneNumber, resultMessage);
}

async function handleResultSelection(phoneNumber: string, message: string, session: UserSession) {
  const lowerMessage = message.toLowerCase().trim();
  
  // Gérer la commande "commander"
  if (lowerMessage === 'commander') {
    if (!session.cart || session.cart.length === 0) {
      return await sendWhatsAppMessage(
        phoneNumber,
        `🛒 *PANIER VIDE*\n\n💡 Ajoutez d'abord des pneus au panier`
      );
    }
    session.step = 'checkout';
    await setSession(`session:${phoneNumber}`, session);
    
    return await sendWhatsAppMessage(
      phoneNumber,
      `📋 *FINALISATION*\n\nVoulez-vous ajouter votre email ?\n\n💡 _Tapez votre email ou "non"_`
    );
  }
  
  const parts = message.trim().split(' ');
  const productIndex = parseInt(parts[0]) - 1;
  const quantity = parts.length > 1 ? parseInt(parts[1]) : 4;

  if (isNaN(productIndex) || !session.lastResults || productIndex < 0 || productIndex >= session.lastResults.length) {
    return await sendWhatsAppMessage(
      phoneNumber,
      `❌ Numéro invalide\n\n💡 _Ex: "1 4" pour 4 pneus du produit 1_`
    );
  }

  if (isNaN(quantity) || quantity < 1 || quantity > 20) {
    return await sendWhatsAppMessage(
      phoneNumber,
      `❌ Quantité invalide (1-20)\n\n💡 _Ex: "1 4" pour 4 pneus_`
    );
  }

  const product = session.lastResults[productIndex];
  
  if (!session.cart) session.cart = [];
  
  const existingItem = session.cart.find(item => item.productId === product.id);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    session.cart.push({ productId: product.id, quantity });
  }

  await setSession(`session:${phoneNumber}`, session);

  const total = session.cart.reduce((sum, item) => {
    const prod = session.lastResults!.find(p => p.id === item.productId);
    return sum + (prod ? Number(prod.priceRetail) * item.quantity : 0);
  }, 0);

  const confirmMessage = `✅ *AJOUTÉ AU PANIER !*\n\n` +
    `🚗 ${product.brand} ${product.model}\n` +
    `📦 Quantité: ${quantity}\n` +
    `💰 Prix: ${Number(product.priceRetail) * quantity}€\n\n` +
    `🛒 *Total panier: ${total.toFixed(2)}€*\n\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `*QUE VOULEZ-VOUS FAIRE ?*\n\n` +
    `📝 Tapez "panier" pour voir le panier\n` +
    `🛍️ Tapez "commander" pour finaliser\n` +
    `🔢 Ou tapez un autre numéro pour ajouter plus\n`;

  console.log(`✅ Ajouté: ${product.brand} x${quantity} → Total: ${total}€`);
  return await sendWhatsAppMessage(phoneNumber, confirmMessage);
}

async function showCart(phoneNumber: string, session: UserSession) {
  if (!session.cart || session.cart.length === 0) {
    return await sendWhatsAppMessage(
      phoneNumber,
      `🛒 *PANIER VIDE*\n\n💡 _Tapez "recherche" pour trouver des pneus_`
    );
  }

  let cartMessage = `🛒 *VOTRE PANIER*\n\n`;
  let total = 0;

  for (const item of session.cart) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
    });

    if (product) {
      const subtotal = Number(product.priceRetail) * item.quantity;
      total += subtotal;
      
      cartMessage += `• ${product.brand} ${product.model}\n`;
      cartMessage += `  ${item.quantity} × ${product.priceRetail}€ = ${subtotal}€\n\n`;
    }
  }

  const totalTTC = total * 1.2;
  cartMessage += `*RÉCAPITULATIF*\n`;
  cartMessage += `Sous-total: ${total.toFixed(2)}€\n`;
  cartMessage += `TVA (20%): ${(total * 0.2).toFixed(2)}€\n`;
  cartMessage += `*Total TTC: ${totalTTC.toFixed(2)}€*\n\n`;
  cartMessage += `💡 _Tapez "commander" pour finaliser_\n`;
  cartMessage += `   _Ou "vider" pour vider le panier_`;

  session.step = 'cart';
  await setSession(`session:${phoneNumber}`, session);

  console.log(`📊 Panier: ${session.cart.length} articles, ${totalTTC.toFixed(2)}€ TTC`);
  return await sendWhatsAppMessage(phoneNumber, cartMessage);
}

async function handleCartAction(phoneNumber: string, message: string, session: UserSession) {
  const lowerMessage = message.toLowerCase().trim();

  if (lowerMessage === 'commander') {
    session.step = 'checkout';
    await setSession(`session:${phoneNumber}`, session);
    
    return await sendWhatsAppMessage(
      phoneNumber,
      `📋 *FINALISATION*\n\nVoulez-vous ajouter votre email ?\n\n💡 _Tapez votre email ou "non"_`
    );
  }

  if (lowerMessage === 'vider') {
    session.cart = [];
    session.step = 'welcome';
    await setSession(`session:${phoneNumber}`, session);
    
    return await sendWhatsAppMessage(
      phoneNumber,
      `✅ Panier vidé\n\n💡 _Tapez "recherche" pour une nouvelle recherche_`
    );
  }

  return await sendWhatsAppMessage(
    phoneNumber,
    `💡 _Tapez "commander" ou "vider"_`
  );
}

async function handleCheckout(phoneNumber: string, message: string, session: UserSession, user: any) {
  if (!session.cart || session.cart.length === 0) {
    return await sendWhatsAppMessage(phoneNumber, `❌ Panier vide`);
  }

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

  const year = new Date().getFullYear();
  const orderCount = await prisma.order.count();
  const orderNumber = `GC-${year}-${String(orderCount + 1).padStart(4, '0')}`;

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

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(totalAmount * 1.2 * 100),
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

  session.cart = [];
  session.step = 'welcome';
  await setSession(`session:${phoneNumber}`, session);

  const totalTTC = totalAmount * 1.2;
  const paymentLink = `${process.env.NEXT_PUBLIC_APP_URL}/order/${order.id}`;

  const confirmationMessage = `✅ *COMMANDE CRÉÉE !*\n\n` +
    `📦 *${orderNumber}*\n` +
    `💰 *${totalTTC.toFixed(2)}€ TTC*\n\n` +
    `🔗 *PAIEMENT SÉCURISÉ*\n` +
    `${paymentLink}\n\n` +
    `📱 Cliquez pour payer avec Stripe\n\n` +
    `🎫 Après paiement:\n` +
    `• QR Code de retrait\n` +
    `• Retrait sous 24h\n\n` +
    `💡 _Tapez "menu" pour revenir au menu_`;

  console.log(`✅ Commande ${orderNumber} créée: ${totalTTC.toFixed(2)}€`);
  return await sendWhatsAppMessage(phoneNumber, confirmationMessage);
}

async function showOrderHistory(phoneNumber: string, userId: string, session: UserSession) {
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (orders.length === 0) {
    return await sendWhatsAppMessage(
      phoneNumber,
      `📦 *AUCUNE COMMANDE*\n\n💡 _Tapez "recherche" pour commencer_`
    );
  }

  let historyMessage = `📦 *VOS COMMANDES* (${orders.length})\n\n`;

  orders.forEach((order, index) => {
    const statusEmoji = {
      pending: '⏳',
      paid: '✅',
      ready: '📦',
      completed: '🎉',
    }[order.status] || '❓';

    const statusLabel = {
      pending: 'En attente',
      paid: 'Payée',
      ready: 'Prête',
      completed: 'Terminée',
    }[order.status] || order.status;

    historyMessage += `*${index + 1}. ${order.orderNumber}*\n`;
    historyMessage += `${statusEmoji} ${statusLabel} | ${Number(order.totalAmount * 1.2).toFixed(2)}€\n`;
    historyMessage += `${new Date(order.createdAt).toLocaleDateString('fr-FR')}\n\n`;
  });

  historyMessage += `💡 _Tapez le numéro pour voir les détails_`;

  session.step = 'view_orders';
  session.lastResults = orders;
  await setSession(`session:${phoneNumber}`, session);

  console.log(`📊 Historique: ${orders.length} commandes`);
  return await sendWhatsAppMessage(phoneNumber, historyMessage);
}

async function handleOrderAction(phoneNumber: string, message: string, session: UserSession, user: any) {
  const orderIndex = parseInt(message) - 1;

  if (!isNaN(orderIndex) && session.lastResults && orderIndex >= 0 && orderIndex < session.lastResults.length) {
    const order = session.lastResults[orderIndex];
    
    let orderDetails = `📦 *COMMANDE ${order.orderNumber}*\n\n`;
    orderDetails += `*Statut:* ${order.status}\n`;
    orderDetails += `*Date:* ${new Date(order.createdAt).toLocaleDateString('fr-FR')}\n\n`;
    orderDetails += `*Articles:*\n`;

    order.items.forEach((item: any) => {
      orderDetails += `• ${item.product.brand} ${item.product.model} x${item.quantity}\n`;
    });

    orderDetails += `\n*Total TTC:* ${(Number(order.totalAmount) * 1.2).toFixed(2)}€\n\n`;

    if (order.status === 'paid' || order.status === 'ready') {
      orderDetails += `🎫 _Tapez "qr" pour le QR Code_\n\n`;
    }

    orderDetails += `💡 _Tapez "commandes" pour revenir_`;

    return await sendWhatsAppMessage(phoneNumber, orderDetails);
  }

  if (message.toLowerCase() === 'qr' && session.lastResults) {
    const lastOrder = session.lastResults[0];
    if (lastOrder && (lastOrder.status === 'paid' || lastOrder.status === 'ready')) {
      await sendQRCodeWhatsApp(phoneNumber, lastOrder.orderNumber, lastOrder.id);
      return;
    }
  }

  return await sendWhatsAppMessage(
    phoneNumber,
    `💡 _Tapez le numéro de la commande ou "menu"_`
  );
}

async function sendMenu(phoneNumber: string, session: UserSession) {
  const menuMessage = `📋 *MENU PRINCIPAL*\n\n` +
    `┌─────────────────────┐\n` +
    `│ 1️⃣ Rechercher pneus │\n` +
    `│ 2️⃣ Mon panier       │\n` +
    `│ 3️⃣ Mes commandes    │\n` +
    `└─────────────────────┘\n\n` +
    `💡 _Tapez le numéro de votre choix_`;

  session.step = 'welcome';
  await setSession(`session:${phoneNumber}`, session);

  return await sendWhatsAppMessage(phoneNumber, menuMessage);
}
