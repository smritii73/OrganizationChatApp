import { useEffect, useState } from "react";
import { BASE_URL } from "../../Url";
import { useAuthContext } from "../../context/AuthContext";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./Meetings.css";

const Meetings = () => {
  const { authUser } = useAuthContext();

  const [meetings, setMeetings] = useState([]);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState("");

  /* ==========================================
     FETCH ALL USER MEETINGS
  ========================================== */

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        setLoading(true);

        const res = await fetch(`${BASE_URL}/api/meetings`, {
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch meetings");
        }

        setMeetings(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, []);

  /* ==========================================
     FETCH SINGLE MEETING DETAILS
  ========================================== */

  const fetchMeetingDetails = async (id) => {
    try {
      setDetailsLoading(true);
      setSelectedMeeting(null);

      const res = await fetch(`${BASE_URL}/api/meetings/${id}`, {
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch meeting");
      }

      setSelectedMeeting(data);
    } catch (err) {
      alert(err.message);
    } finally {
      setDetailsLoading(false);
    }
  };

  /* ==========================================
     EXPORT PDF
  ========================================== */

  const exportPDF = async () => {
    const element = document.getElementById("report-content");
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    pdf.addImage(imgData, "PNG", 0, 0, 210, 297);
    pdf.save("Meeting_Report.pdf");
  };

  /* ==========================================
     RENDER
  ========================================== */

  return (
    <div className="meetings-container">
      <div className="meetings-header">
        <h2>📋 Meeting Reports</h2>
        <p>AI-generated Minutes of Meeting</p>
      </div>

      <div className="meetings-layout">
        {/* LEFT PANEL - MEETING LIST */}
        <div className="meetings-list">
          {loading && <p>Loading meetings...</p>}

          {error && <p className="error-text">{error}</p>}

          {!loading && meetings.length === 0 && (
            <p>No meetings found.</p>
          )}

          {meetings.map((meeting) => (
            <div
              key={meeting._id}
              className="meeting-card"
              onClick={() => fetchMeetingDetails(meeting._id)}
            >
              <h4>{meeting.title}</h4>
              <p className="meeting-date">
                {new Date(meeting.createdAt).toLocaleString()}
              </p>

              <span className={`status-badge ${meeting.status}`}>
                {meeting.status}
              </span>

              {meeting.summary && (
                <p className="meeting-summary-preview">
                  {meeting.summary.substring(0, 80)}...
                </p>
              )}

              {/* 🔥 SHOW DURATION IN CARD */}
              {meeting.durationMinutes > 0 && (
                <p className="meeting-duration">
                  ⏱️ {meeting.durationMinutes.toFixed(1)} min
                </p>
              )}
            </div>
          ))}
        </div>

        {/* RIGHT PANEL - DETAILS */}
        <div className="meeting-details">
          {detailsLoading && <p>Loading meeting details...</p>}

          {!detailsLoading && !selectedMeeting && (
            <div className="empty-state">
              <p>Select a meeting to view details</p>
            </div>
          )}

          {selectedMeeting && (
            <div className="meeting-full-view" id="report-content">
              <h3>{selectedMeeting.title}</h3>

              {/* 🔥 ANALYTICS SECTION */}
              <div className="section analytics-section">
                <h4>📊 Meeting Analytics</h4>
                <div className="analytics-grid">
                  <div className="metric">
                    <span className="metric-label">Duration</span>
                    <span className="metric-value">
                      {selectedMeeting.durationMinutes?.toFixed(1) || 0} min
                    </span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Confidence</span>
                    <span className="metric-value">
                      {selectedMeeting.confidenceScore || 0}%
                    </span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Tone</span>
                    <span
                      className={`metric-value sentiment-${selectedMeeting.sentiment?.toLowerCase()}`}
                    >
                      {selectedMeeting.sentiment || "Neutral"}
                    </span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Participants</span>
                    <span className="metric-value">
                      {(selectedMeeting.participants?.length || 0) + 1}
                    </span>
                  </div>
                </div>
              </div>

              {/* EXISTING SECTIONS */}
              <div className="section">
                <h4>📌 Summary</h4>
                <p>{selectedMeeting.summary}</p>
              </div>

              <div className="section">
                <h4>📝 Key Discussion Points</h4>
                <ul>
                  {selectedMeeting.keyPoints?.map((point, idx) => (
                    <li key={idx}>{point}</li>
                  ))}
                </ul>
              </div>

              <div className="section">
                <h4>✅ Decisions Taken</h4>
                <ul>
                  {selectedMeeting.decisions?.map((decision, idx) => (
                    <li key={idx}>{decision}</li>
                  ))}
                </ul>
              </div>

              <div className="section">
                <h4>📍 Action Items</h4>
                <ul>
                  {selectedMeeting.actionItems?.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="section">
                <h4>📄 Full Meeting Report</h4>
                <pre className="report-box">
                  {selectedMeeting.meetingReport}
                </pre>
              </div>

              {/* 🔥 EXPORT BUTTON */}
              <div className="export-actions">
                <button className="export-btn" onClick={exportPDF}>
                  📥 Export as PDF
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Meetings;