import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://jfsgnivgwemukcyhioqu.supabase.co";
const supabaseKey = "sb_publishable_G6TEwODfDrtL8X8qClUujA_qKGI4NFL";

export const supabase = createClient(supabaseUrl, supabaseKey);