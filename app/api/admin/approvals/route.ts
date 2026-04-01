import { NextResponse } from "next/server";

import { listPendingApprovalItems } from "@/lib/admin-approvals";

export async function GET() {
  try {
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
