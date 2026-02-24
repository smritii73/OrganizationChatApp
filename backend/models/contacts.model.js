import mongoose from 'mongoose';
const contactSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true, // This creates the index automatically
    },
    contacts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
}, { timestamps: true });
const Contact = mongoose.model('Contact', contactSchema);
export default Contact;