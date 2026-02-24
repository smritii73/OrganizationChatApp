// migrate.js
import mongoose from 'mongoose';
import User from './models/user.model.js';
import Contact from './models/contacts.model.js';
import dotenv from 'dotenv';

dotenv.config();

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI_URI);
        console.log('Connected to MongoDB');

        // Get all users with contacts array
        const users = await User.find({ contacts: { $exists: true, $ne: [] } });
        
        for (const user of users) {
            if (user.contacts && user.contacts.length > 0) {
                // Check if Contact document exists
                let contactDoc = await Contact.findOne({ user: user._id });
                
                if (!contactDoc) {
                    // Create new Contact document
                    contactDoc = new Contact({
                        user: user._id,
                        contacts: user.contacts
                    });
                } else {
                    // Merge contacts (avoid duplicates)
                    const existingIds = contactDoc.contacts.map(id => id.toString());
                    const newContacts = user.contacts.filter(
                        id => !existingIds.includes(id.toString())
                    );
                    contactDoc.contacts.push(...newContacts);
                }
                
                await contactDoc.save();
                console.log(`Migrated contacts for user: ${user.username}`);
            }
        }

        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();