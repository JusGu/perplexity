import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">
        What do you want to know?
      </h1>
      
      <div className="flex gap-3">
        <div className="relative">
          <Input 
            placeholder="Ask me anything..." 
            className="w-[400px] h-12 text-lg"
          />
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6" />
        </div>
        <Button className="h-12 px-6 text-lg">Ask</Button>
      </div>
    </main>
  )
}
