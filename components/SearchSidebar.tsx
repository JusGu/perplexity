'use client';

import { Search } from '@prisma/client';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Menu, Pencil, Trash } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface SearchWithQueries extends Search {
  queries: { searchString: string }[];
}

interface SearchSidebarProps {
  searches: SearchWithQueries[];
}

export default function SearchSidebar({ searches }: SearchSidebarProps) {
  const router = useRouter();
  const [editingSearch, setEditingSearch] = useState<SearchWithQueries | null>(null);
  const [newSearchString, setNewSearchString] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [searchToDelete, setSearchToDelete] = useState<string | null>(null);

  const handleDelete = async (searchId: string) => {
    try {
      await fetch(`/api/search/${searchId}`, {
        method: 'DELETE',
      });
      setIsDeleteDialogOpen(false);
      setSearchToDelete(null);
      router.refresh();
    } catch (error) {
      console.error('Error deleting search:', error);
    }
  };

  const handleUpdate = async (searchId: string) => {
    try {
      await fetch(`/api/search/${searchId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ searchString: newSearchString }),
      });
      setIsEditDialogOpen(false);
      setEditingSearch(null);
      router.refresh();
    } catch (error) {
      console.error('Error updating search:', error);
    }
  };

  return (
    <>
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
                  <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          setEditingSearch(search);
                          setNewSearchString(search.queries[0]?.searchString || '');
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Search</DialogTitle>
                        <DialogDescription>
                          Update your search query below.
                        </DialogDescription>
                      </DialogHeader>
                      <Input
                        value={newSearchString}
                        onChange={(e) => setNewSearchString(e.target.value)}
                        placeholder="Enter new search query"
                      />
                      <DialogFooter className="mt-4">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsEditDialogOpen(false);
                            setEditingSearch(null);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => editingSearch && handleUpdate(editingSearch.id)}
                        >
                          Save Changes
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setSearchToDelete(search.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete Search</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete this search? This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter className="mt-4">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsDeleteDialogOpen(false);
                            setSearchToDelete(null);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => searchToDelete && handleDelete(searchToDelete)}
                        >
                          Delete
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
} 