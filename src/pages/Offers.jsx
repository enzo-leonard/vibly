import React from 'react';

// Import icons
import { FaMoneyBillWave, FaLaptop, FaPlane, FaTag, FaStar } from 'react-icons/fa';

export default function Offers() {
  return (
    <div className="container mx-auto px-4 py-6 pb-20">
      <h1 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400">
        Promotions & Offres
      </h1>

      {/* Featured Discounts */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl p-4 shadow-sm border border-purple-100">
          <div className="flex items-center mb-2">
            <FaTag className="text-purple-500 mr-2" />
            <span className="font-bold text-purple-700">-10%</span>
          </div>
          <p className="font-medium text-purple-900">de réduction sur</p>
          <p className="text-purple-800">Beauté Privée</p>
        </div>
        
        <div className="bg-gradient-to-br from-pink-100 to-pink-50 rounded-xl p-4 shadow-sm border border-pink-100">
          <div className="flex items-center mb-2">
            <FaTag className="text-pink-500 mr-2" />
            <span className="font-bold text-pink-700">-15%</span>
          </div>
          <p className="font-medium text-pink-900">de réduction sur</p>
          <p className="text-pink-800">tout le site Weleda</p>
        </div>
      </div>

      {/* Finance Section */}
      <div className="mb-10">
        <div className="flex items-center mb-5">
          <div className="bg-gradient-to-r from-yellow-200 to-yellow-100 p-3 rounded-xl mr-3 shadow-sm">
            <FaMoneyBillWave className="text-yellow-600 text-xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Finance</h2>
        </div>

        <div className="grid grid-cols-2 gap-5">
          {/* Offer Card 1 */}
          <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100">
            <div className="p-4">
              <div className="bg-blue-50 rounded-xl shadow-sm inline-block mb-3 border border-blue-100">
                <div className="h-16 w-16 flex items-center justify-center p-2">
                  <span className="font-bold text-blue-600">WIZBII Money</span>
                </div>
              </div>
              <p className="font-medium text-gray-800 mb-2">Reçois jusqu'à 3 000€ d'aides financières</p>
              <div className="flex items-center mt-2 text-gray-500 text-sm">
                <FaStar className="text-yellow-400 mr-1" />
                <span>Offre populaire</span>
              </div>
            </div>
          </div>
          
          {/* Offer Card 2 */}
          <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100">
            <div className="p-4">
              <div className="bg-green-50 rounded-xl shadow-sm inline-block mb-3 border border-green-100">
                <div className="h-16 w-16 flex items-center justify-center p-2">
                  <div className="text-green-600 font-medium">
                    <div className="text-sm">PETIT</div>
                    <div className="font-bold">PLACEMENT</div>
                  </div>
                </div>
              </div>
              <p className="font-medium text-gray-800 mb-2">Gagne 50€ à l'ouverture de ton compte</p>
              <div className="flex items-center mt-2 text-gray-500 text-sm">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Nouveau</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* High-Tech Section */}
      <div className="mb-10">
        <div className="flex items-center mb-5">
          <div className="bg-gradient-to-r from-gray-200 to-gray-100 p-3 rounded-xl mr-3 shadow-sm">
            <FaLaptop className="text-gray-700 text-xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">High-Tech</h2>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {/* LG Offer Card */}
          <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100">
            <div className="p-5">
              <div className="flex items-center">
                <div className="bg-red-50 rounded-xl shadow-sm inline-block mb-3 mr-4 border border-red-100">
                  <div className="h-16 w-16 flex items-center justify-center p-2">
                    <span className="font-bold text-red-600 text-xl">LG</span>
                  </div>
                </div>
                <div>
                  <p className="font-medium text-gray-800 mb-1">-5% de remise sur tout LG Electronics</p>
                  <p className="text-gray-600 text-sm">Téléviseurs, smartphones, électroménager</p>
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <button className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                  Voir l'offre
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Voyage Section */}
      <div className="mb-10">
        <div className="flex items-center mb-5">
          <div className="bg-gradient-to-r from-blue-200 to-blue-100 p-3 rounded-xl mr-3 shadow-sm">
            <FaPlane className="text-blue-600 text-xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Voyage</h2>
        </div>

        <div className="grid grid-cols-2 gap-5">
          {/* Voyage Card 1 */}
          <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="h-36 bg-gradient-to-r from-blue-500 to-blue-600 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white text-center">
                  <p className="font-bold text-xl mb-1">Destinations d'été</p>
                  <p className="text-sm mb-2">-20% sur vos réservations</p>
                  <span className="bg-white text-blue-600 px-3 py-1 rounded-full text-xs font-bold">Exclusif</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Voyage Card 2 */}
          <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="h-36 bg-gradient-to-r from-orange-500 to-orange-600 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white text-center">
                  <p className="font-bold text-xl mb-1">Ton permis à 75€</p>
                  <p className="text-sm mb-2">Offre limitée dans le temps</p>
                  <span className="bg-white text-orange-600 px-3 py-1 rounded-full text-xs font-bold">Populaire</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 