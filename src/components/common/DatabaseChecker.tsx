// 'use client';

// import { useState } from 'react';

// interface DbTestResult {
//   success: boolean;
//   message: string;
//   details?: any;
//   error?: string;
//   warning?: string;
// }

// export default function DatabaseChecker() {
//   const [testResult, setTestResult] = useState<DbTestResult | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [customQuery, setCustomQuery] = useState('SELECT COUNT(*) as total_articles FROM articles');

//   const testConnection = async () => {
//     setLoading(true);
//     try {
//       const response = await fetch('/api/test-db');
//       const result = await response.json();
//       setTestResult(result);
//     } catch (error) {
//       setTestResult({
//         success: false,
//         message: 'Failed to connect to API',
//         error: error instanceof Error ? error.message : 'Unknown error'
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const testCustomQuery = async () => {
//     setLoading(true);
//     try {
//       const response = await fetch('/api/test-db', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ query: customQuery }),
//       });
//       const result = await response.json();
//       setTestResult(result);
//     } catch (error) {
//       setTestResult({
//         success: false,
//         message: 'Failed to execute custom query',
//         error: error instanceof Error ? error.message : 'Unknown error'
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
//       <h2 className="text-2xl font-bold mb-6 text-gray-800">Database Connection Test</h2>
      
//       <div className="space-y-4 mb-6">
//         <button
//           onClick={testConnection}
//           disabled={loading}
//           className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
//         >
//           {loading ? 'Testing...' : 'Test Database Connection'}
//         </button>

//         <div className="flex flex-col space-y-2">
//           <label className="text-sm font-medium text-gray-700">
//             Test Custom Query (SELECT only):
//           </label>
//           <textarea
//             value={customQuery}
//             onChange={(e) => setCustomQuery(e.target.value)}
//             className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             rows={3}
//             placeholder="Enter your SELECT query here..."
//           />
//           <button
//             onClick={testCustomQuery}
//             disabled={loading || !customQuery.trim()}
//             className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed self-start"
//           >
//             {loading ? 'Executing...' : 'Execute Query'}
//           </button>
//         </div>
//       </div>

//       {testResult && (
//         <div className={`p-4 rounded-lg border ${
//           testResult.success 
//             ? 'bg-green-50 border-green-200' 
//             : 'bg-red-50 border-red-200'
//         }`}>
//           <div className="flex items-center mb-2">
//             <div className={`w-3 h-3 rounded-full mr-2 ${
//               testResult.success ? 'bg-green-500' : 'bg-red-500'
//             }`}></div>
//             <h3 className={`font-semibold ${
//               testResult.success ? 'text-green-800' : 'text-red-800'
//             }`}>
//               {testResult.message}
//             </h3>
//           </div>
          
//           {testResult.warning && (
//             <div className="mb-2 p-2 bg-yellow-100 border border-yellow-300 rounded text-yellow-800 text-sm">
//               <strong>Warning:</strong> {testResult.warning}
//             </div>
//           )}
          
//           {testResult.error && (
//             <div className="mb-2 p-2 bg-red-100 border border-red-300 rounded text-red-800 text-sm">
//               <strong>Error:</strong> {testResult.error}
//             </div>
//           )}
          
//           {testResult.details && (
//             <div className="mt-3">
//               <h4 className="font-medium text-gray-700 mb-2">Details:</h4>
//               <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
//                 {JSON.stringify(testResult.details, null, 2)}
//               </pre>
//             </div>
//           )}
//         </div>
//       )}

//       <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
//         <h4 className="font-medium text-blue-800 mb-2">What this test checks:</h4>
//         <ul className="text-sm text-blue-700 space-y-1">
//           <li>• Database connection establishment</li>
//           <li>• PostgreSQL version and current time</li>
//           <li>• Connection pool status</li>
//           <li>• Basic CRUD operations (Create, Read, Update, Delete)</li>
//           <li>• Custom query execution</li>
//         </ul>
//       </div>
//     </div>
//   );
// }