
import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { APP_NAME } from '../constants';
import { AcademicCapIcon, BookOpenIcon, SparklesIcon, UserCircleIcon, ChatAlt2Icon } from '../components/icons/HeroIcons';

const FeatureCard: React.FC<{title: string, description: string, Icon: React.ElementType}> = ({title, description, Icon}) => (
    <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full mb-4">
            <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
    </div>
);

const CourseHighlightCard: React.FC<{title: string, description: string, Icon: React.ElementType, linkTo: string}> = ({title, description, Icon, linkTo}) => (
  <Link to={linkTo} className="group block bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 ease-in-out">
      <div className="flex items-center justify-center w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full mb-6 mx-auto group-hover:bg-indigo-200 transition-colors duration-300">
          <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-2xl font-semibold text-gray-800 mb-3 text-center group-hover:text-indigo-600 transition-colors duration-300">{title}</h3>
      <p className="text-gray-600 text-sm text-center mb-4 h-16">{description}</p>
      <div className="text-center">
        <span className="inline-block text-indigo-600 font-semibold group-hover:underline">
            Explore {title} &rarr;
        </span>
      </div>
  </Link>
);

const TestimonialCard: React.FC<{ quote: string; name: string; role: string; AvatarIcon: React.ElementType }> = ({ quote, name, role, AvatarIcon }) => (
  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl shadow-lg h-full flex flex-col">
    <ChatAlt2Icon className="w-10 h-10 text-blue-400 mb-4" />
    <blockquote className="text-gray-700 italic text-base mb-6 flex-grow">
      "{quote}"
    </blockquote>
    <div className="flex items-center">
      <AvatarIcon className="w-12 h-12 text-blue-500 rounded-full mr-4" />
      <div>
        <p className="font-semibold text-gray-800">{name}</p>
        <p className="text-sm text-blue-600">{role}</p>
      </div>
    </div>
  </div>
);


const HomePage: React.FC = () => {
  const testimonials = [
    {
      name: "Sarah L.",
      role: "IELTS Achiever",
      quote: "The IELTS preparation course was fantastic! The structured lessons and mock tests helped me achieve my target score. Highly recommended!",
      AvatarIcon: UserCircleIcon,
    },
    {
      name: "John B.",
      role: "Grammar Enthusiast",
      quote: "I finally understand complex grammar rules. The explanations are so clear and the exercises are very helpful for my daily learning.",
      AvatarIcon: UserCircleIcon,
    },
    {
      name: "Maria P.",
      role: "Vocabulary Builder",
      quote: "My vocabulary has expanded significantly. Learning new words is now fun and engaging, not a chore! This platform is amazing.",
      AvatarIcon: UserCircleIcon,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16 sm:py-20 md:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 sm:mb-6">
              Welcome to {APP_NAME}
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-8 sm:mb-10 max-w-xl md:max-w-3xl mx-auto">
              Your comprehensive platform for mastering English grammar, vocabulary, and acing your exams.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 sm:mt-10">
              <Link to="/signup" className="w-full sm:w-auto">
                <Button variant="primary" size="lg" className="bg-orange-500 hover:bg-orange-600 text-white focus:ring-orange-400 w-full sm:w-auto">
                  Get Started Now
                </Button>
              </Link>
              <Link to="/dashboard/category/grammar" className="w-full sm:w-auto"> {/* Example link */}
                <Button variant="ghost" size="lg" className="text-white border border-white hover:bg-white hover:bg-opacity-20 w-full sm:w-auto">
                  Explore Courses
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 md:py-16 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-10 md:mb-12">
              Why Choose {APP_NAME}?
            </h2>
            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
              <FeatureCard 
                Icon={BookOpenIcon}
                title="Structured Learning"
                description="Master grammar, vocabulary, and exam techniques with our organized lessons and clear explanations."
              />
              <FeatureCard 
                Icon={AcademicCapIcon}
                title="Exam Preparation"
                description="Specific content for IELTS, SSC, HSC to help you achieve your target scores."
              />
              <FeatureCard 
                Icon={SparklesIcon}
                title="Interactive Content"
                description="Engage with diverse learning materials designed to make learning effective and enjoyable."
              />
            </div>
          </div>
        </section>

        {/* Animated Courses Section */}
        <section className="py-12 md:py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-extrabold text-center text-gray-900 mb-4 md:mb-6">
              Unlock Your Potential
            </h2>
            <p className="text-center text-base md:text-lg text-gray-600 mb-10 md:mb-16 max-w-lg md:max-w-2xl mx-auto">
              Dive into our curated courses designed to boost your English proficiency, from foundational grammar to advanced exam strategies.
            </p>
            <div className="grid md:grid-cols-3 gap-6 md:gap-10">
              <CourseHighlightCard
                Icon={BookOpenIcon}
                title="Master Grammar"
                description="Build a strong foundation with comprehensive grammar lessons and interactive exercises."
                linkTo="/dashboard/category/grammar"
              />
              <CourseHighlightCard
                Icon={SparklesIcon}
                title="Expand Vocabulary"
                description="Learn new words effectively with engaging content and practical usage examples."
                linkTo="/dashboard/category/vocabulary"
              />
              <CourseHighlightCard
                Icon={AcademicCapIcon}
                title="Ace Your IELTS"
                description="Prepare for success with targeted strategies, mock tests, and expert guidance for IELTS."
                linkTo="/dashboard/category/ielts"
              />
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-12 md:py-20 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-extrabold text-center text-gray-900 mb-4 md:mb-6">
              Hear From Our Learners
            </h2>
            <p className="text-center text-base md:text-lg text-gray-600 mb-10 md:mb-16 max-w-lg md:max-w-2xl mx-auto">
              Discover how {APP_NAME} has helped students like you achieve their English learning goals.
            </p>
            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
              {testimonials.map((testimonial, index) => (
                <TestimonialCard
                  key={index}
                  quote={testimonial.quote}
                  name={testimonial.name}
                  role={testimonial.role}
                  AvatarIcon={testimonial.AvatarIcon}
                />
              ))}
            </div>
          </div>
        </section>
        
        {/* Call to Action Section (Existing) */}
        <section className="py-16 md:py-20 bg-blue-600 text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 md:mb-6">Ready to Start Your English Journey?</h2>
            <p className="text-lg md:text-xl mb-8 md:mb-10 max-w-xl md:max-w-2xl mx-auto">
              Join thousands of learners and take your English skills to the next level with {APP_NAME}.
            </p>
            <Link to="/signup">
              <Button variant="primary" size="lg" className="bg-orange-500 hover:bg-orange-600 text-white focus:ring-orange-400 py-3 sm:py-4 px-8 sm:px-10 text-base sm:text-lg">
                Sign Up for Free
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;