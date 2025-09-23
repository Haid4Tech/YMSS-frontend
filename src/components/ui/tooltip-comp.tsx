import { FC, ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ITooltipComp {
  trigger: ReactNode;
  content: string;
}

const TooltipComp: FC<ITooltipComp> = ({ trigger, content }) => {
  return (
    <Tooltip>
      <TooltipTrigger>{trigger}</TooltipTrigger>
      <TooltipContent>
        <p>{content}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export { TooltipComp };
