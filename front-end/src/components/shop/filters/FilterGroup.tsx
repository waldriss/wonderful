"use client"

import { useState, useRef, useLayoutEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from "framer-motion"

interface FilterGroupProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  id: string;
}

/**
 * A collapsible filter group component with smooth bouncy animations
 * Enhanced with spring physics and visual feedback
 */
export const FilterGroup: React.FC<FilterGroupProps> = ({ 
  title, 
  children,
  defaultOpen = true,
  id
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [contentHeight, setContentHeight] = useState<number>(0)
  const contentRef = useRef<HTMLDivElement>(null)

  // Measure content height for smooth animations
  useLayoutEffect(() => {
    if (contentRef.current) {
      const height = contentRef.current.scrollHeight
      setContentHeight(height)
    }
  }, [children, isOpen])

  // Enhanced content animation with bouncy spring physics
  const contentVariants = {
    hidden: { 
      height: 0,
      opacity: 0,
      scale: 0.95,
      transition: {
        height: { 
          duration: 0.4, 
          ease: [0.23, 1, 0.32, 1] // Custom easing for smooth deceleration
        },
        opacity: { duration: 0.2, ease: "easeOut" },
        scale: { duration: 0.3, ease: "easeOut" }
      }
    },
    visible: { 
      height: contentHeight,
      opacity: 1,
      scale: 1,
      transition: {
        height: { 
          duration: 0.5, 
          ease: [0.23, 1, 0.32, 1],
          type: "spring",
          stiffness: 300,
          damping: 30
        },
        opacity: { duration: 0.3, ease: "easeIn", delay: 0.1 },
        scale: { 
          duration: 0.4, 
          ease: "easeOut",
          type: "spring",
          stiffness: 400,
          damping: 25
        }
      }
    }
  }

  // Button hover animation
  const buttonVariants = {
    hover: { 
      scale: 1.02,
      backgroundColor: "rgba(var(--primary-50), 0.8)",
      transition: { duration: 0.2, ease: "easeOut" }
    },
    tap: { 
      scale: 0.98,
      transition: { duration: 0.1, ease: "easeOut" }
    }
  }

  return (
    <motion.div 
      className="mb-4 bg-card border-[3px] border-secondary/5 overflow-hidden rounded-2xl "
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <motion.button
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors duration-200"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={`filter-content-${id}`}
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
      >
        <h3 className="text-secondary font-sans font-semibold tracking-widest text-base">
          {title}
        </h3>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ 
            duration: 0.3, 
            ease: [0.23, 1, 0.32, 1],
            type: "spring",
            stiffness: 300,
            damping: 20
          }}
        >
          <ChevronDown className="h-5 w-5 text-secondary" />
        </motion.div>
      </motion.button>
      
      <AnimatePresence initial={false} mode="wait">
        {isOpen && (
          <motion.div
            id={`filter-content-${id}`}
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="overflow-hidden"
            style={{ originY: 0 }}
          >
            <motion.div 
              ref={contentRef}
              className="px-4 pb-4"
              initial={{ y: -10 }}
              animate={{ y: 0 }}
              transition={{ 
                duration: 0.3, 
                delay: 0.1,
                ease: "easeOut" 
              }}
            >
              {children}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default FilterGroup
