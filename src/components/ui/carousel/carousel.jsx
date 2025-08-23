"use client" // This directive is typically used in Next.js for client-side rendering

import React, { useState, useEffect, useCallback, createContext, useContext, useRef } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"

// --- Helper Utilities (Simplified for this example) ---
// A simple `cn` (class names) utility function.
// In a real project, you might use a library like `clsx` or `class-variance-authority`.
function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

// A basic Button component that uses Tailwind CSS classes.
// This replaces the `shadcn/ui` Button for this pure JSX conversion.
function Button({ className, variant, size, disabled, onClick, children, ...props }) {
  const baseClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  const variantClasses = {
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    // Add other variants if needed, e.g., default: "bg-primary text-primary-foreground hover:bg-primary/90"
  };
  const sizeClasses = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10", // Default for icon size
  };

  return (
    <button
      className={cn(baseClasses, variantClasses[variant] || "", sizeClasses[size] || "", className)}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}

// --- Carousel Core Components ---

// Type definitions removed, but the conceptual types are:
// CarouselApi: The API object returned by useEmblaCarousel.
// CarouselOptions: Options passed to Embla Carousel.
// CarouselPlugin: Plugins passed to Embla Carousel.

// Context for the Carousel components to share state
const CarouselContext = createContext(null);

// Custom hook to access carousel context
function useCarousel() {
  const context = useContext(CarouselContext);

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }

  return context;
}

/**
 * Main Carousel component.
 * Manages Embla Carousel instance, state, and provides context to child components.
 */
function Carousel({
  orientation = "horizontal",
  opts,
  setApi,
  plugins,
  className,
  children,
  ...props
}) {
  // Initialize Embla Carousel
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === "horizontal" ? "x" : "y", // Set axis based on orientation prop
    },
    plugins
  );

  // State to track if previous/next scrolling is possible
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  // Callback to update scroll capabilities
  const onSelect = useCallback((emblaApi) => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, []);

  // Callback to scroll to the previous slide
  const scrollPrev = useCallback(() => {
    api?.scrollPrev();
  }, [api]);

  // Callback to scroll to the next slide
  const scrollNext = useCallback(() => {
    api?.scrollNext();
  }, [api]);

  // Keyboard navigation handler
  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollNext();
      }
    },
    [scrollPrev, scrollNext]
  );

  // Effect to expose the Embla API instance if `setApi` is provided
  useEffect(() => {
    if (!api || !setApi) return;
    setApi(api);
  }, [api, setApi]);

  // Effect to attach Embla Carousel event listeners
  useEffect(() => {
    if (!api) return;
    onSelect(api); // Initialize scroll state

    // Listen for reInit and select events to update scroll state
    api.on("reInit", onSelect);
    api.on("select", onSelect);

    // Cleanup function to remove event listeners
    return () => {
      api?.off("select", onSelect);
      api?.off("reInit", onSelect); // Also remove reInit listener
    };
  }, [api, onSelect]);

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api: api,
        opts,
        orientation:
          orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
      }}
    >
      <div
        onKeyDownCapture={handleKeyDown} // Capture keyboard events for navigation
        className={cn("relative", className)}
        role="region" // ARIA role for accessibility
        aria-roledescription="carousel"
        data-slot="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

/**
 * Container for the carousel slides.
 * This component wraps the individual `CarouselItem`s.
 */
function CarouselContent({ className, ...props }) {
  const { carouselRef, orientation } = useCarousel();

  return (
    <div
      ref={carouselRef} // Attach Embla Carousel ref here
      className="overflow-hidden"
      data-slot="carousel-content"
    >
      <div
        className={cn(
          "flex",
          orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col", // Negative margin for spacing compensation
          className
        )}
        {...props}
      />
    </div>
  );
}

/**
 * Individual slide item within the carousel.
 */
function CarouselItem({ className, ...props }) {
  const { orientation } = useCarousel();

  return (
    <div
      role="group" // ARIA role for accessibility
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn(
        "min-w-0 shrink-0 grow-0 ", // Ensures items take full width/height
        orientation === "horizontal" ? "pl-4" : "pt-4", // Padding for spacing compensation
        className
      )}
      {...props}
    />
  );
}

/**
 * Button for navigating to the previous slide.
 */
function CarouselPrevious({
  className,
  variant = "outline",
  size = "icon",
  ...props
}) {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel();

  return (
    <div
      data-slot="carousel-previous"
      variant={variant}
      size={size}
      className={cn(
        "absolute w-10 h-10 rounded-full rounded-l-none bg-white/40  backdrop-blur-md flex justify-center items-center cursor-pointer",
        orientation === "horizontal"
          ? "bottom-0 -right-12 -translate-y-1/2" // Horizontal positioning
          : "-top-12 left-1/2 -translate-x-1/2 rotate-90", // Vertical positioning
        className
      )}
      disabled={!canScrollPrev} // Disable if unable to scroll prev
      onClick={scrollPrev} // Trigger scrollPrev on click
      {...props}
    >
      <ChevronLeft className="stroke-black " strokeWidth={2} size={20}/>
      <span className="sr-only">Previous slide</span> {/* Screen reader text */}
    </div>
  );
}

/**
 * Button for navigating to the next slide.
 */
function CarouselNext({
  className,
  variant = "outline",
  size = "icon",
  ...props
}) {
  const { orientation, scrollNext, canScrollNext } = useCarousel();

  return (
    <div
      data-slot="carousel-next"
      variant={variant}
      size={size}
      className={cn(
        "absolute rounded-full w-10 h-10 rounded-r-none bg-white/40 backdrop-blur-md flex justify-center items-center cursor-pointer",
        orientation === "horizontal"
          ? "top-0 -right-12 -translate-y-1/2" // Horizontal positioning
          : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90", // Vertical positioning
        className
      )}
      disabled={!canScrollNext} // Disable if unable to scroll next
      onClick={scrollNext} // Trigger scrollNext on click
      {...props}
    >
      <ChevronRight color="black" strokeWidth={2} size={20}/>
      <span className="sr-only">Next slide</span> {/* Screen reader text */}
    </div>
  );
}

export {
  // CarouselApi // Type export removed for JSX
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
};
