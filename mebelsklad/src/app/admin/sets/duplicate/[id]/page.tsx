// src/app/admin/sets/duplicate/[id]/page.tsx
import { notFound, redirect } from "next/navigation";
import { jsonDataService } from "@/lib/api/jsonDataService";
import { generateId } from "@/lib/utils/format";

export default async function DuplicateSetPage({
  params,
}: {
  params: { id: string };
}) {
  // Get the original set
  const originalSet = await jsonDataService.getProductSetById(params.id);

  if (!originalSet) {
    notFound();
  }

  // Create a copy with a new ID and slightly modified name
  const newSet = {
    ...originalSet,
    id: generateId("SET"),
    name: `${originalSet.name} (Copy)`,
    slug: `${originalSet.slug}-copy`,
  };

  // Save the new set
  await jsonDataService.saveProductSet(newSet);

  // Redirect to edit page for the new set
  redirect(`/admin/sets/${newSet.id}`);
}
