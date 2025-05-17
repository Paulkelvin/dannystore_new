const reviews = [
  {
    name: 'Olokuntoye Iyanuoluwa',
    avatar: '/avatars/avatar1.jpg',
    rating: 5,
    text: "Featuring Paul in our content was a great choice. He had a dynamic presence and made the video more engaging than we anticipated, driving higher audience engagement and positive feedback. His contribution truly elevated the project.",
  },
  {
    name: 'Eniola',
    avatar: '/avatars/avatar2.jpg',
    rating: 5,
    text: "Having Paul model my clothing brand was a game-changer. He did a good job showcasing our designs with style and charisma leading to more customer conversion.",
  },
  {
    name: 'Smart',
    avatar: '/avatars/avatar3.jpg',
    rating: 5,
    text: "He provided exceptional product photography services for our latest collection. Their attention to detail and creative approach resulted in images that perfectly showcased our products. Highly recommended!",
  },
  // ...add more reviews
];

export default function ReviewSection() {
  return (
    <section className="w-full py-24 bg-[#F8F9FA]">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Headline & Subheading */}
        <h2 className="text-3xl font-bold text-[#333333] text-center mb-2">Hear From Our Happy Customers</h2>
        <p className="text-lg text-[#6c757d] text-center mb-10">Real stories from parents and kids who love our toys!</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {reviews.map((review, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-white border border-[#DEE2E6] p-8 flex flex-col items-start relative hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex items-center mb-4">
                <img
                  src={review.avatar}
                  alt={review.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white mr-4"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(review.name) + '&background=232326&color=fff&size=128'; }}
                />
                <div>
                  <div className="text-lg font-semibold text-[#333333]">{review.name}</div>
                </div>
              </div>
              <p className="text-[#4A4A4A] mb-6 text-base leading-relaxed">"{review.text}"</p>
              <div className="flex items-center mt-auto">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-[#FFC300] fill-[#FFC300] mr-1" />
                ))}
                {[...Array(5 - review.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-[#DEE2E6] mr-1" />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-10">
          <a
            href="/reviews"
            className="inline-block px-6 py-3 bg-[#42A5F5] text-white font-semibold rounded-lg shadow hover:bg-[#1e88e5] transition-colors"
          >
            Read more reviews
          </a>
        </div>
      </div>
    </section>
  );
} 