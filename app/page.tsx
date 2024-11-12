import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 max-w-3xl mx-auto">
      <h1 className="text-4xl md:text-5xl font-bold text-center mb-8 tracking-tight text-white">
        What do you want to know?
      </h1>
      
      <div className="w-full flex gap-2">
        <div className="relative flex-1">
          <Input 
            placeholder="Ask me anything..." 
            className="w-full pl-4 pr-10 py-6 text-lg rounded-xl bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-400 focus-visible:ring-zinc-600"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-5 w-5" />
        </div>
        <Button 
          className="px-6 py-6 text-lg rounded-xl bg-white hover:bg-zinc-100 text-black"
          size="lg"
        >
          Ask
        </Button>
      </div>
    </main>
  )
}
