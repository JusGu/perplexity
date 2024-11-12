import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { searchString } = await req.json();

    const search = await prisma.search.create({
      data: {
        queries: {
          create: {
            searchString,
            answer: "", // Empty answer for now
          },
        },
      },
      include: {
        queries: true,
      },
    });

    return NextResponse.json({ searchId: search.id });
  } catch (error) {
    console.error("Error creating search:", error);
    return NextResponse.json(
      { error: "Failed to create search" },
      { status: 500 }
    );
  }
} 