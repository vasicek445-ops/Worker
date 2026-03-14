import { supabase } from "../supabase";
import DashboardContent from "../components/DashboardContent";

export const dynamic = 'force-dynamic';

async function getDashboardData() {
  const [
    { count: agencyCount },
    { count: jobCount },
    { count: housingCount },
  ] = await Promise.all([
    supabase.from("agencies").select("*", { count: "exact", head: true }),
    supabase.from("jobs").select("*", { count: "exact", head: true }),
    supabase.from("housing").select("*", { count: "exact", head: true }),
  ]);

  // Get 6 latest jobs for preview
  const { data: latestJobs } = await supabase
    .from("jobs")
    .select("id, title, company, canton, salary_text, created_at, source")
    .order("created_at", { ascending: false })
    .limit(6);

  return {
    agencyCount: agencyCount || 0,
    jobCount: jobCount || 0,
    housingCount: housingCount || 0,
    latestJobs: latestJobs || [],
  };
}

export default async function Dashboard() {
  const data = await getDashboardData();
  return <DashboardContent {...data} />;
}
