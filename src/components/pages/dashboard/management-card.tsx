"use client";

import { FC, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@radix-ui/themes";
import { Button } from "@/components/ui/button";

interface IManagementCard {
  title: string;
  subtitle: string;
  actionItems: {
    label: string;
    url: string;
  }[];
}

const ManagementCard: FC<IManagementCard> = ({
  title,
  subtitle,
  actionItems,
}) => {
  const router = useRouter();
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);

  const handleClick = async (url: string, index: number) => {
    setLoadingIndex(index);
    // Simulate async operation like API call or routing delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    router.push(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground">{subtitle}</p>
        <div className={"flex flex-row gap-2"}>
          {actionItems.map((item, index) => (
            <Button
              key={index}
              asChild
              onClick={() => handleClick(item.url, index)}
              variant={index > 0 ? "default" : "outline"}
            >
              {loadingIndex === index ? (
                <div>
                  <Spinner />
                </div>
              ) : (
                <p>{item.label}</p>
              )}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ManagementCard;
