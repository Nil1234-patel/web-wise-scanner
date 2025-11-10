import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ScanTileProps {
  icon: LucideIcon;
  title: string;
  description: string;
  scanType: "malware" | "vulnerability" | "legal";
  gradient: string;
}

const ScanTile = ({ icon: Icon, title, description, scanType, gradient }: ScanTileProps) => {
  const navigate = useNavigate();

  return (
    <Card
      className={`group cursor-pointer transition-all duration-300 hover:scale-105 border-primary/20 backdrop-blur-sm bg-gradient-to-br ${gradient} hover:glow-cyan`}
      onClick={() => navigate(`/scan/${scanType}`)}
    >
      <CardHeader>
        <div className="mb-4 p-3 bg-card/50 rounded-lg w-fit">
          <Icon className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="text-muted-foreground">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant="ghost"
          className="w-full justify-between group-hover:text-primary transition-colors"
        >
          Start Scan
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default ScanTile;
