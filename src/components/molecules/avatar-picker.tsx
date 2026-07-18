import { ToggleGroup, ToggleGroupItem } from '@/components/design/toggle-group';
import { KID_AVATARS } from '@/utils/avatars';

export function AvatarPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (avatarKey: string) => void;
}) {
  return (
    <ToggleGroup
      value={[value]}
      onValueChange={(next) => {
        if (next[0]) onChange(next[0]);
      }}
      variant="outline"
      className="w-full flex-wrap"
    >
      {KID_AVATARS.map((avatar) => (
        <ToggleGroupItem
          key={avatar}
          value={avatar}
          aria-label={`Avatar ${avatar}`}
          className="text-xl"
        >
          {avatar}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
