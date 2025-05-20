
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ShoppingCart, Menu, X, LogIn, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const navLinks = [
    { name: 'Accueil', path: '/' },
    { name: 'Produits', path: '/products' },
    { name: 'Recettes', path: '/recipes' },
    { name: 'À propos', path: '/about' },
  ];

  return (
    <nav className="w-full bg-beyana-cream shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold font-playfair text-beyana-green">Beyana</span>
          </Link>
          
          {/* Desktop Navigation */}
          {!isMobile && (
            <div className="hidden md:flex space-x-8">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  to={link.path} 
                  className="nav-link"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            {!isMobile && (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-beyana-green hover:bg-beyana-lightgreen/20 flex items-center gap-1">
                    <LogIn className="h-4 w-4" />
                    <span>Connexion</span>
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="ghost" size="sm" className="text-beyana-green hover:bg-beyana-lightgreen/20 flex items-center gap-1">
                    <UserPlus className="h-4 w-4" />
                    <span>Inscription</span>
                  </Button>
                </Link>
              </>
            )}
            
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="text-beyana-green hover:bg-beyana-lightgreen/20">
                <ShoppingCart className="h-5 w-5" />
              </Button>
            </Link>
            
            {isMobile && (
              <Button variant="ghost" size="icon" onClick={toggleMenu} className="md:hidden">
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            )}
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <div className={cn(
          "md:hidden overflow-hidden transition-all duration-300",
          isOpen ? "max-h-80" : "max-h-0"
        )}>
          <div className="flex flex-col space-y-4 py-4">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path} 
                className="text-center py-2 hover:bg-beyana-lightgreen/20 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 py-2 hover:bg-beyana-lightgreen/20 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              <LogIn className="h-4 w-4" />
              <span>Connexion</span>
            </Link>
            <Link
              to="/signup"
              className="flex items-center justify-center gap-2 py-2 hover:bg-beyana-lightgreen/20 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              <UserPlus className="h-4 w-4" />
              <span>Inscription</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
