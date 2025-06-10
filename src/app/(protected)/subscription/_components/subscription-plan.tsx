"use client";

import { loadStripe } from "@stripe/stripe-js";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";

import { createStripeCheckout } from "@/actions/create-stripe-checkout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const plans = [
  {
    name: "Plano Básico",
    price: 59,
    features: [
      "Cadastro de até 3 médicos",
      "Agendamentos ilimitados",
      "Métricas básicas",
      "Cadastro de pacientes",
      "Confirmação manual",
      "Suporte via e-mail",
    ],
  },
];

interface SubscriptionPlanProps {
  active: boolean;
  userEmail: string;
}

const SubscriptionPlan = ({
  active = false,
  userEmail,
}: SubscriptionPlanProps) => {
  const router = useRouter();
  const createStripeCheckoutAction = useAction(createStripeCheckout, {
    onSuccess: async ({ data }) => {
      if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
        throw new Error("Stripe publishable key is not set");
      }
      const stripe = await loadStripe(
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
      );
      if (!stripe) {
        throw new Error("Stripe not found");
      }
      if (!data?.sessionId) {
        throw new Error("Session ID not found");
      }

      await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });
    },
  });

  const handleSubscribeClick = () => {
    createStripeCheckoutAction.execute();
  };

  const handleManagePlanClick = () => {
    router.push(
      `${process.env.NEXT_PUBLIC_STRIPE_CUSTOMER_PORTAL_URL}?prefilled_email=${userEmail}`
    );
  };

  return plans.map((plan, index) => {
    return (
      <Card key={index}>
        <CardHeader>
          <CardTitle className="mb-2 flex items-center justify-between">
            {plan.name}
            {active && (
              <Badge
                variant="default"
                className="rounded-full bg-[#EBFAF7] text-[#008069]"
              >
                Atual
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Para profissionais autônomos ou pequenas clínicas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-semibold">
            R$ {plan.price}
            <span className="text-xl font-normal text-muted-foreground">
              {" "}
              / mês
            </span>
          </p>
          <Separator className="my-6" />
          <ul className="space-y-3 text-sm">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#008069]" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <Separator className="my-6" />

          <Button
            className="w-full"
            variant="outline"
            onClick={active ? handleManagePlanClick : handleSubscribeClick}
            disabled={createStripeCheckoutAction.isExecuting}
          >
            {createStripeCheckoutAction.isExecuting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : active ? (
              "Gerenciar Assinatura"
            ) : (
              "Fazer Assinatura"
            )}
          </Button>
        </CardContent>
      </Card>
    );
  });
};

export default SubscriptionPlan;
