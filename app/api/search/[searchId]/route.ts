import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { searchId: string } }
) {
  try {
    const search = await prisma.search.findUnique({
      where: { id: params.searchId },
      include: {
        queries: true
      }
    });
    
    if (!search) {
      return NextResponse.json({ error: 'Search not found' }, { status: 404 });
    }

    return NextResponse.json(search);
  } catch (error) {
    console.error('Error fetching search:', error);
    return NextResponse.json(
      { error: 'Failed to fetch search' }, 
      { status: 500 }
    );
  }
}

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

export async function PATCH(
  req: Request,
  { params }: { params: { searchId: string } }
) {
  try {
    const { searchString } = await req.json();
    const search = await prisma.search.findUnique({
      where: { id: params.searchId },
      include: { queries: true },
    });

    if (!search) {
      return NextResponse.json({ error: "Search not found" }, { status: 404 });
    }

    // Update the first query's searchString
    await prisma.query.update({
      where: { id: search.queries[0].id },
      data: { searchString },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating search:", error);
    return NextResponse.json(
      { error: "Failed to update search" },
      { status: 500 }
    );
  }
} 