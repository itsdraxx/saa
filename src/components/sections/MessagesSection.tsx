"use client";

import { motion } from "motion/react";
import SectionHeading from "@/components/ui/SectionHeading";
import AudioPlayer from "@/components/ui/AudioPlayer";
import VideoPlayer from "@/components/ui/VideoPlayer";
import { familyMessages } from "@/data/family-messages";
import { User, Volume2, Video, Heart, Quote } from "lucide-react";

export default function MessagesSection() {
  return (
    <section id="messages" className="w-full bg-ivory py-24 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          title="Voice & Video Messages"
          subtitle="Heartfelt wishes, quiet prayers, and loving memories recorded by those who cherish you the most."
        />

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {familyMessages.map((msg, index) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col justify-between overflow-hidden rounded-3xl border border-warm-beige bg-warm-white p-6 shadow-sm transition-all duration-300 hover:border-gold/50 hover:shadow-md"
            >
              <div>
                {/* Family Member Header */}
                <div className="flex items-center gap-4 border-b border-warm-beige/60 pb-4">
                  {/* Avatar Placeholder */}
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-gold/40 bg-champagne/60 text-burgundy shadow-xs">
                    <User className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="font-heading text-xl font-semibold text-charcoal">
                      {msg.name}
                    </h3>
                    <p className="text-xs font-medium text-gold uppercase tracking-wider">
                      {msg.relation}
                    </p>
                  </div>
                  <div className="ml-auto">
                    {msg.type === "video" ? (
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-burgundy/10 text-burgundy" title="Video message">
                        <Video className="h-4 w-4" />
                      </span>
                    ) : (
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/15 text-gold" title="Audio message">
                        <Volume2 className="h-4 w-4" />
                      </span>
                    )}
                  </div>
                </div>

                {/* Short Bio */}
                <p className="mt-4 text-xs leading-relaxed text-soft-brown">
                  {msg.description}
                </p>

                {/* Media Player Component */}
                <div className="mt-5">
                  {msg.type === "video" ? (
                    <VideoPlayer
                      src={msg.mediaSrc}
                      title={`${msg.name}'s Message`}
                      className="w-full"
                    />
                  ) : (
                    <AudioPlayer
                      src={msg.mediaSrc}
                      title={`${msg.name}'s Voice Note`}
                      className="w-full"
                    />
                  )}
                </div>

                {/* Transcript */}
                {msg.transcript && (
                  <div className="mt-5 rounded-2xl border border-warm-beige/60 bg-champagne/15 p-4 text-xs leading-relaxed text-charcoal/80">
                    <div className="mb-1.5 flex items-center gap-1.5 text-burgundy font-medium">
                      <Quote className="h-3.5 w-3.5 fill-current" />
                      <span>Transcript</span>
                    </div>
                    <p className="italic font-body">&ldquo;{msg.transcript}&rdquo;</p>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="mt-6 flex items-center justify-between border-t border-warm-beige/60 pt-3 text-[11px] text-soft-brown">
                <span className="flex items-center gap-1">
                  <Heart className="h-3 w-3 fill-gold text-gold" />
                  Sent with love
                </span>
                <span>Silver Jubilee 2024</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

