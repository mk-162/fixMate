import { Wrench } from 'lucide-react';

export const Logo = (props: {
  isTextHidden?: boolean;
}) => (
  <div className="flex items-center gap-2.5">
    <div className="flex size-9 items-center justify-center rounded-xl bg-primary">
      <Wrench className="size-5 text-white" />
    </div>
    {!props.isTextHidden && (
      <span className="text-xl font-bold tracking-tight">FixMate</span>
    )}
  </div>
);
