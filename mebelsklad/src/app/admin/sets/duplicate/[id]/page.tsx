// src/app/admin/sets/duplicate/[id]/page.tsx
import { notFound, redirect } from "next/navigation";
import { generateId } from "@/lib/utils/format";
import { setsApi } from "@/lib/api/mongoApi";

type Props = {
  params: { id: string };
}

export default async function DuplicateSetPage({ params }: Props) {
  try {
    // Get the original set
    const originalSet = await setsApi.getSetById(params.id);
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
    await setsApi.saveSet(newSet);

    // Redirect to edit page for the new set
    redirect(`/admin/sets/${newSet.id}?isDuplicate=true`);
  } catch (error) {
    console.error('Error duplicating set:', error);
    // В случае ошибки перенаправляем на страницу списка продуктов
    redirect('/admin/sets');
  }
}
