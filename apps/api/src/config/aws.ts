import { S3Client } from "@aws-sdk/client-s3";
import { SQSClient } from "@aws-sdk/client-sqs";
import { env } from "./env";

// Do not put access keys in source code. Locally, the AWS SDK reads your
// AWS CLI profile. In App Runner, it uses the attached instance role.
export const sqsClient = new SQSClient({
  region: env.awsRegion
});

export const s3Client = new S3Client({
  region: env.awsRegion
});
