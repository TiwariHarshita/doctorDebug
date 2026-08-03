import json
import logging
import os
from datetime import UTC, datetime
from typing import Any

import boto3

LOGGER = logging.getLogger()
LOGGER.setLevel(logging.INFO)

S3 = boto3.client("s3")
BUCKET_NAME = os.environ["EVENT_ARCHIVE_BUCKET"]


def _require_string(payload: dict[str, Any], key: str) -> str:
    value = payload.get(key)
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{key} must be a non-empty string")
    return value


def _archive_record(record: dict[str, Any]) -> None:
    payload = json.loads(record["body"])

    event_id = _require_string(payload, "eventId")
    project_id = _require_string(payload, "projectId")

    # Deterministic key makes retries idempotent. Retrying the same SQS message
    # overwrites the same object instead of creating duplicates.
    object_key = f"events/{project_id}/{event_id}.json"

    archive_document = {
        **payload,
        "archivedAt": datetime.now(UTC).isoformat(),
        "archiveVersion": 1,
    }

    S3.put_object(
        Bucket=BUCKET_NAME,
        Key=object_key,
        Body=json.dumps(archive_document, ensure_ascii=False, default=str).encode(
            "utf-8"
        ),
        ContentType="application/json",
        ServerSideEncryption="AES256",
        Metadata={
            "event-id": event_id,
            "project-id": project_id,
        },
    )

    LOGGER.info(
        "Archived event",
        extra={"eventId": event_id, "projectId": project_id, "key": object_key},
    )


def lambda_handler(event: dict[str, Any], context: Any) -> dict[str, list[dict[str, str]]]:
    del context
    failures: list[dict[str, str]] = []

    for record in event.get("Records", []):
        try:
            _archive_record(record)
        except Exception:
            LOGGER.exception(
                "Failed to archive SQS record",
                extra={"messageId": record.get("messageId")},
            )
            failures.append({"itemIdentifier": record["messageId"]})

    # With ReportBatchItemFailures enabled, Lambda retries only these messages.
    return {"batchItemFailures": failures}
