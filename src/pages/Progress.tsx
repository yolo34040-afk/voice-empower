import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Award, Mic2, Target, X } from "lucide-react";
import { FeedbackCard } from "@/components/FeedbackCard";

interface Profile {
  name: string;
  speaking_level: string;
  confidence_score: number;
  total_speeches: number;
}

interface Speech {
  id: string;
  title: string;
  created_at: string;
  is_assessment: boolean;
}

interface Feedback {
  id: string;
  confidence_score: number;
  pace_rating: string;
  clarity_rating: string;
  filler_words_count: number;
  strengths: string[];
  improvements: string[];
  ai_summary: string;
}

export default function Progress() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [speeches, setSpeeches] = useState<Speech[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpeechId, setSelectedSpeechId] = useState<string | null>(null);
  const [speechFeedback, setSpeechFeedback] = useState<Feedback | null>(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    const { data: speechesData } = await supabase
      .from("speeches")
      .select("id, title, created_at, is_assessment")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    setProfile(profileData);
    setSpeeches(speechesData || []);
    setLoading(false);
  };

  const loadSpeechFeedback = async (speechId: string) => {
    setLoadingFeedback(true);
    setSelectedSpeechId(speechId);

    const { data: feedbackData } = await supabase
      .from("feedback")
      .select("*")
      .eq("speech_id", speechId)
      .single();

    setSpeechFeedback(feedbackData);
    setLoadingFeedback(false);
  };

  const badges = [
    { name: "First Steps", description: "Completed assessment", earned: (profile?.total_speeches || 0) >= 1 },
    { name: "Practice Makes Perfect", description: "5 speeches uploaded", earned: (profile?.total_speeches || 0) >= 5 },
    { name: "Speaking Streak", description: "10 speeches uploaded", earned: (profile?.total_speeches || 0) >= 10 },
    { name: "Confident Speaker", description: "Confidence score above 70", earned: (profile?.confidence_score || 0) >= 70 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center glow-primary animate-pulse">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <p className="text-lg text-muted-foreground">Loading your progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-20">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-2">Your Progress</h1>
            <p className="text-xl text-muted-foreground">
              Track your speaking journey and celebrate your wins
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="shadow-card bg-card/80 backdrop-blur border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Speeches</CardTitle>
                <Mic2 className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{profile?.total_speeches || 0}</div>
              </CardContent>
            </Card>

            <Card className="shadow-card bg-card/80 backdrop-blur border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Confidence Score</CardTitle>
                <TrendingUp className="h-4 w-4 text-secondary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{profile?.confidence_score || 0}</div>
              </CardContent>
            </Card>

            <Card className="shadow-card bg-card/80 backdrop-blur border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Speaking Level</CardTitle>
                <Target className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">{profile?.speaking_level}</div>
              </CardContent>
            </Card>

            <Card className="shadow-card bg-card/80 backdrop-blur border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Badges Earned</CardTitle>
                <Award className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {badges.filter(b => b.earned).length}/{badges.length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Badges Section */}
          <Card className="shadow-card bg-card/80 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle className="text-2xl">Achievements</CardTitle>
              <CardDescription>Unlock badges as you improve your speaking skills</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {badges.map((badge, index) => (
                  <div 
                    key={index}
                    className={`p-4 rounded-lg border transition-smooth ${
                      badge.earned 
                        ? 'bg-gradient-to-br from-accent/20 to-primary/20 border-accent/50' 
                        : 'bg-muted/30 border-border/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        badge.earned 
                          ? 'bg-gradient-to-br from-accent to-primary glow-primary' 
                          : 'bg-muted'
                      }`}>
                        <Award className={`w-6 h-6 ${badge.earned ? 'text-white' : 'text-muted-foreground'}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{badge.name}</h3>
                        <p className="text-sm text-muted-foreground">{badge.description}</p>
                        {badge.earned && (
                          <Badge className="mt-2 bg-accent/20 text-accent border-accent/50">
                            Earned!
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Speeches */}
          <Card className="shadow-card bg-card/80 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle className="text-2xl">Recent Speeches</CardTitle>
              <CardDescription>Your practice history</CardDescription>
            </CardHeader>
            <CardContent>
              {speeches.length > 0 ? (
                <div className="space-y-4">
                  {speeches.map((speech) => (
                    <div 
                      key={speech.id}
                      className="p-4 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 transition-smooth cursor-pointer"
                      onClick={() => loadSpeechFeedback(speech.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <Mic2 className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{speech.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {new Date(speech.created_at).toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                        {speech.is_assessment && (
                          <Badge variant="outline">Assessment</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Mic2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No speeches yet. Start practicing to see your progress!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Feedback Modal */}
          {selectedSpeechId && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-background rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-background border-b border-border/50 p-4 flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Speech Analysis</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedSpeechId(null);
                      setSpeechFeedback(null);
                    }}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <div className="p-6">
                  {loadingFeedback ? (
                    <div className="text-center py-12">
                      <div className="animate-pulse">
                        <Mic2 className="h-16 w-16 mx-auto text-primary mb-4" />
                      </div>
                      <p className="text-muted-foreground">Loading analysis...</p>
                    </div>
                  ) : speechFeedback ? (
                    <FeedbackCard feedback={speechFeedback} />
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <p>No feedback available for this speech yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
