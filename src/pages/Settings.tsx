import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { User, LogOut, RefreshCw } from "lucide-react";

interface Profile {
  name: string;
  speaking_level: string;
}

export default function Settings() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (data) {
      setProfile(data);
      setName(data.name);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update({ name })
        .eq("id", session.user.id);

      if (error) throw error;

      toast.success("Profile updated successfully!");
      setProfile({ ...profile!, name });
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleRetakeAssessment = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update({ 
          speaking_level: 'beginner',
          confidence_score: 0 
        })
        .eq("id", session.user.id);

      if (error) throw error;

      toast.success("Assessment reset! Redirecting...");
      setTimeout(() => navigate("/assessment"), 1500);
    } catch (error: any) {
      toast.error(error.message || "Failed to reset assessment");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen gradient-hero">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-20">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-2">Settings</h1>
            <p className="text-xl text-muted-foreground">
              Manage your profile and preferences
            </p>
          </div>

          {/* Profile Settings */}
          <Card className="shadow-card bg-card/80 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <User className="h-6 w-6" />
                Profile Information
              </CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-background/50"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Speaking Level</Label>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="capitalize font-medium">{profile?.speaking_level || 'Beginner'}</p>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update Profile"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Assessment Reset */}
          <Card className="shadow-card bg-card/80 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <RefreshCw className="h-6 w-6" />
                Retake Assessment
              </CardTitle>
              <CardDescription>
                Reset your speaking level and retake the initial assessment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline"
                className="w-full"
                onClick={handleRetakeAssessment}
              >
                Retake Assessment
              </Button>
            </CardContent>
          </Card>

          {/* Logout */}
          <Card className="shadow-card bg-card/80 backdrop-blur border-destructive/50">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <LogOut className="h-6 w-6" />
                Sign Out
              </CardTitle>
              <CardDescription>Sign out of your account</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="destructive"
                className="w-full"
                onClick={handleLogout}
              >
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
