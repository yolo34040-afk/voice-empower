import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function Practice() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const prompts = [
    "Describe a moment that changed your perspective on life",
    "Explain why communication matters in today's world",
    "Share a story about overcoming fear or doubt",
    "Teach us something you're passionate about",
    "Discuss a book, movie, or idea that inspired you"
  ];

  const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!title.trim()) {
      toast.error("Please enter a title for your speech");
      return;
    }

    const validTypes = ['audio/mp3', 'audio/wav', 'audio/mpeg', 'audio/webm'];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload an audio file (MP3 or WAV)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setUploading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const fileName = `${session.user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('speeches')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('speeches')
        .getPublicUrl(fileName);

      const { error: speechError } = await supabase
        .from('speeches')
        .insert({
          user_id: session.user.id,
          title: title,
          audio_url: publicUrl,
          prompt_used: randomPrompt
        });

      if (speechError) throw speechError;

      // Update total speeches count
      const { data: profile } = await supabase
        .from('profiles')
        .select('total_speeches')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        await supabase
          .from('profiles')
          .update({ total_speeches: (profile.total_speeches || 0) + 1 })
          .eq('id', session.user.id);
      }

      toast.success("Speech uploaded! Generating feedback...");
      navigate("/dashboard");

    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || "Failed to upload");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-20">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-2">Practice Session</h1>
            <p className="text-xl text-muted-foreground">
              Record your speech and get AI-powered feedback
            </p>
          </div>

          <Card className="shadow-card bg-gradient-to-br from-primary/10 to-secondary/10 backdrop-blur border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-accent" />
                Today's Prompt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-medium italic">"{randomPrompt}"</p>
            </CardContent>
          </Card>

          <Card className="shadow-card bg-card/80 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle className="text-2xl">Upload Your Speech</CardTitle>
              <CardDescription>
                Give your speech a title and upload your audio recording
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Speech Title</Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="e.g., My Journey to Confidence"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-4">
                <Label>Audio File</Label>
                <label htmlFor="audio-upload" className="block">
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 glow-primary"
                    disabled={uploading}
                    asChild
                  >
                    <span>
                      <Upload className="mr-2 h-4 w-4" />
                      {uploading ? "Uploading..." : "Choose Audio File"}
                    </span>
                  </Button>
                </label>
                <input
                  id="audio-upload"
                  type="file"
                  accept="audio/mp3,audio/wav,audio/mpeg,audio/webm"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />
                <p className="text-sm text-muted-foreground">
                  Supported formats: MP3, WAV (max 10MB)
                </p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <h3 className="font-semibold">What we'll analyze:</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    Confidence and tone
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    Speaking pace and clarity
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    Filler words and pauses
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    Overall structure and flow
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
