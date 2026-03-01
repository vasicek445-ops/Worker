import { supabase } from "../../supabase";

export async function GET() {
  const { data, error } = await supabase.from("Nabídky").select("*");
  return Response.json({ data, error });
}