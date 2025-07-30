"use client";

import { FC, ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@radix-ui/themes";
import { ArrowLeft } from "lucide-react";
import { PersonAvatar } from "../ui/person-avatar";

interface IPageHeader {
  title: string;
  subtitle: string;
  btnTitle?: string;
  link?: string;
  endBtns?: ReactNode;
}

export const PageHeader: FC<IPageHeader> = ({
  title,
  subtitle,
  btnTitle,
  link,
  endBtns,
}) => {
  const router = useRouter();
  const [isBkLoading, setIsBkLoading] = useState<boolean>(false);

  const handleBack = (url?: string) => {
    setIsBkLoading(true);

    if (url) {
      router.push(url);
    } else {
      router.back();
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="grid grid-cols-3 w-full items-center">
        <button
          className="cursor-pointer w-fit group p-2 rounded-sm bg-primary-gray"
          onClick={() => handleBack(link ?? undefined)}
        >
          {isBkLoading ? (
            <div>
              <Spinner />
            </div>
          ) : (
            <div className="flex flex-row items-center gap-1">
              <ArrowLeft size={18} />
              <p className="hidden md:block text-sm">
                {btnTitle ? btnTitle : "Back"}
              </p>
            </div>
          )}
        </button>
        <div className="text-center">
          <h1 className="text-lg md:text-xl lg:text-3xl font-bold">{title}</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            {subtitle}
          </p>
        </div>
      </div>
      <div>{endBtns}</div>
    </div>
  );
};

interface IDynamicHeader extends IPageHeader {
  name: string;
  profileImg?: string;
}

export const DynamicHeader: FC<IDynamicHeader> = ({
  title,
  subtitle,
  btnTitle,
  link,
  endBtns,
  name,
  profileImg,
}) => {
  const router = useRouter();
  const [isBkLoading, setIsBkLoading] = useState<boolean>(false);

  const handleBack = (url?: string) => {
    setIsBkLoading(true);

    if (url) {
      router.push(url);
    } else {
      router.back();
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
      <div className="w-full items-center">
        <div className={"flex flex-row gap-8 items-center"}>
          <button
            className="cursor-pointer w-fit group p-2 rounded-sm bg-primary-gray"
            onClick={() => handleBack(link ?? undefined)}
          >
            {isBkLoading ? (
              <div>
                <Spinner />
              </div>
            ) : (
              <div className="flex flex-row items-center gap-1">
                <ArrowLeft size={18} />
                <p className="hidden md:block text-sm">
                  {btnTitle ? btnTitle : "Back"}
                </p>
              </div>
            )}
          </button>

          <div className={"flex flex-row gap-3 items-center ml-auto md:m-auto"}>
            <PersonAvatar
              imageUrl={profileImg ?? null}
              name={name || "Unknown Teacher"}
              size="xl"
            />

            <div className="text-left">
              <h1 className="text-lg md:text-xl lg:text-3xl font-bold">
                {title}
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                {subtitle}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="ml-auto">{endBtns}</div>
    </div>
  );
};
