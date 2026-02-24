import mongoose from "mongoose";
const languageSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true, // ✅ This creates the index automatically
    },
    language: {
        type: String,
        required: true,
        default: "en",
    }
}, { timestamps: true });
export const Language = mongoose.model("Language", languageSchema);