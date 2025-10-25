'use client';

import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import { Trash2, Plus, Minus } from 'lucide-react';

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalAmount, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Link href="/search" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Continuer mes achats
          </Link>
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Votre panier est vide</h1>
            <p className="text-gray-600 mb-8">Ajoutez des pneus pour commencer votre commande</p>
            <Link
              href="/search"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition inline-block"
            >
              Rechercher des pneus
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Link href="/search" className="text-blue-600 hover:underline mb-4 inline-block">
          ← Continuer mes achats
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mon Panier</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Liste des articles */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.productId} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    {item.product.isOverstock && (
                      <span className="inline-block bg-red-500 text-white text-xs px-2 py-1 rounded mb-2">
                        PROMO -{item.product.discountPercent}%
                      </span>
                    )}
                    <h3 className="text-xl font-bold text-gray-900">
                      {item.product.brand} {item.product.model}
                    </h3>
                    <p className="text-gray-600 mt-1">
                      {item.product.width}/{item.product.height}R{item.product.diameter}
                    </p>
                    <p className="text-2xl font-bold text-blue-600 mt-2">
                      {item.product.priceRetail}€ / pneu
                    </p>
                  </div>

                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-red-600 hover:text-red-700 p-2"
                    title="Supprimer"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="bg-gray-200 hover:bg-gray-300 p-2 rounded"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-lg font-semibold w-12 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="bg-gray-200 hover:bg-gray-300 p-2 rounded"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-gray-600">Sous-total</p>
                    <p className="text-xl font-bold text-gray-900">
                      {(Number(item.product.priceRetail) * item.quantity).toFixed(2)}€
                    </p>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={clearCart}
              className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Vider le panier
            </button>
          </div>

          {/* Récapitulatif */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-md sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Récapitulatif</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Sous-total</span>
                  <span>{totalAmount.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>TVA (20%)</span>
                  <span>{(totalAmount * 0.2).toFixed(2)}€</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-xl font-bold text-gray-900">
                  <span>Total TTC</span>
                  <span>{(totalAmount * 1.2).toFixed(2)}€</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition block text-center"
              >
                Passer la commande
              </Link>

              <p className="text-xs text-gray-500 mt-4 text-center">
                Paiement sécurisé par Stripe
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
