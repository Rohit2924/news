 import AuthForm from '../components/ui/AuthForm';

export default function AuthPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="absolute inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-sm z-0" />
      <div className="relative z-10 w-full max-w-md p-8 bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-2xl backdrop-blur-md">
        <AuthForm />
      </div>
    </div>
  );
}