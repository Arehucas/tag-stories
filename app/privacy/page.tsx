export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 py-10">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center gap-6 border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">Privacy Policy</h1>
        <p className="text-gray-700 text-base mb-4 text-center">
          Your privacy is extremely important to us. This project is designed with privacy by default and by design.
        </p>
        <ul className="list-disc pl-5 text-gray-600 text-sm mb-4 text-left w-full">
          <li>We do <b>not</b> store any user images or personal content on our servers.</li>
          <li>We do <b>not</b> collect, store, or share any personal data from users.</li>
          <li>All authentication is handled securely via trusted third-party providers (Google, Instagram).</li>
          <li>Any data required for the functioning of the service (such as provider information) is stored securely and never shared with third parties.</li>
          <li>We do not use your data for advertising or marketing purposes.</li>
        </ul>
        <p className="text-gray-700 text-sm text-center">
          If you have any questions about privacy or data protection, please contact us at <a href="mailto:privacy@taun.me" className="text-blue-500 underline">privacy@taun.me</a>.
        </p>
      </div>
    </div>
  );
} 