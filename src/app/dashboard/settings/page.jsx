"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";
import styles from "./Settings.module.css";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    email: "",
    role: "",
    college: "",
    specialization: "",
    skills: "",
    company: "",
    job_role: "",
    about: "",
    country: "",
    state: "",
  });

  // Change Password state
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwError, setPwError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (data) {
        setProfile({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          email: data.email || "",
          role: data.role || "",
          college: data.college || "",
          specialization: data.specialization || "",
          skills: data.skills || "",
          company: data.company || "",
          job_role: data.job_role || "",
          about: data.about || "",
          country: data.country || "",
          state: data.state || "",
        });
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
    setSuccess(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: profile.first_name,
        last_name: profile.last_name,
        college: profile.college,
        specialization: profile.specialization,
        skills: profile.skills,
        company: profile.company,
        job_role: profile.job_role,
        about: profile.about,
        country: profile.country,
        state: profile.state,
      })
      .eq("id", session.user.id);

    if (!error) setSuccess(true);
    else console.error("Update error:", error);
    setSaving(false);
  };

  const handlePwChange = (e) => {
    setPwForm({ ...pwForm, [e.target.name]: e.target.value });
    setPwError("");
    setPwSuccess("");
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");

    if (pwForm.newPassword.length < 6) {
      setPwError("New password must be at least 6 characters.");
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError("New password and confirmation do not match.");
      return;
    }

    setPwSaving(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password: pwForm.currentPassword,
      });
      if (signInError) {
        setPwError("Current password is incorrect.");
        setPwSaving(false);
        return;
      }
      const { error: updateError } = await supabase.auth.updateUser({
        password: pwForm.newPassword,
      });
      if (updateError) {
        setPwError(updateError.message);
      } else {
        setPwSuccess("Password changed successfully! ✅");
        setPwForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (err) {
      setPwError(err.message);
    }
    setPwSaving(false);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner} />
        <p>Loading your profile...</p>
      </div>
    );
  }

  const initials =
    `${profile.first_name?.[0] || ""}${profile.last_name?.[0] || ""}`.toUpperCase();

  const tabs = [
    { id: "profile", label: "Profile", icon: "👤" },
    {
      id: "details",
      label: profile.role === "student" ? "Academic" : "Professional",
      icon: profile.role === "student" ? "🎓" : "💼",
    },
    { id: "security", label: "Security", icon: "🔒" },
  ];

  return (
    <div className={styles.settingsPage}>
      {/* Profile Hero Card */}
      <div className={styles.heroCard}>
        <div className={styles.heroBg} />
        <div className={styles.heroContent}>
          <div className={styles.avatarRing}>
            <div className={styles.avatar}>{initials}</div>
          </div>
          <div className={styles.heroInfo}>
            <h1 className={styles.heroName}>
              {profile.first_name} {profile.last_name}
            </h1>
            <p className={styles.heroEmail}>{profile.email}</p>
            <span className={styles.roleBadge}>
              {profile.role === "student" ? "🎓 Student" : "💼 Professional"}
            </span>
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {success && (
        <div className={styles.toast}>
          <span>✅</span> Profile updated successfully!
        </div>
      )}

      {/* Tab Navigation */}
      <div className={styles.tabBar}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className={styles.tabIcon}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {/* ── PROFILE TAB ── */}
        {activeTab === "profile" && (
          <div className={styles.formSection}>
            <div className={styles.formHeader}>
              <h2>Personal Information</h2>
              <p>Update your personal details and bio.</p>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label>First Name</label>
                <input
                  name="first_name"
                  value={profile.first_name}
                  onChange={handleChange}
                  placeholder="Enter first name"
                />
              </div>
              <div className={styles.field}>
                <label>Last Name</label>
                <input
                  name="last_name"
                  value={profile.last_name}
                  onChange={handleChange}
                  placeholder="Enter last name"
                />
              </div>
              <div className={styles.field}>
                <label>Email Address</label>
                <input
                  value={profile.email}
                  disabled
                  className={styles.disabledInput}
                />
                <span className={styles.fieldHint}>
                  Email cannot be changed
                </span>
              </div>
              <div className={styles.field}>
                <label>Country</label>
                <input
                  name="country"
                  value={profile.country}
                  onChange={handleChange}
                  placeholder="e.g. India"
                />
              </div>
              <div className={styles.field}>
                <label>State</label>
                <input
                  name="state"
                  value={profile.state}
                  onChange={handleChange}
                  placeholder="e.g. Gujarat"
                />
              </div>
              <div className={styles.field}>
                <label>Role</label>
                <input
                  value={profile.role}
                  disabled
                  className={styles.disabledInput}
                  style={{ textTransform: "capitalize" }}
                />
              </div>
            </div>

            <div className={styles.fieldFull}>
              <label>About</label>
              <textarea
                name="about"
                value={profile.about}
                onChange={handleChange}
                placeholder="Write a short bio about yourself..."
                rows={4}
              />
            </div>

            <button
              onClick={handleSave}
              className={styles.primaryBtn}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}

        {/* ── DETAILS TAB ── */}
        {activeTab === "details" && (
          <div className={styles.formSection}>
            {profile.role === "student" ? (
              <>
                <div className={styles.formHeader}>
                  <h2>Academic Details 🎓</h2>
                  <p>Your university and academic information.</p>
                </div>
                <div className={styles.formGrid}>
                  <div className={styles.field}>
                    <label>College / University</label>
                    <input
                      name="college"
                      value={profile.college}
                      onChange={handleChange}
                      placeholder="e.g. IIT Bombay"
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Specialization</label>
                    <input
                      name="specialization"
                      value={profile.specialization}
                      onChange={handleChange}
                      placeholder="e.g. Computer Science"
                    />
                  </div>
                </div>
                <div className={styles.fieldFull}>
                  <label>Skills</label>
                  <input
                    name="skills"
                    value={profile.skills}
                    onChange={handleChange}
                    placeholder="e.g. React, Python, Machine Learning"
                  />
                </div>
              </>
            ) : (
              <>
                <div className={styles.formHeader}>
                  <h2>Professional Details 💼</h2>
                  <p>Your work and industry information.</p>
                </div>
                <div className={styles.formGrid}>
                  <div className={styles.field}>
                    <label>Company</label>
                    <input
                      name="company"
                      value={profile.company}
                      onChange={handleChange}
                      placeholder="e.g. Google"
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Job Role</label>
                    <input
                      name="job_role"
                      value={profile.job_role}
                      onChange={handleChange}
                      placeholder="e.g. Senior Developer"
                    />
                  </div>
                </div>
              </>
            )}

            <button
              onClick={handleSave}
              className={styles.primaryBtn}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}

        {/* ── SECURITY TAB ── */}
        {activeTab === "security" && (
          <div className={styles.formSection}>
            <div className={styles.formHeader}>
              <h2>Change Password 🔒</h2>
              <p>
                Update your account password. Make sure to use a strong, unique
                password.
              </p>
            </div>

            {pwError && <div className={styles.alertError}>{pwError}</div>}
            {pwSuccess && (
              <div className={styles.alertSuccess}>{pwSuccess}</div>
            )}

            <form onSubmit={handleChangePassword}>
              <div className={styles.fieldFull}>
                <label>Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={pwForm.currentPassword}
                  onChange={handlePwChange}
                  placeholder="Enter your current password"
                  required
                />
              </div>
              <div className={styles.formGrid} style={{ marginTop: "1rem" }}>
                <div className={styles.field}>
                  <label>New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={pwForm.newPassword}
                    onChange={handlePwChange}
                    placeholder="Min 6 characters"
                    required
                    minLength={6}
                  />
                </div>
                <div className={styles.field}>
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={pwForm.confirmPassword}
                    onChange={handlePwChange}
                    placeholder="Re-type new password"
                    required
                    minLength={6}
                  />
                </div>
              </div>
              <button
                type="submit"
                className={styles.dangerBtn}
                disabled={pwSaving}
                style={{ marginTop: "1.5rem" }}
              >
                {pwSaving ? "Updating..." : "Update Password"}
              </button>
            </form>

            <div className={styles.securityNote}>
              <span>💡</span>
              <p>
                After changing your password, you&apos;ll remain logged in on
                this device. Your new password will be required on any future
                logins.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

