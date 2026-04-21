import Image from 'next/image';
import Link from 'next/link';

export interface CarCardProps {
  id: string;
  year: number;
  make: string;
  model: string;
  price: number;
  mileage: number;
  location?: string;
  transmission?: string;
  image?: string;
  href: string;
  onContact?: (id: string) => void;
  onBuy?: (id: string) => void;
  variant?: 'grid' | 'list';
  currency?: string;
}

export default function CarCard({
  id,
  year,
  make,
  model,
  price,
  mileage,
  location,
  transmission,
  image,
  href,
  onContact,
  onBuy,
  variant = 'grid',
  currency = 'VND',
}: CarCardProps) {
  const cropImage = image || '/default-car.png';
  
  // Get currency symbol
  const getCurrencySymbol = (curr: string) => {
    switch (curr?.toUpperCase()) {
      case 'VND':
        return '₫';
      default:
        return '₫';
    }
  };
  
  const currencySymbol = getCurrencySymbol(currency);

  if (variant === 'list') {
    return (
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden flex flex-col md:flex-row">
        <Link href={href} className="relative w-full md:w-1/4 h-40 md:h-auto overflow-hidden bg-gray-200">
          <Image
            fill
            src={cropImage}
            alt={`${make} ${model}`}
            className="object-cover hover:scale-105 transition-transform"
          />
        </Link>

        <div className="flex-1 p-4 flex flex-col justify-between">
          <Link href={href} className="text-lg font-bold text-gray-900 hover:text-teal-600">
            {year} {make} {model}
          </Link>
          <div className="text-gray-600 text-sm">
            <p>Mileage: {mileage.toLocaleString()} km</p>
            <p>Transmission: {transmission ?? 'N/A'}</p>
            <p>Location: {location ?? 'Unknown'}</p>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-2xl font-bold text-[#006557]">{currencySymbol}{price.toLocaleString()}</p>
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onContact?.(id);
                }}
                className="px-3 py-1 bg-[#006557] text-white rounded-lg text-xs font-medium hover:bg-teal-700"
              >
                Contact
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onBuy?.(id);
                }}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700"
              >
                Buy
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden block h-full flex flex-col">
      <Link href={href} className="group block">
        <div className="relative h-48 overflow-hidden bg-gray-200">
          <Image
            fill
            src={cropImage}
            alt={`${make} ${model}`}
            className="object-cover hover:scale-105 transition-transform"
          />
        </div>
        <div className="p-4">
          <h3
            className="text-lg font-bold text-gray-900 mb-2 overflow-hidden break-words"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              maxHeight: '3rem',
            }}
          >
            {year} {make} {model}
          </h3>

          <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
            <span className="flex items-center gap-1">
              <svg width="13" height="14" viewBox="0 0 13 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.625 0.875V1.75H1.3125C0.587891 1.75 0 2.33789 0 3.0625V4.375H12.25V3.0625C12.25 2.33789 11.6621 1.75 10.9375 1.75H9.625V0.875C9.625 0.391016 9.23398 0 8.75 0C8.26602 0 7.875 0.391016 7.875 0.875V1.75H4.375V0.875C4.375 0.391016 3.98398 0 3.5 0C3.01602 0 2.625 0.391016 2.625 0.875ZM12.25 5.25H0V12.6875C0 13.4121 0.587891 14 1.3125 14H10.9375C11.6621 14 12.25 13.4121 12.25 12.6875V5.25Z" fill="#4B5563"/>
              </svg>
              {year}
            </span>
            <span className="flex items-center gap-1">
              <svg width="16" height="13" viewBox="0 0 16 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 0H4.95469C4.21367 0 3.55195 0.467578 3.30586 1.16484L0.0847656 10.2594C0.0300781 10.418 0 10.5875 0 10.757C0 11.5801 0.669922 12.25 1.49297 12.25H7V10.5C7 10.016 7.39102 9.625 7.875 9.625C8.35898 9.625 8.75 10.016 8.75 10.5V12.25H14.257C15.0828 12.25 15.75 11.5801 15.75 10.757C15.75 10.5875 15.7199 10.418 15.6652 10.2594L12.4441 1.16484C12.1953 0.467578 11.5363 0 10.7953 0H8.75V1.75C8.75 2.23398 8.35898 2.625 7.875 2.625C7.39102 2.625 7 2.23398 7 1.75V0ZM8.75 5.25V7C8.75 7.48398 8.35898 7.875 7.875 7.875C7.39102 7.875 7 7.48398 7 7V5.25C7 4.76602 7.39102 4.375 7.875 4.375C8.35898 4.375 8.75 4.76602 8.75 5.25Z" fill="#4B5563"/>
              </svg>
              {mileage.toLocaleString()} km
            </span>
          </div>

          <div className="flex flex-col gap-2 mb-4">
            <p className="text-lg font-bold text-[#006557]">{currencySymbol}{price.toLocaleString()}</p>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <svg width="11" height="14" viewBox="0 0 11 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5.89805 13.65C7.30078 11.8945 10.5 7.63984 10.5 5.25C10.5 2.35156 8.14844 0 5.25 0C2.35156 0 0 2.35156 0 5.25C0 7.63984 3.19922 11.8945 4.60195 13.65C4.93828 14.0684 5.56172 14.0684 5.89805 13.65ZM5.25 3.5C5.71413 3.5 6.15925 3.68437 6.48744 4.01256C6.81563 4.34075 7 4.78587 7 5.25C7 5.71413 6.81563 6.15925 6.48744 6.48744C6.15925 6.81563 5.71413 7 5.25 7C4.78587 7 4.34075 6.81563 4.01256 6.48744C3.68437 6.15925 3.5 5.71413 3.5 5.25C3.5 4.78587 3.68437 4.34075 4.01256 4.01256C4.34075 3.68437 4.78587 3.5 5.25 3.5Z" fill="#6B7280"/>
              </svg>
              {location ?? 'Unknown'}
            </div>
          </div>
        </div>
      </Link>

      <div className="p-4 pt-0 mt-auto flex gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onContact?.(id);
          }}
          className="flex-1 bg-[#006557] text-white py-2 rounded-lg text-sm font-medium hover:bg-teal-700"
        >
          Contact Seller
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onBuy?.(id);
          }}
          className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          Buy
        </button>
      </div>
    </div>
  );
}
