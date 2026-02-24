import { Language } from "../models/userLanguage.js";
import User from "../models/user.model.js";

/* SET LANGUAGE */

export const setLanguage = async (req, res) => {
  try {
    const { userId, language } = req.body;

    if (!userId || !language) {
      return res.status(400).json({ error: "UserId and language are required" });
    }

    // Validate language code (add more as needed)
    const validLanguages = ["en", "es", "fr", "de", "zh", "ja", "hi", "ar", "pt", "ru"];
    if (!validLanguages.includes(language)) {
      return res.status(400).json({ 
        error: "Invalid language code",
        validLanguages 
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) { return res.status(404).json({ error: "User not found" }); }

    // ✅ Update user's language in User model
    user.language = language;
    await user.save();

    // ✅ Also update/create in Language collection for backwards compatibility
    const langDoc = await Language.findOneAndUpdate(
      { userId },
      { language },
      { new: true, upsert: true }
    );

    res.status(200).json({ 
      message: `Language updated to ${language}`, 
      language: langDoc.language 
    });
  } catch (error) {
    console.error("Error updating language:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* GET LANGUAGE */

export const getLanguage = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "UserId is required" });
    }

    // Try to get from User model first (primary source)
    const user = await User.findById(userId).select("language");
    
    if (user && user.language) {
      return res.status(200).json({ language: user.language });
    }

    // Fallback to Language collection
    const langDoc = await Language.findOne({ userId });
    
    if (langDoc) {
      return res.status(200).json({ language: langDoc.language });
    }

    // Default to English
    res.status(200).json({ language: "en" });
  } catch (error) {
    console.error("Error getting language:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};