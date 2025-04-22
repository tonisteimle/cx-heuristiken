"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Füge eine Funktion für responsive Schriftgrößen hinzu
// Füge diese Funktion am Anfang der Datei hinzu, nach den Imports
function responsiveSize(base: string, md?: string, lg?: string): string {
  return cn(base, md && `md:${md}`, lg && `lg:${lg}`)
}

// Heading Components
export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  responsive?: boolean
}

export const Title = React.forwardRef<HTMLHeadingElement, TypographyProps>(
  ({ className, children, responsive = true, ...props }, ref) => (
    <h1
      ref={ref}
      className={cn(
        responsive ? responsiveSize("text-2xl", "text-3xl", "text-4xl") : "text-3xl",
        "font-bold tracking-tight text-gray-900",
        className,
      )}
      {...props}
    >
      {children}
    </h1>
  ),
)
Title.displayName = "Title"

export const Subtitle = React.forwardRef<HTMLHeadingElement, TypographyProps>(
  ({ className, children, responsive = true, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn(
        responsive ? responsiveSize("text-xl", "text-2xl", "text-3xl") : "text-2xl",
        "font-semibold tracking-tight text-gray-900",
        className,
      )}
      {...props}
    >
      {children}
    </h2>
  ),
)
Subtitle.displayName = "Subtitle"

export const SectionTitle = React.forwardRef<HTMLHeadingElement, TypographyProps>(
  ({ className, children, responsive = true, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        responsive ? responsiveSize("text-lg", "text-xl", "text-2xl") : "text-xl",
        "font-semibold tracking-tight text-gray-900",
        className,
      )}
      {...props}
    >
      {children}
    </h3>
  ),
)
SectionTitle.displayName = "SectionTitle"

export const SubsectionTitle = React.forwardRef<HTMLHeadingElement, TypographyProps>(
  ({ className, children, responsive = true, ...props }, ref) => (
    <h4
      ref={ref}
      className={cn(
        responsive ? responsiveSize("text-base", "text-lg", "text-xl") : "text-lg",
        "font-medium tracking-tight text-gray-900",
        className,
      )}
      {...props}
    >
      {children}
    </h4>
  ),
)
SubsectionTitle.displayName = "SubsectionTitle"

// Text Components
export const BodyText = React.forwardRef<HTMLParagraphElement, TypographyProps>(
  ({ className, children, responsive = true, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(
        responsive ? responsiveSize("text-sm", "text-base", "text-base") : "text-base",
        "text-gray-700 leading-relaxed",
        className,
      )}
      {...props}
    >
      {children}
    </p>
  ),
)
BodyText.displayName = "BodyText"

export const LeadText = React.forwardRef<HTMLParagraphElement, TypographyProps>(
  ({ className, children, responsive = true, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(
        responsive ? responsiveSize("text-base", "text-lg", "text-xl") : "text-lg",
        "text-gray-700 leading-relaxed",
        className,
      )}
      {...props}
    >
      {children}
    </p>
  ),
)
LeadText.displayName = "LeadText"

export const MutedText = React.forwardRef<HTMLParagraphElement, TypographyProps>(
  ({ className, children, responsive = true, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(
        responsive ? responsiveSize("text-xs", "text-sm", "text-sm") : "text-sm",
        "text-gray-500 leading-relaxed",
        className,
      )}
      {...props}
    >
      {children}
    </p>
  ),
)
MutedText.displayName = "MutedText"

export interface SmallTextProps extends TypographyProps {
  as?: keyof JSX.IntrinsicElements
}

export const SmallText = React.forwardRef<HTMLParagraphElement, SmallTextProps>(
  ({ className, children, as: Component = "p", responsive = true, ...props }, ref) => {
    const Comp = Component as any
    return (
      <Comp
        ref={ref}
        className={cn(
          responsive ? responsiveSize("text-xs", "text-xs", "text-sm") : "text-xs",
          "text-gray-500 leading-relaxed",
          className,
        )}
        {...props}
      >
        {children}
      </Comp>
    )
  },
)
SmallText.displayName = "SmallText"

// Label Component
interface LabelTextProps extends TypographyProps {
  icon?: React.ReactNode
}

export const LabelText = React.forwardRef<HTMLLabelElement, LabelTextProps>(
  ({ className, icon, children, responsive = true, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        responsive ? responsiveSize("text-xs", "text-sm", "text-sm") : "text-sm",
        "font-medium text-gray-700 flex items-center gap-1",
        className,
      )}
      {...props}
    >
      {icon && icon}
      {children}
    </label>
  ),
)
LabelText.displayName = "LabelText"

// Card Typography
export const CardTitleText = React.forwardRef<HTMLHeadingElement, TypographyProps>(
  ({ className, children, responsive = true, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        responsive ? responsiveSize("text-base", "text-lg", "text-lg") : "text-lg",
        "font-semibold leading-none tracking-tight text-gray-900",
        className,
      )}
      {...props}
    >
      {children}
    </h3>
  ),
)
CardTitleText.displayName = "CardTitleText"

export const CardDescriptionText = React.forwardRef<HTMLParagraphElement, TypographyProps>(
  ({ className, children, responsive = true, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(
        responsive ? responsiveSize("text-xs", "text-sm", "text-sm") : "text-sm",
        "text-gray-500",
        className,
      )}
      {...props}
    >
      {children}
    </p>
  ),
)
CardDescriptionText.displayName = "CardDescriptionText"

// Inline Text Components
export const BoldText = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, children, ...props }, ref) => (
    <span ref={ref} className={cn("font-semibold", className)} {...props}>
      {children}
    </span>
  ),
)
BoldText.displayName = "BoldText"

export const ItalicText = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, children, ...props }, ref) => (
    <span ref={ref} className={cn("italic", className)} {...props}>
      {children}
    </span>
  ),
)
ItalicText.displayName = "ItalicText"

export const CodeText = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, children, ...props }, ref) => (
    <span ref={ref} className={cn("font-mono bg-gray-100 px-1 py-0.5 rounded text-sm", className)} {...props}>
      {children}
    </span>
  ),
)
CodeText.displayName = "CodeText"

// List Components
export const UnorderedList = React.forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement>>(
  ({ className, children, ...props }, ref) => (
    <ul ref={ref} className={cn("pl-6 list-disc text-gray-700 space-y-1", className)} {...props}>
      {children}
    </ul>
  ),
)
UnorderedList.displayName = "UnorderedList"

export const OrderedList = React.forwardRef<HTMLOListElement, React.HTMLAttributes<HTMLOListElement>>(
  ({ className, children, ...props }, ref) => (
    <ol ref={ref} className={cn("pl-6 list-decimal text-gray-700 space-y-1", className)} {...props}>
      {children}
    </ol>
  ),
)
OrderedList.displayName = "OrderedList"

export const ListItem = React.forwardRef<HTMLLIElement, React.HTMLAttributes<HTMLLIElement>>(
  ({ className, children, ...props }, ref) => (
    <li ref={ref} className={cn("text-base", className)} {...props}>
      {children}
    </li>
  ),
)
ListItem.displayName = "ListItem"

// Dialog Typography
export const DialogTitleText = React.forwardRef<HTMLHeadingElement, TypographyProps>(
  ({ className, children, responsive = true, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn(
        responsive ? responsiveSize("text-base", "text-lg", "text-xl") : "text-lg",
        "font-semibold text-gray-900",
        className,
      )}
      {...props}
    >
      {children}
    </h2>
  ),
)
DialogTitleText.displayName = "DialogTitleText"

export const DialogDescriptionText = React.forwardRef<HTMLParagraphElement, TypographyProps>(
  ({ className, children, responsive = true, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(
        responsive ? responsiveSize("text-xs", "text-sm", "text-sm") : "text-sm",
        "text-gray-500",
        className,
      )}
      {...props}
    >
      {children}
    </p>
  ),
)
DialogDescriptionText.displayName = "DialogDescriptionText"

export const DialogParagraph = React.forwardRef<HTMLParagraphElement, TypographyProps>(
  ({ className, children, responsive = true, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(
        responsive ? responsiveSize("text-sm", "text-base", "text-base") : "text-base",
        "text-gray-700 whitespace-pre-wrap",
        className,
      )}
      {...props}
    >
      {children}
    </p>
  ),
)
DialogParagraph.displayName = "DialogParagraph"
