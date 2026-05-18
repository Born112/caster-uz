export { createClient } from "./supabase/client";

import { createClient as createClientFn } from "./supabase/client";
export const supabase = createClientFn();
