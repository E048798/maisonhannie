export default function Terms() {
  return (
    <div className="min-h-screen bg-[#F7F3EC]">
      <section className="relative h-[40vh] min-h-[280px] flex items-center justify-center">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556742061-5f16f0c6d529?w=1920&q=80')" }} />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative text-center text-white px-4">
          <h1 className="text-4xl md:text-5xl font-serif mb-2">Terms of Service</h1>
          <p className="text-white/80">Please review the terms below</p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl p-8 shadow-sm prose prose-lg max-w-none text-black/80">
          <h2>Use of Service</h2>
          <p>By using our website and services, you agree to follow applicable laws and respect our content and community guidelines.</p>
          <h2>Orders and Payments</h2>
          <p>Orders are confirmed upon successful payment. Pricing and availability may change without prior notice.</p>
          <h2>Returns</h2>
          <p>We offer returns on eligible items within 30 days of purchase. Items must be unused and in original condition.</p>
          <h2>Limitation of Liability</h2>
          <p>We are not liable for indirect or incidental damages. Our maximum liability is limited to the amount paid for the product or service.</p>
          <h2>Contact</h2>
          <p>For questions about these terms, please contact us via the details on our Contact page.</p>
        </div>
      </div>
    </div>
  );
}