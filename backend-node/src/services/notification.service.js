const nodemailer = require('nodemailer');
const twilio = require('twilio');
const Notification = require('../models/Notification.model');
const User = require('../models/User.model');

class NotificationService {
    constructor() {
        this.io = null;
        this.emailEnabled = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
        this.smsEnabled = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER);

        if (this.emailEnabled) {
            this.mailer = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT || '587', 10),
                secure: process.env.SMTP_PORT === '465',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            });
        } else {
            console.warn('[notification.service] Email not configured (missing SMTP_HOST/SMTP_USER/SMTP_PASS) — email notifications are disabled.');
        }

        if (this.smsEnabled) {
            this.twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        } else {
            console.warn('[notification.service] SMS not configured (missing TWILIO_ACCOUNT_SID/TWILIO_AUTH_TOKEN/TWILIO_PHONE_NUMBER) — SMS notifications are disabled.');
        }
    }

    setIO(io) {
        this.io = io;
    }

    /**
     * Save an in-app notification to MongoDB and push it live to the user's socket room
     */
    async createAndEmit({ userId, type = 'system', title, message, link = null, metadata = {} }) {
        if (!userId) return null;
        try {
            const notification = await Notification.create({
                userId,
                type,
                title,
                message,
                link,
                metadata
            });

            if (this.io) {
                this.io.to(`user:${userId.toString()}`).emit('notification', notification);
            }

            return notification;
        } catch (err) {
            console.error('[notification.service] Failed to create notification:', err.message);
            return null;
        }
    }

    /**
     * Notify all admin users
     */
    async notifyAdmins({ type = 'system', title, message, link = '/admin/matches', metadata = {} }) {
        try {
            const admins = await User.find({ role: 'admin' }).select('_id');
            await Promise.all(
                admins.map((admin) =>
                    this.createAndEmit({
                        userId: admin._id,
                        type,
                        title,
                        message,
                        link,
                        metadata
                    })
                )
            );
        } catch (err) {
            console.error('[notification.service] Failed to notify admins:', err.message);
        }
    }

    /**
     * Triggered when AI creates a new match between a missing person and a sighting
     */
    async notifyMatchFound({ missingPerson, sighting, match }) {
        const score = Math.round(match.similarityScore || 0);
        const personName = missingPerson?.fullName || 'your missing person report';
        const metadata = {
            matchId: match._id,
            missingPersonId: missingPerson?._id,
            sightingId: sighting?._id,
            similarityScore: score
        };

        const missingReporterId = missingPerson?.createdBy?._id || missingPerson?.createdBy;
        const sightingReporterId = sighting?.reportedBy?._id || sighting?.reportedBy;

        // Notify the user who reported the missing person
        if (missingReporterId) {
            await this.createAndEmit({
                userId: missingReporterId,
                type: 'match_found',
                title: 'Potential Match Found',
                message: `AI found a ${score}% potential match for ${personName}. An administrator is reviewing it.`,
                link: `/citizen/missing/${missingPerson._id}`,
                metadata
            });
        }

        // Notify the user who submitted the sighting (if different)
        if (sightingReporterId && sightingReporterId.toString() !== missingReporterId?.toString()) {
            await this.createAndEmit({
                userId: sightingReporterId,
                type: 'match_found',
                title: 'Your Sighting Matched a Case',
                message: `Your sighting report has a ${score}% potential match with a missing person case and is under review.`,
                link: `/citizen/sighting/${sighting._id}`,
                metadata
            });
        }

        // Notify admins to review
        await this.notifyAdmins({
            type: 'match_found',
            title: 'New AI Match to Review',
            message: `${score}% match found for ${personName}.`,
            link: '/admin/matches',
            metadata
        });
    }

    /**
     * Triggered when an admin verifies a match
     */
    async notifyMatchVerified({ missingPerson, sighting, match }) {
        const score = Math.round(match.similarityScore || 0);
        const personName = missingPerson?.fullName || 'your missing person report';
        const metadata = {
            matchId: match._id,
            missingPersonId: missingPerson?._id,
            sightingId: sighting?._id,
            similarityScore: score
        };

        const missingReporterId = missingPerson?.createdBy?._id || missingPerson?.createdBy;
        const sightingReporterId = sighting?.reportedBy?._id || sighting?.reportedBy;

        if (missingReporterId) {
            await this.createAndEmit({
                userId: missingReporterId,
                type: 'match_verified',
                title: 'Match Verified!',
                message: `An administrator has verified a ${score}% match for ${personName}. Open the report for details.`,
                link: `/citizen/missing/${missingPerson._id}`,
                metadata
            });
        }

        if (sightingReporterId && sightingReporterId.toString() !== missingReporterId?.toString()) {
            await this.createAndEmit({
                userId: sightingReporterId,
                type: 'match_verified',
                title: 'Sighting Match Verified',
                message: `Thank you! Your sighting report was verified as a match for ${personName}.`,
                link: `/citizen/sighting/${sighting._id}`,
                metadata
            });
        }

        // Also send email/SMS if configured
        if (missingPerson) {
            return this.notifyFamilyOfMatch(missingPerson, match);
        }
        return { emailSent: false, smsSent: false, errors: [] };
    }

    /**
     * Triggered when an admin rejects a match
     */
    async notifyMatchRejected({ missingPerson, sighting, match, reason }) {
        const personName = missingPerson?.fullName || 'your missing person report';
        const sightingReporterId = sighting?.reportedBy?._id || sighting?.reportedBy;

        if (sightingReporterId) {
            await this.createAndEmit({
                userId: sightingReporterId,
                type: 'match_rejected',
                title: 'Match Reviewed',
                message: `A potential match from your sighting for ${personName} was reviewed and ruled out.${reason ? ` Note: ${reason}` : ''}`,
                link: `/citizen/sighting/${sighting._id}`,
                metadata: { matchId: match._id, sightingId: sighting?._id }
            });
        }
    }

    /**
     * Triggered when a sighting status changes
     */
    async notifySightingStatusChange({ sighting, status }) {
        const reporterId = sighting?.reportedBy?._id || sighting?.reportedBy;
        if (!reporterId) return;

        await this.createAndEmit({
            userId: reporterId,
            type: 'sighting_status',
            title: 'Sighting Report Updated',
            message: `Your sighting report status has been updated to "${status}".`,
            link: `/citizen/sighting/${sighting._id}`,
            metadata: { sightingId: sighting._id }
        });
    }

    /**
     * Triggered when a missing person status changes
     */
    async notifyMissingPersonStatusChange({ missingPerson, status }) {
        const reporterId = missingPerson?.createdBy?._id || missingPerson?.createdBy;
        if (!reporterId) return;

        await this.createAndEmit({
            userId: reporterId,
            type: 'missing_status',
            title: 'Missing Person Report Updated',
            message: `The status for ${missingPerson.fullName} has been updated to "${status}".`,
            link: `/citizen/missing/${missingPerson._id}`,
            metadata: { missingPersonId: missingPerson._id }
        });
    }

    /**
     * Existing Email + SMS notification for verified matches
     */
    async notifyFamilyOfMatch(missingPerson, match) {
        const result = { emailSent: false, smsSent: false, errors: [] };
        const contact = missingPerson.contactInfo || {};

        const subject = `Possible match found for ${missingPerson.fullName}`;
        const messageBody =
            `Hello ${contact.name || ''},\n\n` +
            `A potential match has been verified for ${missingPerson.fullName} ` +
            `(similarity score: ${match.similarityScore}%).\n\n` +
            `Please log in to the platform or contact the coordinating team as soon as possible ` +
            `to review the details and next steps.\n\n` +
            `Match reference: ${match._id}`;

        if (this.emailEnabled && contact.email) {
            try {
                await this.mailer.sendMail({
                    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
                    to: contact.email,
                    subject,
                    text: messageBody
                });
                result.emailSent = true;
            } catch (err) {
                console.error('[notification.service] Failed to send email:', err.message);
                result.errors.push(`email: ${err.message}`);
            }
        }

        if (this.smsEnabled && contact.phone) {
            try {
                await this.twilioClient.messages.create({
                    body: `${subject}. Similarity: ${match.similarityScore}%. Please check the platform for details. Ref: ${match._id}`,
                    from: process.env.TWILIO_PHONE_NUMBER,
                    to: contact.phone
                });
                result.smsSent = true;
            } catch (err) {
                console.error('[notification.service] Failed to send SMS:', err.message);
                result.errors.push(`sms: ${err.message}`);
            }
        }

        return result;
    }
}

module.exports = new NotificationService();