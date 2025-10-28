'use client';

import Link from 'next/link';
import { MessageCircle, CircleDot, Shield, Zap, Package, Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Logo/Title Card */}
          <div className="mb-12">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-6 flex-wrap">
              <CircleDot className="w-10 h-10 sm:w-16 sm:h-16 text-blue-600 animate-spin-slow" />
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                GarageConnect
              </h1>
              <CircleDot className="w-10 h-10 sm:w-16 sm:h-16 text-purple-600 animate-spin-slow" />
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-200 inline-block mx-4">
              <p className="text-lg sm:text-xl md:text-2xl text-gray-800 mb-2 font-bold">
                Vente de Pneus en Guadeloupe
              </p>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 flex items-center justify-center gap-2 flex-wrap">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                <span className="text-center">Trouvez les pneus parfaits pour votre véhicule en quelques clics</span>
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <Link
              href="/search"
              className="group relative bg-gradient-to-r from-blue-500 to-blue-600 text-white px-10 py-5 rounded-2xl text-lg font-bold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-2xl hover:shadow-blue-500/50 transform hover:scale-105 hover:-translate-y-1"
            >
              <div className="flex items-center justify-center gap-3">
                <CircleDot className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
                <span>Rechercher des Pneus</span>
              </div>
              <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            
            <a
              href="https://wa.me/14155238886"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative bg-gradient-to-r from-green-500 to-emerald-600 text-white px-10 py-5 rounded-2xl text-lg font-bold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-2xl hover:shadow-green-500/50 transform hover:scale-105 hover:-translate-y-1 animate-pulse-slow"
            >
              <div className="flex items-center justify-center gap-3">
                <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                <span>Contacter sur WhatsApp</span>
              </div>
              <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </a>
          </div>

          {/* QR Code WhatsApp */}
          <div className="bg-white p-8 rounded-3xl shadow-2xl inline-block border-4 border-green-400 relative overflow-hidden group hover:border-green-500 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-emerald-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-2 mb-3">
                <MessageCircle className="w-6 h-6 text-green-600" />
                <p className="text-lg text-gray-800 font-bold">Scannez pour WhatsApp</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl shadow-lg flex items-center justify-center">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://wa.me/14155238886?text=Bonjour"
                  alt="QR Code WhatsApp"
                  className="w-48 h-48 rounded-xl"
                />
              </div>
              <p className="text-sm text-gray-600 mt-3 font-medium">
                Ou cliquez sur le bouton WhatsApp ci-dessus
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-4 gap-8 mt-20">
          <div className="bg-white p-6 rounded-2xl text-center border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 shadow-xl hover:shadow-2xl group">
            <div className="bg-gradient-to-br from-blue-400 to-blue-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-blue-500/50 group-hover:rotate-6 transition-all duration-300">
              <CircleDot className="w-10 h-10 text-white group-hover:rotate-180 transition-transform duration-500" />
            </div>
            <h3 className="font-bold text-xl mb-2 text-gray-800">Recherche Facile</h3>
            <p className="text-sm text-gray-600">
              Trouvez vos pneus par dimensions en quelques secondes
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl text-center border-2 border-green-200 hover:border-green-400 transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 shadow-xl hover:shadow-2xl group">
            <div className="bg-gradient-to-br from-green-400 to-emerald-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-green-500/50 group-hover:rotate-6 transition-all duration-300">
              <Shield className="w-10 h-10 text-white group-hover:scale-110 transition-transform duration-300" />
            </div>
            <h3 className="font-bold text-xl mb-2 text-gray-800">Paiement Sécurisé</h3>
            <p className="text-sm text-gray-600">
              Transactions protégées par Stripe
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl text-center border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 shadow-xl hover:shadow-2xl group">
            <div className="bg-gradient-to-br from-purple-400 to-purple-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-purple-500/50 group-hover:rotate-6 transition-all duration-300">
              <Package className="w-10 h-10 text-white group-hover:scale-110 transition-transform duration-300" />
            </div>
            <h3 className="font-bold text-xl mb-2 text-gray-800">Retrait Rapide</h3>
            <p className="text-sm text-gray-600">
              À l&apos;entrepôt sous 24h
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl text-center border-2 border-yellow-200 hover:border-yellow-400 transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 shadow-xl hover:shadow-2xl group">
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-yellow-500/50 group-hover:rotate-6 transition-all duration-300">
              <Zap className="w-10 h-10 text-white group-hover:scale-110 transition-transform duration-300" />
            </div>
            <h3 className="font-bold text-xl mb-2 text-gray-800">Support WhatsApp</h3>
            <p className="text-sm text-gray-600">
              Assistance en temps réel
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
