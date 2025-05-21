import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import productService, { Product, ProductFilters } from '../services/api/productService';
import { useToast } from './use-toast';

// Clés de requête pour React Query
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: ProductFilters) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  featured: () => [...productKeys.all, 'featured'] as const,
  similar: (id: string) => [...productKeys.all, 'similar', id] as const,
};

// Hook personnalisé pour les produits
export const useProducts = (filters?: ProductFilters) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Récupérer tous les produits avec filtres optionnels
  const getProducts = useQuery({
    queryKey: productKeys.list(filters || {}),
    queryFn: () => productService.getProducts(filters),
    select: (data) => {
      // Adapter la réponse au format attendu par le composant
      // En utilisant la structure actuelle de l'API
      const products = data.data || [];
      const count = data.count || 0;
      const page = filters?.page || 1;
      const limit = filters?.limit || 12;
      const totalPages = Math.ceil(count / limit) || 1;
      
      return {
        data: products,
        total: count,
        page: page,
        limit: limit,
        totalPages: totalPages
      };
    },
  });

  // Récupérer les produits mis en avant
  const getFeaturedProducts = useQuery({
    queryKey: productKeys.featured(),
    queryFn: () => productService.getFeaturedProducts(),
    select: (data) => data.data || [],
  });

  // Mutation pour créer un produit (admin)
  const createProduct = useMutation({
    mutationFn: (productData: Omit<Product, '_id'>) => productService.createProduct(productData),
    onSuccess: () => {
      // Invalider les requêtes de liste de produits pour forcer un rechargement
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      toast({
        title: 'Produit créé',
        description: 'Le produit a été créé avec succès.',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: `Impossible de créer le produit: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Mutation pour mettre à jour un produit (admin)
  const updateProduct = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) => 
      productService.updateProduct(id, data),
    onSuccess: (_, variables) => {
      // Invalider les requêtes spécifiques
      queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      toast({
        title: 'Produit mis à jour',
        description: 'Le produit a été mis à jour avec succès.',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: `Impossible de mettre à jour le produit: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Mutation pour supprimer un produit (admin)
  const deleteProduct = useMutation({
    mutationFn: (id: string) => productService.deleteProduct(id),
    onSuccess: () => {
      // Invalider les requêtes de liste de produits
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      toast({
        title: 'Produit supprimé',
        description: 'Le produit a été supprimé avec succès.',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: `Impossible de supprimer le produit: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  return {
    getProducts,
    getFeaturedProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  };
};

// Hook pour récupérer un produit par son ID
export const useProduct = (id?: string) => {
  const enabled = !!id;
  
  return useQuery({
    queryKey: productKeys.detail(id || ''),
    queryFn: () => productService.getProductById(id || ''),
    enabled,
    select: (data) => data.data,
  });
};

// Hook pour récupérer un produit par son slug
export const useProductBySlug = (slug?: string) => {
  const enabled = !!slug;
  
  return useQuery({
    queryKey: [...productKeys.details(), 'slug', slug],
    queryFn: () => productService.getProductBySlug(slug || ''),
    enabled,
    select: (data) => data.data,
  });
};

// Hook pour récupérer les produits similaires
export const useSimilarProducts = (productId?: string) => {
  const enabled = !!productId;
  
  return useQuery({
    queryKey: productKeys.similar(productId || ''),
    queryFn: () => productService.getSimilarProducts(productId || ''),
    enabled,
    select: (data) => data.data || [],
  });
};
