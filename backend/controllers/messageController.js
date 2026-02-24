import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import Contact from "../models/contacts.model.js";
import User from "../models/user.model.js";
import { Language } from "../models/userLanguage.js";
import { getReceiverSocketId, getIO } from "../socket/socket.js";
import translate from "translate";

translate.engine = "google";

/* ============================================================
   SEND MESSAGE
============================================================ */

export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    // ✅ Validate message
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: "Message cannot be empty" });
    }

    // ✅ Validate receiver exists
    const receiverExists = await User.findById(receiverId);
    if (!receiverExists) {
      return res.status(404).json({ error: "Receiver not found" });
    }

    /* ==============================
       FIND OR CREATE CONVERSATION
    ============================== */

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    /* ==============================
       LANGUAGE FETCH & TRANSLATION
    ============================== */

    // ✅ Try User model first, then Language collection
    const sender = await User.findById(senderId).select("language");
    const receiver = await User.findById(receiverId).select("language");

    let fromLang = sender?.language || "en";
    let targetLang = receiver?.language || "en";

    // Fallback to Language collection if not in User
    if (!sender?.language) {
      const senderLangDoc = await Language.findOne({ userId: senderId });
      fromLang = senderLangDoc?.language || "en";
    }

    if (!receiver?.language) {
      const receiverLangDoc = await Language.findOne({ userId: receiverId });
      targetLang = receiverLangDoc?.language || "en";
    }

    let translatedText = message;

    // Only translate if languages differ
    if (fromLang !== targetLang) {
      try {
        translatedText = await translate(message, {
          from: fromLang,
          to: targetLang,
        });
      } catch (err) {
        console.error("Translation failed:", err);
        // Keep original message if translation fails
        translatedText = message;
      }
    }

    /* ==============================
       CREATE MESSAGE
    ============================== */

    const newMessage = new Message({
      senderId,
      receiverId,
      message: message.trim(),
      translatedMessage: translatedText,
    });

    conversation.messages.push(newMessage._id);

    // ✅ Save both in parallel for better performance
    await Promise.all([conversation.save(), newMessage.save()]);

    /* ==============================
       UPDATE CONTACTS (Both Sides)
    ============================== */

    // Add receiver to sender's contacts if not already there
    let senderContacts = await Contact.findOne({ user: senderId });
    if (!senderContacts) {
      senderContacts = new Contact({ user: senderId, contacts: [] });
    }
    if (!senderContacts.contacts.includes(receiverId)) {
      senderContacts.contacts.push(receiverId);
      await senderContacts.save();
    }

    // Add sender to receiver's contacts if not already there
    let receiverContacts = await Contact.findOne({ user: receiverId });
    if (!receiverContacts) {
      receiverContacts = new Contact({ user: receiverId, contacts: [] });
    }
    if (!receiverContacts.contacts.includes(senderId)) {
      receiverContacts.contacts.push(senderId);
      await receiverContacts.save();
    }

    /* ==============================
       SOCKET EMIT
    ============================== */

    const receiverSocketId = getReceiverSocketId(receiverId.toString());

    if (receiverSocketId) {
      try {
        const io = getIO();
        io.to(receiverSocketId).emit("newMessage", {
          ...newMessage.toObject(),
          translatedMessage: translatedText,
        });
      } catch (socketError) {
        console.error("Socket emit error:", socketError);
        // Don't fail the request if socket fails
      }
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessage:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* ============================================================
   GET MESSAGES
============================================================ */

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const senderId = req.user._id;

    // ✅ Validate user exists
    const userExists = await User.findById(userToChatId);
    if (!userExists) {
      return res.status(404).json({ error: "User not found" });
    }

    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, userToChatId] },
    }).populate("messages");

    if (!conversation) {
      return res.status(200).json([]);
    }

    res.status(200).json(conversation.messages);
  } catch (error) {
    console.error("Error in getMessages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};