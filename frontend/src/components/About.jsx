import React from 'react';
import { 
  Users, 
  ThumbsUp, 
  UsersIcon, 
  Clock, 
  Target, 
  Heart, 
  Shield, 
  Zap, 
  Leaf 
} from 'lucide-react';

const About = () => {
  const stats = [
    { id: 1, value: "15+", label: "Happy customers who have trusted us", icon: Users, color: "text-blue-600" },
    { id: 2, value: "99%", label: "Our customers agree with our offer value", icon: ThumbsUp, color: "text-green-600" },
    { id: 3, value: "5,000+", label: "Trusted by thousands of satisfied clients", icon: UsersIcon, color: "text-purple-600" },
    { id: 4, value: "24/7", label: "Our dedicated support team is available", icon: Clock, color: "text-orange-600" }
  ];

  const values = [
    { 
      id: 1, 
      title: "Customer Focus", 
      description: "We put our customers at the heart of everything we do. Your satisfaction is our top priority, and we strive to exceed your expectations with every rental experience.",
      icon: Heart,
      color: "bg-red-50 text-red-600"
    },
    { 
      id: 2, 
      title: "Integrity", 
      description: "Honesty and transparency are the cornerstones of our business. We believe in building trust through clear communication and fair pricing without hidden fees.",
      icon: Shield,
      color: "bg-blue-50 text-blue-600"
    },
    { 
      id: 3, 
      title: "Reliability", 
      description: "Our customers rely on us for safe and dependable transportation. We maintain our vehicles to the highest standards to ensure you have a worry-free driving experience.",
      icon: Shield,
      color: "bg-green-50 text-green-600"
    },
    { 
      id: 4, 
      title: "Innovation", 
      description: "We embrace new technologies and ideas to enhance our services. From easy online booking to vehicle tracking, we are always looking for ways to improve.",
      icon: Zap,
      color: "bg-yellow-50 text-yellow-600"
    },
    { 
      id: 5, 
      title: "Sustainability", 
      description: "We are committed to reducing our environmental impact. Our fleet includes eco-friendly vehicles, and we promote responsible driving practices to protect our planet.",
      icon: Leaf,
      color: "bg-teal-50 text-teal-600"
    }
  ];
  const teams = [
    { name: "Alice Johnson", role: "CEO", image: "https://randomuser.me/api/portraits/women/44.jpg" },
    { name: "Bob Smith", role: "CTO", image: "https://randomuser.me/api/portraits/men/46.jpg" },
    { name: "Catherine Lee", role: "COO", image: "https://randomuser.me/api/portraits/women/47.jpg" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-800 to-gray-200 text-white py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Who we are</h1>
          <p className="text-xl md:text-2xl max-w-3xl leading-relaxed">
            Founded with a passion for making city travel easy and accessible, we have grown to become a trusted car rental service in the area.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 md:px-8 py-12 md:py-16 max-w-6xl">
        {/* Introduction Paragraph */}
        <div className="mb-16 md:mb-20">
          <p className="text-gray-700 text-lg md:text-xl leading-relaxed max-w-4xl">
            Our mission is to provide seamless and affordable transportation options for every occasion, from daily commutes to special events. With a fleet of diverse, well-maintained vehicles and a commitment to customer satisfaction, we strive to make every rental experience smooth and stress-free.
          </p>
        </div>

        {/* Stats Section */}
        <div className="mb-16 md:mb-24">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => {
              const IconComponent = stat.icon;
              return (
                <div 
                  key={stat.id} 
                  className="bg-white rounded-xl shadow-lg p-6 text-center transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
                >
                  <div className="flex justify-center mb-4">
                    <div className={`p-3 rounded-full ${stat.color} bg-opacity-10`}>
                      <IconComponent className="h-8 w-8" />
                    </div>
                  </div>
                  <div className={`text-3xl md:text-4xl font-bold mb-2 ${stat.color}`}>
                    {stat.value}
                  </div>
                  <p className="text-gray-600">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mission Section */}
        <div className="mb-16 md:mb-24">
          <div className="flex items-center mb-8">
            <Target className="h-8 w-8 text-indigo-600 mr-3" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Our mission</h2>
          </div>
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-8 md:p-10 shadow-md">
            <p className="text-gray-800 text-lg md:text-xl leading-relaxed">
              Our mission is to provide exceptional car rental services that make urban travel easy, affordable, and enjoyable. We aim to create a seamless experience by offering a diverse fleet of vehicles, flexible rental options, and outstanding customer support. We are committed to being your trusted partner in city travel, ensuring every journey is smooth, convenient, and tailored to your needs.
            </p>
          </div>
        </div>

        {/* Values Section */}
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-10">Our values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value) => {
              const IconComponent = value.icon;
              return (
                <div 
                  key={value.id} 
                  className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="flex items-start mb-4">
                    <div className={`p-3 rounded-lg ${value.color} mr-4`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{value.title}</h3>
                  </div>
                  <p className="text-gray-700">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
        {/* Team Section */}
        <div className="mt-16 md:mt-24">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-10">Meet the Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {teams.map((member, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow duration-300"
              >   
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-32 h-32 mx-auto rounded-full object-cover mb-4"
                />
                <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                <p className="text-gray-600">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default About;