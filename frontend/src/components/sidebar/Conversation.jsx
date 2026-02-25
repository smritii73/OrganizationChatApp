	import { useSocketContext } from "../../context/SocketContext";
	import useConversation from "../../zustand/useConversation";
	import "./Conversation.css";

	const Conversation = ({ contact, lastIdx, emoji }) => {
		const { selectedConversation, setSelectedConversation, typingUsers } = useConversation();

		const { onlineUsers } = useSocketContext();
		const isTyping = typingUsers[contact._id]; // ✅ now this works
		const isSelected = selectedConversation?._id === contact._id;
		const isOnline = onlineUsers.includes(contact._id);

		return (
			<>
				<div
					className={`conversation-item ${isSelected ? "conversation-selected" : ""}`}
					onClick={() => setSelectedConversation(contact)}
				>
					<div className="conversation-avatar">
						<img src={contact.profilePic} alt="avatar" />
						{isOnline && <span className="online-dot"></span>}
					</div>

					<div className="conversation-content">
						<div className="conversation-name">
							{contact.fullName}
						</div>

						{isTyping && (
							<div className="typing-status">
								Typing...
							</div>
						)}
					</div>

					<div className="conversation-emoji">
						{emoji}
					</div>
				</div>

				{!lastIdx && <div className="conversation-divider" />}
			</>
		);
	};

	export default Conversation;