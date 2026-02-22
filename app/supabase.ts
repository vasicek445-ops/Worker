import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://recyoezvcfiarmeizgqc.supabase.co";
const supabaseKey = "sb_publishable_rx-9r9EdGK7ZC45iedOp3g_jWO8AIEo";

export const supabase = createClient(supabaseUrl, supabaseKey);