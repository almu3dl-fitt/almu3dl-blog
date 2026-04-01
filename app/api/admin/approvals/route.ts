import { NextRequest, NextResponse } from "next/server";

import {
  getApprovalReviewItem,
  listPendingApprovalItems,
  type ApprovalItemSource,
} from "@/lib/admin-approvals";

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
