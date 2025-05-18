import Image from "next/image";
import Link from "next/link";

export default function MenuBar() {
  return (
    <div className="bg-red-100 border-b border-neutral-200 h-20 flex flex-row items-center justify-between px-12">
      <Image src={"/calendar.png"} alt={"school logo"} width={16} height={16} />
      <div>
        <Link href={"/signin"}>login</Link>
      </div>
    </div>
  );
}
