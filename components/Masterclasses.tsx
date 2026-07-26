'use client';

import { motion } from 'motion/react';
import { BookOpen, Lightbulb, PenTool, LayoutDashboard } from 'lucide-react';

const MASTERCLASSES = [
  {
    id: 1,
    title: 'From Idea to Startup',
    subtitle: 'Understanding the Startup Lifecycle',
    icon: <BookOpen className="w-6 h-6 text-blue-400" />,
    desc: 'Gain a comprehensive understanding of the startup journey, from identifying a problem and validating an idea to building a product, entering the market, scaling the business, and achieving sustainable growth.'
  },
  {
    id: 2,
    title: 'Discover Opportunities',
    subtitle: 'The Art of Idea Generation',
    icon: <Lightbulb className="w-6 h-6 text-blue-400" />,
    desc: 'Learn how to identify real-world problems, uncover market opportunities, and generate innovative business ideas using proven creativity and opportunity recognition techniques.'
  },
  {
    id: 3,
    title: 'Think Like an Innovator',
    subtitle: 'Design Thinking for Startups',
    icon: <PenTool className="w-6 h-6 text-blue-400" />,
    desc: 'Explore customer-centric innovation through design thinking methodologies, including empathy mapping, ideation, prototyping, and solution validation.'
  },
  {
    id: 4,
    title: 'Build a Winning Business Model',
    subtitle: 'Sustainable & Scalable Growth',
    icon: <LayoutDashboard className="w-6 h-6 text-blue-400" />,
    desc: 'Understand how to develop a sustainable and scalable business model by defining value propositions, customer segments, revenue streams, and growth strategies.'
  },
];

export default function Masterclasses() {
  return (
    <section id="masterclasses" className="py-24 relative bg-[#0A0A0A]">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-blue-500 font-medium tracking-wider uppercase text-sm mb-4 block">
            Expert-Led Training
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-6">
            Startup Masterclass Series
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Practical startup frameworks, real-world case studies, and hands-on entrepreneurial learning limited to 70 participants per session.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {MASTERCLASSES.map((mc, idx) => (
            <motion.div
              key={mc.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="p-8 rounded-2xl card-glass border border-white/10 hover:bg-white/[0.05] transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-500/20">
                {mc.icon}
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{mc.title}</h3>
              <p className="text-sm font-medium text-blue-400 mb-4">{mc.subtitle}</p>
              <p className="text-white/60 leading-relaxed">
                {mc.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
