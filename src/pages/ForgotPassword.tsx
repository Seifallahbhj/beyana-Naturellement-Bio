
import { Link } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  email: z.string().email({
    message: "Veuillez entrer une adresse email valide.",
  }),
});

const ForgotPassword = () => {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Simuler une demande de réinitialisation de mot de passe réussie
    console.log("Reset password for:", values.email);
    toast({
      title: "Email envoyé",
      description: "Les instructions de réinitialisation ont été envoyées à votre adresse email.",
    });
  };

  return (
    <Layout>
      <div className="container max-w-md mx-auto py-12">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold font-playfair text-beyana-green">Mot de passe oublié</h1>
          <p className="text-muted-foreground mt-2">
            Entrez votre email pour réinitialiser votre mot de passe
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          placeholder="exemple@email.com"
                          {...field}
                          className="pl-10"
                        />
                      </FormControl>
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full bg-beyana-green hover:bg-beyana-green/90">
                Envoyer les instructions
              </Button>

              <div className="text-center mt-4">
                <Link to="/login" className="text-beyana-green font-medium hover:underline">
                  Retour à la connexion
                </Link>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </Layout>
  );
};

export default ForgotPassword;
