import React from 'react';

export default function InviteLinksDisplay({ inviteResult, onBack }) {
  const handleCopy = async (link) => {
    try {
      await navigator.clipboard.writeText(link);
      alert('Link copied to clipboard!');
    } catch (err) {
      alert('Failed to copy link.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Invite Results</h2>
      {inviteResult.success && inviteResult.success.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-2 text-green-700">Success</h3>
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Link</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inviteResult.success.map(({ email, link }, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                      <a href={link} target="_blank" rel="noopener noreferrer" className="underline">{link}</a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        className="bg-blue-500 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded"
                        onClick={() => handleCopy(link)}
                      >
                        Copy
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {inviteResult.failed && inviteResult.failed.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-2 text-red-700">Failed</h3>
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inviteResult.failed.map(({ email, reason }, idx) => (
                  <tr key={idx} className="hover:bg-red-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <div className="flex justify-center mt-8">
        <button
          className="bg-gray-700 hover:bg-gray-900 text-white font-semibold px-6 py-2 rounded shadow"
          onClick={onBack}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
} 