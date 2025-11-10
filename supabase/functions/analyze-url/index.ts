import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, scanType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Analyzing URL: ${url} with scan type: ${scanType}`);

    // Create context-specific system prompt based on scan type
    const systemPrompts = {
      malware: `You are a cybersecurity expert specializing in malware detection. Analyze the provided URL and assess its safety based on common malware indicators such as:
- Known malicious domains
- Suspicious URL patterns (excessive subdomains, random strings, etc.)
- Potential phishing attempts
- Drive-by download risks
- Malvertising indicators

Provide a safety score (0-100) where 100 is completely safe. Return findings and recommendations.`,
      
      vulnerability: `You are a security analyst specializing in vulnerability assessment. Analyze the provided URL for potential security weaknesses such as:
- Outdated software signatures
- Known CVEs
- Weak encryption indicators
- Exposed sensitive endpoints
- Missing security headers
- SQL injection or XSS vulnerability patterns

Provide a safety score (0-100) where 100 is completely safe. Return findings and recommendations.`,
      
      legal: `You are a legal compliance and security standards expert. Analyze the provided URL for compliance with security regulations such as:
- GDPR compliance indicators
- Privacy policy presence
- SSL/TLS certificate validity
- Cookie consent mechanisms
- Terms of service
- Data protection measures

Provide a safety score (0-100) where 100 is fully compliant. Return findings and recommendations.`
    };

    const systemPrompt = systemPrompts[scanType as keyof typeof systemPrompts] || systemPrompts.vulnerability;

    // Call Lovable AI for analysis
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: `Analyze this URL for security: ${url}

Please respond in the following JSON format:
{
  "safetyScore": <number between 0-100>,
  "status": "<safe|warning|danger>",
  "findings": ["<finding1>", "<finding2>", ...],
  "recommendations": ["<recommendation1>", "<recommendation2>", ...]
}

Base your analysis on the URL structure, domain reputation, and known security patterns. Be thorough but realistic - this is an educational security analysis tool.` 
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits depleted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices[0].message.content;
    
    console.log('AI Response:', content);

    // Parse the JSON response from AI
    let analysis;
    try {
      // Extract JSON from the response (AI might wrap it in markdown code blocks)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback if JSON parsing fails
        analysis = {
          safetyScore: 50,
          status: "warning",
          findings: ["Unable to complete full analysis"],
          recommendations: ["Try scanning again or contact support"]
        };
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Create a fallback response
      analysis = {
        safetyScore: 50,
        status: "warning",
        findings: ["Analysis completed with limited results"],
        recommendations: ["Consider manual review of this URL"]
      };
    }

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-url function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
