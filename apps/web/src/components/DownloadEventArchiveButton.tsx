import axios from "axios";
import { Download } from "lucide-react";
import { useState } from "react";
import { api } from "../lib/api";

type DownloadEventArchiveButtonProps = {
  eventId: string;
};

type ArchiveResponse = {
  success: boolean;
  message?: string;
  data?: {
    downloadUrl: string;
    expiresInSeconds: number;
  };
};

export function DownloadEventArchiveButton({
  eventId
}: DownloadEventArchiveButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const downloadArchive = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get<ArchiveResponse>(
        `/events/${eventId}/archive-url`
      );

      const downloadUrl = response.data.data?.downloadUrl;

      if (!downloadUrl) {
        throw new Error(
          response.data.message || "Archive download URL was not returned"
        );
      }

      window.location.assign(downloadUrl);
    } catch (caught: unknown) {
      if (axios.isAxiosError(caught)) {
        setError(
          caught.response?.data?.message ||
            "Could not download the event archive"
        );
      } else {
        setError(
          caught instanceof Error
            ? caught.message
            : "Could not download the event archive"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={downloadArchive}
        disabled={loading}
        className="flex items-center gap-2 rounded-full bg-[#EEF2FF] px-4 py-2 text-xs font-extrabold text-[#4F46E5] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Download size={14} />

        {loading ? "Preparing archive..." : "Download raw event"}
      </button>

      {error && (
        <p className="mt-2 text-xs font-semibold text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}