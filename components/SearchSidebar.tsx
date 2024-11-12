'use client';

import { Search } from '@prisma/client';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Menu, Pencil, Trash } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface SearchWithQueries extends Search {
  queries: { searchString: string }[];
}

interface SearchSidebarProps {
  searches: SearchWithQueries[];
}

export default function SearchSidebar({ searches }: SearchSidebarProps) {
  const router = useRouter();
  const [editingSearch, setEditingSearch] = useState<SearchWithQueries | null>(null);

  const handleDelete = async (searchId: string) => {
    if (!confirm('Are you sure you want to delete this search?')) return;
    
    try {
      await fetch(`/api/search/${searchId}`, {
        method: 'DELETE',
      });
      router.refresh();
    } catch (error) {
      console.error('Error deleting search:', error);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="fixed top-4 left-4">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] bg-background">
        <SheetHeader>
          <SheetTitle>Recent Searches</SheetTitle>
        </SheetHeader>
        <div className="space-y-2 py-4">
          {searches.map((search) => (
            <div
              key={search.id}
              className="flex items-center justify-between p-2 hover:bg-accent rounded-md group"
            >
              <button
                onClick={() => router.push(`/${search.id}`)}
                className="text-sm text-left flex-1 truncate"
              >
                {search.queries[0]?.searchString}
              </button>
              <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setEditingSearch(search)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleDelete(search.id)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
} 