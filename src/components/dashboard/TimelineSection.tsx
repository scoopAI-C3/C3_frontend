import ScrollReveal from "../ScrollReveal";
import type { DailyTimeline } from "../../types/session";

interface TimelineSectionProps {
  dailyTimeline: DailyTimeline;
}

const TimelineSection = ({ dailyTimeline }: TimelineSectionProps) => {
  return (
    <section className="flex flex-col items-center w-screen min-h-screen py-20">
      <div className="flex flex-col items-start w-[676px]">
        <ScrollReveal animation="fadeUp" delay={0}>
          <h2 className="text-3xl font-bold mb-8">Daily Timeline</h2>
          <div className="text-white/50">
            <p>Decision Count: {dailyTimeline.decisionCount}</p>
            <div className="mt-4">
              {dailyTimeline.events.map((event, index) => (
                <div key={index} className="mb-2">
                  <span>{event.start} - {event.end}: </span>
                  <span>{event.label}</span>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default TimelineSection;
