import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Mic2, Upload } from "lucide-react";
import { toast } from "sonner";

export default function Assessment() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['audio/mp3', 'audio/wav', 'audio/mpeg', 'audio/webm'];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload an audio file (MP3 or WAV)");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setUploading(true);
    setStep(2);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      // Upload to storage
      const fileName = `${session.user.id}/${Date.now()}-assessment.${file.name.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage
        .from('speeches')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('speeches')
        .getPublicUrl(fileName);

      setStep(3);
      setAnalyzing(true);

      // Simulate AI analysis (in production, this would call an edge function)
      setTimeout(async () => {
        // Update user profile with assessment results
        const level = file.size > 5000000 ? 'confident' : file.size > 2000000 ? 'intermediate' : 'beginner';
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            speaking_level: level,
            confidence_score: Math.floor(Math.random() * 30) + 50,
            total_speeches: 1
          })
          .eq('id', session.user.id);

        if (updateError) throw updateError;

        // Create speech record
        const { error: speechError } = await supabase
          .from('speeches')
          .insert({
            user_id: session.user.id,
            title: 'Initial Assessment',
            audio_url: publicUrl,
            is_assessment: true,
            prompt_used: 'Introduce yourself and share your speaking goals'
          });

        if (speechError) throw speechError;

        setAnalyzing(false);
        toast.success("Assessment complete! 🎉");
        
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      }, 3000);

    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || "Failed to upload audio");
      setUploading(false);
      setStep(1);
    }
  };

  return (
    <div className="min-h-screen gradient-hero">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-20">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-card bg-card/80 backdrop-blur-lg border-border/50">
            <CardHeader className="space-y-4 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center glow-primary">
                <Mic2 className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold">
                Let's Assess Your Speaking Style
              </CardTitle>
              <CardDescription className="text-lg">
                Upload a 30-60 second clip introducing yourself so we can personalize your experience
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Progress Steps */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm mb-2">
                  <span className={step >= 1 ? "text-primary font-medium" : "text-muted-foreground"}>
                    Record
                  </span>
                  <span className={step >= 2 ? "text-primary font-medium" : "text-muted-foreground"}>
                    Upload
                  </span>
                  <span className={step >= 3 ? "text-primary font-medium" : "text-muted-foreground"}>
                    Analyze
                  </span>
                </div>
                <Progress value={step * 33.33} className="h-2" />
              </div>

              {step === 1 && (
                <div className="space-y-6">
                  <div className="bg-muted/50 p-6 rounded-lg space-y-4">
                    <h3 className="font-semibold text-lg">Speaking Prompt:</h3>
                    <p className="text-muted-foreground italic">
                      "Introduce yourself and share what you hope to achieve with SpeakUp. 
                      What are your speaking goals?"
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Tips for your recording:</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Speak naturally and authentically</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Keep it between 30-60 seconds</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Record in a quiet environment</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>Don't worry about being perfect!</span>
                      </li>
                    </ul>
                  </div>

                  <label htmlFor="audio-upload">
                    <Button 
                      className="w-full bg-primary hover:bg-primary/90 glow-primary"
                      asChild
                    >
                      <span>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Your Recording
                      </span>
                    </Button>
                  </label>
                  <input
                    id="audio-upload"
                    type="file"
                    accept="audio/mp3,audio/wav,audio/mpeg,audio/webm"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              )}

              {step === 2 && !analyzing && (
                <div className="text-center space-y-4 py-8">
                  <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                    <Upload className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-lg">Uploading your audio...</p>
                </div>
              )}

              {analyzing && (
                <div className="text-center space-y-4 py-8">
                  <div className="w-16 h-16 mx-auto rounded-full bg-secondary/20 flex items-center justify-center animate-pulse">
                    <Mic2 className="w-8 h-8 text-secondary" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-medium">Analyzing your speech...</p>
                    <p className="text-sm text-muted-foreground">
                      We're analyzing your tone, pace, and clarity
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
