// import Particles from "particles.js";
// import { useEffect } from "react";

// const ParticleBackground = () => {
//   useEffect(() => {
//     Particles.init({
//       selector: ".particles",
//       color: "#3B82F6", // Blue color to match the theme
//       connectParticles: true,
//       maxParticles: 100,
//       sizeVariations: 3,
//       speed: 0.5,
//       responsive: [
//         {
//           breakpoint: 768,
//           options: {
//             maxParticles: 50,
//           },
//         },
//       ],
//     });
//   }, []);

//   return <div className="particles absolute inset-0 z-0" />;
// };

// export default ParticleBackground;

import { useEffect } from "react";
import { tsParticles } from "tsparticles"; // Correct import

const ParticleBackground = () => {
  useEffect(() => {
    tsParticles.load("tsparticles", {
      particles: {
        number: {
          value: 100,
          density: {
            enable: true,
            value_area: 800,
          },
        },
        color: {
          value: "#3B82F6", // Blue color to match the theme
        },
        shape: {
          type: "circle",
          stroke: {
            width: 0,
            color: "#000000",
          },
          polygon: {
            nb_sides: 5,
          },
        },
        opacity: {
          value: 0.5,
          random: false,
          anim: {
            enable: false,
            speed: 1,
            opacity_min: 0.1,
            sync: false,
          },
        },
        size: {
          value: 3,
          random: true,
          anim: {
            enable: false,
            speed: 40,
            size_min: 0.1,
            sync: false,
          },
        },
        line_linked: {
          enable: true,
          distance: 150,
          color: "#3B82F6",
          opacity: 0.4,
          width: 1,
        },
        move: {
          enable: true,
          speed: 6,
          direction: "none",
          random: false,
          straight: false,
          out_mode: "out",
          bounce: false,
          attract: {
            enable: false,
            rotateX: 600,
            rotateY: 1200,
          },
        },
      },
      interactivity: {
        detect_on: "canvas",
        events: {
          onHover: {
            enable: true,
            mode: "repulse",
          },
          onClick: {
            enable: true,
            mode: "push",
          },
          onResize: true,
        },
        modes: {
          grab: {
            distance: 400,
            line_linked: {
              opacity: 1,
            },
          },
          bubble: {
            distance: 400,
            size: 40,
            duration: 2,
            opacity: 8,
            speed: 3,
          },
          repulse: {
            distance: 200,
            duration: 0.4,
          },
          push: {
            particles_nb: 4,
          },
          remove: {
            particles_nb: 2,
          },
        },
      },
      retina_detect: true,
    });
  }, []);

  return <div id="tsparticles" className="absolute inset-0 z-0" />;
};

export default ParticleBackground;
