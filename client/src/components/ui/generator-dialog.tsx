import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

// Context to provide portal container for dropdowns inside generator dialogs
const GeneratorDialogContext = React.createContext<HTMLElement | null>(null)

export const useGeneratorDialogContext = () => {
  return React.useContext(GeneratorDialogContext)
}

// Use modal={false} to prevent scroll locking and allow dropdowns to work
const GeneratorDialog = ({ children, ...props }: DialogPrimitive.DialogProps) => (
  <DialogPrimitive.Root modal={false} {...props}>
    {children}
  </DialogPrimitive.Root>
)

const GeneratorDialogTrigger = DialogPrimitive.Trigger

const GeneratorDialogPortal = DialogPrimitive.Portal

const GeneratorDialogClose = DialogPrimitive.Close

const GeneratorDialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-[var(--z-modal)] bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
GeneratorDialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const GeneratorDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  const [container, setContainer] = React.useState<HTMLDivElement | null>(null)

  return (
    <GeneratorDialogPortal>
      <GeneratorDialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-[50%] top-[50%] z-[var(--z-modal)] grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg sm:max-w-lg sm:w-full sm:h-auto max-sm:w-[100vw] max-sm:h-[100vh] max-sm:max-w-none max-sm:rounded-none max-sm:border-none",
          className
        )}
        {...props}
      >
        <div ref={setContainer} className="contents">
          <GeneratorDialogContext.Provider value={container}>
            {children}
          </GeneratorDialogContext.Provider>
        </div>
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </GeneratorDialogPortal>
  )
})
GeneratorDialogContent.displayName = DialogPrimitive.Content.displayName

const GeneratorDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
GeneratorDialogHeader.displayName = "GeneratorDialogHeader"

const GeneratorDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
GeneratorDialogFooter.displayName = "GeneratorDialogFooter"

const GeneratorDialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
GeneratorDialogTitle.displayName = DialogPrimitive.Title.displayName

const GeneratorDialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
GeneratorDialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  GeneratorDialog,
  GeneratorDialogPortal,
  GeneratorDialogOverlay,
  GeneratorDialogClose,
  GeneratorDialogTrigger,
  GeneratorDialogContent,
  GeneratorDialogHeader,
  GeneratorDialogFooter,
  GeneratorDialogTitle,
  GeneratorDialogDescription,
}
