import User from "../models/user.model.js";
import Contact from "../models/contacts.model.js";
import { getIO, getReceiverSocketId } from "../socket/socket.js";

/* GET USERS FOR SIDEBAR (NOT USED - Use getConversations instead) */

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    // ✅ FIXED - Use Contact model instead of User.contacts
    const userContacts = await Contact.findOne({ user: loggedInUserId })
      .populate("contacts", "-password");

    if (!userContacts) {
      return res.status(200).json([]);
    }

    res.status(200).json(userContacts.contacts);
  } catch (error) {
    console.error("Error in getUsersForSidebar:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/* ============================================================
   ADD CONTACT
============================================================ */

export const addContact = async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  try {
    // Find user to add (case insensitive)
    const userToAdd = await User.findOne({
      username: new RegExp("^" + username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "$", "i"),
    });

    if (!userToAdd) {
      return res.status(404).json({ error: "User not found" });
    }

    const loggedInUserId = req.user._id;

    // ✅ Check if trying to add themselves
    if (userToAdd._id.equals(loggedInUserId)) {
      return res.status(400).json({ error: "You cannot add yourself" });
    }

    // ✅ FIXED - Use Contact model for both users
    let loggedInUserContacts = await Contact.findOne({ user: loggedInUserId });
    
    if (!loggedInUserContacts) {
      loggedInUserContacts = new Contact({
        user: loggedInUserId,
        contacts: []
      });
    }

    // Check if already a contact
    if (loggedInUserContacts.contacts.includes(userToAdd._id)) {
      return res.status(400).json({ error: "User is already a contact" });
    }

    // Add to logged-in user's contacts
    loggedInUserContacts.contacts.push(userToAdd._id);
    await loggedInUserContacts.save();

    // Add logged-in user to the other user's contacts
    let otherUserContacts = await Contact.findOne({ user: userToAdd._id });
    
    if (!otherUserContacts) {
      otherUserContacts = new Contact({
        user: userToAdd._id,
        contacts: []
      });
    }

    if (!otherUserContacts.contacts.includes(loggedInUserId)) {
      otherUserContacts.contacts.push(loggedInUserId);
      await otherUserContacts.save();
    }

    // ✅ Emit socket event
    const receiverSocketId = getReceiverSocketId(userToAdd._id.toString());

    if (receiverSocketId) {
      try {
        const io = getIO();
        const loggedInUser = await User.findById(loggedInUserId).select("-password");
        
        io.to(receiverSocketId).emit("contactAdded", {
          userId: loggedInUser._id,
          username: loggedInUser.username,
          fullName: loggedInUser.fullName,
          profilePic: loggedInUser.profilePic || null,
          message: `${loggedInUser.username} added you as a contact`,
          createdAt: new Date(),
        });
      } catch (socketError) {
        console.error("Socket emit error:", socketError);
        // Don't fail the request if socket fails
      }
    }

    res.status(200).json({ 
      message: "Contact added successfully",
      contact: {
        _id: userToAdd._id,
        username: userToAdd.username,
        fullName: userToAdd.fullName,
        profilePic: userToAdd.profilePic
      }
    });
  } catch (error) {
    console.error("Error in addContact:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/* ============================================================
   REMOVE CONTACT (OPTIONAL - Add this feature)
============================================================ */

export const removeContact = async (req, res) => {
  const { contactId } = req.params;

  try {
    const loggedInUserId = req.user._id;

    // Remove from logged-in user's contacts
    const loggedInUserContacts = await Contact.findOne({ user: loggedInUserId });
    
    if (!loggedInUserContacts) {
      return res.status(404).json({ error: "Contact list not found" });
    }

    loggedInUserContacts.contacts = loggedInUserContacts.contacts.filter(
      id => !id.equals(contactId)
    );
    await loggedInUserContacts.save();

    // Remove from other user's contacts
    const otherUserContacts = await Contact.findOne({ user: contactId });
    
    if (otherUserContacts) {
      otherUserContacts.contacts = otherUserContacts.contacts.filter(
        id => !id.equals(loggedInUserId)
      );
      await otherUserContacts.save();
    }

    res.status(200).json({ message: "Contact removed successfully" });
  } catch (error) {
    console.error("Error in removeContact:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};