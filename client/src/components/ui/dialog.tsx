// PHASE_3_2_MODAL_DRAWER_HARDENED
/* PHASE_3_1_OVERLAY_HARDENED */
"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

import Button from "@/components/ui/button";
import { XIcon } from "lucide-react";

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root {...props} />;
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger {...props} />;
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal {...props} />;
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close {...props} />;
}

function DialogOverlay({
  className = "",
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      className={`
        enterprise-modal-guard fixed inset-0 z-50 max-h-[calc(100dvh-1rem)] overflow-y-auto
        bg-black/50
        ${className}
      `}
      {...props}
    />
  );
}

function DialogContent({
  className = "",
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean;
}) {
  return (
    <DialogPortal>
      <DialogOverlay />

      <DialogPrimitive.Content
        className={`
          enterprise-modal-guard fixed
          left-1/2
          top-1/2
          z-50 max-h-[calc(100dvh-1rem)] overflow-y-auto
          w-full
          max-w-lg enterprise-modal-safe
          -translate-x-1/2
          -translate-y-1/2
          rounded-xl
          bg-white
          p-6
          shadow-xl
          ${className}
        `}
        {...props}
      >
        {children}

        {showCloseButton && (
          <DialogPrimitive.Close asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="absolute right-3 top-3"
            >
              <XIcon size={16} />
            </Button>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader({
  className = "",
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={`flex flex-col gap-2 ${className}`}
      {...props}
    />
  );
}

function DialogFooter({
  className = "",
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean;
}) {
  return (
    <div
      className={`
        flex
        justify-end
        gap-2
        pt-4
        ${className}
      `}
      {...props}
    >
      {children}

      {showCloseButton && (
        <DialogPrimitive.Close asChild>
          <Button variant="outline">
            Close
          </Button>
        </DialogPrimitive.Close>
      )}
    </div>
  );
}

function DialogTitle({
  className = "",
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={`text-lg font-semibold ${className}`}
      {...props}
    />
  );
}

function DialogDescription({
  className = "",
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={`text-sm text-zinc-500 ${className}`}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogClose,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};

