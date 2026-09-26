import { motion } from 'framer-motion';

interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
}

/**
 * Smooth toggle switch with spring animations
 */
const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  label,
  checked,
  onChange,
  description
}) => {
  const switchVariants = {
    checked: {
      backgroundColor: "var(--secondary)",
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 30,
        duration: 0.3
      }
    },
    unchecked: {
      backgroundColor: "rgba(237,103,109,0.1)",
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 30,
        duration: 0.3
      }
    }
  };

  const thumbVariants = {
    checked: {
      x: 20,
      scale: 1.1,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 25,
        duration: 0.3
      }
    },
    unchecked: {
      x: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 25,
        duration: 0.3
      }
    }
  };

  return (
    <motion.div 
      className="flex items-center justify-between py-2"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="flex-1">
        <label className="text-secondary-850 font-sans font-medium cursor-pointer">
          {label}
        </label>
        {description && (
          <p className="text-sm text-secondary-850/60 mt-1">{description}</p>
        )}
      </div>
      
      <motion.button
        className="relative w-12 h-6 rounded-full focus:outline-none focus:ring-2 focus:ring-secondary/30"
        onClick={() => onChange(!checked)}
        variants={switchVariants}
        initial="unchecked"
        animate={checked ? "checked" : "unchecked"}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md"
          variants={thumbVariants}
          initial="unchecked"
          animate={checked ? "checked" : "unchecked"}
        />
      </motion.button>
    </motion.div>
  );
};

export default ToggleSwitch;
