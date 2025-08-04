import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://noxrldmdtlxckientgqx.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5veHJsZG1kdGx4Y2tpZW50Z3F4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMjYzMjksImV4cCI6MjA2OTgwMjMyOX0.nXn4DMpFdCXRYD3sVv7MvVUHJJj-FNwoqoZCMktuoe4";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
