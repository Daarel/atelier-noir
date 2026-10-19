import type { FC } from 'react';

import { SERVICES } from '@/constants';

const ServicesGrid: FC = () => {
  return (
    <section className="border-foreground/10 bg-background w-full border-t py-14 md:py-20">
      <div className="container mx-auto px-6 sm:px-10 lg:px-16">
        <div className="border-foreground/15 border-y py-1 sm:py-2">
          <div className="divide-foreground/15 grid grid-cols-1 divide-y md:grid-cols-2 md:divide-x md:divide-y-0 lg:grid-cols-4">
            {SERVICES.map((service, index) => (
              <div
                key={service.id}
                className={`hover:bg-muted/30 flex flex-col justify-start py-8 transition-colors duration-300 sm:py-9 md:py-10 ${
                  index === 0
                    ? 'md:pr-6 lg:pr-8'
                    : index === SERVICES.length - 1
                      ? 'md:pl-6 lg:pl-8'
                      : 'md:px-6 lg:px-8'
                }`}
              >
                <span className="text-foreground/80 font-mono text-[11px] font-medium tracking-[0.2em] uppercase">
                  {service.category}
                </span>
                <h3 className="text-foreground mt-3 text-xs font-bold tracking-wider uppercase sm:text-[13px] sm:leading-snug">
                  {service.title}
                </h3>
                <p className="text-muted-foreground mt-2.5 text-xs leading-relaxed font-light">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesGrid;
