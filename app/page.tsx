"use client";
import { SignOutButton, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import styles from './src.module.css';
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const handleClick = (role: string) => {
    router.push(`/signin?role=${role}`); 
  };

  return (
    <div className={styles.container}>
      <button className={styles.button} onClick={() => handleClick('Admin')}>Admin</button>
      <button className={styles.button} onClick={() => handleClick('Client')}>Client</button>
    </div>
  );
}
