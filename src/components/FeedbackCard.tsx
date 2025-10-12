import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle } from "lucide-react";

interface FeedbackCardProps {
  feedback: {
    confidence_score: number;
    pace_rating: string;
    clarity_rating: string;
    filler_words_count: number;
    strengths: string[];
    improvements: string[];
    ai_summary: string;
    created_at?: string;
  };
}

export function FeedbackCard({ feedback }: FeedbackCardProps) {
  const getRatingColor = (rating: string) => {
    const colors: Record<string, string> = {
      excellent: 'bg-accent text-accent-foreground',
      good: 'bg-primary/20 text-primary',
      fair: 'bg-amber-500/20 text-amber-500',
      poor: 'bg-destructive/20 text-destructive',
      too_fast: 'bg-amber-500/20 text-amber-500',
      too_slow: 'bg-amber-500/20 text-amber-500',
    };
    return colors[rating] || 'bg-muted text-muted-foreground';
  };

  return (
    <Card className="shadow-card bg-card/80 backdrop-blur border-border/50">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl">AI Feedback</CardTitle>
          <div className="flex flex-col items-end gap-2">
            <div className="text-3xl font-bold text-primary">
              {feedback.confidence_score}
              <span className="text-sm text-muted-foreground">/100</span>
            </div>
            <p className="text-xs text-muted-foreground">Confidence Score</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <p className="text-sm leading-relaxed">{feedback.ai_summary}</p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <Badge className={getRatingColor(feedback.pace_rating)}>
              {feedback.pace_rating.replace('_', ' ')}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">Pace</p>
          </div>
          <div className="text-center">
            <Badge className={getRatingColor(feedback.clarity_rating)}>
              {feedback.clarity_rating}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">Clarity</p>
          </div>
          <div className="text-center">
            <Badge variant="outline">
              {feedback.filler_words_count} words
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">Filler Words</p>
          </div>
        </div>

        {/* Strengths */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-accent" />
            Strengths
          </h4>
          <ul className="space-y-2">
            {feedback.strengths?.map((strength, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="text-accent mt-0.5">✓</span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Improvements */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            Areas for Improvement
          </h4>
          <ul className="space-y-2">
            {feedback.improvements?.map((improvement, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="text-amber-500 mt-0.5">•</span>
                <span>{improvement}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
