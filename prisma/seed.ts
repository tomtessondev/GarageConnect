import { PrismaClient, ProductCondition } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Créer le distributeur mock
  const distributor = await prisma.distributor.create({
    data: {
      name: 'Distributeur Guadeloupe',
      contactEmail: 'contact@distributeur-gp.com',
      apiKey: 'mock_api_key_12345',
    },
  });

  console.log('✅ Distributeur créé');

  // Données de pneus réalistes
  const tyres = [
    // Michelin
    { brand: 'Michelin', model: 'Pilot Sport 4', width: 195, height: 65, diameter: 15, priceRetail: 135.00, stock: 12, overstock: false },
    { brand: 'Michelin', model: 'Pilot Sport 4', width: 205, height: 55, diameter: 16, priceRetail: 145.00, stock: 8, overstock: false },
    { brand: 'Michelin', model: 'Energy Saver', width: 185, height: 65, diameter: 15, priceRetail: 95.00, stock: 15, overstock: false },
    { brand: 'Michelin', model: 'Primacy 4', width: 215, height: 60, diameter: 16, priceRetail: 155.00, stock: 0, overstock: true, discount: 30 },
    { brand: 'Michelin', model: 'CrossClimate', width: 195, height: 65, diameter: 15, priceRetail: 125.00, stock: 10, overstock: false },
    
    // Continental
    { brand: 'Continental', model: 'PremiumContact 6', width: 205, height: 55, diameter: 16, priceRetail: 89.00, stock: 0, overstock: true, discount: 35 },
    { brand: 'Continental', model: 'EcoContact 6', width: 195, height: 65, diameter: 15, priceRetail: 110.00, stock: 20, overstock: false },
    { brand: 'Continental', model: 'SportContact 5', width: 225, height: 45, diameter: 17, priceRetail: 165.00, stock: 6, overstock: false },
    { brand: 'Continental', model: 'AllSeasonContact', width: 185, height: 65, diameter: 15, priceRetail: 105.00, stock: 0, overstock: true, discount: 25 },
    
    // Bridgestone
    { brand: 'Bridgestone', model: 'Turanza T005', width: 195, height: 65, diameter: 15, priceRetail: 120.00, stock: 14, overstock: false },
    { brand: 'Bridgestone', model: 'Potenza S001', width: 225, height: 45, diameter: 17, priceRetail: 175.00, stock: 5, overstock: false },
    { brand: 'Bridgestone', model: 'Ecopia EP150', width: 185, height: 65, diameter: 15, priceRetail: 92.00, stock: 18, overstock: false },
    { brand: 'Bridgestone', model: 'Turanza T001', width: 205, height: 55, diameter: 16, priceRetail: 130.00, stock: 0, overstock: true, discount: 28 },
    
    // Goodyear
    { brand: 'Goodyear', model: 'EfficientGrip Performance', width: 195, height: 65, diameter: 15, priceRetail: 115.00, stock: 11, overstock: false },
    { brand: 'Goodyear', model: 'Eagle F1 Asymmetric 3', width: 225, height: 45, diameter: 17, priceRetail: 170.00, stock: 7, overstock: false },
    { brand: 'Goodyear', model: 'Vector 4Seasons', width: 185, height: 65, diameter: 15, priceRetail: 108.00, stock: 0, overstock: true, discount: 32 },
    { brand: 'Goodyear', model: 'UltraGrip Performance', width: 205, height: 55, diameter: 16, priceRetail: 140.00, stock: 9, overstock: false },
    
    // Pirelli
    { brand: 'Pirelli', model: 'Cinturato P7', width: 195, height: 65, diameter: 15, priceRetail: 125.00, stock: 13, overstock: false },
    { brand: 'Pirelli', model: 'P Zero', width: 225, height: 45, diameter: 17, priceRetail: 185.00, stock: 4, overstock: false },
    { brand: 'Pirelli', model: 'Cinturato All Season', width: 185, height: 65, diameter: 15, priceRetail: 112.00, stock: 16, overstock: false },
    { brand: 'Pirelli', model: 'Scorpion Verde', width: 215, height: 60, diameter: 16, priceRetail: 150.00, stock: 0, overstock: true, discount: 27 },
    
    // Dunlop
    { brand: 'Dunlop', model: 'Sport BluResponse', width: 195, height: 65, diameter: 15, priceRetail: 105.00, stock: 17, overstock: false },
    { brand: 'Dunlop', model: 'SP Sport Maxx RT', width: 225, height: 45, diameter: 17, priceRetail: 160.00, stock: 8, overstock: false },
    { brand: 'Dunlop', model: 'StreetResponse 2', width: 185, height: 65, diameter: 15, priceRetail: 88.00, stock: 22, overstock: false },
    
    // Hankook
    { brand: 'Hankook', model: 'Ventus Prime 3', width: 195, height: 65, diameter: 15, priceRetail: 98.00, stock: 19, overstock: false },
    { brand: 'Hankook', model: 'Kinergy 4S2', width: 185, height: 65, diameter: 15, priceRetail: 95.00, stock: 0, overstock: true, discount: 30 },
    { brand: 'Hankook', model: 'Ventus S1 Evo3', width: 225, height: 45, diameter: 17, priceRetail: 155.00, stock: 6, overstock: false },
    
    // Yokohama
    { brand: 'Yokohama', model: 'BluEarth AE50', width: 195, height: 65, diameter: 15, priceRetail: 102.00, stock: 14, overstock: false },
    { brand: 'Yokohama', model: 'Advan Sport V105', width: 225, height: 45, diameter: 17, priceRetail: 168.00, stock: 5, overstock: false },
    { brand: 'Yokohama', model: 'BluEarth Winter', width: 185, height: 65, diameter: 15, priceRetail: 110.00, stock: 0, overstock: true, discount: 26 },
    
    // Firestone
    { brand: 'Firestone', model: 'Roadhawk', width: 195, height: 65, diameter: 15, priceRetail: 92.00, stock: 21, overstock: false },
    { brand: 'Firestone', model: 'Firehawk TZ300', width: 205, height: 55, diameter: 16, priceRetail: 115.00, stock: 10, overstock: false },
    
    // Toyo
    { brand: 'Toyo', model: 'Proxes CF2', width: 195, height: 65, diameter: 15, priceRetail: 100.00, stock: 15, overstock: false },
    { brand: 'Toyo', model: 'Proxes Sport', width: 225, height: 45, diameter: 17, priceRetail: 162.00, stock: 7, overstock: false },
    
    // Falken
    { brand: 'Falken', model: 'Ziex ZE310', width: 195, height: 65, diameter: 15, priceRetail: 94.00, stock: 18, overstock: false },
    { brand: 'Falken', model: 'Azenis FK510', width: 225, height: 45, diameter: 17, priceRetail: 158.00, stock: 0, overstock: true, discount: 33 },
    
    // Kumho
    { brand: 'Kumho', model: 'Ecsta HS51', width: 195, height: 65, diameter: 15, priceRetail: 89.00, stock: 20, overstock: false },
    { brand: 'Kumho', model: 'Solus HA31', width: 185, height: 65, diameter: 15, priceRetail: 86.00, stock: 0, overstock: true, discount: 29 },
    
    // Nexen
    { brand: 'Nexen', model: 'N\'blue HD Plus', width: 195, height: 65, diameter: 15, priceRetail: 85.00, stock: 23, overstock: false },
    { brand: 'Nexen', model: 'N\'Fera SU1', width: 225, height: 45, diameter: 17, priceRetail: 145.00, stock: 9, overstock: false },
    
    // Nokian
    { brand: 'Nokian', model: 'Powerproof', width: 195, height: 65, diameter: 15, priceRetail: 118.00, stock: 12, overstock: false },
    { brand: 'Nokian', model: 'Wetproof', width: 185, height: 65, diameter: 15, priceRetail: 105.00, stock: 0, overstock: true, discount: 31 },
    
    // Uniroyal
    { brand: 'Uniroyal', model: 'RainExpert 3', width: 195, height: 65, diameter: 15, priceRetail: 96.00, stock: 16, overstock: false },
    { brand: 'Uniroyal', model: 'RainSport 5', width: 205, height: 55, diameter: 16, priceRetail: 122.00, stock: 11, overstock: false },
    
    // Kleber
    { brand: 'Kleber', model: 'Dynaxer HP4', width: 195, height: 65, diameter: 15, priceRetail: 88.00, stock: 19, overstock: false },
    { brand: 'Kleber', model: 'Quadraxer 2', width: 185, height: 65, diameter: 15, priceRetail: 98.00, stock: 0, overstock: true, discount: 28 },
    
    // BFGoodrich
    { brand: 'BFGoodrich', model: 'Advantage', width: 195, height: 65, diameter: 15, priceRetail: 103.00, stock: 14, overstock: false },
    { brand: 'BFGoodrich', model: 'g-Grip', width: 205, height: 55, diameter: 16, priceRetail: 128.00, stock: 8, overstock: false },
    
    // Maxxis
    { brand: 'Maxxis', model: 'Premitra HP5', width: 195, height: 65, diameter: 15, priceRetail: 91.00, stock: 17, overstock: false },
    { brand: 'Maxxis', model: 'Victra Sport 5', width: 225, height: 45, diameter: 17, priceRetail: 152.00, stock: 6, overstock: false },
  ];

  // Créer les produits
  let count = 0;
  for (const tyre of tyres) {
    const sku = `${tyre.brand.toUpperCase()}_${tyre.model.replace(/\s+/g, '_').toUpperCase()}_${tyre.width}_${tyre.height}_${tyre.diameter}`;
    
    await prisma.product.create({
      data: {
        sku,
        brand: tyre.brand,
        model: tyre.model,
        width: tyre.width,
        height: tyre.height,
        diameter: tyre.diameter,
        priceCost: tyre.priceRetail * 0.65, // Marge ~35%
        priceRetail: tyre.priceRetail,
        stockQuantity: tyre.stock,
        isOverstock: tyre.overstock,
        discountPercent: tyre.discount || null,
        condition: ProductCondition.new,
        distributorId: distributor.id,
      },
    });
    count++;
  }

  console.log(`✅ Seed completed: ${count} pneus créés`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
