"use client";
import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import styles from "../Auth.module.css";
import Link from "next/link";

export default function Signup() {
  const [step, setStep] = useState(1); // 1: Role Selection, 2: Details Form, 3: Success
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    college: "",
    specialization: "",
    skills: "",
    company: "",
    jobRole: "",
    about: "",
    country: "",
    state: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setStep(2);
  };

  // Generate a strong random password
  const generatePassword = () => {
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const nums = "0123456789";
    const special = "!@#$%&*";
    const all = upper + lower + nums + special;
    // Ensure at least one of each type
    let password = "";
    password += upper[Math.floor(Math.random() * upper.length)];
    password += lower[Math.floor(Math.random() * lower.length)];
    password += nums[Math.floor(Math.random() * nums.length)];
    password += special[Math.floor(Math.random() * special.length)];
    for (let i = 4; i < 12; i++) {
      password += all[Math.floor(Math.random() * all.length)];
    }
    // Shuffle the password
    return password
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Auto-generate password
      const autoPassword = generatePassword();

      // 2. Sign up user (email confirmation disabled since we verify via our own email)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: autoPassword,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            role: role,
          },
        },
      });

      if (authError) throw authError;

      const userId = authData.user?.id;
      if (!userId) throw new Error("Signup failed.");

      // 3. Create profile with 15 free GC-Tokens via server API (bypasses RLS)
      const profileRes = await fetch("/api/create-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: role,
          about: formData.about,
          country: formData.country,
          state: formData.state,
          college: formData.college,
          specialization: formData.specialization,
          skills: formData.skills,
          company: formData.company,
          jobRole: formData.jobRole,
        }),
      });

      if (!profileRes.ok) {
        const pErr = await profileRes.json();
        console.error("Profile creation error:", pErr);
        throw new Error("Failed to create profile. Please try again.");
      }

      // 4. Send password via email using our API route
      const emailRes = await fetch("/api/send-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: autoPassword,
          firstName: formData.firstName,
        }),
      });

      if (!emailRes.ok) {
        console.error("Email send failed:", await emailRes.json());
      }

      // 5. Sign out so navbar shows guest view (user must log in with emailed credentials)
      await supabase.auth.signOut();

      // 6. Show success
      setStep(3);
    } catch (err) {
      console.error("Signup Error:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className={styles.signupContainer}>
      <h2 className={styles.title}>
        {step === 1 && "Choose Your Path"}
        {step === 2 &&
          `Join as a ${role === "student" ? "Student" : "Professional"}`}
        {step === 3 && "Account Created! 🎉"}
      </h2>
      <p className={styles.subtitle}>
        {step === 1 && "Select your profile type to get started."}
        {step === 2 && "Tell us a bit about yourself."}
        {step === 3 && "Check your email for your login credentials."}
      </p>

      {error && <div className={styles.error}>{error}</div>}

      {/* Step 1: Role Selection */}
      {step === 1 && (
        <div className={styles.roleGrid}>
          <button
            className={styles.roleCard}
            onClick={() => handleRoleSelect("student")}
          >
            <div className={styles.roleIcon}>🎓</div>
            <h3>Student</h3>
            <p>I am here to learn, share notes, and grow my skills.</p>
            <span className={styles.arrowBtn}>&rarr;</span>
          </button>
          <button
            className={styles.roleCard}
            onClick={() => handleRoleSelect("professional")}
          >
            <div className={styles.roleIcon}>💼</div>
            <h3>Working Professional</h3>
            <p>I am here to mentor, network, and share industry insights.</p>
            <span className={styles.arrowBtn}>&rarr;</span>
          </button>
        </div>
      )}

      {/* Step 2: Form */}
      {step === 2 && (
        <form onSubmit={handleSignup} className={`${styles.form} fade-in`}>
          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>First Name</label>
              <input
                name="firstName"
                className={styles.input}
                required
                onChange={handleChange}
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Last Name</label>
              <input
                name="lastName"
                className={styles.input}
                required
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Email Address</label>
            <input
              name="email"
              type="email"
              className={styles.input}
              required
              onChange={handleChange}
              placeholder="you@example.com"
            />
          </div>

          {role === "student" ? (
            <>
              <div className={styles.inputGroup}>
                <label className={styles.label}>College / University</label>
                <input
                  name="college"
                  className={styles.input}
                  required
                  onChange={handleChange}
                  placeholder="e.g. IIT Bombay"
                />
              </div>
              <div className={styles.row}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Specialization</label>
                  <input
                    name="specialization"
                    className={styles.input}
                    required
                    onChange={handleChange}
                    placeholder="e.g. Computer Science"
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Skills</label>
                  <input
                    name="skills"
                    className={styles.input}
                    onChange={handleChange}
                    placeholder="e.g. React, Python"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Company Name</label>
                <input
                  name="company"
                  className={styles.input}
                  required
                  onChange={handleChange}
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Job Role</label>
                <input
                  name="jobRole"
                  className={styles.input}
                  required
                  onChange={handleChange}
                  placeholder="e.g. Senior Developer"
                />
              </div>
            </>
          )}

          <div className={styles.inputGroup}>
            <label className={styles.label}>About Yourself</label>
            <textarea
              name="about"
              className={styles.textarea}
              rows="2"
              onChange={handleChange}
              placeholder="Short bio..."
            />
          </div>

          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Country</label>
              <input
                name="country"
                className={styles.input}
                required
                onChange={handleChange}
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>State</label>
              <input
                name="state"
                className={styles.input}
                required
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.backBtn}
              onClick={() => setStep(1)}
            >
              Back
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create My Account"}
            </button>
          </div>
        </form>
      )}

      {/* Step 3: Success */}
      {step === 3 && (
        <div className={`${styles.successBox} fade-in`}>
          <div className={styles.successIcon}>📧</div>
          <p>
            We have sent your <strong>email</strong> and{" "}
            <strong>password</strong> to your inbox.
          </p>
          <p>Use those credentials to log in.</p>
          <Link
            href="/login"
            className={styles.submitBtn}
            style={{
              textAlign: "center",
              display: "block",
              marginTop: "1.5rem",
              textDecoration: "none",
            }}
          >
            Go to Login Page →
          </Link>
        </div>
      )}

      {step !== 3 && (
        <p className={styles.footer}>
          Already have an account?
          <Link href="/login" className={styles.link}>
            Log in
          </Link>
        </p>
      )}
    </div>
  );
}

