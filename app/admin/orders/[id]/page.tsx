import { PagePlaceholder } from "@/components/shared/page-placeholder";

type AdminOrderDetailPageProps = {
  params: { id: string };
};

export default function AdminOrderDetailPage({ params }: AdminOrderDetailPageProps) {
  return (
    <PagePlaceholder
      title={`Order #${params.id}`}
      description="Order detail, status update, and refund processing tools will be implemented here."
    />
  );
}
