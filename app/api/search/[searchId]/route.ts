import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: { searchId: string } }
) {
  try {
    await prisma.search.delete({
      where: { id: params.searchId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting search:", error);
    return NextResponse.json(
      { error: "Failed to delete search" },
      { status: 500 }
    );
  }
} 