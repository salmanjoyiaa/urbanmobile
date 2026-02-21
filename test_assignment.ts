import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function check() {
    const { data: users } = await supabase.auth.admin.listUsers();
    const salman = users.users.find(u => u.user_metadata?.full_name?.toLowerCase().includes("salman"));
    console.log("Salman User ID:", salman?.id);

    const { data: agents } = await supabase.from("agents").select("*").eq("profile_id", salman?.id);
    console.log("Agent Record:", agents);

    const { data: visits } = await supabase.from("visit_requests").select("*").eq("visiting_agent_id", salman?.id);
    console.log("Assigned Visits:", visits);

    if (salman) {
        // Try Querying with RLS as Salman
        const userClient = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { global: { headers: { Authorization: `Bearer ${salman.id}` /* actually we need a proper token or just check RLS */ } } }
        );
    }
}

check().catch(console.error);
