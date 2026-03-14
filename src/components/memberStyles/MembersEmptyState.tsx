import InlineEmptyState from "@/components/EmptyState";
import Icon from "@/lib/table/Icon";

type MembersEmptyStateProps = {
  title: string;
  description: string;
};

export default function MembersEmptyState({
  title,
  description,
}: MembersEmptyStateProps) {
  return (
    <div className="max-w-4xl mx-auto px-4">
      <InlineEmptyState
        message={title}
        subMessage={description}
        icon={<Icon name="image-slash" className="size-12 bg-amber-500" />}
      />
    </div>
  );
}
