import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function ServerError() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="max-w-md text-center">
        <h1 className="text-9xl font-bold text-primary mb-4">500</h1>
        <h2 className="text-2xl font-semibold mb-2">Server Error</h2>
        <p className="text-muted-foreground mb-6">
          Something went wrong on our end. Please try again later.
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => navigate(-1)} variant="outline">
            Go Back
          </Button>
          <Button onClick={() => navigate("/")}>Go Home</Button>
          <Button onClick={() => window.location.reload()} variant="ghost">
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
}