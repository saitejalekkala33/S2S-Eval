"use client";

import { useState } from "react";
import axios from "axios";
import styles from "./signup.module.css";
import { useRouter, useSearchParams } from "next/navigation";

export default function SignUp() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const searchParams = useSearchParams();
  const role = searchParams?.get("role");

  const handleSignInClick = (role: string) => {
    router.push(`/signin?role=${role}`);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const userData = {
      role,
      username,
      mailID: email,
      password,
    };

    try {
      const res = await axios.post("http://localhost:5000/api/user", userData);
      setSuccess(res.data.message);
      // alert(res.data.message);
      if (res.data.status !== "success") {
        alert('Some Error');
        return;
      }
      if (role == "Admin") {
        router.push("/admin");
      }
      if (role == "Client") {
        router.push("/client");
      }

    } catch (error: any) {
      if (error.res) {
        setError(
          error.res.data.message || "An error occurred. Please try again."
        );
      } else {
        setError("Network error, please try again later.");
      }
    }
  };

  return (
    <div className={styles.container}>
      {role && (
        <div className={styles.roleText}>
          {role.charAt(0).toUpperCase() + role.slice(1)}
        </div>
      )}
      <div className={styles.card}>
        <h2>Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <input
              type="text"
              id="username"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <input
              type="email"
              id="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <input
              type="password"
              id="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className={styles.button}>
            Sign Up
          </button>
        </form>
        {success && <p className={styles.successMessage}>{success}</p>}
        {error && <p className={styles.errorMessage}>{error}</p>}
      </div>
      <div className={styles.signinText}>
        If already an user?{" "}
        <a
          onClick={() => handleSignInClick(`${role}`)}
          style={{ cursor: "pointer", color: "blue" }}
        >
          signin
        </a>
      </div>
    </div>
  );
}
