import { Star } from 'lucide-react'

interface RatingFilterProps {
  minRating: number;
  onChange: (rating: number) => void;
}

/**
 * Star rating filter component with simplified UI and no animations
 */
const RatingFilter: React.FC<RatingFilterProps> = ({ minRating, onChange }) => {
  return (
    <div className="space-y-2 py-2">
      {[5, 4, 3, 2, 1].map((rating) => (
        <div 
          key={rating} 
          className="flex items-center cursor-pointer group"
          onClick={() => onChange(rating === minRating ? 0 : rating)}
        >
          <div 
            className={`w-5 h-5 rounded-full border ${
              rating <= minRating 
                ? 'bg-secondary border-secondary' 
                : 'bg-transparent border-secondary group-hover:border-secondary/70'
            } mr-2 flex items-center justify-center`}
          >
            {rating <= minRating && (
              <div className="w-[6px] h-[6px] rounded-full bg-white" />
            )}
          </div>
          <div className="flex items-center">
            {Array(5).fill(0).map((_, i) => (
              <Star 
                key={i}
                strokeWidth={i < rating ? 2.5 : 1.5}
                className={`w-4 h-4 mx-[1px] transition-colors duration-150 ${
                  i < rating 
                    ? 'text-primary-400 fill-primary-400' 
                    : 'text-primary-400 group-hover:text-primary-300'
                }`}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RatingFilter;
