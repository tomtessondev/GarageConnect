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
  getOptionsOnly: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const filters = searchSchema.parse(body);

    // If requesting available options only
    if (filters.getOptionsOnly) {
      const where: Record<string, number> = {};
      
      if (filters.width) where.width = filters.width;
      if (filters.height) where.height = filters.height;
      if (filters.diameter) where.diameter = filters.diameter;

      // Get distinct values for each dimension based on current filters
      const products = await prisma.product.findMany({
        where,
        select: {
          width: true,
          height: true,
          diameter: true,
        },
      });

      // Extract unique values
      const widths = [...new Set(products.map(p => p.width))];
      const heights = [...new Set(products.map(p => p.height))];
      const diameters = [...new Set(products.map(p => p.diameter))];

      return NextResponse.json({
        options: {
          widths,
          heights,
          diameters,
        },
      });
    }

    // Regular search
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
