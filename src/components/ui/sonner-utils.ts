import { Toaster as Sonner, toast } from "sonner"

// Type pour les props du composant Toaster
export type ToasterProps = React.ComponentProps<typeof Sonner>

// Exporter le toast pour pouvoir l'utiliser ailleurs
export { toast }
