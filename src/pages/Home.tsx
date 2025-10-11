import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Upload, MessageSquare, TrendingUp, Sparkles, Target, Heart } from "lucide-react";
import heroImage from "@/assets/hero-speaking.jpg";

export default function Home() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Upload,
      title: "Record",
      description: "Upload your speech recording easily"
    },
    {
      icon: MessageSquare,
      title: "Analyze",
      description: "AI analyzes your tone, pace, and clarity"
    },
    {
      icon: TrendingUp,
      title: "Improve",
      description: "Get personalized feedback and tips"
    }
  ];

  const benefits = [
    {
      icon: Sparkles,
      title: "Confidence",
      description: "Build unshakeable confidence in your speaking abilities"
    },
    {
      icon: Target,
      title: "Communication",
      description: "Master clear and impactful communication"
    },
    {
      icon: Heart,
      title: "Empowerment",
      description: "Find your authentic voice and speak your truth"
    }
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-50" />
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(8px)'
          }}
        />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              Find your voice.
              <br />
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Speak your truth.
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              SpeakUp helps you build confidence, clarity, and charisma through AI-powered feedback.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 glow-primary transition-smooth"
                onClick={() => navigate("/auth")}
              >
                Get Started Free
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-6 border-primary/50 hover:border-primary transition-smooth"
                onClick={() => navigate("/auth")}
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-b from-transparent to-background" />
      </section>

      {/* How It Works */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground">Three simple steps to speaking success</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="shadow-card hover-scale transition-smooth bg-card/50 backdrop-blur border-border/50"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="pt-8 text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center glow-primary">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why SpeakUp */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Why SpeakUp?</h2>
            <p className="text-xl text-muted-foreground">Transform the way you communicate</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {benefits.map((benefit, index) => (
              <Card 
                key={index} 
                className="shadow-card hover-scale transition-smooth bg-card/50 backdrop-blur border-border/50"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="pt-8 space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent to-secondary/50 flex items-center justify-center">
                    <benefit.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold">
              Ready to transform your speaking?
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of confident speakers who've found their voice with SpeakUp
            </p>
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 glow-primary transition-smooth"
              onClick={() => navigate("/auth")}
            >
              Start Your Journey
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border/50">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 SpeakUp. Built to empower your voice.</p>
        </div>
      </footer>
    </div>
  );
}
