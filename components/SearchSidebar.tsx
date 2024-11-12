'use client';

import { Search, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { SearchWithQueries } from '@/types/search';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function SearchSidebar({ searches }: { searches: SearchWithQueries[] }) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 bg-gray-900">
        <div className="space-y-4 py-4">
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold text-white">Recent Searches</h2>
            <div className="space-y-1">
              {searches?.map((search) => (
                <button
                  key={search.id}
                  onClick={() => router.push(`/${search.id}`)}
                  className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-white hover:bg-gray-800 transition-all"
                >
                  <Search className="h-4 w-4" />
                  <span className="text-sm text-left flex-1 truncate">
                    {search.query}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="lg:hidden">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="bg-gray-900 w-72 p-0">
          <div className="space-y-4 py-4">
            <div className="px-3 py-2">
              <h2 className="mb-2 px-4 text-lg font-semibold text-white">Recent Searches</h2>
              <div className="space-y-1">
                {searches?.map((search) => (
                  <button
                    key={search.id}
                    onClick={() => router.push(`/${search.id}`)}
                    className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-white hover:bg-gray-800 transition-all"
                  >
                    <Search className="h-4 w-4" />
                    <span className="text-sm text-left flex-1 truncate">
                      {search.query}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
} 