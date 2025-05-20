
import React from 'react';
import { Info, ChefHat, BookOpen } from 'lucide-react';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const AboutPage = () => {
  const teamMembers = [
    {
      name: 'Marie Dupont',
      role: 'Fondatrice & CEO',
      image: 'https://picsum.photos/seed/team1/200/200',
      bio: 'Passionnée de nutrition et d\'agriculture biologique depuis plus de 15 ans, Marie a fondé Beyana avec la vision de rendre les aliments biologiques accessibles à tous.'
    },
    {
      name: 'Thomas Laurent',
      role: 'Chef Culinaire',
      image: 'https://picsum.photos/seed/team2/200/200',
      bio: 'Ancien chef étoilé, Thomas a rejoint Beyana pour développer des recettes innovantes qui mettent en valeur les saveurs naturelles de nos ingrédients biologiques.'
    },
    {
      name: 'Sophia Moreau',
      role: 'Nutritionniste',
      image: 'https://picsum.photos/seed/team3/200/200',
      bio: 'Diplômée en nutrition et spécialiste de l\'alimentation à base de plantes, Sophia veille à ce que tous nos produits respectent les plus hauts standards nutritionnels.'
    }
  ];

  const values = [
    {
      title: 'Qualité Bio',
      icon: <BookOpen className="h-8 w-8 text-beyana-green" />,
      description: 'Nous sélectionnons minutieusement les meilleurs ingrédients biologiques pour garantir une qualité optimale dans chaque produit.'
    },
    {
      title: 'Durabilité',
      icon: <Info className="h-8 w-8 text-beyana-green" />,
      description: 'Notre engagement envers l\'environnement se reflète dans nos pratiques d\'approvisionnement responsables et nos emballages écologiques.'
    },
    {
      title: 'Innovation',
      icon: <ChefHat className="h-8 w-8 text-beyana-green" />,
      description: 'Nous repoussons constamment les limites pour créer des produits innovants qui allient santé, saveur et commodité.'
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        {/* Hero section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-playfair font-bold text-beyana-green mb-4">
            Notre Histoire
          </h1>
          <p className="text-lg max-w-3xl mx-auto text-gray-600">
            Découvrez l'histoire de Beyana, notre mission et les valeurs qui nous guident chaque jour.
          </p>
        </div>
        
        {/* Story section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-3xl font-playfair font-bold text-beyana-green mb-4">
              Notre Voyage
            </h2>
            <p className="text-gray-600 mb-4">
              Beyana est née en 2015 d'une passion simple mais profonde pour l'alimentation biologique et durable. Notre fondatrice, Marie Dupont, frustrée par le manque d'options biologiques savoureuses et accessibles, a décidé de créer sa propre gamme de produits.
            </p>
            <p className="text-gray-600 mb-4">
              Ce qui a commencé comme une petite entreprise locale s'est rapidement développé en une marque reconnue nationalement, aimée pour ses engagements forts envers la qualité, l'innovation et la durabilité.
            </p>
            <p className="text-gray-600">
              Aujourd'hui, Beyana continue de grandir tout en restant fidèle à sa mission originelle : rendre les aliments biologiques délicieux, nutritifs et accessibles à tous, tout en soutenant des pratiques agricoles durables et des communautés locales.
            </p>
          </div>
          <div className="rounded-lg overflow-hidden shadow-lg">
            <img 
              src="https://www.bio-verde.de/wp-content/uploads/2021/06/bio-verde_Qualitaet_Rezepturen@2x.jpg" 
              alt="L'histoire de Beyana" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        {/* Values section */}
        <div className="mb-20">
          <h2 className="text-3xl font-playfair font-bold text-beyana-green text-center mb-12">
            Nos Valeurs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center p-6 h-full bg-beyana-cream/50 border-none shadow-md">
                <CardContent className="pt-6">
                  <div className="mb-4 flex justify-center">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-beyana-green">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        {/* Team section */}
        <div className="mb-20">
          <h2 className="text-3xl font-playfair font-bold text-beyana-green text-center mb-12">
            Notre Équipe
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="text-center">
                <div className="mb-4 rounded-full overflow-hidden w-40 h-40 mx-auto shadow-md">
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold text-beyana-green">{member.name}</h3>
                <p className="text-beyana-brown font-medium mb-2">{member.role}</p>
                <p className="text-gray-600">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Mission statement */}
        <div className="bg-beyana-lightgreen/30 rounded-lg p-8 md:p-12 text-center mb-20">
          <h2 className="text-3xl font-playfair font-bold text-beyana-green mb-4">
            Notre Mission
          </h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            "Nous nous engageons à fournir des aliments biologiques de la plus haute qualité, produits de manière durable et éthique, 
            tout en éduquant et en inspirant les gens à adopter un mode de vie plus sain et plus respectueux de l'environnement."
          </p>
        </div>
        
        {/* CTA section */}
        <div className="text-center">
          <h2 className="text-3xl font-playfair font-bold text-beyana-green mb-4">
            Rejoignez Notre Aventure
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Explorez notre gamme de produits biologiques et découvrez la différence Beyana.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              className="bg-beyana-green hover:bg-beyana-darkgreen"
              onClick={() => window.location.href = '/products'}
            >
              Découvrir nos produits
            </Button>
            <Button 
              variant="outline" 
              className="border-beyana-green text-beyana-green hover:bg-beyana-green hover:text-white"
              onClick={() => window.location.href = '/contact'}
            >
              Nous contacter
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AboutPage;
