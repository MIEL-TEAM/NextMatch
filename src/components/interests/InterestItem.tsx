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
          flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all
          ${
            isSelected
              ? "bg-amber-100 border border-amber-400"
              : "bg-gray-50 border border-gray-200 hover:border-amber-300"
          }
        `}
    >
      <span className="text-xl">{interest.icon}</span>
      <span className="text-sm font-medium">{interest.name}</span>
      {isSelected && (
        <div className="ml-auto w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center">
          <svg
            width="12"
            height="12"
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
    </div>
  );
}
