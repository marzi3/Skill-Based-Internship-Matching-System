export default function Terms() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-indigo-600 px-8 py-6">
                    <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
                    <p className="text-indigo-100 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
                </div>
                <div className="px-8 py-8 prose prose-indigo max-w-none text-gray-600">
                    <h3>1. Acceptance of Terms</h3>
                    <p>By accessing and using InternMatch ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement.</p>

                    <h3>2. Description of Service</h3>
                    <p>InternMatch provides a platform for students to find internships and for employers to post opportunities. We verify skills to ensure quality matches.</p>

                    <h3>3. User Conduct</h3>
                    <p>You agree to use the Platform only for lawful purposes. You are prohibited from posting or transmitting any unlawful, threatening, libelous, defamatory, obscene, or profane material.</p>

                    <h3>4. Account Security</h3>
                    <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>

                    <h3>5. Intellectual Property</h3>
                    <p>All content included on this site, such as text, graphics, logos, images, is the property of InternMatch or its content suppliers and protected by international copyright laws.</p>

                    <h3>6. Termination</h3>
                    <p>We reserve the right to terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
                </div>
            </div>
        </div>
    );
}
