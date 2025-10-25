'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CheckCircle, Clock, Package, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function OrderPage() {
  const params = useParams();
  const orderId = params.id as string;

  const { data, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const response = await fetch(`/api/orders/${orderId}`);
      if (!response.ok) throw new Error('Failed to fetch order');
      return response.json();
    },
  });

  const createPaymentIntentMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/payment/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      if (!response.ok) throw new Error('Failed to create payment intent');
      return response.json();
    },
    onSuccess: (data) => {
      toast.success('Lien de paiement créé !');
      // Dans une vraie app, on redirigerait vers Stripe Checkout
      console.log('Payment Intent:', data);
    },
    onError: () => {
      toast.error('Erreur lors de la création du paiement');
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement de la commande...</p>
        </div>
      </div>
    );
  }

  if (!data?.order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Commande introuvable</h1>
            <Link
              href="/search"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition inline-block"
            >
              Retour à la recherche
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const order = data.order;
  const statusConfig = {
    pending: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'En attente de paiement' },
    paid: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Payée' },
    ready: { icon: Package, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Prête pour retrait' },
    completed: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Terminée' },
  };

  const status = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
          ← Retour à l&apos;accueil
        </Link>

        {/* Header avec statut */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Commande {order.orderNumber}
              </h1>
              <p className="text-gray-600">
                Créée le {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${status.bg}`}>
              <StatusIcon className={`w-6 h-6 ${status.color}`} />
              <span className={`font-semibold ${status.color}`}>{status.label}</span>
            </div>
          </div>

          {order.status === 'pending' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800 font-semibold mb-2">⏳ Paiement en attente</p>
              <p className="text-yellow-700 text-sm mb-4">
                Vous allez recevoir un lien de paiement par WhatsApp au {order.user.phoneNumber}
              </p>
              <button
                onClick={() => createPaymentIntentMutation.mutate()}
                disabled={createPaymentIntentMutation.isPending}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 flex items-center gap-2"
              >
                {createPaymentIntentMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  '💳 Créer le lien de paiement'
                )}
              </button>
            </div>
          )}

          {order.status === 'paid' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800 font-semibold mb-2">✅ Paiement confirmé !</p>
              <p className="text-green-700 text-sm mb-4">
                Votre commande sera prête pour retrait sous 24h.
              </p>
              
              {/* QR Code de retrait */}
              <div className="bg-white p-4 rounded-lg border-2 border-green-300 text-center">
                <p className="text-sm font-semibold text-gray-700 mb-3">🎫 QR Code de Retrait</p>
                <img
                  src={`/api/qrcode/${order.id}`}
                  alt="QR Code de retrait"
                  className="mx-auto w-64 h-64"
                />
                <p className="text-xs text-gray-500 mt-3">
                  Présentez ce QR Code à l&apos;entrepôt
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Articles */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Articles commandés</h2>
              <div className="space-y-4">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center border-b pb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {item.product.brand} {item.product.model}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {item.product.width}/{item.product.height}R{item.product.diameter}
                      </p>
                      <p className="text-gray-500 text-sm">Quantité: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{item.subtotal}€</p>
                      <p className="text-sm text-gray-500">{item.unitPrice}€ / pneu</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Récapitulatif */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Récapitulatif</h2>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Sous-total</span>
                  <span>{order.totalAmount}€</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>TVA (20%)</span>
                  <span>{(Number(order.totalAmount) * 0.2).toFixed(2)}€</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-xl font-bold text-gray-900">
                  <span>Total TTC</span>
                  <span>{(Number(order.totalAmount) * 1.2).toFixed(2)}€</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Contact</h2>
              <div className="space-y-2 text-sm">
                <p className="text-gray-600">
                  <span className="font-semibold">Téléphone:</span><br />
                  {order.user.phoneNumber}
                </p>
                {order.user.email && (
                  <p className="text-gray-600">
                    <span className="font-semibold">Email:</span><br />
                    {order.user.email}
                  </p>
                )}
                {(order.user.firstName || order.user.lastName) && (
                  <p className="text-gray-600">
                    <span className="font-semibold">Nom:</span><br />
                    {order.user.firstName} {order.user.lastName}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
