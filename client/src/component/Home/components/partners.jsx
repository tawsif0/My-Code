import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";

// Partner logos
import BritishCouncil from "../../../assets/partners/british-council.png";
import IDP from "../../../assets/partners/idp.png";
import HopeEducation from "../../../assets/partners/hope-education.png";
import INTI from "../../../assets/partners/inti.png";
import Coventry from "../../../assets/partners/coventry.png";
import Hertfordshire from "../../../assets/partners/hertfordshire.png";
import SheffieldHallam from "../../../assets/partners/sheffield-hallam.png";
import SNHU from "../../../assets/partners/snhu.png";
import Swinburne from "../../../assets/partners/swinburne.png";
import Shinawatra from "../../../assets/partners/shinawatra.png";
import Wekerle from "../../../assets/partners/wekerle.png";
import SkyWide from "../../../assets/partners/skywide.png";
import Arbeit from "../../../assets/partners/arbeit.png";

const Partners = () => {
  const viewportRef = useRef(null); // clipping viewport
  const trackRef = useRef(null); // moving track
  const animRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  const partners = [
    { name: "British Council", logo: BritishCouncil },
    { name: "IDP", logo: IDP },
    { name: "HOPE Education Group, China", logo: HopeEducation },
    {
      name: "INTI International University and Colleges, Malaysia",
      logo: INTI,
    },
    { name: "Coventry University, UK", logo: Coventry },
    { name: "University of Hertfordshire, UK", logo: Hertfordshire },
    { name: "Sheffield Hallam University, UK", logo: SheffieldHallam },
    { name: "Southern New Hampshire University, USA", logo: SNHU },
    { name: "Swinburne University of Technology, Australia", logo: Swinburne },
    {
      name: "Shinawatra University, Thailand (Japan Campus)",
      logo: Shinawatra,
    },
    { name: "Wekerle International University, Hungary", logo: Wekerle },
    { name: "SkyWide Migration", logo: SkyWide },
    { name: "Arbeit Technology", logo: Arbeit },
  ];

  // Duplicate once for seamless loop
  const doubled = [...partners, ...partners];

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    const SPEED_PX_PER_SEC = 120; // adjust for faster/slower marquee

    const killAnim = () => {
      if (animRef.current) {
        animRef.current.kill();
        animRef.current = null;
      }
      gsap.set(track, { x: 0 });
    };

    const waitForImages = () => {
      const imgs = Array.from(track.querySelectorAll("img"));
      if (imgs.length === 0) return Promise.resolve();
      const promises = imgs.map((img) =>
        img.complete
          ? Promise.resolve()
          : new Promise((res) => {
              const done = () => res();
              img.addEventListener("load", done, { once: true });
              img.addEventListener("error", done, { once: true });
            })
      );
      return Promise.all(promises);
    };

    const build = async () => {
      killAnim();

      await waitForImages();

      // The track contains two sets back-to-back.
      // Half of the scrollWidth is one full set width.
      const fullSetWidth = track.scrollWidth / 2;

      if (fullSetWidth <= 0) return;

      // Duration based on distance & speed
      const duration = fullSetWidth / SPEED_PX_PER_SEC;

      // Create infinite, seamless loop from 0 to -fullSetWidth
      animRef.current = gsap.fromTo(
        track,
        { x: 0 },
        {
          x: -fullSetWidth,
          duration,
          ease: "none",
          repeat: -1,
        }
      );
    };

    // Pause on hover
    const handleEnter = () => animRef.current && animRef.current.pause();
    const handleLeave = () => animRef.current && animRef.current.play();

    viewport.addEventListener("mouseenter", handleEnter);
    viewport.addEventListener("mouseleave", handleLeave);

    // Rebuild on resize (debounced)
    let resizeTimer;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        build();
      }, 120);
    };
    window.addEventListener("resize", onResize);

    // initial build (a tad delayed to allow layout)
    const t = setTimeout(build, 50);

    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", onResize);
      viewport.removeEventListener("mouseenter", handleEnter);
      viewport.removeEventListener("mouseleave", handleLeave);
      killAnim();
    };
  }, [mounted, partners.length]);

  return (
    <section className="py-34  overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center mb-12">
          <div className="mb-8 bg-[#004080] text-white rounded-full shadow-lg inline-flex items-center justify-center transform hover:scale-105 transition-transform duration-300 group">
            <span className="text-sm font-semibold tracking-wider uppercase inline-block px-4 py-1.5">
              Our Partners
            </span>
          </div>

          {/* Premium Heading */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold !text-gray-900 mb-6 relative inline-block mt-2">
            Meet Our Trusted Global{" "}
            <span className="text-[#004080] relative">Partners</span>
          </h2>
          <div className="w-24 h-1 bg-[#004080] mx-auto rounded-full"></div>
        </div>
        {/* Viewport (clipping) */}
        <div
          ref={viewportRef}
          className="relative w-full overflow-hidden"
          aria-label="Partner logos marquee"
        >
          {/* Moving track */}
          <div
            ref={trackRef}
            className="flex items-center gap-8 will-change-transform"
            style={{
              // Make sure the track is only as wide as content and can move freely
              width: "max-content",
            }}
          >
            {doubled.map((partner, idx) => (
              <div
                key={`${partner.name}-${idx}`}
                className="cursor-pointer logo-card flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
                style={{
                  width: 220,
                  height: 180,
                  flex: "0 0 auto",
                }}
              >
                <div className="w-full h-24 flex items-center justify-center mb-3 p-2">
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="max-h-full max-w-full object-contain"
                    style={{ maxHeight: 80 }}
                    draggable={false}
                  />
                </div>
                <p className="text-xs md:text-sm text-gray-600 text-center font-medium line-clamp-2 px-2">
                  {partner.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Partners;
