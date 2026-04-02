import { NextRequest, NextResponse } from "next/server";

import { normalizeCoverImageForStorage } from "@/lib/article-cover-images";
import {
  getApprovalReviewItem,
  listPendingApprovalItems,
  type ApprovalItemSource,
  type DraftApprovalUpdateInput,
  updateDraftApprovalItem,
} from "@/lib/admin-approvals";

function isDraftSectionList(
  value: unknown,
): value is DraftApprovalUpdateInput["sections"] {
  return (
    Array.isArray(value) &&
    value.every(
      (section) =>
        typeof section === "object" &&
        section !== null &&
        typeof (section as { heading?: unknown }).heading === "string" &&
        typeof (section as { content?: unknown }).content === "string",
    )
  );
}

function isDraftApprovalUpdateInput(
  value: unknown,
): value is DraftApprovalUpdateInput {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const payload = value as Record<string, unknown>;

  return (
    typeof payload.title === "string" &&
    typeof payload.slug === "string" &&
    typeof payload.excerpt === "string" &&
    typeof payload.category === "string" &&
    typeof payload.seoTitle === "string" &&
    typeof payload.seoDescription === "string" &&
    (typeof payload.coverImageUrl === "undefined" ||
      typeof payload.coverImageUrl === "string") &&
    (typeof payload.sourceUrl === "undefined" ||
      typeof payload.sourceUrl === "string") &&
    isDraftSectionList(payload.sections)
  );
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get("source");
    const id = searchParams.get("id");

    if (source && id) {
      if (source !== "database" && source !== "draft") {
        return NextResponse.json(
          { error: "Invalid approval source" },
          { status: 400 },
        );
      }

      const approval = await getApprovalReviewItem(source as ApprovalItemSource, id);

      if (!approval) {
        return NextResponse.json(
          { error: "Approval item not found" },
          { status: 404 },
        );
      }

      return NextResponse.json(approval);
    }

    const approvals = await listPendingApprovalItems();
    return NextResponse.json(approvals);
  } catch (error) {
    console.error("Failed to fetch approvals:", error);
    return NextResponse.json(
      { error: "Failed to fetch approvals" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, source, data } = (await request.json()) as {
      id?: string;
      source?: ApprovalItemSource;
      data?: unknown;
    };

    if (!id || source !== "draft" || !isDraftApprovalUpdateInput(data)) {
      return NextResponse.json(
        { error: "Draft approval id and valid draft data are required" },
        { status: 400 },
      );
    }

    const updatedDraft = await updateDraftApprovalItem(id, {
      title: data.title.trim(),
      slug: data.slug.trim(),
      excerpt: data.excerpt.trim(),
      category: data.category.trim(),
      coverImageUrl:
        normalizeCoverImageForStorage(data.coverImageUrl?.trim()) ?? undefined,
      seoTitle: data.seoTitle.trim(),
      seoDescription: data.seoDescription.trim(),
      sourceUrl: data.sourceUrl?.trim(),
      sections: data.sections.map((section) => ({
        heading: section.heading.trim(),
        content: section.content.trim(),
      })),
    });

    return NextResponse.json(updatedDraft);
  } catch (error) {
    console.error("Failed to update draft approval item:", error);
    const message =
      error instanceof Error && error.message.trim().length > 0
        ? error.message
        : "Failed to update draft approval item";
    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }
}
