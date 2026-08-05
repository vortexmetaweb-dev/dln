import { redirect } from "next/navigation";

export default function LegacyPlatformEditQuotePage({
  params,
}: {
  params: { id: string };
}) {
  redirect(`/platform/new?id=${encodeURIComponent(params.id)}`);
}
