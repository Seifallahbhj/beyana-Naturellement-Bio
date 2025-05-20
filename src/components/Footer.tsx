
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-beyana-green text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1">
            <h3 className="text-xl font-playfair font-bold mb-4">Beyana</h3>
            <p className="text-sm">
              Spécialiste des collations et aliments biologiques pour un mode de vie sain et responsable.
            </p>
          </div>
          
          <div className="col-span-1">
            <h4 className="text-lg font-semibold mb-4">Navigation</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:underline">Accueil</Link></li>
              <li><Link to="/products" className="hover:underline">Produits</Link></li>
              <li><Link to="/recipes" className="hover:underline">Recettes</Link></li>
              <li><Link to="/about" className="hover:underline">À propos</Link></li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h4 className="text-lg font-semibold mb-4">Informations</h4>
            <ul className="space-y-2">
              <li><Link to="/contact" className="hover:underline">Contact</Link></li>
              <li><Link to="/faq" className="hover:underline">FAQ</Link></li>
              <li><Link to="/shipping" className="hover:underline">Livraison</Link></li>
              <li><Link to="/terms" className="hover:underline">Conditions générales</Link></li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h4 className="text-lg font-semibold mb-4">Newsletter</h4>
            <p className="text-sm mb-4">Inscrivez-vous pour recevoir nos offres et actualités</p>
            <div className="flex">
              <input 
                type="email" 
                placeholder="Votre email" 
                className="px-4 py-2 w-full text-black rounded-l-md focus:outline-none"
              />
              <button className="bg-beyana-brown hover:bg-opacity-80 text-white px-4 py-2 rounded-r-md">
                OK
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-white/20 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Beyana. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
