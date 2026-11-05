import { cn } from "~/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { LoaderIcon } from "lucide-react";
import type { ComponentProps } from "react";

export const buttonVariants = cva(
  "inline-flex w-fit shrink-0 items-center gap-2 whitespace-nowrap border border-neutral-300 dark:border-neutral-700 font-medium text-sm transition-all duration-150 focus:outline disabled:pointer-events-none disabled:opacity-50 md:focus:outline-offset-2",
  {
    variants: {
      loading: {
        false: null,
        true: "text-transparent relative",
      },
      size: {
        default: "h-8 px-3",
        icon: "size-8 justify-center",
        sm: "h-6 px-2",
        lg: "h-12 px-4 text-md",
      },
      variant: {
        default:
          "hover:bg-neutral-900 hover:text-neutral-100 dark:hover:bg-white dark:hover:text-neutral-800 focus:bg-white focus:text-neutral-800 focus:outline-neutral-800 dark:focus:outline-white",
        success:
          "border-emerald-200 hover:bg-emerald-300 hover:text-emerald-800 focus:bg-emerald-300 focus:text-emerald-800 focus:outline-emerald-300",
        warning:
          "border-yellow-200 hover:bg-yellow-300 hover:text-yellow-800 focus:bg-yellow-300 focus:text-yellow-800 focus:outline-yellow-300",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  },
);

export type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants>;

export default function Button({
  children,
  className,
  loading,
  size,
  variant,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={cn(buttonVariants({ loading, variant, size, className }), {
        "cursor-pointer": typeof buttonVariants !== "undefined",
      })}
      type={type}
      disabled={props.disabled || !!loading}
    >
      {children}
      {loading && (
        <LoaderIcon
          size={20}
          strokeWidth={1.5}
          className="animate-spin absolute inset-x-0 mx-auto text-black dark:text-white"
        />
      )}
    </button>
  );
}
