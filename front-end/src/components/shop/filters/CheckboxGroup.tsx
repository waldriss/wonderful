import { Checkbox } from '@/components/ui/checkbox';

interface CheckboxGroupProps {
  title?: string;
  items: string[];
  selected: string[];
  onChange: (item: string, checked: boolean) => void;
  idPrefix: string;
}

/**
 * A group of checkboxes with a consistent UI
 * Animations removed for better performance
 */
const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  title,
  items,
  selected,
  onChange,
  idPrefix
}) => {
  return (
    <div className="mb-6">
      {title && (
        <p className="text-sm text-secondary-850/70 mb-2">{title}</p>
      )}
      <div className="space-y-2">
        {items.map((itemValue) => (
          <div 
            className="flex items-center" 
            key={`${idPrefix}-${itemValue}`}
          >
            <Checkbox
              id={`${idPrefix}-${itemValue}`}
              className="mr-2"
              checked={selected.includes(itemValue)}
              onCheckedChange={(checked) => onChange(itemValue, !!checked)}
            />
            <label
              htmlFor={`${idPrefix}-${itemValue}`}
              className="text-secondary-850 font-sans cursor-pointer hover:text-secondary transition-colors duration-150"
            >
              {itemValue}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CheckboxGroup;
