import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    (supabase as any)
      .from("platform_settings")
      .select("key, value")
      .then(({ data }: any) => {
        const map: Record<string, string> = {};
        (data || []).forEach((d: any) => { map[d.key] = d.value; });
        setSettings(map);
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    for (const [key, value] of Object.entries(settings)) {
      await (supabase as any)
        .from("platform_settings")
        .update({ value, updated_at: new Date().toISOString() })
        .eq("key", key);
    }
    toast({ title: "Settings saved" });
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Platform Settings</h1>

      <Card className="bg-[#1E293B] border-[#334155] max-w-xl">
        <CardHeader><CardTitle className="text-lg">General</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Site Name</Label>
            <Input
              value={settings.site_name || ""}
              onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
              className="bg-[#0F172A] border-[#334155]"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Maintenance Mode</Label>
              <p className="text-xs text-muted-foreground">Take the site offline temporarily</p>
            </div>
            <Switch
              checked={settings.maintenance_mode === "true"}
              onCheckedChange={(v) => setSettings({ ...settings, maintenance_mode: v ? "true" : "false" })}
            />
          </div>

          <div className="space-y-2">
            <Label>Refund Policy</Label>
            <Textarea
              value={settings.refund_policy || ""}
              onChange={(e) => setSettings({ ...settings, refund_policy: e.target.value })}
              className="bg-[#0F172A] border-[#334155]"
              rows={5}
            />
          </div>

          <Button onClick={handleSave} disabled={saving} className="gap-2 bg-primary hover:bg-primary/90">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
