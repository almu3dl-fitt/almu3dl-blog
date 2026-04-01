import { NextRequest, NextResponse } from "next/server";

import { rejectApprovalItem, type ApprovalItemSource } from "@/lib/admin-approvals";

export async function POST(request: NextRequest) {
  try {
    const { id, source, reason } = (await request.json()) as {
      id?: string;
      source?: ApprovalItemSource;
      reason?: string;
    };

    if (!id || (source !== "database" && source !== "draft")) {
      return NextResponse.json(
        { error: "Approval id and source are required" },
        { status: 400 },
      );
    }

    await rejectApprovalItem(source, id, reason);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Failed to reject item:", error);
    return NextResponse.json(
      { error: "Failed to reject item" },
      { status: 500 },
    );
  }
}
