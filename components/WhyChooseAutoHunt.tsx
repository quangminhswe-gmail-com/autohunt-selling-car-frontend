'use client';

interface Benefit {
  title: string;
  description: string;
  icon: React.ReactNode;
  iconColor: string;
  bgColor: string;
}

export default function WhyChooseAutoHunt() {
  const benefits: Benefit[] = [
    {
      title: 'Verified Listings',
      description: 'All listings are verified to ensure authenticity and prevent fraud.',
      iconColor: 'text-[#22a447]',
      bgColor: 'bg-[#e6f9f0]',
      icon: (
        <svg width="19" height="20" viewBox="0 0 19 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9.37502 0C9.55471 0 9.73439 0.0390625 9.89845 0.113281L17.2539 3.23438C18.1133 3.59766 18.7539 4.44531 18.75 5.46875C18.7305 9.34375 17.1367 16.4336 10.4063 19.6562C9.75392 19.9688 8.99611 19.9688 8.34377 19.6562C1.6133 16.4336 0.019549 9.34375 1.77675e-05 5.46875C-0.00388848 4.44531 0.636736 3.59766 1.49611 3.23438L8.85549 0.113281C9.01564 0.0390625 9.19533 0 9.37502 0ZM9.37502 2.60938V17.375C14.7656 14.7656 16.2149 8.98828 16.25 5.52344L9.37502 2.60938Z" fill="#16A34A"/>
        </svg>

      ),
    },
    {
      title: 'No Middleman',
      description: 'Deal directly with sellers and buyers. No hidden fees or commissions.',
      iconColor: 'text-[#1E40AF]', 
      bgColor: 'bg-[#DBEAFE]',     
      icon: (
        <svg width="25" height="20" viewBox="0 0 25 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3.75 5C3.75 3.67392 4.27678 2.40215 5.21447 1.46447C6.15215 0.526784 7.42392 0 8.75 0C10.0761 0 11.3479 0.526784 12.2855 1.46447C13.2232 2.40215 13.75 3.67392 13.75 5C13.75 6.32608 13.2232 7.59785 12.2855 8.53553C11.3479 9.47322 10.0761 10 8.75 10C7.42392 10 6.15215 9.47322 5.21447 8.53553C4.27678 7.59785 3.75 6.32608 3.75 5ZM0 18.8398C0 14.9922 3.11719 11.875 6.96484 11.875H10.5352C14.3828 11.875 17.5 14.9922 17.5 18.8398C17.5 19.4805 16.9805 20 16.3398 20H1.16016C0.519531 20 0 19.4805 0 18.8398ZM23.8008 20H18.4141C18.625 19.6328 18.75 19.207 18.75 18.75V18.4375C18.75 16.0664 17.6914 13.9375 16.0234 12.5078C16.1172 12.5039 16.207 12.5 16.3008 12.5H18.6992C22.1797 12.5 25 15.3203 25 18.8008C25 19.4648 24.4609 20 23.8008 20ZM16.875 10C15.6641 10 14.5703 9.50781 13.7773 8.71484C14.5469 7.67578 15 6.39062 15 5C15 3.95312 14.7422 2.96484 14.2852 2.09766C15.0117 1.56641 15.9062 1.25 16.875 1.25C19.293 1.25 21.25 3.20703 21.25 5.625C21.25 8.04297 19.293 10 16.875 10Z" fill="#1E40AF"/>
        </svg>

      ),
    },
    {
      title: 'Easy Communication',
      description: 'Built-in messaging system to communicate safely and efficiently.',
      iconColor: 'text-[#A855F7]', 
      bgColor: 'bg-[#F3E8FF]',    
      icon: (
        <svg width="25" height="20" viewBox="0 0 25 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8.12494 13.75C12.6132 13.75 16.2499 10.6719 16.2499 6.875C16.2499 3.07812 12.6132 0 8.12494 0C3.63666 0 -6.07639e-05 3.07812 -6.07639e-05 6.875C-6.07639e-05 8.38281 0.574158 9.77734 1.54681 10.9141C1.4101 11.2812 1.20697 11.6055 0.992127 11.8789C0.804627 12.1211 0.613221 12.3086 0.472596 12.4375C0.402283 12.5 0.343689 12.5508 0.304627 12.582C0.285095 12.5977 0.26947 12.6094 0.261658 12.6133L0.253845 12.6211C0.0390017 12.7812 -0.0547483 13.0625 0.0311892 13.3164C0.117127 13.5703 0.355408 13.75 0.624939 13.75C1.4765 13.75 2.33588 13.5312 3.05072 13.2617C3.4101 13.125 3.74603 12.9727 4.039 12.8164C5.23822 13.4102 6.63275 13.75 8.12494 13.75ZM17.4999 6.875C17.4999 11.2617 13.6288 14.5664 9.04291 14.9609C9.99213 17.8672 13.1406 20 16.8749 20C18.3671 20 19.7617 19.6602 20.9648 19.0664C21.2578 19.2227 21.5898 19.375 21.9492 19.5117C22.664 19.7812 23.5234 20 24.3749 20C24.6445 20 24.8867 19.8242 24.9687 19.5664C25.0507 19.3086 24.9609 19.0273 24.7421 18.8672L24.7343 18.8594C24.7265 18.8516 24.7109 18.8438 24.6913 18.8281C24.6523 18.7969 24.5937 18.75 24.5234 18.6836C24.3828 18.5547 24.1913 18.3672 24.0038 18.125C23.789 17.8516 23.5859 17.5234 23.4492 17.1602C24.4218 16.0273 24.996 14.6328 24.996 13.1211C24.996 9.49609 21.6796 6.52344 17.4726 6.26562C17.4882 6.46484 17.496 6.66797 17.496 6.87109L17.4999 6.875Z" fill="#9333EA"/>
        </svg>
      ),
    },
  ];

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-3">
            Why Choose AutoHunt?
          </h2>
          <p className="text-gray-600 text-base md:text-lg">
            Trusted by thousands of buyers and sellers
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-lg hover:shadow-lg transition-all duration-300"
            >
              <div className="flex justify-center mb-6">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${benefit.bgColor} ${benefit.iconColor}`}>
                  {benefit.icon}
                </div>
              </div>

              <h3 className="text-lg md:text-xl font-semibold text-black mb-3">
                {benefit.title}
              </h3>

              <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}