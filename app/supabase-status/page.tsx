import { SupabaseStatus } from "@/components/supabase-status"

export default function SupabaseStatusPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Supabase Status</h1>
      <SupabaseStatus />

      <div className="mt-8">
        <h2 className="text-lg font-medium mb-4">Troubleshooting Supabase Connection</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">1. Check Environment Variables</h3>
            <p className="text-sm text-gray-600 mt-1">
              Ensure you have the correct Supabase URL and API keys in your environment variables.
            </p>
          </div>

          <div>
            <h3 className="font-medium">2. Verify Storage Bucket</h3>
            <p className="text-sm text-gray-600 mt-1">
              Make sure you have created a 'guidelines-images' bucket in your Supabase project.
            </p>
          </div>

          <div>
            <h3 className="font-medium">3. Check RLS Policies</h3>
            <p className="text-sm text-gray-600 mt-1">
              Verify that your Row Level Security (RLS) policies allow the necessary operations.
            </p>
          </div>

          <div>
            <h3 className="font-medium">4. Review Error Messages</h3>
            <p className="text-sm text-gray-600 mt-1">
              The specific error messages above can help identify the exact issue with your Supabase connection.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
