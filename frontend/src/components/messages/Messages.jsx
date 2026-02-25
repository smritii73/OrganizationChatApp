import { useEffect, useRef } from "react";
import useGetMessages from "../../hooks/useGetMessages";
import MessageSkeleton from "../skeletons/MessageSkeleton";
import Message from "./Message";
import useListenMessages from "../../hooks/useListenMessages";

const Messages = () => {
	const { messages, loading } = useGetMessages();
	useListenMessages();
	const lastMessageRef = useRef(null);

	useEffect(() => {
		setTimeout(() => {
			lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
		}, 100);
	}, [messages]);

	const safeMessages = Array.isArray(messages) ? messages : [];

	return (
		<div className="messages-container custom-scrollbar">
			{!loading &&
				safeMessages.map((message, index) => (
					<div
						key={message._id}
						ref={index === safeMessages.length - 1 ? lastMessageRef : null}
						className="msg-appear"
						style={{ animationDelay: `${Math.min(index * 0.04, 0.4)}s` }}
					>
						<Message message={message} />
					</div>
				))}

			{loading &&
				[...Array(3)].map((_, idx) => (
					<MessageSkeleton key={idx} />
				))}

			{!loading && safeMessages.length === 0 && (
				<div className="empty-chat">
					<span className="empty-icon">💬</span>
					<p>Start the conversation</p>
					<span className="empty-hint">Say something nice ✨</span>
				</div>
			)}
		</div>
	);
};

export default Messages;