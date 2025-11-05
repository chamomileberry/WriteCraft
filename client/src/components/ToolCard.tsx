import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, LucideIcon } from "lucide-react";

interface ToolCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  category: string;
  features: string[];
  onUse?: () => void;
  isPopular?: boolean;
}

export default function ToolCard({
  title,
  description,
  icon: Icon,
  category,
  features,
  onUse,
  isPopular = false,
}: ToolCardProps) {
  const handleUse = () => {
    console.log(`Using ${title}`);
    onUse?.();
  };

  return (
    <Card className="group hover-elevate transition-all duration-200 relative">
      {isPopular && (
        <Badge className="absolute -top-2 -right-2 bg-chart-3 text-background">
          Popular
        </Badge>
      )}

      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-primary/10 rounded-lg p-2">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                {title}
              </CardTitle>
              <Badge variant="secondary" className="text-xs mt-1">
                {category}
              </Badge>
            </div>
          </div>
        </div>
        <CardDescription className="mt-2">{description}</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2 text-muted-foreground">
              Features:
            </h4>
            <ul className="space-y-1">
              {features.map((feature, index) => (
                <li
                  key={index}
                  className="text-sm text-foreground flex items-center"
                >
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <Button
            onClick={handleUse}
            className="w-full group/btn"
            data-testid={`button-use-${title.toLowerCase().replace(/\s+/g, "-")}`}
          >
            Use {title}
            <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
