import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Shield, Bug, FileWarning, ArrowRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };
    checkUser();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center space-y-12">
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="p-4 bg-primary/10 rounded-full glow-cyan">
              <Shield className="w-16 h-16 text-primary" />
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold">
            <span className="gradient-cyber bg-clip-text text-transparent">
              WebSec Analyzer
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Advanced security analysis tool for detecting malware, vulnerabilities, and ensuring
            legal compliance. Powered by AI for accurate threat detection.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            onClick={() => navigate("/auth")}
            className="gradient-cyber hover:opacity-90 transition-opacity text-lg px-8"
          >
            Get Started
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
          <div className="p-6 rounded-lg border border-primary/20 bg-card/50 backdrop-blur-sm space-y-3">
            <div className="p-2 bg-red-500/10 rounded-lg w-fit">
              <Bug className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold">Malware Detection</h3>
            <p className="text-muted-foreground">
              Scan websites for malicious code and harmful software
            </p>
          </div>
          <div className="p-6 rounded-lg border border-primary/20 bg-card/50 backdrop-blur-sm space-y-3">
            <div className="p-2 bg-primary/10 rounded-lg w-fit glow-cyan">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Vulnerability Check</h3>
            <p className="text-muted-foreground">
              Identify security weaknesses and potential threats
            </p>
          </div>
          <div className="p-6 rounded-lg border border-primary/20 bg-card/50 backdrop-blur-sm space-y-3">
            <div className="p-2 bg-blue-500/10 rounded-lg w-fit">
              <FileWarning className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold">Legal Compliance</h3>
            <p className="text-muted-foreground">
              Verify security standards and regulatory compliance
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
