import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, TrendingUp, Award, Mic2 } from "lucide-react";
import { toast } from "sonner";

interface Profile {
  name: string;
  speaking_level: string;
  confidence_score: number;
  total_speeches: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    // Check if user has completed assessment
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (profileData) {
      setProfile(profileData);
      
      // If user hasn't done assessment yet (no speaking level set beyond default)
      if (profileData.total_speeches === 0) {
        navigate("/assessment");
      }
    }
    
    setLoading(false);
  };

  const prompts = useMemo(() => [
    "Describe a moment that changed your perspective on life",
    "Explain why communication matters in today's world",
    "Share a story about overcoming fear or doubt",
    "Teach us something you're passionate about",
    "Discuss a book, movie, or idea that inspired you"
  ], []);

  // Use a stable daily prompt (changes daily but stays same throughout the day)
  const dailyPrompt = useMemo(() => {
    const dailyPromptIndex = new Date().getDate() % prompts.length;
    return prompts[dailyPromptIndex];
  }, [prompts]);

  if (loading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center glow-primary animate-pulse">
            <Mic2 className="w-8 h-8 text-white" />
          </div>
          <p className="text-lg text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-20">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Welcome Section */}
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              Welcome back, {profile?.name?.split(' ')[0] || 'Speaker'}! 👋
            </h1>
            <p className="text-xl text-muted-foreground">
              Ready to improve your speaking skills today?
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="shadow-card bg-card/80 backdrop-blur border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Speaking Level</CardTitle>
                <Award className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">
                  {profile?.speaking_level || 'Beginner'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Keep practicing to level up!
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card bg-card/80 backdrop-blur border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Confidence Score</CardTitle>
                <TrendingUp className="h-4 w-4 text-secondary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {profile?.confidence_score || 0}/100
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Based on recent speeches
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card bg-card/80 backdrop-blur border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Speeches</CardTitle>
                <Mic2 className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {profile?.total_speeches || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Speeches uploaded
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Daily Prompt */}
          <Card className="shadow-card bg-gradient-to-br from-primary/10 to-secondary/10 backdrop-blur border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl">Today's Practice Prompt</CardTitle>
              <CardDescription className="text-base">
                Challenge yourself with this speaking topic
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xl font-medium italic">"{dailyPrompt}"</p>
              <Button 
                className="bg-primary hover:bg-primary/90 glow-primary"
                onClick={() => navigate(`/practice?prompt=${encodeURIComponent(dailyPrompt)}`)}
              >
                <Upload className="mr-2 h-4 w-4" />
                Start Recording
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-card bg-card/80 backdrop-blur border-border/50 hover-scale transition-smooth cursor-pointer"
                  onClick={() => navigate(`/practice?prompt=${encodeURIComponent(dailyPrompt)}`)}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-primary" />
                  Upload New Speech
                </CardTitle>
                <CardDescription>
                  Record and upload a new speech to get AI feedback
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-card bg-card/80 backdrop-blur border-border/50 hover-scale transition-smooth cursor-pointer"
                  onClick={() => navigate("/progress")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-secondary" />
                  View Progress
                </CardTitle>
                <CardDescription>
                  Track your improvement and see detailed analytics
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
