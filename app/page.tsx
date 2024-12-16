import { SignOutButton, UserButton } from "@clerk/nextjs";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      {/* <SignOutButton redirectUrl="/client"/> */}
      <UserButton afterSignOutUrl="/client"/>
    </div>
  );
}
