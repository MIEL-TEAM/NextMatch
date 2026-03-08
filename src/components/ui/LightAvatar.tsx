import Image from "next/image";

function LightAvatar({ src, name }: { src?: string; name: string }) {
  const initials = name?.slice(0, 2).toUpperCase();

  return src ? (
    <Image
      width={32}
      height={32}
      src={src}
      alt={name}
      className="w-8 h-8 rounded-full object-cover"
      loading="lazy"
    />
  ) : (
    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
      {initials}
    </div>
  );
}

export default LightAvatar;
