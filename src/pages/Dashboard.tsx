import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Shield, Bug, FileWarning, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ScanTile from "@/components/ScanTile";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      // Get user profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", session.user.id)
        .single();

      if (profile?.full_name) {
        setUserName(profile.full_name);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="gradient-cyber bg-clip-text text-transparent">
                WebSec Analyzer
              </span>
            </h1>
            {userName && (
              <p className="text-muted-foreground">Welcome back, {userName}!</p>
            )}
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="border-primary/20 hover:bg-primary/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ScanTile
            icon={Bug}
            title="Malware Scanning"
            description="Detect malicious software and harmful code in websites"
            scanType="malware"
            gradient="from-red-500/20 to-orange-500/20"
          />
          <ScanTile
            icon={Shield}
            title="Vulnerability Scanning"
            description="Identify security weaknesses and potential threats"
            scanType="vulnerability"
            gradient="from-yellow-500/20 to-amber-500/20"
          />
          <ScanTile
            icon={FileWarning}
            title="Legal Security"
            description="Check compliance with security standards and regulations"
            scanType="legal"
            gradient="from-blue-500/20 to-cyan-500/20"
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
