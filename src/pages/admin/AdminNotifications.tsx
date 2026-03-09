import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminNotifications() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState("all");
  const [specificUserId, setSpecificUserId] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    supabase.from("profiles").select("id, full_name, email").then(({ data }) => setUsers(data || []));
  }, []);

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast({ title: "Please fill title and message", variant: "destructive" });
      return;
    }
    setSending(true);

    const targetUsers = target === "all" ? users : users.filter((u) => u.id === specificUserId);
    if (targetUsers.length === 0) {
      toast({ title: "No users selected", variant: "destructive" });
      setSending(false);
      return;
    }

    const notifications = targetUsers.map((u) => ({
      user_id: u.id,
      title,
      message,
      icon: "bell",
    }));

    const { error } = await supabase.from("notifications").insert(notifications);
    if (error) {
      toast({ title: "Failed to send", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Notification sent to ${targetUsers.length} user(s)` });
      setTitle("");
      setMessage("");
    }
    setSending(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Send Notifications</h1>

      <Card className="bg-[#1E293B] border-[#334155] max-w-xl">
        <CardHeader><CardTitle className="text-lg">New Notification</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Target</Label>
            <Select value={target} onValueChange={setTarget}>
              <SelectTrigger className="bg-[#0F172A] border-[#334155]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="specific">Specific User</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {target === "specific" && (
            <div className="space-y-2">
              <Label>Select User</Label>
              <Select value={specificUserId} onValueChange={setSpecificUserId}>
                <SelectTrigger className="bg-[#0F172A] border-[#334155]">
                  <SelectValue placeholder="Choose user..." />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.email || u.full_name || u.id.slice(0, 8)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Notification title" className="bg-[#0F172A] border-[#334155]" />
          </div>

          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Notification message..." className="bg-[#0F172A] border-[#334155]" rows={4} />
          </div>

          <Button onClick={handleSend} disabled={sending} className="gap-2 bg-primary hover:bg-primary/90">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Send Notification
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
