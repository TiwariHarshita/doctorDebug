"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enqueueEventArchive = void 0;
const client_sqs_1 = require("@aws-sdk/client-sqs");
const aws_1 = require("../config/aws");
const env_1 = require("../config/env");
const enqueueEventArchive = async (message) => {
    if (!env_1.env.eventArchiveQueueUrl) {
        console.warn("EVENT_ARCHIVE_QUEUE_URL is not set; skipping asynchronous event archival");
        return false;
    }
    await aws_1.sqsClient.send(new client_sqs_1.SendMessageCommand({
        QueueUrl: env_1.env.eventArchiveQueueUrl,
        MessageBody: JSON.stringify(message)
    }));
    return true;
};
exports.enqueueEventArchive = enqueueEventArchive;
