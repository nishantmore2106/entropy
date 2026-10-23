"use client"

import * as React from "react"
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence, useReducedMotion, type MotionValue } from "framer-motion"
import { cn } from "../../lib/utils"

export interface DockItemData {
    /** Unique identifier */
    id: string
    /** Display label */
    label: string
    /** Icon component or image URL */
    icon: React.ReactNode
    /** Target navigation URL / path */
    href?: string
    /** Click handler */
    onClick?: () => void
    /** Whether item is active */
    isActive?: boolean
    /** Badge count */
    badge?: number
}

export interface MagneticDockProps {
    /** Array of dock items */
    items: DockItemData[]
    /** Size of icons in pixels */
    iconSize?: number
    /** Maximum scale on hover */
    maxScale?: number
    /** Distance of magnetic effect in pixels */
    magneticDistance?: number
    /** Show labels on hover */
    showLabels?: boolean
    /** Dock position */
    position?: "bottom" | "top" | "left" | "right"
    /** Background style */
    variant?: "glass" | "solid" | "transparent"
    /** Custom class name */
    className?: string
}

interface DockItemProps {
    item: DockItemData
    mouseX: MotionValue<number>
    iconSize: number
    maxScale: number
    magneticDistance: number
    showLabels: boolean
    position: "bottom" | "top" | "left" | "right"
    isVertical: boolean
    reducedMotion: boolean
}

function DockItem({
    item,
    mouseX,
    iconSize,
    maxScale,
    magneticDistance,
    showLabels,
    position,
    isVertical,
    reducedMotion,
}: DockItemProps) {
    const ref = React.useRef<HTMLAnchorElement>(null)
    const [isHovered, setIsHovered] = React.useState(false)
    const [isFocused, setIsFocused] = React.useState(false)
    const showLabel = showLabels && (isHovered || isFocused)

    // Calculate distance from mouse to center of item
    const distance = useTransform(mouseX, (val: number) => {
        if (!ref.current) return magneticDistance + 1
        const rect = ref.current.getBoundingClientRect()
        const center = isVertical
            ? rect.top + rect.height / 2
            : rect.left + rect.width / 2
        return val - center
    })

    // Scale based on distance - closer = larger
    const scale = useTransform(distance, [-magneticDistance, 0, magneticDistance], [1, maxScale, 1])

    // Apply spring physics for smooth animation
    const springConfig = { damping: 20, stiffness: 300, mass: 0.5 }
    const smoothScale = useSpring(scale, springConfig)

    // Calculate the size based on scale
    const size = useTransform(smoothScale, (s) => s * iconSize)

    // Floating effect
    const y = useTransform(smoothScale, (s) => {
        if (position === "top") {
            return (s - 1) * 6 // subtle downwards growth when floating at top
        }
        return (s - 1) * -10 // upwards growth when dock is at bottom
    })
    const smoothY = useSpring(y, springConfig)

    return (
        <motion.a
            ref={ref}
            href={item.href || '#'}
            tabIndex={0}
            aria-label={item.label}
            aria-current={item.isActive ? "page" : undefined}
            onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
                    return; // Allow native browser new tab
                }
                if (item.onClick) {
                    e.preventDefault();
                    item.onClick();
                }
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={cn(
                "group relative flex items-center justify-center cursor-pointer select-none no-underline",
                "rounded-xl sm:rounded-2xl transition-colors duration-200",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50",
                item.isActive && "bg-white/[0.06]"
            )}
            style={{
                width: reducedMotion ? iconSize : size,
                height: reducedMotion ? iconSize : size,
                y: reducedMotion || isVertical ? 0 : smoothY,
                x: reducedMotion || !isVertical ? 0 : smoothY,
            }}
            whileTap={reducedMotion ? undefined : { scale: 0.95 }}
        >
            {/* Icon Container with dark glass aesthetic */}
            <motion.div
                className={cn(
                    "relative w-full h-full rounded-xl sm:rounded-2xl overflow-hidden",
                    "bg-gradient-to-b from-white/[0.08] to-white/[0.02]",
                    "border border-white/[0.1] group-hover:border-white/[0.22]",
                    item.isActive && "border-white/[0.28] shadow-[0_0_15px_rgba(200,225,255,0.12)]",
                    "backdrop-blur-md",
                    "shadow-lg shadow-black/40",
                    "flex items-center justify-center",
                    "transition-all duration-200"
                )}
                style={{
                    boxShadow: isHovered
                        ? "0 10px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2)"
                        : item.isActive
                        ? "0 6px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)"
                        : "0 4px 12px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.08)",
                }}
            >
                {/* Icon with pale-blue / white accents */}
                <div
                    aria-hidden="true"
                    className={cn(
                        "w-[52%] h-[52%] flex items-center justify-center transition-all duration-200",
                        item.isActive
                            ? "text-white drop-shadow-[0_0_8px_rgba(224,242,254,0.7)]"
                            : "text-[#B0B4C3] group-hover:text-white"
                    )}
                >
                    {item.icon}
                </div>

                {/* Subtle top-left glass highlight shine */}
                <motion.div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background:
                            "linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(186,230,253,0.05) 40%, transparent 80%)",
                        opacity: isHovered ? 0.95 : item.isActive ? 0.7 : 0.4,
                    }}
                />
            </motion.div>

            {/* Optional Badge */}
            <AnimatePresence initial={false}>
                {item.badge !== undefined && item.badge > 0 && (
                    <motion.div
                        initial={reducedMotion ? false : { scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={reducedMotion ? { opacity: 0 } : { scale: 0, opacity: 0 }}
                        className={cn(
                            "absolute -top-1 -right-1",
                            "min-w-[18px] h-4.5 px-1.5",
                            "rounded-full",
                            "bg-sky-500",
                            "text-black text-[10px] font-bold font-mono tracking-tight",
                            "flex items-center justify-center",
                            "border border-black",
                            "shadow-lg"
                        )}
                    >
                        {item.badge > 99 ? "99+" : item.badge}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Active Indicator dot */}
            <AnimatePresence initial={false}>
                {item.isActive && (
                    <motion.div
                        layoutId="active-dock-indicator"
                        initial={reducedMotion ? false : { scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={reducedMotion ? { opacity: 0 } : { scale: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 380, damping: 26 }}
                        className={cn(
                            "absolute",
                            position === "top" ? "-bottom-1.5" : "-top-1.5",
                            "w-1.5 h-1.5 rounded-full",
                            "bg-sky-200 shadow-[0_0_8px_rgba(186,230,253,0.9),0_0_2px_#ffffff]"
                        )}
                    />
                )}
            </AnimatePresence>

            {/* Tooltip Label (refined Inter typography, smooth fade with upward movement) */}
            <AnimatePresence initial={false}>
                {showLabel && (
                    <motion.div
                        aria-hidden="true"
                        initial={
                            reducedMotion
                                ? false
                                : { opacity: 0, y: 5, scale: 0.95 }
                        }
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={
                            reducedMotion
                                ? { opacity: 0 }
                                : { opacity: 0, y: 3, scale: 0.96 }
                        }
                        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                        className={cn(
                            "absolute left-1/2 -translate-x-1/2",
                            position === "top" ? "top-full mt-2.5" : "-top-10",
                            "px-2.5 py-1 rounded-md",
                            "bg-[#0c0d12]/95 backdrop-blur-md",
                            "text-white text-[12px] font-['Inter',sans-serif] font-medium tracking-tight whitespace-nowrap leading-none",
                            "border border-white/12",
                            "shadow-[0_8px_25px_rgba(0,0,0,0.85)]",
                            "pointer-events-none select-none z-50"
                        )}
                    >
                        {item.label}
                        {/* Tooltip arrow */}
                        <div
                            className={cn(
                                "absolute left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 pointer-events-none",
                                position === "top"
                                    ? "-top-1 bg-[#0c0d12]/95 border-l border-t border-white/12"
                                    : "-bottom-1 bg-[#0c0d12]/95 border-r border-b border-white/12"
                            )}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hover glow */}
            <motion.div
                className="absolute inset-0 rounded-xl sm:rounded-2xl pointer-events-none"
                animate={{
                    boxShadow: isHovered
                        ? "0 0 24px rgba(186,230,253,0.18)"
                        : "0 0 0px rgba(255,255,255,0)",
                }}
                transition={{ duration: 0.3 }}
            />
        </motion.a>
    )
}

export function MagneticDock({
    items,
    iconSize = 44,
    maxScale = 1.35,
    magneticDistance = 140,
    showLabels = true,
    position = "top",
    variant = "glass",
    className,
}: MagneticDockProps) {
    const mousePosition = useMotionValue(Infinity)
    const reducedMotion = useReducedMotion() ?? false
    const isVertical = position === "left" || position === "right"

    // Responsive icon sizing for small mobile screens
    const [responsiveSize, setResponsiveSize] = React.useState<number>(iconSize)

    React.useEffect(() => {
        const updateSize = () => {
            if (typeof window !== "undefined") {
                if (window.innerWidth < 360) {
                    setResponsiveSize(Math.min(iconSize, 30))
                } else if (window.innerWidth < 420) {
                    setResponsiveSize(Math.min(iconSize, 34))
                } else if (window.innerWidth < 640) {
                    setResponsiveSize(Math.min(iconSize, 38))
                } else {
                    setResponsiveSize(iconSize)
                }
            }
        }
        updateSize()
        window.addEventListener("resize", updateSize)
        return () => window.removeEventListener("resize", updateSize)
    }, [iconSize])

    const handleMouseMove = React.useCallback(
        (e: React.MouseEvent) => {
            if (isVertical) {
                mousePosition.set(e.clientY)
            } else {
                mousePosition.set(e.clientX)
            }
        },
        [mousePosition, isVertical]
    )

    const handleMouseLeave = () => {
        mousePosition.set(Infinity)
    }

    const variantStyles = {
        glass: cn(
            "bg-[#0a0a0d]/80",
            "backdrop-blur-xl backdrop-saturate-150",
            "border border-white/[0.08]",
            "shadow-[0_12px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06)]"
        ),
        solid: cn(
            "bg-[#111116]",
            "border border-[#222228]"
        ),
        transparent: "bg-transparent border-0 shadow-none",
    }

    const positionStyles = {
        bottom: "flex-row items-end",
        top: "flex-row items-center",
        left: "flex-col items-center",
        right: "flex-col items-center",
    }

    return (
        <motion.nav
            aria-label="Primary Navigation"
            onMouseMove={reducedMotion ? undefined : handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={cn(
                "inline-flex gap-1.5 sm:gap-2 p-1.5 sm:p-2.5 rounded-2xl sm:rounded-3xl",
                variantStyles[variant],
                positionStyles[position],
                className
            )}
            initial={{ opacity: 0, y: position === "top" ? -12 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
            {items.map((item) => (
                <DockItem
                    key={item.id}
                    item={item}
                    mouseX={mousePosition}
                    iconSize={responsiveSize}
                    maxScale={maxScale}
                    magneticDistance={magneticDistance}
                    showLabels={showLabels}
                    position={position}
                    isVertical={isVertical}
                    reducedMotion={reducedMotion}
                />
            ))}
        </motion.nav>
    )
}

// Preset minimal icons for standard usage
export function DockIconHome({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn("w-full h-full", className)}
        >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
    )
}

export function DockIconBriefcase({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn("w-full h-full", className)}
        >
            <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
    )
}

export function DockIconCompass({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn("w-full h-full", className)}
        >
            <circle cx="12" cy="12" r="10" />
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
        </svg>
    )
}

export function DockIconLayers({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn("w-full h-full", className)}
        >
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
        </svg>
    )
}

export function DockIconWorkflow({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn("w-full h-full", className)}
        >
            <rect width="8" height="8" x="3" y="3" rx="2" />
            <path d="M7 11v4a2 2 0 0 0 2 2h4" />
            <rect width="8" height="8" x="13" y="13" rx="2" />
        </svg>
    )
}

export function DockIconSend({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn("w-full h-full", className)}
        >
            <path d="m22 2-7 20-4-9-9-4Z" />
            <path d="M22 2 11 13" />
        </svg>
    )
}

/** About — minimal info mark (circle with stem and dot) */
export function DockIconAbout({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn("w-full h-full", className)}
        >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
        </svg>
    )
}

/** Explore — framed image / gallery mark */
export function DockIconGallery({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn("w-full h-full", className)}
        >
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21" />
        </svg>
    )
}
