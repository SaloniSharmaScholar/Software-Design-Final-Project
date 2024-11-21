import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "../styles/VolunteerMatchingForm.module.css";

const VolunteerMatchingForm = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedVolunteer, setSelectedVolunteer] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState("");

  // Fetch volunteers on component mount
  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        const response = await axios.get("/api/volunteers", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setVolunteers(response.data);
      } catch (error) {
        console.error("Error fetching volunteers:", error);
        setError("Failed to fetch volunteers.");
      }
    };

    fetchVolunteers();
  }, []);

  // Match events for the selected volunteer
  const handleMatch = async (e) => {
    e.preventDefault();

    if (!selectedVolunteer) {
      setError("Please select a volunteer.");
      return;
    }

    try {
      const response = await axios.post(
        "/api/matching",
        { volunteerId: selectedVolunteer },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (response.data && Array.isArray(response.data)) {
        setEvents(response.data);
        setNotifications([]);
      } else if (response.data.message) {
        setEvents([]);
        setNotifications([response.data.message]);
      }
    } catch (error) {
      console.error("Error finding matching events:", error);
      setError("An error occurred while finding matching events.");
    }
  };

  // Assign volunteer to an event
  const handleAssign = async (eventId) => {
    try {
      const response = await axios.post(
        '/api/volunteer-history',
        {
          volunteerId: selectedVolunteer,
          eventId,
          participationStatus: 'Assigned',
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
  
      if (response.status === 201) {
        setNotifications([
          ...notifications,
          `Volunteer assigned to event with ID: ${eventId}`,
        ]);
      }
    } catch (error) {
      console.error('Error assigning volunteer to event:', error);
      setError('Failed to assign volunteer to event.');
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2>Volunteer Matching and Assignment</h2>
      {error && <p className={styles.error}>{error}</p>}

      <form onSubmit={handleMatch}>
        <div>
          <label>Volunteer:</label>
          <select
            value={selectedVolunteer}
            onChange={(e) => setSelectedVolunteer(e.target.value)}
          >
            <option value="">Select a Volunteer</option>
            {volunteers.map((volunteer) => (
              <option key={volunteer.userId} value={volunteer.userId}>
                {volunteer.fullName}
              </option>
            ))}
          </select>
        </div>

        <button type="submit">Find Matching Events</button>
      </form>

      {events.length > 0 && (
        <div className={styles.results}>
          <h3>Matching Events</h3>
          <ul>
            {events.map((event) => (
              <li key={event.id} className={styles.eventItem}>
                <p><strong>{event.eventName}</strong></p>
                <p>{event.eventDescription}</p>
                <p>Location: {event.location}</p>
                <p>Required Skills: {event.requiredSkills.join(", ")}</p>
                <button onClick={() => handleAssign(event.id)}>
                  Assign Volunteer
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {notifications.length > 0 && (
        <div className={styles.notifications}>
          <h3>Notifications</h3>
          <ul>
            {notifications.map((message, index) => (
              <li key={index}>{message}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default VolunteerMatchingForm;
