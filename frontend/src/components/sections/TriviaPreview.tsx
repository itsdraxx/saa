"use client";

import SectionHeading from "@/components/ui/SectionHeading";
import TriviaGame from "@/components/interactive/TriviaGame";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/data/translations";

export default function TriviaPreview() {
  const { language, isTelugu } = useLanguage();
  const t = translations[language].trivia;

  return (
    <section id="trivia" className="w-full bg-champagne/30 py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl text-center">
        <SectionHeading
          title={t.previewHeading}
          subtitle={
            isTelugu
              ? "బుజ్జి & సత్య గురించి మీకు ఎంత తెలుసు? జ్ఞాపకాలను ఇక్కడే ఒక్కొక్కటిగా ఊహించండి!"
              : "How well do you know Bujji & Satya? Guess the memories right here, one after another!"
          }
        />

        <div className="mt-6 sm:mt-8">
          <TriviaGame autoStart={true} embedded={true} />
        </div>
      </div>
    </section>
  );
}
