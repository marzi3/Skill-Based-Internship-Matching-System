export default function Privacy() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-purple-600 px-8 py-6">
                    <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
                    <p className="text-purple-100 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
                </div>
                <div className="px-8 py-8 prose prose-purple max-w-none text-gray-600">
                    <h3>1. Information We Collect</h3>
                    <p>We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us.</p>

                    <h3>2. How We Use Your Information</h3>
                    <p>We use the information we collect to provide, maintain, and improve our services, including to match students with employers, process transactions, and send you related information.</p>

                    <h3>3. Information Sharing</h3>
                    <p>We may share the information we collect about you as described in this Statement or as described at the time of collection or sharing, including with employers/students as part of the matching process.</p>

                    <h3>4. Data Security</h3>
                    <p>We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.</p>

                    <h3>5. Cookies</h3>
                    <p>We use cookies and similar technologies to facilitate administration and navigation of our Website, to better understand and improve our Services, and to determine and improve the advertising shown to you on our Website or elsewhere.</p>

                    <h3>6. Contact Us</h3>
                    <p>If you have any questions about this Privacy Policy, please contact us at support@internmatch.com.</p>
                </div>
            </div>
        </div>
    );
}
