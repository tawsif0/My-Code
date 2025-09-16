/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

const SLIDE_DURATION_MS = 5000; // total time per slide
const TRANSITION_SEC = 0.8; // slide transition time
const ZOOM_SEC = 4.8; // zoom tween duration

const Hero = () => {
  const [heroData, setHeroData] = useState([]);
  const [displayedIndex, setDisplayedIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  // Refs
  const currentRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const currentImageRef = useRef(null);
  const nextImageRef = useRef(null);
  const progressItemsRef = useRef([]);
  const progressFillRefs = useRef([]);
  const autoslideTimeoutRef = useRef(null);
  const zoomTweenRef = useRef(null);
  const progressTweenRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const cursorIntervalRef = useRef(null);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    const cleanedPath = imagePath.replace(/^public[\\/]/, "");
    const normalizedPath = cleanedPath.replace(/\\/g, "/");
    return `http://localhost:3500/${normalizedPath}`;
  };

  // Preload helper
  const preloadImage = (url) =>
    new Promise((resolve) => {
      const img = new Image();
      img.onload = resolve;
      img.onerror = resolve; // still resolve to avoid deadlocks
      img.src = url;
    });

  // Typing effect
  const typeText = (text, onComplete) => {
    setIsTyping(true);
    setShowCursor(true);
    let i = 0;
    const base = 80 + Math.random() * 40;
    const pauseAt = Math.floor(text.length * 0.7);
    const pauseDuration = 250;

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    setDisplayText("");

    const type = () => {
      if (i < text.length) {
        if (i === pauseAt) {
          typingTimeoutRef.current = setTimeout(type, pauseDuration);
        } else {
          setDisplayText(text.substring(0, i + 1));
          const char = text.charAt(i);
          const speed = char === " " ? base * 0.7 : base;
          typingTimeoutRef.current = setTimeout(type, speed);
        }
        i++;
      } else {
        setIsTyping(false);
        onComplete && onComplete();
      }
    };
    type();
  };

  // Cleanup helpers
  const killTweensAndTimers = () => {
    if (autoslideTimeoutRef.current) {
      clearTimeout(autoslideTimeoutRef.current);
      autoslideTimeoutRef.current = null;
    }
    if (zoomTweenRef.current) {
      zoomTweenRef.current.kill();
      zoomTweenRef.current = null;
    }
    if (progressTweenRef.current) {
      progressTweenRef.current.kill();
      progressTweenRef.current = null;
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  const scheduleAutoSlide = () => {
    if (heroData.length < 2) return; // no auto-advance if only one slide
    if (isAnimatingRef.current) return; // don't schedule during animation
    if (autoslideTimeoutRef.current) clearTimeout(autoslideTimeoutRef.current);

    autoslideTimeoutRef.current = setTimeout(() => {
      nextSlide();
    }, SLIDE_DURATION_MS);
  };

  const startZoomAnimation = () => {
    if (!currentImageRef.current) return;
    gsap.set(currentImageRef.current, { scale: 1 });
    zoomTweenRef.current = gsap.to(currentImageRef.current, {
      scale: 1.1,
      duration: ZOOM_SEC,
      ease: "none",
    });
  };

  const resetAllProgress = () => {
    progressFillRefs.current.forEach((ref) => {
      if (ref) gsap.set(ref, { scaleX: 0, backgroundColor: "transparent" });
    });
  };

  const startProgressAnimation = (index) => {
    if (!progressFillRefs.current[index]) return;
    const fillRef = progressFillRefs.current[index];

    gsap.set(fillRef, { scaleX: 0, backgroundColor: "#004080" });
    progressTweenRef.current = gsap.to(fillRef, {
      scaleX: 1,
      duration: SLIDE_DURATION_MS / 1000,
      ease: "none",
      onComplete: () => {
        gsap.set(fillRef, { scaleX: 0, backgroundColor: "transparent" });
        nextSlide();
      },
    });
  };

  const applyInitialSlideState = (index) => {
    const url = getImageUrl(heroData[index].image);

    // current layer shows the current slide
    gsap.set(currentImageRef.current, {
      backgroundImage: `url(${url})`,
      x: 0,
      opacity: 1,
      zIndex: 20,
      scale: 1,
    });

    // next layer hidden and cleared to avoid "same image twice" flashes
    gsap.set(nextImageRef.current, {
      backgroundImage: "none",
      x: 0,
      opacity: 0,
      zIndex: 10,
    });

    setDisplayedIndex(index);
    currentRef.current = index;
  };

  const goToSlide = async (nextIndex) => {
    if (!heroData.length) return;
    if (nextIndex === currentRef.current) return;
    if (isAnimatingRef.current) return;

    isAnimatingRef.current = true;
    killTweensAndTimers();
    resetAllProgress();

    const currentImage = currentImageRef.current;
    const nextImage = nextImageRef.current;

    // Preload next image before animating
    const nextUrl = getImageUrl(heroData[nextIndex].image);
    await preloadImage(nextUrl);

    // Prepare nextImage with next slide content
    gsap.set(nextImage, {
      backgroundImage: `url(${nextUrl})`,
      x: "100%",
      opacity: 0.7,
      zIndex: 20,
    });
    // Current image sits below
    gsap.set(currentImage, { zIndex: 10 });

    // Transition timeline
    const tl = gsap.timeline({
      onComplete: () => {
        // Put the new image onto the current layer
        currentImage.style.backgroundImage = `url(${nextUrl})`;
        gsap.set(currentImage, { x: 0, opacity: 1, zIndex: 20, scale: 1 });
        // Clear the next layer to avoid duplicate flashes later
        gsap.set(nextImage, {
          opacity: 0,
          backgroundImage: "none",
          x: 0,
          zIndex: 10,
        });

        currentRef.current = nextIndex;
        setDisplayedIndex(nextIndex);

        // Restart effects for the new slide
        startZoomAnimation();
        startProgressAnimation(nextIndex);
        scheduleAutoSlide();
        typeText(heroData[nextIndex].description);

        isAnimatingRef.current = false;
      },
    });

    tl.to(
      currentImage,
      { x: "-100%", duration: TRANSITION_SEC, ease: "power2.inOut" },
      0
    );
    tl.to(
      nextImage,
      { x: "0%", duration: TRANSITION_SEC, ease: "power2.inOut" },
      0
    );
  };

  const nextSlide = () => {
    if (!heroData.length) return;
    if (isAnimatingRef.current) return;
    const nextIndex = (currentRef.current + 1) % heroData.length;
    goToSlide(nextIndex);
  };

  const prevSlide = () => {
    if (!heroData.length) return;
    if (isAnimatingRef.current) return;
    const prevIndex =
      (currentRef.current - 1 + heroData.length) % heroData.length;
    goToSlide(prevIndex);
  };

  // Fetch data & initial setup
  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const response = await fetch("http://localhost:3500/api/hero");
        if (!response.ok) throw new Error("Failed to fetch hero sections");
        const data = await response.json();

        const formatted = data.map((item) => ({
          id: item._id,
          description: item.description,
          image: item.image,
          createdAt: item.createdAt,
        }));

        setHeroData(formatted);
      } catch (err) {
        console.error("Error fetching hero data:", err);
        setHeroData([]);
      }
    };

    fetchHeroData();

    // cursor blink (once)
    cursorIntervalRef.current = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);

    return () => {
      killTweensAndTimers();
      if (cursorIntervalRef.current) clearInterval(cursorIntervalRef.current);
    };
  }, []);

  // Initialize first slide when data is ready
  useEffect(() => {
    if (!heroData.length || !currentImageRef.current || !nextImageRef.current)
      return;

    killTweensAndTimers();
    resetAllProgress();

    // Set starting slide
    applyInitialSlideState(0);
    typeText(heroData[0].description);
    startZoomAnimation();
    startProgressAnimation(0);
    scheduleAutoSlide();
  }, [heroData]);

  // Progress bullets active state
  useEffect(() => {
    progressItemsRef.current.forEach((item, index) => {
      if (item) {
        item.classList.toggle("bg-white/90", index === displayedIndex);
        item.classList.toggle("bg-white/40", index !== displayedIndex);
      }
    });
  }, [displayedIndex]);

  if (heroData.length === 0) return null;

  return (
    <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
      {/* Background Images */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute top-0 left-0 w-full h-full bg-cover bg-center"
          ref={currentImageRef}
        />
        <div
          className="absolute top-0 left-0 w-full h-full bg-cover bg-center"
          ref={nextImageRef}
        />
      </div>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70 z-1" />

      {/* Content */}
      <div className="relative z-20 w-full h-full px-4 md:px-8 lg:px-12 flex flex-col justify-center container mx-auto">
        <div className="text-center max-w-5xl mx-auto px-8 py-12">
          <p className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight mb-6 text-white">
            <span className="text-container">{displayText}</span>
            {(isTyping || showCursor) && (
              <span
                className="inline-block w-1 h-12 bg-white ml-1 align-middle transition-opacity duration-300"
                style={{ opacity: showCursor ? 1 : 0 }}
              />
            )}
          </p>
        </div>

        {/* Navigation */}
        <div className="absolute bottom-8 left-0 right-0">
          <div className="flex flex-col items-center gap-2.5 mx-auto max-w-xs">
            <div className="flex justify-between w-full">
              <button
                onClick={prevSlide}
                className="bg-black/30 hover:bg-black/40 border-none text-white text-3xl cursor-pointer p-2 rounded-full w-12 h-12 flex items-center justify-center transition-all duration-300 hover:scale-110"
                aria-label="Previous slide"
              >
                <span className="sr-only">Previous</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                onClick={nextSlide}
                className="bg-black/30 hover:bg-black/40 border-none text-white text-3xl cursor-pointer p-2 rounded-full w-12 h-12 flex items-center justify-center transition-all duration-300 hover:scale-110"
                aria-label="Next slide"
              >
                <span className="sr-only">Next</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>

            <div className="flex flex-row gap-2">
              {heroData.map((_, index) => (
                <div
                  key={index}
                  className="flex items-center relative cursor-pointer group"
                  onClick={() => goToSlide(index)}
                  ref={(el) => (progressItemsRef.current[index] = el)}
                >
                  <div className="w-7 h-1.5 overflow-hidden bg-white/20 relative">
                    <div className="absolute inset-0 bg-white/20" />
                    <div
                      className="absolute top-0 left-0 h-full bg-white origin-left"
                      ref={(el) => (progressFillRefs.current[index] = el)}
                      style={{ transform: "scaleX(0)", width: "100%" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
