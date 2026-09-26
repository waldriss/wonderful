import { motion } from 'framer-motion';

interface PillSelectorProps {
  items: string[];
  selected: string[];
  onChange: (item: string) => void;
  multiSelect?: boolean;
  className?: string;
}

/**
 * Pill-style selector with minimal, fast animations
 */
const PillSelector: React.FC<PillSelectorProps> = ({
  items,
  selected,
  onChange,
  multiSelect = true,
  className = ""
}) => {
  const pillVariants = {
    selected: {
      backgroundColor: "rgba(237,103,109,0.8)",
      color: "white",
      scale: 1.02,
      transition: {
        duration: 0.15,
        ease: "easeOut"
      }
    },
    unselected: {
      backgroundColor: "transparent",
      color: "rgba(237,103,109,0.8)",
      scale: 1,
      border: "2px solid rgba(237,103,109,0.3)",
      transition: {
        duration: 0.15,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.01,
      transition: {
        duration: 0.1,
        ease: "easeOut"
      }
    },
    tap: {
      scale: 0.98,
      transition: {
        duration: 0.05,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {items.map((item, index) => {
        const isSelected = selected.includes(item);
        
        return (
          <motion.button
            key={item}
            className="px-4 py-1 rounded-full border-2 border-secondary/80 font-sans font-medium text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-secondary/30"
            onClick={() => onChange(item)}
            variants={pillVariants}
            initial="unselected"
            animate={isSelected ? "selected" : "unselected"}
            whileHover={!isSelected ? "hover" : undefined}
            whileTap="tap"
          >
            <span>{item}</span>
          </motion.button>
        );
      })}
    </div>
  );
};

export default PillSelector;
