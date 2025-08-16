import { FC } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dispatch, SetStateAction } from "react";

interface IToggleItem {
  label: string;
  id: string;
  value: boolean;
  setValue: Dispatch<SetStateAction<boolean>>;
}

const ToggleItem: FC<IToggleItem> = ({ label, id, value, setValue }) => {
  return (
    <div className="flex items-center space-x-2">
      <Switch id={id} checked={value} onCheckedChange={setValue} />
      <Label htmlFor={id}>{label}</Label>
    </div>
  );
};

export default ToggleItem;
