import { NextRequest, NextResponse } from "next/server";

import { approveApprovalItem, type ApprovalItemSource } from "@/lib/admin-approvals";

export async function POST(request: NextRequest) {
  try {
    const { id, source } = (await request.json()) as {
      id?: string;
      source?: ApprovalItemSource;
    };

    if (!id || (source !== "database" && source !== "draft")) {
      return NextResponse.json(
        { error: "Approval id and source are required" },
        { status: 400 },
      );
    }

    await approveApprovalItem(source, id);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Failed to approve item:", error);
    return NextResponse.json(
      { error: "Failed to approve item" },
      { status: 500 },
    );
  }
}
