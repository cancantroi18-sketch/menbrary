import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default function NewPostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
