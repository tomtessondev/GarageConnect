import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const searchSchema = z.object({
  width: z.number().optional(),
  height: z.number().optional(),
  diameter: z.number().optional(),
  brand: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  inStock: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const filters = searchSchema.parse(body);

    const where: any = {};

    if (filters.width) where.width = filters.width;
    if (filters.height) where.height = filters.height;
    if (filters.diameter) where.diameter = filters.diameter;
    if (filters.brand) where.brand = { contains: filters.brand, mode: 'insensitive' };
    if (filters.minPrice || filters.maxPrice) {
      where.priceRetail = {};
      if (filters.minPrice) where.priceRetail.gte = filters.minPrice;
      if (filters.maxPrice) where.priceRetail.lte = filters.maxPrice;
    }
    if (filters.inStock) {
      where.OR = [
        { stockQuantity: { gt: 0 } },
        { isOverstock: true },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: [
        { isOverstock: 'desc' },
        { stockQuantity: 'desc' },
        { priceRetail: 'asc' },
      ],
    });

    return NextResponse.json({ products, count: products.length });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to search products' },
      { status: 500 }
    );
  }
}
