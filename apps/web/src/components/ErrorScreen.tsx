type ErrorScreenProps = {
  message: string;
};

function ErrorScreen({ message }: ErrorScreenProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F8FB]">
      <div className="max-w-md rounded-[28px] bg-white p-8 text-center shadow-sm ring-1 ring-black/5">
        <h1 className="text-2xl font-extrabold">Could not load dashboard</h1>

        <p className="mt-3 text-sm font-medium text-[#6B7280]">
          {message}
        </p>

        <p className="mt-5 rounded-2xl bg-[#FFF3CC] p-4 text-sm font-bold text-[#92400E]">
          Make sure your API server is running and your JWT is stored in
          localStorage as debugpilot_token.
        </p>
      </div>
    </div>
  );
}

export default ErrorScreen;