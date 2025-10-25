'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import { toast } from 'sonner';
import { ShoppingCart } from 'lucide-react';

interface Product {
  id: string;
  sku: string;
  brand: string;
  model: string;
  width: number;
  height: number;
  diameter: number;
  priceRetail: number;
  stockQuantity: number;
  isOverstock: boolean;
  discountPercent: number | null;
}

export default function SearchPage() {
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [diameter, setDiameter] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const { addItem, itemCount } = useCart();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['tyres', width, height, diameter],
    queryFn: async () => {
      const response = await fetch('/api/search-tyres', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          width: width ? parseInt(width) : undefined,
          height: height ? parseInt(height) : undefined,
          diameter: diameter ? parseInt(diameter) : undefined,
        }),
      });
      return response.json();
    },
    enabled: false,
  });

  const handleSearch = () => {
    setHasSearched(true);
    refetch();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
              ← Retour à l&apos;accueil
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Recherche de Pneus</h1>
            <p className="text-gray-600 mt-2">Trouvez vos pneus par dimensions</p>
          </div>
          <Link
            href="/cart"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2"
          >
            <ShoppingCart className="w-5 h-5" />
            Panier ({itemCount})
          </Link>
        </div>

        {/* Search Form */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Largeur
              </label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                placeholder="195"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hauteur
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="65"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Diamètre
              </label>
              <input
                type="number"
                value={diameter}
                onChange={(e) => setDiameter(e.target.value)}
                placeholder="15"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleSearch}
                className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                🔍 Rechercher
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Recherche en cours...</p>
          </div>
        )}

        {!isLoading && hasSearched && data?.products && (
          <div>
            <p className="text-gray-600 mb-4">
              {data.count} résultat{data.count > 1 ? 's' : ''} trouvé{data.count > 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {data.products.map((product: Product) => (
                <div key={product.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
                  {product.isOverstock && (
                    <span className="inline-block bg-red-500 text-white text-xs px-2 py-1 rounded mb-2">
                      PROMO -{product.discountPercent}%
                    </span>
                  )}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {product.brand} {product.model}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {product.width}/{product.height}R{product.diameter}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-blue-600">
                      {product.priceRetail}€
                    </span>
                    <span className={`text-sm ${product.stockQuantity > 0 ? 'text-green-600' : 'text-orange-600'}`}>
                      {product.stockQuantity > 0 ? `${product.stockQuantity} en stock` : 'Sur commande'}
                    </span>
                  </div>
                  <button 
                    onClick={() => {
                      addItem(product, 1);
                      toast.success(`${product.brand} ${product.model} ajouté au panier !`);
                    }}
                    className="w-full mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Ajouter au panier
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isLoading && hasSearched && data?.products?.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-600 text-lg">Aucun pneu trouvé avec ces critères</p>
            <p className="text-gray-500 mt-2">Essayez avec d&apos;autres dimensions</p>
          </div>
        )}
      </div>
    </div>
  );
}
