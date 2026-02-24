import { useEffect, useState, useRef } from "react";
import useConversation from "../../zustand/useConversation";
import MessageInput from "./MessageInput";
import Messages from "./Messages";
import { TiMessages } from "react-icons/ti";
import { IoArrowBack } from "react-icons/io5";
import { FaPhone, FaVideo, FaPhoneSlash, FaPhoneAlt } from "react-icons/fa";
import { useAuthContext } from "../../context/AuthContext";
import { useSocketContext } from "../../context/SocketContext";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { BASE_URL, CREATE_MEETING } from "../../Url";
import "./MessageContainer.css";

const MessageContainer = ({ onBack }) => {
  const { authUser } = useAuthContext();
  const { selectedConversation } = useConversation();
  const { socket, onlineUsers } = useSocketContext();

  const [isCallActive, setIsCallActive] = useState(false);
  const [callType, setCallType] = useState(null);
  const [callStatus, setCallStatus] = useState("");
  const [incomingCall, setIncomingCall] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [speechError, setSpeechError] = useState("");

  const zegoInstance = useRef(null);
  const meetingIdRef = useRef(null);
  const recognitionRef = useRef(null);

  const isSelectedUserOnline =
    selectedConversation &&
    onlineUsers.some(
      (id) => id.toString() === selectedConversation._id.toString()
    );

  /* ===============================
     🎙 BROWSER SPEECH RECOGNITION
  =============================== */

  const checkSpeechRecognitionSupport = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      const msg = "❌ Speech Recognition NOT supported. Please use Chrome or Edge browser.";
      console.error(msg);
      setSpeechError(msg);
      alert(msg);
      return false;
    }
    
    console.log("✅ Speech Recognition is supported!");
    return true;
  };

  const startSpeechRecognition = () => {
    console.log("🎬 ATTEMPTING TO START SPEECH RECOGNITION");
    
    if (!checkSpeechRecognitionSupport()) {
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    console.log("⚙️ Speech Recognition configured:");
    console.log("- continuous:", recognition.continuous);
    console.log("- interimResults:", recognition.interimResults);
    console.log("- lang:", recognition.lang);

    recognition.onstart = () => {
      console.log("🎙️ ✅ SPEECH RECOGNITION STARTED SUCCESSFULLY!");
      setIsRecording(true);
      setSpeechError("");
    };

    recognition.onresult = (event) => {
      console.log("🎤 Speech detected! Processing results...");
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPiece = event.results[i][0].transcript;
        const confidence = event.results[i][0].confidence;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPiece + ". ";
          console.log(`✅ FINAL (confidence: ${confidence}): "${transcriptPiece}"`);
        } else {
          interimTranscript += transcriptPiece;
          console.log(`⏳ INTERIM: "${transcriptPiece}"`);
        }
      }

      if (finalTranscript) {
        setTranscript((prev) => {
          const updated = prev + finalTranscript;
          console.log(`📝 Transcript updated! Total length: ${updated.length} chars`);
          console.log(`📝 Full transcript so far: "${updated}"`);
          return updated;
        });
      }
    };

    recognition.onerror = (event) => {
      console.error("❌ SPEECH RECOGNITION ERROR:");
      console.error("Error type:", event.error);
      console.error("Error message:", event.message);
      
      const errorMsg = `Speech error: ${event.error}`;
      setSpeechError(errorMsg);
      
      if (event.error === "no-speech") {
        console.log("⚠️ No speech detected, but still listening...");
      } else if (event.error === "not-allowed") {
        alert("🎤 MICROPHONE PERMISSION DENIED!\n\nPlease:\n1. Click the microphone icon in the address bar\n2. Allow microphone access\n3. Refresh the page and try again");
        setIsRecording(false);
      } else if (event.error === "audio-capture") {
        alert("🎤 NO MICROPHONE DETECTED!\n\nPlease:\n1. Connect a microphone\n2. Check system settings\n3. Try again");
        setIsRecording(false);
      } else {
        alert(`Speech recognition error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      console.log("🛑 Speech recognition ended");
      
      // Auto-restart if still in call
      if (isCallActive && callStatus === "connected" && recognitionRef.current) {
        console.log("🔄 Auto-restarting speech recognition...");
        setTimeout(() => {
          try {
            recognition.start();
          } catch (err) {
            console.error("❌ Failed to restart recognition:", err);
            setIsRecording(false);
          }
        }, 100);
      } else {
        setIsRecording(false);
        console.log("ℹ️ Not restarting (call ended or manually stopped)");
      }
    };

    try {
      console.log("🚀 Starting recognition.start()...");
      recognition.start();
      recognitionRef.current = recognition;
      console.log("✅ recognition.start() called successfully");
      
      // Give it 2 seconds to see if it actually starts
      setTimeout(() => {
        if (!isRecording) {
          console.error("⚠️ WARNING: Recognition didn't start after 2 seconds");
          console.log("Check browser permissions!");
        }
      }, 2000);
      
    } catch (err) {
      console.error("❌ FAILED TO START RECOGNITION:");
      console.error("Error:", err);
      console.error("Stack:", err.stack);
      alert(`Failed to start speech recognition:\n${err.message}\n\nMake sure you're using Chrome/Edge and have granted microphone permissions.`);
      setSpeechError(`Failed to start: ${err.message}`);
    }
  };

  const stopSpeechRecognition = () => {
    console.log("🛑 Stopping speech recognition...");
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        recognitionRef.current = null;
        setIsRecording(false);
        console.log("✅ Speech recognition stopped successfully");
      } catch (err) {
        console.error("❌ Error stopping recognition:", err);
      }
    } else {
      console.log("ℹ️ No recognition to stop");
    }
  };

  /* ===============================
     CREATE MEETING
  =============================== */

  const createMeetingOnStart = async () => {
    try {
      console.log("📝 Creating meeting...");
      const res = await fetch(CREATE_MEETING, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: `Meeting with ${selectedConversation.fullName}`,
          participants: [selectedConversation._id],
        }),
      });

      const data = await res.json();

      if (res.ok) {
        meetingIdRef.current = data._id;
        console.log("✅ Meeting created successfully!");
        console.log("Meeting ID:", data._id);
        console.log("Meeting title:", data.title);
      } else {
        console.error("❌ Meeting creation failed:", data);
        alert("Failed to create meeting: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.error("❌ Meeting creation error:", error);
      alert("Error creating meeting: " + error.message);
    }
  };

  /* ===============================
     SOCKET EVENTS
  =============================== */

  useEffect(() => {
    if (!socket) return;

    socket.on("incomingCall", (data) => {
      console.log("📞 Incoming call:", data);
      setIncomingCall(data);
    });

    socket.on("callAccepted", async () => {
      console.log("✅ Call accepted by remote user");
      setCallStatus("connected");
      console.log("🎬 Now creating meeting and starting speech recognition...");
      await createMeetingOnStart();
      startSpeechRecognition();
    });

    socket.on("callEnded", () => {
      console.log("📴 Call ended by remote user");
      handleCallCleanup();
    });

    return () => {
      socket.off("incomingCall");
      socket.off("callAccepted");
      socket.off("callEnded");
    };
  }, [socket, selectedConversation, isCallActive, callStatus]);

  /* ===============================
     START CALL
  =============================== */

  const startCall = (type) => {
    if (!selectedConversation || !isSelectedUserOnline) {
      alert("User is not online!");
      return;
    }

    console.log(`📞 Starting ${type} call with ${selectedConversation.fullName}`);
    setCallType(type);
    setIsCallActive(true);
    setCallStatus("calling");

    socket.emit("callUser", {
      userToCall: selectedConversation._id,
      callType: type,
      caller: authUser,
      roomID: `chat_${[authUser._id, selectedConversation._id]
        .sort()
        .join("_")}`,
    });
  };

  /* ===============================
     ACCEPT CALL
  =============================== */

  const acceptCall = async () => {
    if (!incomingCall) return;

    console.log("✅ Accepting incoming call");
    setCallType(incomingCall.callType);
    setIsCallActive(true);
    setCallStatus("connected");
    setIncomingCall(null);

    console.log("🎬 Now creating meeting and starting speech recognition...");
    await createMeetingOnStart();
    startSpeechRecognition();

    socket.emit("acceptCall", {
      callerId: incomingCall.caller._id,
      roomID: incomingCall.roomID,
    });
  };

  /* ===============================
     END CALL
  =============================== */

  const handleCallCleanup = () => {
    console.log("🧹 Cleaning up call...");
    stopSpeechRecognition();
    setIsCallActive(false);
    setCallType(null);
    setCallStatus("");
    setIncomingCall(null);

    if (zegoInstance.current) {
      try {
        zegoInstance.current.destroy();
        zegoInstance.current = null;
        console.log("✅ Zego instance destroyed");
      } catch (err) {
        console.error("❌ Error destroying Zego:", err);
      }
    }
  };

  const endCall = async () => {
    console.log("📴 ========== ENDING CALL ==========");
    stopSpeechRecognition();

    socket.emit("endCall", {
      userToCall: selectedConversation._id,
    });

    console.log("📊 FINAL STATS:");
    console.log("- Transcript length:", transcript.length, "chars");
    console.log("- Meeting ID:", meetingIdRef.current);
    console.log("📄 FULL TRANSCRIPT:");
    console.log(transcript || "(empty)");
    console.log("=====================================");

    if (!meetingIdRef.current) {
      console.error("❌ NO MEETING ID! Cannot save report.");
      alert("Error: Meeting was not created properly. Cannot save transcript.");
      handleCallCleanup();
      setTranscript("");
      return;
    }

    if (transcript.trim() === "") {
      console.warn("⚠️ TRANSCRIPT IS EMPTY!");
      const proceed = confirm(
        "No speech was captured during the call.\n\n" +
        "This could be because:\n" +
        "• Microphone wasn't enabled\n" +
        "• Speech recognition didn't start\n" +
        "• No one spoke during the call\n\n" +
        "Do you want to save an empty meeting report anyway?"
      );
      
      if (!proceed) {
        handleCallCleanup();
        setTranscript("");
        meetingIdRef.current = null;
        return;
      }
    }

    try {
      console.log("📤 Sending transcript to backend...");
      const url = `${BASE_URL}/api/meetings/${meetingIdRef.current}/generate-report`;
      console.log("URL:", url);
      console.log("Transcript to send:", transcript);

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ transcript }),
      });

      const data = await res.json();
      console.log("📥 Backend response:", data);

      if (res.ok) {
        console.log("✅ REPORT GENERATED SUCCESSFULLY!");
        console.log("Meeting status:", data.status);
        console.log("Summary:", data.summary);
        alert("✅ Meeting report generated successfully!\n\nCheck the Meetings page to view it.");
      } else {
        console.error("❌ Report generation failed!");
        console.error("Status:", res.status);
        console.error("Error:", data.error);
        alert(`Failed to generate report:\n${data.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("❌ ERROR SENDING TRANSCRIPT:");
      console.error(error);
      alert(`Error generating report:\n${error.message}`);
    }

    handleCallCleanup();
    setTranscript("");
    meetingIdRef.current = null;
    console.log("📴 ========== CALL ENDED ==========");
  };

  /* ===============================
     TEST BUTTON - MANUAL SPEECH TEST
  =============================== */

  const testSpeechRecognition = () => {
    console.log("🧪 TESTING SPEECH RECOGNITION");
    
    if (!checkSpeechRecognitionSupport()) {
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      console.log("🎙️ TEST: Recognition started! Speak now...");
      alert("Speech recognition test started!\n\nSpeak something now (you have 10 seconds).");
    };

    recognition.onresult = (event) => {
      for (let i = 0; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        console.log("🎤 TEST: Heard:", transcript);
        if (event.results[i].isFinal) {
          alert(`✅ Successfully captured:\n"${transcript}"\n\nSpeech recognition is working!`);
        }
      }
    };

    recognition.onerror = (event) => {
      console.error("❌ TEST ERROR:", event.error);
      alert(`Test failed: ${event.error}\n\nCheck console for details.`);
    };

    recognition.onend = () => {
      console.log("🛑 TEST: Recognition ended");
    };

    try {
      recognition.start();
    } catch (err) {
      console.error("❌ TEST: Failed to start:", err);
      alert(`Failed to start test:\n${err.message}`);
    }
  };

  /* ===============================
     ZEGOCLOUD INIT
  =============================== */

  const initializeCall = (element) => {
    if (!element || callStatus !== "connected") return;

    const roomID = `chat_${[authUser._id, selectedConversation._id]
      .sort()
      .join("_")}`;

    console.log("🎥 Initializing Zego call, room:", roomID);

    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      Number(import.meta.env.VITE_ZEGO_APP_ID),
      import.meta.env.VITE_ZEGO_SERVER_SECRET,
      roomID,
      authUser._id,
      authUser.fullName
    );

    const zp = ZegoUIKitPrebuilt.create(kitToken);
    zegoInstance.current = zp;

    zp.joinRoom({
      container: element,
      scenario: { mode: ZegoUIKitPrebuilt.OneONoneCall },
      showPreJoinView: false,
      turnOnMicrophoneWhenJoining: true,
      turnOnCameraWhenJoining: callType === "video",
    });

    console.log("✅ Zego call initialized");
  };

  /* ===============================
     UI
  =============================== */

  return (
    <div className="blur-bg">
      {incomingCall && !isCallActive && (
        <div className="incoming-call-notification">
          <h3>{incomingCall.caller.fullName}</h3>
          <p>Incoming {incomingCall.callType} call</p>
          <button onClick={acceptCall}>
            <FaPhoneAlt />
          </button>
          <button onClick={handleCallCleanup}>
            <FaPhoneSlash />
          </button>
        </div>
      )}

      {isCallActive && callStatus === "connected" && (
        <div className="call-modal-overlay">
          <div className="call-modal">
            <div className="call-header">
              {callType} Call with {selectedConversation?.fullName}
              {isRecording && (
                <span style={{ marginLeft: "10px", color: "#ff0000", fontWeight: "bold" }}>
                  🔴 RECORDING
                </span>
              )}
              {!isRecording && (
                <span style={{ marginLeft: "10px", color: "#ff9900", fontWeight: "bold" }}>
                  ⚠️ NOT RECORDING
                </span>
              )}
            </div>

            <div className="call-container">
              <div
                ref={initializeCall}
                style={{ width: "100%", height: "100%" }}
              />
            </div>

            {/* Enhanced Debug Panel */}
            <div style={{ 
              padding: "15px", 
              background: "rgba(0,0,0,0.8)", 
              color: "white",
              fontSize: "13px",
              borderRadius: "5px",
              margin: "10px"
            }}>
              <div style={{ fontWeight: "bold", marginBottom: "10px", color: "#00ff00" }}>
                📊 DEBUG INFO
              </div>
              <div>Meeting ID: <strong>{meetingIdRef.current || "❌ Not created"}</strong></div>
              <div>Transcript length: <strong style={{ color: transcript.length > 0 ? "#00ff00" : "#ff0000" }}>{transcript.length} chars</strong></div>
              <div>Recording: <strong style={{ color: isRecording ? "#00ff00" : "#ff0000" }}>{isRecording ? "✅ YES" : "❌ NO"}</strong></div>
              {speechError && (
                <div style={{ color: "#ff0000", marginTop: "5px" }}>Error: {speechError}</div>
              )}
              <div style={{ 
                marginTop: "10px", 
                padding: "8px", 
                background: "rgba(255,255,255,0.1)",
                borderRadius: "3px",
                maxHeight: "60px",
                overflow: "auto",
                fontSize: "11px"
              }}>
                <div style={{ color: "#888" }}>Last 150 chars:</div>
                <div style={{ color: "#0ff" }}>{transcript.slice(-150) || "(no text yet)"}</div>
              </div>
            </div>

            <button 
              onClick={endCall} 
              style={{ 
                marginTop: "10px",
                padding: "15px 30px",
                fontSize: "16px",
                fontWeight: "bold"
              }}
            >
              <FaPhoneSlash /> End Call & Generate Report
            </button>
          </div>
        </div>
      )}

      <div className="message-container">
        {!selectedConversation ? (
          <div className="no-chat-container">
            <p>Select a chat</p>
            <TiMessages />
          </div>
        ) : (
          <>
            <div className="chat-header">
              <button onClick={onBack}>
                <IoArrowBack />
              </button>

              <span>{selectedConversation.fullName}</span>

              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                {/* Test Button */}
                <button 
                  onClick={testSpeechRecognition}
                  style={{ 
                    background: "#4CAF50",
                    padding: "8px 12px",
                    fontSize: "12px"
                  }}
                  title="Test if speech recognition works on your browser"
                >
                  🧪 Test Mic
                </button>

                <button 
                  onClick={() => startCall("audio")}
                  disabled={!isSelectedUserOnline}
                  title={!isSelectedUserOnline ? "User is offline" : "Audio call"}
                >
                  <FaPhone />
                </button>

                <button 
                  onClick={() => startCall("video")}
                  disabled={!isSelectedUserOnline}
                  title={!isSelectedUserOnline ? "User is offline" : "Video call"}
                >
                  <FaVideo />
                </button>
              </div>
            </div>

            <div className="messages">
              <Messages />
            </div>

            <MessageInput />
          </>
        )}
      </div>
    </div>
  );
};

export default MessageContainer;