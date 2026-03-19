import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import RankingEditor from "@/components/RankingEditor";

export const dynamic = "force-dynamic";

export default async function RankingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">MYランキング</h1>
      <p className="mb-6 text-gray-900">
        好きなラーメン店 Best 3 を登録しましょう。公開/非公開を個別に設定できます。
      </p>
      <RankingEditor userId={user.id} />
    </div>
  );
}
