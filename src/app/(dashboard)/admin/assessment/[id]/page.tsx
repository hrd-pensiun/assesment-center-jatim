import { AttemptDetailPage } from "@/components/assessment/attempt-detail-page";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AttemptDetailPage id={id} />;
}
