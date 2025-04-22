import SupabaseStorageTest from "@/components/supabase-storage-test"

export default function TestStoragePage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Test Supabase Storage</h1>
      <SupabaseStorageTest />
    </div>
  )
}
