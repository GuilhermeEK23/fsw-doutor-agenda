import {
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";

import SubscriptionPlan from "./_components/subscription-plan";

const SubscriptionPage = () => {
  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Assinatura</PageTitle>
          <PageDescription>Gerencie sua assinatura e planos.</PageDescription>
        </PageHeaderContent>
      </PageHeader>
      <PageContent>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <SubscriptionPlan />
        </div>
      </PageContent>
    </PageContainer>
  );
};

export default SubscriptionPage;
