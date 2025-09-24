'use client';

import React from 'react';
import * as React from 'react';

import { cn } from '@/lib/utils';

// This is a fallback tooltip component for use when @radix-ui/react-tooltip is not available
// It provides basic tooltip functionality but without animations and advanced positioning

const TooltipProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

interface TooltipProps {
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}
const Tooltip = ({
  children,
  open,
  defaultOpen,
  onOpenChange,
}: TooltipProps) => {
  return <>{children}</>;
};

interface TooltipTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}
const TooltipTrigger = React.forwardRef<HTMLButtonElement, TooltipTriggerProps>(
  ({ className, asChild = false, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn('inline-flex items-center justify-center', className)}
        {...props}
      />
    );
  }
);
TooltipTrigger.displayName = 'TooltipTrigger';

interface TooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  sideOffset?: number;
}
const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ className, sideOffset = 4, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md',
          className
        )}
        {...props}
      />
    );
  }
);
TooltipContent.displayName = 'TooltipContent';

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
