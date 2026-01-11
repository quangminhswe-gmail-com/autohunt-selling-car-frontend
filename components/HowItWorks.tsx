'use client';

interface Step {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export default function HowItWorks() {
  const steps: Step[] = [
    {
      number: 1,
      title: 'Seller Posts Car',
      description:
        'Upload photos, add details, and set your price. Create a compelling listing in minutes.',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11.25 4.26855V13.749C11.25 14.4404 10.6914 14.999 10 14.999C9.30859 14.999 8.75 14.4404 8.75 13.749V4.26855L5.88281 7.13574C5.39453 7.62402 4.60156 7.62402 4.11328 7.13574C3.625 6.64746 3.625 5.85449 4.11328 5.36621L9.11328 0.366211C9.60156 -0.12207 10.3945 -0.12207 10.8828 0.366211L15.8828 5.36621C16.3711 5.85449 16.3711 6.64746 15.8828 7.13574C15.3945 7.62402 14.6016 7.62402 14.1133 7.13574L11.25 4.26855ZM2.5 13.749H7.5C7.5 15.1279 8.62109 16.249 10 16.249C11.3789 16.249 12.5 15.1279 12.5 13.749H17.5C18.8789 13.749 20 14.8701 20 16.249V17.499C20 18.8779 18.8789 19.999 17.5 19.999H2.5C1.12109 19.999 0 18.8779 0 17.499V16.249C0 14.8701 1.12109 13.749 2.5 13.749ZM16.875 17.8115C17.1236 17.8115 17.3621 17.7128 17.5379 17.5369C17.7137 17.3611 17.8125 17.1227 17.8125 16.874C17.8125 16.6254 17.7137 16.3869 17.5379 16.2111C17.3621 16.0353 17.1236 15.9365 16.875 15.9365C16.6264 15.9365 16.3879 16.0353 16.2121 16.2111C16.0363 16.3869 15.9375 16.6254 15.9375 16.874C15.9375 17.1227 16.0363 17.3611 16.2121 17.5369C16.3879 17.7128 16.6264 17.8115 16.875 17.8115Z" fill="white"/>
        </svg>


      ),
    },
    {
      number: 2,
      title: 'Buyer Contacts Seller',
      description:
        'Browse listings, find your perfect car, and contact the seller directly to negotiate.',
      icon: (
      <svg width="25" height="15" viewBox="0 0 25 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.6328 0.828125L8.85156 3.89063C8.22266 4.39844 8.10156 5.3125 8.57812 5.96484C9.08203 6.66016 10.0625 6.79688 10.7383 6.26953L14.6172 3.25391C14.8906 3.04297 15.2812 3.08984 15.4961 3.36328C15.7109 3.63672 15.6602 4.02734 15.3867 4.24219L14.5703 4.875L20 9.875V2.5H19.9727L19.8203 2.40234L16.9844 0.585938C16.3867 0.203125 15.6875 0 14.9766 0C14.125 0 13.2969 0.292969 12.6328 0.828125ZM13.5234 5.6875L11.5039 7.25781C10.2734 8.21875 8.48828 7.96875 7.56641 6.70312C6.69922 5.51172 6.91797 3.84766 8.0625 2.92188L11.3125 0.292969C10.8594 0.101562 10.3711 0.00390619 9.875 0.00390619C9.14062 -5.96629e-08 8.42578 0.21875 7.8125 0.625L5 2.5V11.25H6.10156L9.67188 14.5078C10.4375 15.207 11.6211 15.1523 12.3203 14.3867C12.5352 14.1484 12.6797 13.8711 12.7539 13.582L13.418 14.1914C14.1797 14.8906 15.3672 14.8398 16.0664 14.0781C16.2422 13.8867 16.3711 13.6641 16.4531 13.4336C17.2109 13.9414 18.2422 13.8359 18.8789 13.1406C19.5781 12.3789 19.5273 11.1914 18.7656 10.4922L13.5234 5.6875ZM0.625 2.5C0.28125 2.5 0 2.78125 0 3.125V11.25C0 11.9414 0.558594 12.5 1.25 12.5H2.5C3.19141 12.5 3.75 11.9414 3.75 11.25V2.5H0.625ZM1.875 10C2.04076 10 2.19973 10.0658 2.31694 10.1831C2.43415 10.3003 2.5 10.4592 2.5 10.625C2.5 10.7908 2.43415 10.9497 2.31694 11.0669C2.19973 11.1842 2.04076 11.25 1.875 11.25C1.70924 11.25 1.55027 11.1842 1.43306 11.0669C1.31585 10.9497 1.25 10.7908 1.25 10.625C1.25 10.4592 1.31585 10.3003 1.43306 10.1831C1.55027 10.0658 1.70924 10 1.875 10ZM21.25 2.5V11.25C21.25 11.9414 21.8086 12.5 22.5 12.5H23.75C24.4414 12.5 25 11.9414 25 11.25V3.125C25 2.78125 24.7188 2.5 24.375 2.5H21.25ZM22.5 10.625C22.5 10.4592 22.5658 10.3003 22.6831 10.1831C22.8003 10.0658 22.9592 10 23.125 10C23.2908 10 23.4497 10.0658 23.5669 10.1831C23.6842 10.3003 23.75 10.4592 23.75 10.625C23.75 10.7908 23.6842 10.9497 23.5669 11.0669C23.4497 11.1842 23.2908 11.25 23.125 11.25C22.9592 11.25 22.8003 11.1842 22.6831 11.0669C22.5658 10.9497 22.5 10.7908 22.5 10.625Z" fill="white"/>
      </svg>


      ),
    },
    {
      number: 3,
      title: 'Deal Completed',
      description:
        'Meet in person, inspect the car, and complete the transaction safely and securely.',
      icon: (
        <svg
          className="w-8 h-8 text-white"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
        </svg>
      ),
    },
  ];

  return (
    <section className="py-16 md:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-3">
            How It Works
          </h2>
          <p className="text-gray-600 text-base md:text-lg">
            Simple steps to buy or sell your car
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
          {steps.map((step) => (
            <div key={step.number} className="text-center">
              {/* Icon Circle */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-[#006557] rounded-full flex items-center justify-center shadow-md">
                  {step.icon}
                </div>
              </div>

              {/* Title */}
              <h3 className="text-lg md:text-xl font-semibold text-black mb-3">
                {step.number}. {step.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
