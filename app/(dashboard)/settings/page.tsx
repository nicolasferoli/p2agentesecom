import { Metadata } from "next";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCurrentUserFromServerComponent } from "@/lib/supabase/server";
import { ProfileSettings } from "./_components/profile-settings";
import { AppearanceSettings } from "./_components/appearance-settings";
import { NotificationSettings } from "./_components/notification-settings";
import { ApiKeysSettings } from "./_components/api-keys-settings";

export const metadata: Metadata = {
  title: "Configurações",
  description: "Gerencie suas configurações de conta e preferências",
};

export default async function SettingsPage() {
  const user = await getCurrentUserFromServerComponent();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie suas configurações de conta e preferências
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="appearance">Aparência</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="api-keys">Chaves de API</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="space-y-4">
          <ProfileSettings userId={user.id} />
        </TabsContent>
        <TabsContent value="appearance" className="space-y-4">
          <AppearanceSettings userId={user.id} />
        </TabsContent>
        <TabsContent value="notifications" className="space-y-4">
          <NotificationSettings userId={user.id} />
        </TabsContent>
        <TabsContent value="api-keys" className="space-y-4">
          <ApiKeysSettings userId={user.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
} 