import { GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "../config/aws";
import { env } from "../config/env";
import { prisma } from "../config/prisma";

const getArchiveKey = (projectId: string, eventId: string) =>
  `events/${projectId}/${eventId}.json`;

const isNotFoundError = (error: unknown) => {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as {
    name?: string;
    $metadata?: { httpStatusCode?: number };
  };

  return (
    candidate.name === "NotFound" ||
    candidate.name === "NoSuchKey" ||
    candidate.$metadata?.httpStatusCode === 404
  );
};

export const getEventArchiveDownloadUrl = async (
  eventId: string,
  userId: string
) => {
  if (!env.eventArchiveBucket) {
    throw new Error("EVENT_ARCHIVE_BUCKET is not configured");
  }

  const event = await prisma.apiEvent.findUnique({
    where: { id: eventId },
    include: {
      project: true
    }
  });

  if (!event) {
    throw new Error("Event not found");
  }

  const membership = await prisma.organizationMember.findUnique({
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
    await s3Client.send(
      new HeadObjectCommand({
        Bucket: env.eventArchiveBucket,
        Key: key
      })
    );
  } catch (error) {
    if (isNotFoundError(error)) {
      throw new Error(
        "Archive is not ready yet. Retry in a few seconds."
      );
    }
    throw error;
  }

  const expiresInSeconds = 15 * 60;
  const fileName = `debugpilot-event-${event.id}.json`;

  const downloadUrl = await getSignedUrl(
    s3Client,
    new GetObjectCommand({
      Bucket: env.eventArchiveBucket,
      Key: key,
      ResponseContentType: "application/json",
      ResponseContentDisposition: `attachment; filename="${fileName}"`
    }),
    { expiresIn: expiresInSeconds }
  );

  return {
    eventId: event.id,
    key,
    downloadUrl,
    expiresInSeconds
  };
};
