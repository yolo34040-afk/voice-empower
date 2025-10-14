import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audio_url, speech_id, prompt_used } = await req.json();
    
    console.log('Analyzing speech:', { speech_id, audio_url });

    if (!audio_url || !speech_id) {
      throw new Error('Missing required parameters');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    const lovableKey = Deno.env.get('LOVABLE_API_KEY');

    if (!openaiKey || !lovableKey) {
      throw new Error('API keys not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Step 1: Download audio from storage
    console.log('Downloading audio from storage...');
    
    // Extract the full storage object path from audio_url
    const objectPath = (() => {
      try {
        const u = new URL(audio_url);
        const idx = u.pathname.indexOf('/speeches/');
        if (idx !== -1) return decodeURIComponent(u.pathname.slice(idx + '/speeches/'.length));
      } catch {}
      const match = audio_url.match(/\/speeches\/(.+)$/);
      if (match) return decodeURIComponent(match[1]);
      throw new Error('Could not parse storage path from audio_url');
    })();
    
    console.log('Downloading from path:', objectPath);
    
    const { data: audioData, error: downloadError } = await supabase.storage
      .from('speeches')
      .download(objectPath);

    if (downloadError) {
      console.error('Download error:', downloadError);
      throw new Error(`Failed to download audio: ${downloadError.message}`);
    }

    // Step 2: Transcribe with OpenAI Whisper
    console.log('Transcribing audio with Whisper...');
    const formData = new FormData();
    formData.append('file', audioData, 'audio.webm');
    formData.append('model', 'whisper-1');
    formData.append('language', 'en');

    const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
      },
      body: formData,
    });

    if (!whisperResponse.ok) {
      const error = await whisperResponse.text();
      console.error('Whisper error:', whisperResponse.status, error);
      throw new Error(`Transcription failed: ${whisperResponse.status} - ${error}`);
    }

    const { text: transcript } = await whisperResponse.json();
    console.log('Transcript:', transcript.substring(0, 100) + '...');

    // Update speech with transcript
    await supabase
      .from('speeches')
      .update({ transcript })
      .eq('id', speech_id);

    // Step 3: Analyze with Lovable AI
    console.log('Analyzing transcript with AI...');
    const analysisPrompt = `You are an expert public speaking coach analyzing a speech transcript. The speaker was responding to this prompt: "${prompt_used || 'General speaking practice'}"

Transcript:
"${transcript}"

Analyze this speech and provide detailed feedback in the following JSON structure:
{
  "confidence_score": <number 0-100>,
  "pace_rating": "<too_fast|good|too_slow>",
  "clarity_rating": "<poor|fair|good|excellent>",
  "filler_words_count": <number>,
  "strengths": [<array of 2-4 specific strengths as strings>],
  "improvements": [<array of 2-4 actionable improvements as strings>],
  "ai_summary": "<2-3 sentence encouraging summary of overall performance>"
}

Focus on:
- Confidence and tone
- Speaking pace and rhythm
- Clarity of message
- Use of filler words ("um", "uh", "like", etc.)
- Structure and flow
- Engagement and delivery

Be specific, encouraging, and actionable in your feedback.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are an expert public speaking coach. Always respond with valid JSON only.' },
          { role: 'user', content: analysisPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const error = await aiResponse.text();
      console.error('AI analysis error:', aiResponse.status, error);
      if (aiResponse.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      if (aiResponse.status === 402) {
        throw new Error('Payment required. Please add credits to your workspace.');
      }
      throw new Error(`AI analysis failed: ${aiResponse.status} - ${error}`);
    }

    const aiResult = await aiResponse.json();
    const analysisText = aiResult.choices[0].message.content;
    
    // Parse JSON from response
    let analysis;
    try {
      // Extract JSON if wrapped in markdown code blocks
      const jsonMatch = analysisText.match(/```json\n?(.*?)\n?```/s) || analysisText.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : analysisText;
      analysis = JSON.parse(jsonStr);
    } catch (e) {
      console.error('Failed to parse AI response:', analysisText);
      throw new Error('Invalid AI response format');
    }

    console.log('Analysis complete:', analysis);

    // Step 4: Get user_id from speech record
    const { data: speech } = await supabase
      .from('speeches')
      .select('user_id')
      .eq('id', speech_id)
      .single();

    if (!speech) {
      throw new Error('Speech not found');
    }

    // Step 5: Save feedback to database
    const { data: feedback, error: feedbackError } = await supabase
      .from('feedback')
      .insert({
        speech_id,
        user_id: speech.user_id,
        confidence_score: analysis.confidence_score,
        pace_rating: analysis.pace_rating,
        clarity_rating: analysis.clarity_rating,
        filler_words_count: analysis.filler_words_count || 0,
        strengths: analysis.strengths,
        improvements: analysis.improvements,
        ai_summary: analysis.ai_summary,
      })
      .select()
      .single();

    if (feedbackError) {
      console.error('Feedback insert error:', feedbackError);
      throw feedbackError;
    }

    console.log('Feedback saved successfully');

    return new Response(
      JSON.stringify({
        success: true,
        transcript,
        feedback: {
          ...feedback,
          strengths: analysis.strengths,
          improvements: analysis.improvements,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in analyze-speech:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Analysis failed' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
