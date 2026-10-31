"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
import { cn } from "@/src/lib/utils";

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;

const SheetOverlay = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Overlay>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay ref={ref} className={cn("fixed inset-0 z-50 bg-slate-950/35 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out", className)} {...props} />
));
SheetOverlay.displayName = DialogPrimitive.Overlay.displayName;

const SheetContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { side?: "top" | "right" | "bottom" | "left" }>(({ side = "right", className, children, ...props }, ref) => (
  <DialogPrimitive.Portal><SheetOverlay /><DialogPrimitive.Content ref={ref} className={cn("fixed z-50 flex flex-col gap-4 overflow-y-auto border-slate-200 bg-white shadow-2xl outline-none", side === "right" && "inset-y-0 right-0 h-full w-[min(760px,94vw)] border-l", side === "left" && "inset-y-0 left-0 h-full w-[min(760px,94vw)] border-r", side === "top" && "inset-x-0 top-0 max-h-[85vh] border-b", side === "bottom" && "inset-x-0 bottom-0 max-h-[85vh] border-t", className)} {...props}>{children}<DialogPrimitive.Close className="absolute right-4 top-4 rounded-md p-2 text-slate-500 opacity-80 transition hover:bg-slate-100 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"><XIcon className="h-4 w-4" /><span className="sr-only">Close</span></DialogPrimitive.Close></DialogPrimitive.Content></DialogPrimitive.Portal>
));
SheetContent.displayName = DialogPrimitive.Content.displayName;

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("grid gap-1.5", className)} {...props} />;
const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("mt-auto flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />;
const SheetTitle = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Title>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>>(({ className, ...props }, ref) => <DialogPrimitive.Title ref={ref} className={cn("text-lg font-semibold text-slate-900", className)} {...props} />);
SheetTitle.displayName = DialogPrimitive.Title.displayName;
const SheetDescription = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Description>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>>(({ className, ...props }, ref) => <DialogPrimitive.Description ref={ref} className={cn("text-sm text-slate-500", className)} {...props} />);
SheetDescription.displayName = DialogPrimitive.Description.displayName;

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription };
