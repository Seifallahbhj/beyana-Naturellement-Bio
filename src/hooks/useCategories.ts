import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import categoryService, { Category } from '../services/api/categoryService';
import { useToast } from './use-toast';

// Clés de requête pour React Query
export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: () => [...categoryKeys.lists()] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
  subcategories: (id: string) => [...categoryKeys.all, 'subcategories', id] as const,
  path: (id: string) => [...categoryKeys.all, 'path', id] as const,
  products: (id: string) => [...categoryKeys.all, 'products', id] as const,
};

// Hook personnalisé pour les catégories
export const useCategories = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Récupérer toutes les catégories
  const getCategories = useQuery({
    queryKey: categoryKeys.list(),
    queryFn: () => categoryService.getCategories(),
    select: (data) => data.data || [],
  });

  // Mutation pour créer une catégorie (admin)
  const createCategory = useMutation({
    mutationFn: (categoryData: Omit<Category, '_id'>) => categoryService.createCategory(categoryData),
    onSuccess: () => {
      // Invalider les requêtes de liste de catégories pour forcer un rechargement
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      toast({
        title: 'Catégorie créée',
        description: 'La catégorie a été créée avec succès.',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: `Impossible de créer la catégorie: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Mutation pour mettre à jour une catégorie (admin)
  const updateCategory = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Category> }) => 
      categoryService.updateCategory(id, data),
    onSuccess: (_, variables) => {
      // Invalider les requêtes spécifiques
      queryClient.invalidateQueries({ queryKey: categoryKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      toast({
        title: 'Catégorie mise à jour',
        description: 'La catégorie a été mise à jour avec succès.',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: `Impossible de mettre à jour la catégorie: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Mutation pour supprimer une catégorie (admin)
  const deleteCategory = useMutation({
    mutationFn: (id: string) => categoryService.deleteCategory(id),
    onSuccess: () => {
      // Invalider les requêtes de liste de catégories
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      toast({
        title: 'Catégorie supprimée',
        description: 'La catégorie a été supprimée avec succès.',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: `Impossible de supprimer la catégorie: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  return {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
};

// Hook pour récupérer une catégorie par son ID
export const useCategory = (id?: string) => {
  const enabled = !!id;
  
  return useQuery({
    queryKey: categoryKeys.detail(id || ''),
    queryFn: () => categoryService.getCategoryById(id || ''),
    enabled,
    select: (data) => data.data,
  });
};

// Hook pour récupérer une catégorie par son slug
export const useCategoryBySlug = (slug?: string) => {
  const enabled = !!slug;
  
  return useQuery({
    queryKey: [...categoryKeys.details(), 'slug', slug],
    queryFn: () => categoryService.getCategoryBySlug(slug || ''),
    enabled,
    select: (data) => data.data,
  });
};

// Hook pour récupérer les sous-catégories d'une catégorie
export const useSubcategories = (categoryId?: string) => {
  const enabled = !!categoryId;
  
  return useQuery({
    queryKey: categoryKeys.subcategories(categoryId || ''),
    queryFn: () => categoryService.getSubcategories(categoryId || ''),
    enabled,
    select: (data) => data.data || [],
  });
};

// Hook pour récupérer le chemin d'une catégorie (fil d'Ariane)
export const useCategoryPath = (categoryId?: string) => {
  const enabled = !!categoryId;
  
  return useQuery({
    queryKey: categoryKeys.path(categoryId || ''),
    queryFn: () => categoryService.getCategoryPath(categoryId || ''),
    enabled,
    select: (data) => data.data || [],
  });
};

// Hook pour récupérer les produits d'une catégorie
export const useCategoryProducts = (categoryId?: string, page = 1, limit = 10) => {
  const enabled = !!categoryId;
  
  return useQuery({
    queryKey: [...categoryKeys.products(categoryId || ''), { page, limit }],
    queryFn: () => categoryService.getCategoryProducts(categoryId || '', page, limit),
    enabled,
    select: (data) => data.data || [],
  });
};
