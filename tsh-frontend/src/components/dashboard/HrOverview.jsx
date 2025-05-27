import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export function HrOverview({
  title,
  value,
  description,
  icon: Icon,
  className,
  onClick,
}) {
  return (
    <Card className={className} onClick={onClick}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}