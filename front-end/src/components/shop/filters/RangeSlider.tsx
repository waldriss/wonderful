import { Slider } from '@/components/ui/slider'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface RangeSliderProps {
  label: string;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  min?: number;
  max: number;
  step?: number;
  unit?: string;
  formatValue?: (value: number) => string;
}

/**
 * A reusable range slider component with min/max values and smooth animations
 */
const RangeSlider: React.FC<RangeSliderProps> = ({
  label,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  unit = '',
  formatValue = (val) => val.toString()
}) => {
  // Local state to handle the animation of values
  const [displayValues, setDisplayValues] = useState<[number, number]>(value);
  
  // Update display values with animation when the actual values change
  useEffect(() => {
    setDisplayValues(value);
  }, [value]);

  return (
    <div className="mb-6">
      <h4 className="text-secondary-850 font-sans font-medium mb-2">{label}</h4>
      <Slider
        defaultValue={value}
        min={min}
        max={max}
        step={step}
        value={value}
        onValueChange={(newValue) => onChange(newValue as [number, number])}
        className="mb-2"
      />
      <div className="flex justify-between text-sm text-secondary-850 font-sans">
        <motion.span
          key={`min-${displayValues[0]}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {formatValue(displayValues[0])}{unit}
        </motion.span>
        <motion.span
          key={`max-${displayValues[1]}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {formatValue(displayValues[1])}{unit}
        </motion.span>
      </div>
    </div>
  );
};

export default RangeSlider;
