interface QuotaWarningProps {
  remainingQuota: number | null;
  isPremium: boolean;
}

export default function QuotaWarning({ remainingQuota, isPremium }: QuotaWarningProps) {
  if (isPremium || remainingQuota === null || remainingQuota === 0 || remainingQuota > 2) {
    return null;
  }

  if (remainingQuota === 2) {
    return (
      <p className="text-sm text-gray-500 text-center py-2">
        נשארו לך עוד 2 הודעות בשיחה הזו
      </p>
    );
  }

  // remainingQuota === 1
  return (
    <div className="text-center py-2">
      <p className="text-sm text-amber-600 font-medium">זו ההודעה האחרונה שלך בשיחה הזו</p>
      <p className="text-sm text-amber-600 font-medium">שדרג ל-Miel+ כדי להמשיך לדבר</p>
    </div>
  );
}
