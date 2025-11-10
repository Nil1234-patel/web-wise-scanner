import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Shield, Bug, FileWarning, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ScanResult from "@/components/ScanResult";
import { z } from "zod";

const urlSchema = z.object({
  url: z.string().trim().url({ message: "Please enter a valid URL" }),
});

const scanTypeInfo = {
  malware: {
    icon: Bug,
    title: "Malware Scanning",
    description: "Detecting malicious software and harmful code",
  },
  vulnerability: {
    icon: Shield,
    title: "Vulnerability Scanning",
    description: "Identifying security weaknesses and threats",
  },
  legal: {
    icon: FileWarning,
    title: "Legal Security Check",
    description: "Checking compliance and security standards",
  },
};

const Scan = () => {
  const { scanType } = useParams<{ scanType: "malware" | "vulnerability" | "legal" }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
      }
    };
    checkAuth();
  }, [navigate]);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate URL
      urlSchema.parse({ url });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Invalid URL",
          description: error.errors[0].message,
          variant: "destructive",
        });
        return;
      }
    }

    setScanning(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-url", {
        body: { url, scanType },
      });

      if (error) throw error;

      setResult(data);
      
      // Save to history
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.from("scan_history").insert({
          user_id: session.user.id,
          url,
          scan_type: scanType,
          safety_score: data.safetyScore,
          analysis_result: data,
        });
      }

      toast({
        title: "Scan Complete",
        description: "URL analysis finished successfully",
      });
    } catch (error: any) {
      toast({
        title: "Scan Failed",
        description: error.message || "Failed to analyze URL",
        variant: "destructive",
      });
    } finally {
      setScanning(false);
    }
  };

  if (!scanType || !scanTypeInfo[scanType]) {
    return null;
  }

  const { icon: Icon, title, description } = scanTypeInfo[scanType];

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-8 hover:bg-primary/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card className="border-primary/20 backdrop-blur-sm bg-card/50">
          <CardHeader>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-primary/10 rounded-full glow-cyan">
                <Icon className="w-8 h-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleScan} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="url" className="text-sm font-medium">
                  Enter Website URL
                </label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  className="bg-secondary border-border"
                  disabled={scanning}
                />
              </div>
              <Button
                type="submit"
                className="w-full gradient-cyber hover:opacity-90 transition-opacity"
                disabled={scanning}
              >
                {scanning ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Start Analysis"
                )}
              </Button>
            </form>

            {result && <ScanResult result={result} />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Scan;
