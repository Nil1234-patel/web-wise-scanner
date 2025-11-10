import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ScanResultProps {
  result: {
    safetyScore: number;
    status: "safe" | "warning" | "danger";
    findings: string[];
    recommendations: string[];
  };
}

const ScanResult = ({ result }: ScanResultProps) => {
  const getStatusIcon = () => {
    switch (result.status) {
      case "safe":
        return <CheckCircle2 className="w-6 h-6 text-success" />;
      case "warning":
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
      case "danger":
        return <XCircle className="w-6 h-6 text-destructive" />;
    }
  };

  const getStatusColor = () => {
    switch (result.status) {
      case "safe":
        return "text-success";
      case "warning":
        return "text-yellow-500";
      case "danger":
        return "text-destructive";
    }
  };

  const getProgressColor = () => {
    if (result.safetyScore >= 70) return "bg-success";
    if (result.safetyScore >= 40) return "bg-yellow-500";
    return "bg-destructive";
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="border-primary/20 bg-card/50">
        <CardHeader>
          <div className="flex items-center gap-4">
            {getStatusIcon()}
            <div className="flex-1">
              <CardTitle className="text-xl">Safety Score</CardTitle>
              <CardDescription>Overall security assessment</CardDescription>
            </div>
            <Badge
              variant="outline"
              className={`text-lg px-4 py-2 ${getStatusColor()}`}
            >
              {result.safetyScore}/100
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Progress value={result.safetyScore} className="h-3" />
            <div className={`w-full h-3 rounded-full overflow-hidden bg-secondary`}>
              <div
                className={`h-full ${getProgressColor()} transition-all duration-1000`}
                style={{ width: `${result.safetyScore}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {result.findings.length > 0 && (
        <Card className="border-primary/20 bg-card/50">
          <CardHeader>
            <CardTitle>Findings</CardTitle>
            <CardDescription>Issues detected during the scan</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.findings.map((finding, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 p-3 rounded-lg bg-secondary/50"
                >
                  <span className="text-muted-foreground">•</span>
                  <span className="text-sm">{finding}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {result.recommendations.length > 0 && (
        <Card className="border-primary/20 bg-card/50">
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
            <CardDescription>Steps to improve security</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.recommendations.map((recommendation, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10"
                >
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{recommendation}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ScanResult;
