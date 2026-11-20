const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        type: {
            type: String,
            enum: [
                'match_found',
                'match_verified',
                'match_rejected',
                'sighting_status',
                'missing_status',
                'system'
            ],
            default: 'system'
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        message: {
            type: String,
            required: true,
            trim: true
        },
        link: {
            type: String,
            default: null
        },
        metadata: {
            matchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Match' },
            missingPersonId: { type: mongoose.Schema.Types.ObjectId, ref: 'MissingPerson' },
            sightingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sighting' },
            similarityScore: Number
        },
        isRead: {
            type: Boolean,
            default: false,
            index: true
        },
        readAt: {
            type: Date,
            default: null
        }
    },
    { timestamps: true }
);

notificationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);