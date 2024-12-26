"use client";

import { useState } from 'react';
import styles from './signin.module.css';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SignIn() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const searchParams = useSearchParams();
  const role = searchParams?.get('role');
  
  const handleSignUpClick = (role: string) => {
    router.push(`/signup?role=${role}`); 
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log('Username:', username);
    console.log('Password:', password);
  };

  return (
    <div className={styles.container}>
      {role && (<div className={styles.roleText}>{role.charAt(0).toUpperCase() + role.slice(1)}</div>)}
      <div className={styles.card}>
        <h2>Sign In</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <input type="text" id="username" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required/>
          </div>

          <div className={styles.inputGroup}>
            <input type="password" id="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required/>
          </div>

          <button type="submit" className={styles.button}>Sign In</button>
        </form>
      </div>
      <div className={styles.signupText}>If not an user? <a onClick={() => handleSignUpClick(`${role}`)} style={{ cursor: 'pointer', color: 'blue' }}>signup</a></div>
    </div>
  );
}
