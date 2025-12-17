// Separate component for each interest item
interface InterestItemProps {
  interest: {
    id: string;
    name: string;
    icon: string;
    category?: string;
  };
  isSelected: boolean;
  onClick: () => void;
}

export default function InterestItem({
  interest,
  isSelected,
  onClick,
}: InterestItemProps) {
  return (
    <div
      onClick={onClick}
      className={`
        group relative flex items-center gap-3 p-4 rounded-2xl cursor-pointer 
        transition-all duration-200 ease-out
        ${
          isSelected
            ? "bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-[#E37B27] shadow-lg shadow-orange-200/50 scale-[1.02]"
            : "bg-white border-2 border-gray-200 hover:border-orange-300 hover:shadow-md hover:scale-[1.01]"
        }
      `}
    >
      {/* Icon with background */}
      <div
        className={`
        flex items-center justify-center w-12 h-12 rounded-xl transition-all
        ${
          isSelected
            ? "bg-[#E37B27] text-white"
            : "bg-gray-100 text-gray-600 group-hover:bg-orange-100 group-hover:text-[#E37B27]"
        }
      `}
      >
        <span className="text-2xl">{interest.icon}</span>
      </div>

      {/* Text */}
      <span
        className={`
        flex-1 text-base font-medium transition-colors
        ${isSelected ? "text-[#E37B27]" : "text-gray-700 group-hover:text-[#E37B27]"}
      `}
      >
        {interest.name}
      </span>

      {/* Checkmark */}
      {isSelected && (
        <div className="w-6 h-6 bg-[#E37B27] rounded-full flex items-center justify-center animate-in zoom-in duration-200">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5 13L9 17L19 7"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}

      {/* Subtle glow on selected */}
      {isSelected && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-400/10 to-amber-400/10 pointer-events-none" />
      )}
    </div>
  );
}
