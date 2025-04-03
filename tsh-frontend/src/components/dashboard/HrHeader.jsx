export function HrHeader({
    heading,
    subheading,
    children,
    className,
    ...props
  }) {
    return (
      <div className={`flex items-center justify-between ${className || ""}`} {...props}>
        <div className="grid gap-1">
          <h1 className="text-3xl font-bold md:text-4xl">{heading}</h1>
          {subheading && (
            <p className="text-lg text-muted-foreground">{subheading}</p>
          )}
        </div>
        {children}
      </div>
    );
  }