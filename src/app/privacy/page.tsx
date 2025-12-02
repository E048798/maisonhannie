export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#F7F3EC]">
      <section className="relative h-[40vh] min-h-[280px] flex items-center justify-center">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556742031-c6961e8560b0?w=1920&q=80')" }} />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative text-center text-white px-4">
          <h1 className="text-4xl md:text-5xl font-serif mb-2">Privacy Policy</h1>
          <p className="text-white/80">Your privacy matters to us</p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl p-8 shadow-sm prose prose-lg max-w-none text-black/80">
          <h2>Overview</h2>
          <p>
            We collect only the information necessary to provide our services, process orders, and improve your experience. This includes contact
            details provided in forms, order information, and preferences you share.
          </p>
          <h2>Information We Collect</h2>
          <ul>
            <li>Contact details (e.g., name, email, phone) when you submit forms</li>
            <li>Order and delivery information for purchases</li>
            <li>Feedback and messages you send to us</li>
          </ul>
          <h2>How We Use Your Information</h2>
          <ul>
            <li>To respond to inquiries and provide customer support</li>
            <li>To process payments and fulfill orders</li>
            <li>To send relevant updates when you opt in</li>
          </ul>
          <h2>Your Choices</h2>
          <p>
            You can request updates or deletion of your data by contacting us via the details on our Contact page. Marketing emails are sent only when
            you subscribe and you can unsubscribe at any time.
          </p>
        </div>
      </div>
    </div>
  );
}