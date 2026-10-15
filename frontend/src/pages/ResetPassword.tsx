import TokenReset from '@/components/blocks/application/reset-password/token-reset';

export default function ResetPassword() {
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <TokenReset />
      </div>
    </div>
  );
}
