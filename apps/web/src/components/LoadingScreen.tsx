type LoadingScreenProps = {
  message?: string;
};

function LoadingScreen({
  message = "Loading DebugPilot dashboard..."
}: LoadingScreenProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F8FB]">
      <div className="rounded-[28px] bg-white px-8 py-6 text-lg font-extrabold shadow-sm ring-1 ring-black/5">
        {message}
      </div>
    </div>
  );
}

export default LoadingScreen;