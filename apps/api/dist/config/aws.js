"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3Client = exports.sqsClient = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const client_sqs_1 = require("@aws-sdk/client-sqs");
const env_1 = require("./env");
// Do not put access keys in source code. Locally, the AWS SDK reads your
// AWS CLI profile. In App Runner, it uses the attached instance role.
exports.sqsClient = new client_sqs_1.SQSClient({
    region: env_1.env.awsRegion
});
exports.s3Client = new client_s3_1.S3Client({
    region: env_1.env.awsRegion
});
