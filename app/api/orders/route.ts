import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createOrderSchema = z.object({
  phoneNumber: z.string(),
  email: z.string().email().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().min(1),
    })
  ),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createOrderSchema.parse(body);

    // Créer ou récupérer l'utilisateur
    let user = await prisma.user.findUnique({
      where: { phoneNumber: data.phoneNumber },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          phoneNumber: data.phoneNumber,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
        },
      });
    }

    // Récupérer les produits
    const productIds = data.items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    // Calculer le total
    let totalAmount = 0;
    const orderItems = data.items.map((item) => {
      const product = products.find((p: { id: string }) => p.id === item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);
      
      const subtotal = Number(product.priceRetail) * item.quantity;
      totalAmount += subtotal;
      
      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.priceRetail,
        subtotal,
      };
    });

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
        user: true,
      },
    });

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
