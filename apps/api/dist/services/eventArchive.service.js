"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEventArchiveDownloadUrl = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const aws_1 = require("../config/aws");
const env_1 = require("../config/env");
const prisma_1 = require("../config/prisma");
const getArchiveKey = (projectId, eventId) => `events/${projectId}/${eventId}.json`;
const isNotFoundError = (error) => {
    if (!error || typeof error !== "object") {
        return false;
    }
    const candidate = error;
    return (candidate.name === "NotFound" ||
        candidate.name === "NoSuchKey" ||
        candidate.$metadata?.httpStatusCode === 404);
};
const getEventArchiveDownloadUrl = async (eventId, userId) => {
    if (!env_1.env.eventArchiveBucket) {
        throw new Error("EVENT_ARCHIVE_BUCKET is not configured");
    }
    const event = await prisma_1.prisma.apiEvent.findUnique({
        where: { id: eventId },
        include: {
            project: true
        }
    });
    if (!event) {
        throw new Error("Event not found");
    }
    const membership = await prisma_1.prisma.organizationMember.findUnique({
        where: {
            userId_organizationId: {
                userId,
                organizationId: event.project.organizationId
            }
        }
    });
    if (!membership) {
        throw new Error("You do not have access to this event");
    }
    const key = getArchiveKey(event.projectId, event.id);
    try {
        await aws_1.s3Client.send(new client_s3_1.HeadObjectCommand({
            Bucket: env_1.env.eventArchiveBucket,
            Key: key
        }));
    }
    catch (error) {
        if (isNotFoundError(error)) {
            throw new Error("Archive is not ready yet. Retry in a few seconds.");
        }
        throw error;
    }
    const expiresInSeconds = 15 * 60;
    const fileName = `debugpilot-event-${event.id}.json`;
    const downloadUrl = await (0, s3_request_presigner_1.getSignedUrl)(aws_1.s3Client, new client_s3_1.GetObjectCommand({
        Bucket: env_1.env.eventArchiveBucket,
        Key: key,
        ResponseContentType: "application/json",
        ResponseContentDisposition: `attachment; filename="${fileName}"`
    }), { expiresIn: expiresInSeconds });
    return {
        eventId: event.id,
        key,
        downloadUrl,
        expiresInSeconds
    };
};
exports.getEventArchiveDownloadUrl = getEventArchiveDownloadUrl;
