"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const states = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
];

const skillsOptionsList = [
  "Cooking",
  "Cleaning",
  "Tutoring",
  "Driving",
  "Event Planning",
  "Fundraising",
  "Mentoring",
  "Administrative Tasks",
  "Technical Support",
  "Public Speaking",
  "Marketing",
  "Graphic Design",
  "Writing/Editing",
  "Photography",
  "Video Production",
  "Social Media Management",
];

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zipCode: "",
    skills: [],
    preferences: "",
    availability: "",
  });
  const [skillsOptions, setSkillsOptions] = useState(skillsOptionsList);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [customSkill, setCustomSkill] = useState("");
  const [error, setError] = useState(null);
  const [updateStatus, setUpdateStatus] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");
  
        const response = await fetch("/api/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch profile");
        }
  
        const data = await response.json();
  
        // Handle skills safely
        const skills =
          Array.isArray(data.skills) // Already an array
            ? data.skills
            : typeof data.skills === "string" // Comma-separated string
            ? data.skills.split(",").map((skill) => skill.trim()) // Split and trim each skill
            : [];
  
        setProfile({ ...data, skills });
      } catch (err) {
        setError(err.message);
      }
    };
  
    fetchProfile();
  }, []);
  
  

  const handleEditToggle = () => setEditMode(!editMode);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddSkill = () => {
    if (selectedSkill && !formData.skills.includes(selectedSkill)) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, selectedSkill],
      }));
      setSkillsOptions(skillsOptions.filter((skill) => skill !== selectedSkill));
      setSelectedSkill("");
    }
  };

  const handleAddCustomSkill = () => {
    if (customSkill && !formData.skills.includes(customSkill)) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, customSkill],
      }));
      setCustomSkill("");
    }
  };

  const handleRemoveSkill = (skill) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
    setSkillsOptions((prevSkills) => [...prevSkills, skill]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const response = await fetch("/api/users/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      setEditMode(false);
      setUpdateStatus("Profile updated successfully!");
    } catch (err) {
      setError(err.message);
      setUpdateStatus("Failed to update profile.");
    }
  };

  if (error) return <p>Error: {error}</p>;
  if (!profile) return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      {/* Navigation Links */}
      <nav style={styles.nav}>
        <Link href="/events" legacyBehavior>
          <a style={styles.link}>View Events</a>
        </Link>
        <Link href="/history" legacyBehavior>
          <a style={styles.link}>History</a>
        </Link>
        <Link href="/notifications" legacyBehavior>
          <a style={styles.link}>Notifications</a>
        </Link>
        <Link href="/reports" legacyBehavior>
          <a style={styles.link}>Reports</a>
        </Link>
        <Link href="/volunteer-matching" legacyBehavior>
          <a style={styles.link}>Volunteer Matching</a>
        </Link>
        <Link href="/event-management" legacyBehavior>
          <a style={styles.link}>Event Management</a>
        </Link>
      </nav>

      {/* Profile Information */}
      <h1>User Profile</h1>
      {!editMode ? (
        <div>
          <p><strong>Full Name:</strong> {profile.fullName}</p>
          <p><strong>Address 1:</strong> {profile.address1}</p>
          <p><strong>Address 2:</strong> {profile.address2}</p>
          <p><strong>City:</strong> {profile.city}</p>
          <p><strong>State:</strong> {profile.state}</p>
          <p><strong>Zip Code:</strong> {profile.zipCode}</p>
          <p><strong>Skills:</strong></p>
          <ul>
            {profile.skills.length > 0 ? (
              profile.skills.map((skill, idx) => <li key={idx}>{skill}</li>)
            ) : (
              <li>No skills added</li>
            )}
          </ul>
          <button onClick={handleEditToggle}>Edit Profile</button>
        </div>
      ) : (
        // Edit Form
        <form onSubmit={handleSubmit}>
          <label>
            Full Name:
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
            />
          </label>
          <label>
            Address 1:
            <input
              type="text"
              name="address1"
              value={formData.address1}
              onChange={handleChange}
            />
          </label>
          <label>
            Address 2:
            <input
              type="text"
              name="address2"
              value={formData.address2}
              onChange={handleChange}
            />
          </label>
          <label>
            City:
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
            />
          </label>
          <label>
            State:
            <select
              name="state"
              value={formData.state}
              onChange={handleChange}
            >
              {states.map((state) => (
                <option key={state.code} value={state.code}>
                  {state.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Zip Code:
            <input
              type="text"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
            />
          </label>
          <label>
            Skills:
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
            >
              <option value="">Select a skill</option>
              {skillsOptions.map((skill) => (
                <option key={skill} value={skill}>
                  {skill}
                </option>
              ))}
            </select>
            <button type="button" onClick={handleAddSkill}>
              Add Skill
            </button>
          </label>
          <div>
            <input
              type="text"
              placeholder="Add a custom skill"
              value={customSkill}
              onChange={(e) => setCustomSkill(e.target.value)}
            />
            <button type="button" onClick={handleAddCustomSkill}>
              Add Custom Skill
            </button>
          </div>
          <ul>
            {formData.skills.map((skill) => (
              <li key={skill}>
                {skill}{" "}
                <button type="button" onClick={() => handleRemoveSkill(skill)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <button type="submit">Save Changes</button>
          <button type="button" onClick={handleEditToggle}>
            Cancel
          </button>
        </form>
      )}
      {updateStatus && <p>{updateStatus}</p>}
    </div>
  );
};

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-around",
    marginBottom: "20px",
  },
  link: {
    padding: "10px 15px",
    textDecoration: "none",
    backgroundColor: "#0070f3",
    color: "white",
    borderRadius: "5px",
  },
};

export default ProfilePage;