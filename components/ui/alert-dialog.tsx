"use client"

import * as React from "react"
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

function AlertDialog({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />
}

function AlertDialogTrigger({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
  return (
    <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
  )
}

function AlertDialogPortal({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
  return (
    <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
  )
}

function AlertDialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogContent({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Content>) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
          className
        )}
        role="dialog"
        aria-modal="true"
        {...props}
      />
    </AlertDialogPortal>
  )
}

function AlertDialogHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  )
}

function AlertDialogFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn("text-lg font-semibold", className)}
      {...props}
    />
  )
}

function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function AlertDialogAction({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Action>) {
  return (
    <AlertDialogPrimitive.Action
      className={cn(buttonVariants(), className)}
      {...props}
    />
  )
}

function AlertDialogCancel({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Cancel>) {
  return (
    <AlertDialogPrimitive.Cancel
      className={cn(buttonVariants({ variant: "outline" }), className)}
      {...props}
    />
  )
}

interface CustomAlertAction {
  label: string;
  onClick: () => void | Promise<void>;
  color: 'primary' | 'secondary' | 'danger' | 'cancel';
  disabled?: boolean;
}

interface CustomAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  actions: CustomAlertAction[]; // Máximo 3
  content?: React.ReactNode;
}

export function CustomAlertDialog({ open, onOpenChange, title, description, actions, content }: CustomAlertDialogProps) {
  // Orden: principal (azul), secundaria (violeta), cancelar (gris)
  // Cancelar siempre el último
  const getButtonStyle = (color: string, isLast: boolean) => {
    switch (color) {
      case 'primary':
        return { background: '#2563eb', color: '#fff', border: 'none', fontWeight: 600, fontSize: '1.1rem', padding: '1rem 0', width: '100%', borderRadius: '0.75rem', marginBottom: isLast ? 0 : 16 };
      case 'secondary':
        return { background: '#7c3aed', color: '#fff', border: 'none', fontWeight: 600, fontSize: '1.1rem', padding: '1rem 0', width: '100%', borderRadius: '0.75rem', marginBottom: isLast ? 0 : 16 };
      case 'danger':
        return { background: '#e11d48', color: '#fff', border: 'none', fontWeight: 600, fontSize: '1.1rem', padding: '1rem 0', width: '100%', borderRadius: '0.75rem', marginBottom: isLast ? 0 : 16 };
      case 'cancel':
      default:
        return { background: '#353744', color: '#fff', border: 'none', fontWeight: 600, fontSize: '1.1rem', padding: '1rem 0', width: '100%', borderRadius: '0.75rem', marginBottom: isLast ? 0 : 16 };
    }
  };
  // Cancel siempre el último
  const ordered = [
    ...actions.filter(a => a.color !== 'cancel'),
    ...actions.filter(a => a.color === 'cancel'),
  ];
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent style={{ background: '#18122b', borderRadius: '1rem', border: '1px solid #7c3aed', color: '#fff', maxWidth: 400, margin: '0 auto' }}>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {content}
        <AlertDialogFooter style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {ordered.map((action, idx) => {
            const isLast = idx === ordered.length - 1;
            if (action.color === 'cancel') {
              return (
                <AlertDialogCancel asChild key={action.label}>
                  <button
                    style={getButtonStyle('cancel', isLast)}
                    onClick={action.onClick}
                    disabled={action.disabled}
                  >
                    {action.label}
                  </button>
                </AlertDialogCancel>
              );
            }
            return (
              <AlertDialogAction asChild key={action.label}>
                <button
                  style={getButtonStyle(action.color, isLast)}
                  onClick={action.onClick}
                  disabled={action.disabled}
                >
                  {action.label}
                </button>
              </AlertDialogAction>
            );
          })}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
