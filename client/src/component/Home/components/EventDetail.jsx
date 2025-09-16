import React, { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";

const events = [
  {
    id: 1,
    title: "Tech Innovation Summit 2023",
    date: "November 15, 2023",
    time: "9:00 AM - 5:00 PM",
    location: "Convention Center, San Francisco",
    details: `
      <h2 class="text-2xl font-bold mb-4">About the Event</h2>
      <p class="mb-4">Join us for the most anticipated tech event of the year where industry leaders and innovators come together to discuss the future of technology.</p>
      
      <h3 class="text-xl font-bold mb-3 mt-6">Agenda</h3>
      <ul class="mb-6 space-y-3">
        <li class="flex items-start">
          <span class="inline-block bg-primary text-white rounded-full w-6 h-6 items-center justify-center mr-2 mt-0.5 flex-shrink-0">9:00</span>
          <span>Registration & Breakfast</span>
        </li>
        <li class="flex items-start">
          <span class="inline-block bg-primary text-white rounded-full w-6 h-6 items-center justify-center mr-2 mt-0.5 flex-shrink-000</span>
          <span>Opening Keynote: The Future of AI</span>
        </li>
        <li class="flex items-start">
          <span class="inline-block bg-primary text-white rounded-full w-6 h-6 items-center justify-center mr-2 mt-0.5 flex-shrink-030</span>
          <span>Panel Discussion: Ethical Tech Development</span>
        </li>
        <li class="flex items-start">
          <span class="inline-block bg-primary text-white rounded-full w-6 h-6 items-center justify-center mr-2 mt-0.5 flex-shrink-0">1:00</span>
          <span>Lunch & Networking</span>
        </li>
        <li class="flex items-start">
          <span class="inline-block bg-primary text-white rounded-full w-6 h-6 items-center justify-center mr-2 mt-0.5 flex-shrink-0">2:30</span>
          <span>Breakout Sessions</span>
        </li>
        <li class="flex items-start">
          <span class="inline-block bg-primary text-white rounded-full w-6 h-6 items-center justify-center mr-2 mt-0.5 flex-shrink-0">4:00</span>
          <span>Closing Remarks</span>
        </li>
      </ul>
      
      <h3 class="text-xl font-bold mb-3">Featured Speakers</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div class="flex items-start">
          <div class="w-16 h-16 rounded-full bg-gray-200 mr-4 overflow-hidden">
            <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Speaker" class="w-full h-full object-cover"/>
          </div>
          <div>
            <h4 class="font-bold">Dr. Sarah Chen</h4>
            <p class="text-sm text-gray-600">AI Research Lead, TechFuture</p>
          </div>
        </div>
        <div class="flex items-start">
          <div class="w-16 h-16 rounded-full bg-gray-200 mr-4 overflow-hidden">
            <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Speaker" class="w-full h-full object-cover"/>
          </div>
          <div>
            <h4 class="font-bold">Mark Johnson</h4>
            <p class="text-sm text-gray-600">CTO, InnovateX</p>
          </div>
        </div>
      </div>
    `,
    image:
      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
  },
];

const EventDetail = () => {
  const { id } = useParams();
  const event = events.find((event) => event.id === parseInt(id));
  const sectionRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (!event) return;

    // You could add animations or other effects here
  }, [event]);

  if (!event) {
    return (
      <section className="min-h-screen bg-white py-20">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-800 mb-6">
              Event Not Found
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              The requested event could not be found.
            </p>
            <a
              href="/events"
              className="inline-block bg-[#004080] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#003366] transition duration-300"
            >
              Browse All Events
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen py-12 md:py-20">
      <div className="container mx-auto px-6">
        {/* Event Header */}
        <div ref={sectionRef} className="max-w-5xl mx-auto mb-12">
          <div className="mb-8">
            <span className="inline-block bg-[#004080] text-white text-sm font-semibold px-4 py-1 rounded-full mb-4">
              Featured Event
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              {event.title}
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl">
              Join industry leaders for a day of innovation, networking, and
              forward-thinking discussions.
            </p>
          </div>

          <div className="flex flex-wrap gap-6 mb-8 text-gray-700">
            <div className="flex items-center bg-gray-50 px-4 py-3 rounded-lg">
              <svg
                className="w-5 h-5 text-[#004080] mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="font-medium">{event.date}</span>
            </div>
            <div className="flex items-center bg-gray-50 px-4 py-3 rounded-lg">
              <svg
                className="w-5 h-5 text-[#004080] mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="font-medium">{event.time}</span>
            </div>
            <div className="flex items-center bg-gray-50 px-4 py-3 rounded-lg">
              <svg
                className="w-5 h-5 text-[#004080] mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="font-medium">{event.location}</span>
            </div>
          </div>

          <div className="relative h-80 md:h-96 rounded-xl overflow-hidden mb-8 shadow-lg">
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          </div>
        </div>

        {/* Event Details */}
        <div
          ref={contentRef}
          className="max-w-5xl mx-auto prose prose-lg"
          dangerouslySetInnerHTML={{ __html: event.details }}
        ></div>

        {/* Registration Form */}
        <div className="max-w-5xl mx-auto mt-16 bg-gradient-to-r from-[#004080]/5 to-[#004080]/10 p-8 md:p-12 rounded-2xl shadow-sm">
          <div className="text-center mb-10">
            <h3 className="text-3xl font-bold text-gray-900 mb-3">
              Ready to Join Us?
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Reserve your spot now for this exclusive event. Limited seats
              available!
            </p>
          </div>

          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="w-full px-5 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent transition duration-300"
                  required
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-5 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent transition duration-300"
                  required
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="w-full px-5 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent transition duration-300"
                  required
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <label
                  htmlFor="company"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Company/Organization
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  className="w-full px-5 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent transition duration-300"
                  placeholder="Acme Inc."
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Any Questions or Special Requirements?
              </label>
              <textarea
                id="message"
                name="message"
                rows="4"
                className="w-full px-5 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#004080] focus:border-transparent transition duration-300"
                placeholder="Let us know how we can make your experience better"
              ></textarea>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full md:w-auto bg-[#ffd700] hover:bg-[#ffd400] text-black font-semibold px-8 py-4 rounded-lg transition duration-300 shadow-md hover:shadow-lg"
              >
                Register Now
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default EventDetail;
