export const TitleBar = (props: {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}) => (
  <div className="mb-8 flex items-start justify-between gap-4">
    <div className="space-y-1">
      <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
        {props.title}
      </h1>

      {props.description && (
        <p className="text-sm text-muted-foreground lg:text-base">
          {props.description}
        </p>
      )}
    </div>

    {props.action && <div className="shrink-0">{props.action}</div>}
  </div>
);
