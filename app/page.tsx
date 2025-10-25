import Link from 'next/link';
import { Phone, Search, CreditCard, Package } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            🚗 GarageConnect
          </h1>
          <p className="text-2xl text-gray-600 mb-4">
            Vente de Pneus en Guadeloupe
          </p>
          <p className="text-lg text-gray-500 mb-8">
            Trouvez les pneus parfaits pour votre véhicule en quelques clics
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/search"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
            >
              🔍 Rechercher des Pneus
            </Link>
            <a
              href="https://wa.me/14155238886"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition"
            >
              💬 WhatsApp
            </a>
          </div>

          {/* QR Code WhatsApp */}
          <div className="bg-white p-6 rounded-lg shadow-lg inline-block">
            <p className="text-sm text-gray-600 mb-2 font-semibold">📱 Scannez pour WhatsApp</p>
            <img
              src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://wa.me/14155238886?text=Bonjour"
              alt="QR Code WhatsApp"
              className="w-48 h-48 rounded"
            />
            <p className="text-xs text-gray-500 mt-2 text-center">
              Ou cliquez sur le bouton WhatsApp ci-dessus
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-4 gap-8 mt-16">
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2">Recherche Facile</h3>
            <p className="text-sm text-gray-600">
              Trouvez vos pneus par dimensions
            </p>
          </div>

          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-semibold mb-2">Paiement Sécurisé</h3>
            <p className="text-sm text-gray-600">
              Stripe pour vos transactions
            </p>
          </div>

          <div className="text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-2">Retrait Rapide</h3>
            <p className="text-sm text-gray-600">
              À l'entrepôt sous 24h
            </p>
          </div>

          <div className="text-center">
            <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="font-semibold mb-2">Support WhatsApp</h3>
            <p className="text-sm text-gray-600">
              Assistance en temps réel
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
