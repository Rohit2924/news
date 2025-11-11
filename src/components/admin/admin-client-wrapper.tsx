// // src/components/admin/admin-client-wrapper.tsx
// 'use client';

// import { useAuth } from '@/context/AuthContext';
// import { usePathname, useRouter } from 'next/navigation';
// import { useEffect, useState } from 'react';

// export function AdminClientWrapper({ children }: { children: React.ReactNode }) {
//   const { isAuthenticated, user, isLoading } = useAuth();
//   const pathname = usePathname();
//   const router = useRouter();
//   const [isClient, setIsClient] = useState(false);

//   useEffect(() => {
//     setIsClient(true);
//   }, []);

//   // Your existing client-side logic here...
//   // (Keep your useEffect authentication logic)

//   if (!isClient || isLoading) {
//     return <div>Loading...</div>;
//   }

//   return <>{children}</>;
// }