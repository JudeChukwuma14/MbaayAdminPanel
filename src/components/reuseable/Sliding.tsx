import React, { useState } from "react";
import image1 from "../../assets/image/img1.jpg";
import image2 from "../../assets/image/img2.jpg";
import image3 from "../../assets/image/img3.jpg";
import image4 from "../../assets/image/world.jpg";
import image5 from "../../assets/image/kira-hand.jpg";
import image6 from "../../assets/image/china.jpg";
import image7 from "../../assets/image/Hand.jpg";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import logo from "../../assets/image/mbbaylogo.png";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
const Sliding: React.FC = () => {
  const [slides] = useState([
    {
      img: image1,
      text: "Reconnect with Your Roots—Shop Artisanal & Cultural Creations.",
    },
    {
      img: image2,
      text: "Authentic. Ethical. Handmade. A Piece of Home, Wherever You Are.",
    },
    {
      img: image3,
      text: "Bridging Cultures, One Handcrafted Piece at a Time",
    },
    {
      img: image4,
      text: "Crafted with Tradition, Designed for the World",
    },
    {
      img: image5,
      text: "Honoring Heritage Through Handcrafted Excellence.",
    },
    {
      img: image6,
      text: "From Our Hands to Your Heart—Authentic Cultural Goods.",
    },
    {
      img: image7,
      text: "Where Tradition Meets Modern Craftsmanship.",
    },
  ]);
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
  };
  return (
    <div className="">
      <motion.div className="hidden lg:block w-[500px] h-screen overflow-hidden fixed top-0 left-0">
        <div className="absolute z-10 flex left-7 w-full top-7 ">
          <img src={logo} alt="Logo" />
        </div>
        <Slider {...settings} className="w-full h-screen">
          {slides.map((slide, index) => (
            <div key={index} className="flex flex-col items-start relative">
              <img
                src={slide.img}
                alt=""
                className="w-full h-screen object-cover mb-4"
              />
              {/* Overlay for the slide */}
              <div className="bg-black w-full h-screen absolute inset-0 opacity-50"></div>
              {/* Slide text */}
              <p className="absolute text-white bottom-28 px-5 text-center z-10">
                {slide.text}
              </p>
            </div>
          ))}
        </Slider>
      </motion.div>
    </div>
  );
};

export default Sliding;
