"use client";

import React, { FC, SetStateAction, Dispatch } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { Button } from "./ui/button";

interface ISelectField {
  placeholder: string;
  items: string[];
  title: string;
  selected: string | undefined;
  onSelect: Dispatch<SetStateAction<string | undefined>>;
}

const SelectField: FC<ISelectField> = ({
  placeholder,
  items,
  title,
  selected,
  onSelect,
}) => {
  return (
    <div className={"w-full flex flex-col gap-3"}>
      <p className={"text-sm font-semibold"}>{title}</p>

      <Select value={selected} onValueChange={onSelect}>
        <SelectTrigger
          className={
            "w-[100%] border-[1.5px] border-primary-500 rounded-lg text-neutral-800 capitalize"
          }
        >
          <SelectValue className={"uppercase"} placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Select</SelectLabel>
            {items.length === 0 ? (
              <p>loading...</p>
            ) : (
              items.map((item, index) => (
                <SelectItem className={"capitalize"} key={index} value={item}>
                  {item}
                </SelectItem>
              ))
            )}
          </SelectGroup>
          <Button
            className="hover:bg-red-400/20 text-red-400 w-full px-2"
            variant="secondary"
            size="sm"
            onMouseDown={(e) => {
              e.stopPropagation();
              onSelect("");
            }}
          >
            Clear
          </Button>
        </SelectContent>
      </Select>
    </div>
  );
};

export default React.memo(SelectField);
