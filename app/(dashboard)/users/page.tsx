import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUserFromServerComponent } from "@/lib/supabase/server";
import { UsersList } from "./_components/users-list";

export const metadata: Metadata = {
  title: "Usuários",
  description: "Gerencie usuários do sistema",
};

export default async function UsersPage() {
  const user = await getCurrentUserFromServerComponent();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Usuários</h1>
        <p className="text-muted-foreground">
          Gerencie os usuários do sistema
        </p>
      </div>
      <UsersList />
    </div>
  );
} 