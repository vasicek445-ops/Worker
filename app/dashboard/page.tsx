import { supabase } from "../supabase";
import DashboardContent from "../components/DashboardContent";

export const dynamic = 'force-dynamic';

async function getAgencyCount() {
  const { count } = await supabase.from("agencies").select("*", { count: "exact", head: true });
  return count || 0;
}

async function getAgencyPreview() {
  const { data } = await supabase.from("agencies").select("name, city, canton, language_region").limit(5);
  return data || [];
}

export default async function Dashboard() {
  const agencyCount = await getAgencyCount();
  const agencies = await getAgencyPreview();
  return <DashboardContent agencyCount={agencyCount} agencies={agencies} />;
}
