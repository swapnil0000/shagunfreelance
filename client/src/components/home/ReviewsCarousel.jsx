import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import StarRating from '../ui/StarRating';

const reviews = [
  {
    id: 1,
    name: 'Priya S.',
    rating: 5,
    text: 'Absolutely love my Zimor tote! The leather quality is outstanding and it fits my 15" laptop perfectly. Gets compliments every day at work.',
  },
  {
    id: 2,
    name: 'Ananya M.',
    rating: 5,
    text: "The craftsmanship is incredible. You can tell it's handmade with care. Worth every rupee — this bag will last years.",
  },
  {
    id: 3,
    name: 'Kavya R.',
    rating: 4,
    text: 'Beautiful bag with great compartments. The crossbody strap is super comfortable for commuting. Highly recommend!',
  },
  {
    id: 4,
    name: 'Meera D.',
    rating: 5,
    text: 'Bought the shoulder bag as a gift for my sister and she was thrilled. The packaging was premium too. Will definitely order again.',
  },
  {
    id: 5,
    name: 'Sneha K.',
    rating: 5,
    text: "Finally found a workbag that's both stylish and functional. The Varanasi craftsmanship really shows. Love supporting Indian brands!",
  },
];

export default function ReviewsCarousel() {
  return (
    <section className="bg-neutral-50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="font-heading text-3xl font-bold text-neutral-900">
            What Our Customers Say
          </h2>
          <p className="mt-2 text-neutral-500">
            Real reviews from real professionals
          </p>
        </div>

        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={24}
          slidesPerView={1}
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="pb-12"
        >
          {reviews.map((review) => (
            <SwiperSlide key={review.id}>
              <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                <StarRating rating={review.rating} size="sm" readOnly />
                <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                  "{review.text}"
                </p>
                <p className="mt-4 text-sm font-semibold text-neutral-800">
                  {review.name}
                </p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
