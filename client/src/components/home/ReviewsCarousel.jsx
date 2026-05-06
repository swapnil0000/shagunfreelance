import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/pagination';
import StarRating from '../ui/StarRating';

const reviews = [
  {
    id: 1,
    name: 'Priya S.',
    role: 'Marketing Manager',
    rating: 5,
    text: 'Absolutely love my Zimor tote! The leather quality is outstanding and it fits my 15" laptop perfectly. Gets compliments every day at work.',
  },
  {
    id: 2,
    name: 'Ananya M.',
    role: 'Startup Founder',
    rating: 5,
    text: "The craftsmanship is incredible. You can tell it's handmade with care. Worth every rupee — this bag will last years.",
  },
  {
    id: 3,
    name: 'Kavya R.',
    role: 'Software Engineer',
    rating: 4,
    text: 'Beautiful bag with great compartments. The crossbody strap is super comfortable for commuting. Highly recommend!',
  },
  {
    id: 4,
    name: 'Meera D.',
    role: 'Architect',
    rating: 5,
    text: 'Bought the shoulder bag as a gift for my sister and she was thrilled. The packaging was premium too. Will definitely order again.',
  },
  {
    id: 5,
    name: 'Sneha K.',
    role: 'Consultant',
    rating: 5,
    text: "Finally found a workbag that's both stylish and functional. The Varanasi craftsmanship really shows. Love supporting Indian brands!",
  },
];

export default function ReviewsCarousel() {
  return (
    <section className="bg-neutral-950 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <span className="text-sm font-medium uppercase tracking-widest text-brand-400">
            Testimonials
          </span>
          <h2 className="mt-2 font-heading text-3xl font-bold text-white sm:text-4xl">
            What Our Customers Say
          </h2>
        </motion.div>

        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={20}
          slidesPerView={1}
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="pb-14"
        >
          {reviews.map((review) => (
            <SwiperSlide key={review.id}>
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
                <Quote className="mb-3 h-6 w-6 text-brand-500/40" />
                <StarRating rating={review.rating} size="sm" readOnly />
                <p className="mt-4 text-sm leading-relaxed text-neutral-400">
                  {review.text}
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-linear-to-br from-brand-400 to-brand-600" />
                  <div>
                    <p className="text-sm font-semibold text-white">{review.name}</p>
                    <p className="text-xs text-neutral-500">{review.role}</p>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
