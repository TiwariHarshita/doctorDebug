import { SendMessageCommand } from "@aws-sdk/client-sqs";
import { sqsClient } from "../config/aws";
import { env } from "../config/env";

export type EventArchiveMessage = {
  schemaVersion: 1;
  eventId: string;
  projectId: string;
  incidentId: string | null;
  level: string;
  message: string;
  stack: string | null;
  service: string | null;
  route: string | null;
  environment: string | null;
  metadata: unknown;
  createdAt: string;
};

export const enqueueEventArchive = async (
  message: EventArchiveMessage
): Promise<boolean> => {
  if (!env.eventArchiveQueueUrl) {
    console.warn(
      "EVENT_ARCHIVE_QUEUE_URL is not set; skipping asynchronous event archival"
    );
    return false;
  }

  await sqsClient.send(
    new SendMessageCommand({
      QueueUrl: env.eventArchiveQueueUrl,
      MessageBody: JSON.stringify(message)
    })
  );

  return true;
};
