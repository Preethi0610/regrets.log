import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
//the client func to run and saving the result 
//in our variable supabase. The createBrowserClient function is imported from the @supabase/ssr package and 
// is used to create a Supabase client that can be used in a browser environment. The function takes two arguments: 
// the Supabase URL and the Supabase anon key, which are retrieved from environment variables. The exclamation 
// mark after the environment variable names indicates that these values are non-nullable, meaning they must be 
// defined for the code to work correctly.