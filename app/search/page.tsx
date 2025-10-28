'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import { toast } from 'sonner';
import { ShoppingCart, ArrowLeft, CircleDot, Sparkles, Package, TrendingDown } from 'lucide-react';

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

interface AvailableOptions {
  widths: number[];
  heights: number[];
  diameters: number[];
}

export default function SearchPage() {
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [diameter, setDiameter] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const { addItem, itemCount } = useCart();

  // Fetch available options based on current selections
  const { data: optionsData } = useQuery({
    queryKey: ['available-options', width, height, diameter],
    queryFn: async () => {
      const response = await fetch('/api/search-tyres', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          width: width ? parseInt(width) : undefined,
          height: height ? parseInt(height) : undefined,
          diameter: diameter ? parseInt(diameter) : undefined,
          getOptionsOnly: true,
        }),
      });
      return response.json();
    },
  });

  // Get available options from query data
  const availableOptions: AvailableOptions = optionsData?.options || {
    widths: [],
    heights: [],
    diameters: []
  };

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
    if (!width && !height && !diameter) {
      toast.error('Veuillez sélectionner au moins un critère');
      return;
    }
    setHasSearched(true);
    refetch();
  };

  const handleReset = () => {
    setWidth('');
    setHeight('');
    setDiameter('');
    setHasSearched(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Link 
              href="/" 
              className="text-blue-600 hover:text-blue-700 mb-4 inline-flex items-center gap-2 font-semibold transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              Retour à l&apos;accueil
            </Link>
            <div className="flex items-center gap-3 mb-2">
              <CircleDot className="w-10 h-10 text-blue-600 animate-spin-slow" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Recherche de Pneus
              </h1>
            </div>
            <p className="text-gray-600 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              Sélectionnez vos dimensions pour trouver les pneus parfaits
            </p>
          </div>
          <Link
            href="/cart"
            className="group relative bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
          >
            <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Panier ({itemCount})
          </Link>
        </div>

        {/* Search Form */}
        <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-2xl mb-8 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <CircleDot className="w-6 h-6 text-blue-600" />
            Dimensions du pneu
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Width */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Largeur (mm)
              </label>
              <select
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white font-semibold text-gray-800 cursor-pointer hover:border-blue-400"
              >
                <option value="">Sélectionner...</option>
                {availableOptions.widths.sort((a, b) => a - b).map((w) => (
                  <option key={w} value={w}>
                    {w} mm
                  </option>
                ))}
              </select>
              {width && (
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {availableOptions.heights.length} hauteurs disponibles
                </p>
              )}
            </div>

            {/* Height */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Hauteur (%)
              </label>
              <select
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white font-semibold text-gray-800 cursor-pointer hover:border-blue-400"
                disabled={!width && availableOptions.heights.length === 0}
              >
                <option value="">Sélectionner...</option>
                {availableOptions.heights.sort((a, b) => a - b).map((h) => (
                  <option key={h} value={h}>
                    {h} %
                  </option>
                ))}
              </select>
              {height && (
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {availableOptions.diameters.length} diamètres disponibles
                </p>
              )}
            </div>

            {/* Diameter */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Diamètre (pouces)
              </label>
              <select
                value={diameter}
                onChange={(e) => setDiameter(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white font-semibold text-gray-800 cursor-pointer hover:border-blue-400"
                disabled={!height && availableOptions.diameters.length === 0}
              >
                <option value="">Sélectionner...</option>
                {availableOptions.diameters.sort((a, b) => a - b).map((d) => (
                  <option key={d} value={d}>
                    {d}&quot;
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleSearch}
              disabled={!width && !height && !diameter}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              <CircleDot className="w-5 h-5" />
              Rechercher
            </button>
            <button
              onClick={handleReset}
              className="px-8 py-4 rounded-xl font-bold border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all duration-300"
            >
              Réinitialiser
            </button>
          </div>

          {/* Selected Criteria Display */}
          {(width || height || diameter) && (
            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-sm font-semibold text-blue-800 mb-2">Critères sélectionnés :</p>
              <div className="flex flex-wrap gap-2">
                {width && (
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-semibold">
                    Largeur: {width}mm
                  </span>
                )}
                {height && (
                  <span className="bg-purple-600 text-white px-3 py-1 rounded-lg text-sm font-semibold">
                    Hauteur: {height}%
                  </span>
                )}
                {diameter && (
                  <span className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-sm font-semibold">
                    Diamètre: {diameter}&quot;
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {isLoading && (
          <div className="text-center py-16 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-6 text-gray-600 font-semibold text-lg">Recherche en cours...</p>
          </div>
        )}

        {!isLoading && hasSearched && data?.products && (
          <div>
            <div className="mb-6 p-4 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200">
              <p className="text-gray-800 font-bold text-lg flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                {data.count} résultat{data.count > 1 ? 's' : ''} trouvé{data.count > 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.products.map((product: Product) => (
                <div 
                  key={product.id} 
                  className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-gray-100 hover:border-blue-300 transform hover:-translate-y-2 group"
                >
                  <div className="p-6">
                    {/* Promo Badge */}
                    {product.isOverstock && (
                      <div className="flex items-center gap-2 mb-3">
                        <span className="inline-flex items-center gap-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg animate-pulse-slow">
                          <TrendingDown className="w-4 h-4" />
                          PROMO -{product.discountPercent}%
                        </span>
                      </div>
                    )}

                    {/* Brand & Model */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {product.brand}
                    </h3>
                    <p className="text-lg text-gray-600 font-semibold mb-4">
                      {product.model}
                    </p>

                    {/* Dimensions */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl mb-4 border border-blue-200">
                      <p className="text-2xl font-bold text-center text-gray-800">
                        {product.width}/{product.height}R{product.diameter}
                      </p>
                    </div>

                    {/* Price & Stock */}
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <p className="text-sm text-gray-500 font-semibold">Prix</p>
                        <span className="text-3xl font-bold text-blue-600">
                          {product.priceRetail}€
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500 font-semibold mb-1">Stock</p>
                        <span className={`inline-flex items-center gap-1 text-sm font-bold px-3 py-1 rounded-full ${
                          product.stockQuantity > 0 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          <Package className="w-4 h-4" />
                          {product.stockQuantity > 0 ? `${product.stockQuantity} dispo` : 'Sur commande'}
                        </span>
                      </div>
                    </div>

                    {/* Add to Cart Button */}
                    <button 
                      onClick={() => {
                        addItem(product, 1);
                        toast.success(`${product.brand} ${product.model} ajouté au panier !`);
                      }}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Ajouter au panier
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isLoading && hasSearched && data?.products?.length === 0 && (
          <div className="text-center py-16 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200">
            <CircleDot className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-800 text-xl font-bold mb-2">Aucun pneu trouvé</p>
            <p className="text-gray-500">Essayez avec d&apos;autres dimensions</p>
          </div>
        )}
      </div>
    </div>
  );
}
