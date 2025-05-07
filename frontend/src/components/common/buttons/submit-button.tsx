import * as React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

/**
 * Supported variants. Add more if your design calls for it,
 * e.g., "secondary", "ghost", etc.
 */
type ButtonVariant = 'default' | 'destructive' | 'outline'

/**
 * Button props extending the native HTML button plus our extra options.
 */
interface MyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Use one of the recognized variants for styling. */
  variant?: ButtonVariant
  /** True if the button is in a loading (spinner) state. */
  isLoading?: boolean
  /** Additional classes for styling. */
  className?: string
}

/**
 * We use `React.forwardRef` so we can forward the `ref` to the underlying
 * <button> element. This allows users to do `<MyButton ref={someRef} ... />`
 * just like a normal HTML button.
 */
export const MyButton = React.forwardRef<HTMLButtonElement, MyButtonProps>(
  (
    {
      variant = 'default',
      isLoading = false,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    // Base classes for all buttons (copied from a typical ShadCN button config).
    const baseClasses = cn(
      'relative inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium ' +
        'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ' +
        'disabled:cursor-not-allowed disabled:opacity-50',
      {
        // Variants
        'bg-primary text-white hover:bg-primary/90': variant === 'default',
        'bg-destructive text-white hover:bg-destructive/90':
          variant === 'destructive',
        'border border-input hover:bg-accent hover:text-accent-foreground':
          variant === 'outline',
      },
      className
    )

    return (
      <Button
        ref={ref}
        className={baseClasses}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className='h-4 w-4 animate-spin' />
            <span>Please wait...</span>
          </>
        ) : (
          children
        )}
      </Button>
    )
  }
)

/**
 * A displayName helps with debugging in React DevTools.
 * It's especially recommended for forwardRef components.
 */
MyButton.displayName = 'MyButton'
