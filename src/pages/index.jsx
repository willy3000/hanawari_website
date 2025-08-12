import React from "react";

export default function index() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [cart, setCart] = React.useState([]);
  const [isCartOpen, setCartOpen] = React.useState(false);

  const scrollToSection = (sectionId) => {
    if (typeof document !== "undefined") {
      document
        .getElementById(sectionId)
        ?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const phoneNumber = "+254797871209";
  const message = "Hello! I would like to know more about your services.";

  const handleOrderOption = (option) => {
    if (typeof window !== "undefined") {
      switch (option) {
        case "whatsapp":
          const whatsappMessage = encodeURIComponent(
            "Hello! I would like to order Hanawari salsa."
          );
          window.open(
            `https://wa.me/${phoneNumber}?text=${whatsappMessage}`,
            "_blank"
          );
          break;
        case "email":
          window.open(
            `mailto:hello@hanawari.com?subject=Hanawari Salsa Order&body=Hello! I would like to order Hanawari salsa.`,
            "_blank"
          );
          break;
        case "instagram":
          window.open("https://instagram.com/hanawari_salsa", "_blank");
          break;
        case "call":
          window.open(`tel:${phoneNumber}`, "_blank");
          break;
      }
    }
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#D4B896] font-serif">
      {/* Order Options Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-transparent bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#F5E6D3] rounded-lg shadow-xl max-w-md w-full p-8 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-[#8B4513] hover:text-[#FF4500] text-2xl font-bold"
            >
              ×
            </button>

            <div className="text-center mb-6">
              <h3 className="text-3xl font-bold text-[#8B4513] mb-2">
                🔥 ORDER YOUR MOTO! 🔥
              </h3>
              <p className="text-[#5D4E37]">
                Choose your preferred way to order:
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => handleOrderOption("whatsapp")}
                className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold py-4 px-6 rounded-lg shadow-lg flex items-center justify-center space-x-3 transition-all duration-200"
              >
                <span className="text-2xl">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-5 h-5"
                    fill="currentColor"
                  >
                    <path d="M20.52 3.48A11.94 11.94 0 0012 .1C5.73.1.88 4.95.88 11.22c0 1.98.52 3.9 1.5 5.6L.1 23.9l6.26-1.64a11.2 11.2 0 005.56 1.44c6.27 0 11.12-4.85 11.12-11.12 0-3-1.17-5.8-3.18-7.9zM12 20.1a9 9 0 01-4.6-1.2l-.33-.2-3.7.97.98-3.6-.21-.36A9 9 0 1112 20.1z" />
                    <path d="M17.2 14.3c-.3-.15-1.78-.87-2.05-.97-.27-.1-.47-.15-.67.15-.2.3-.8.97-.98 1.17-.18.2-.36.22-.67.07-.3-.14-1.26-.46-2.4-1.48-.88-.78-1.47-1.73-1.64-2.03-.17-.3-.02-.46.13-.6.13-.12.3-.32.45-.48.15-.17.2-.28.3-.47.1-.2 0-.37-.02-.52-.02-.15-.67-1.6-.92-2.19-.24-.57-.48-.49-.66-.5l-.57-.01c-.2 0-.52.07-.79.37-.27.3-1.03 1.01-1.03 2.47s1.05 2.87 1.2 3.07c.14.2 2.08 3.2 5.04 4.49 2.97 1.3 2.97.87 3.5.82.53-.05 1.72-.7 1.97-1.38.25-.68.25-1.26.17-1.38-.08-.12-.3-.2-.6-.35z" />
                  </svg>
                </span>
                <span>Order via WhatsApp</span>
              </button>

              <button
                onClick={() => handleOrderOption("email")}
                className="w-full bg-[#FF4500] hover:bg-[#FF6347] text-white font-bold py-4 px-6 rounded-lg shadow-lg flex items-center justify-center space-x-3 transition-all duration-200"
              >
                <span className="text-2xl">
                  {" "}
                  <svg
                    viewBox="0 0 24 24"
                    className="w-5 h-5"
                    fill="currentColor"
                  >
                    <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                </span>
                <span>Order via Email</span>
              </button>

              <button
                onClick={() => handleOrderOption("instagram")}
                className="w-full bg-[#E4405F] hover:bg-[#D73652] text-white font-bold py-4 px-6 rounded-lg shadow-lg flex items-center justify-center space-x-3 transition-all duration-200"
              >
                <span className="text-2xl">
                  {" "}
                  <svg
                    viewBox="0 0 24 24"
                    className="w-5 h-5"
                    fill="currentColor"
                  >
                    <path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm5 6.2A4.8 4.8 0 1016.8 13 4.8 4.8 0 0012 8.2zm6.4-2.6a1.2 1.2 0 11-1.2 1.2 1.2 1.2 0 011.2-1.2zM12 10.6A1.4 1.4 0 1110.6 12 1.4 1.4 0 0112 10.6z" />
                  </svg>
                </span>
                <span>Order via Instagram</span>
              </button>

              <button
                onClick={() => handleOrderOption("call")}
                className="w-full bg-[#8B4513] hover:bg-[#A0522D] text-white font-bold py-4 px-6 rounded-lg shadow-lg flex items-center justify-center space-x-3 transition-all duration-200"
              >
                <span className="text-2xl">
                  {" "}
                  <svg
                    viewBox="0 0 24 24"
                    className="w-5 h-5"
                    fill="currentColor"
                  >
                    <path d="M20.487 17.14l-4.015-1.72a1.02 1.02 0 00-1.02.22l-1.86 1.86a15.02 15.02 0 01-7.21-7.21l1.86-1.86a1.02 1.02 0 00.22-1.02L6.86 3.513A1.02 1.02 0 005.9 2.9L3.48 4.36A1.02 1.02 0 003 5.29C2.7 6.86 3 9.2 4.7 12.04c1.8 3.1 4.8 6.1 7.9 7.9 2.84 1.7 5.18 2 6.75 1.71a1.02 1.02 0 00.93-.48l1.46-2.42a1.02 1.02 0 00-.62-1.48z" />
                  </svg>
                </span>
                <span>Call to Order</span>
              </button>
            </div>

            <div className="text-center mt-6">
              <p className="text-sm text-[#5D4E37]">
                We're always thrilled to receive new orders!
              </p>
            </div>
          </div>
        </div>
      )}

      <section className="relative min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-[#D4B896] to-[#C4A676]">
        <div className="text-center max-w-4xl mx-auto">
          <div className="mb-8">
            <img
              src="/assets/logo.png"
              alt="Hanawari Logo"
              className="w-150 h-auto mx-auto mb-6 drop-shadow-lg"
            />
          </div>

          <h1 className="text-6xl md:text-8xl font-bold text-[#8B4513] mb-4 tracking-wider drop-shadow-md">
            HANAWARI
          </h1>

          <div className="bg-[#CD853F] px-8 py-4 inline-block mb-6 transform rotate-1 shadow-lg">
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-wide">
              HOMEMADE KENYAN SALSA
            </h2>
          </div>

          <p className="text-xl md:text-2xl text-[#8B4513] mb-8 font-semibold">
            🔥 TASTE THE MOTO 🔥
          </p>

          <div className="space-y-4 md:space-y-0 md:space-x-6 md:flex md:justify-center">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#FF4500] hover:bg-[#FF6347] text-white font-bold py-4 px-8 text-xl rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 border-4 border-[#8B4513]"
            >
              🌶️ ORDER NOW TO TASTE THE FIRE! 🌶️
            </button>
            <button
              onClick={() => scrollToSection("about")}
              className="bg-[#8B4513] hover:bg-[#A0522D] text-white font-bold py-4 px-8 text-xl rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Learn Our Story
            </button>
          </div>
        </div>
      </section>

      <section id="about" className="py-20 px-4 bg-[#F5E6D3] relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-[#8B4513] mb-6">
              THE HANAWARI EXPERIENCE
            </h2>
            <div className="w-32 h-1 bg-[#FF4500] mx-auto mb-8"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-[#8B4513] mb-6">
                Authentic Kenyan Fire 🔥
              </h3>
              <p className="text-lg text-[#5D4E37] mb-6 leading-relaxed">
                Born from the vibrant streets of Kenya, Hanawari brings you the
                authentic taste of homemade salsa that will ignite your taste
                buds. Our secret blend of local spices and fresh ingredients
                creates the perfect balance of heat and flavor.
              </p>
              <p className="text-lg text-[#5D4E37] mb-8 leading-relaxed">
                Every jar is crafted with love, using traditional recipes passed
                down through generations. When we say "Taste the Moto," we mean
                experience the real fire of Kenyan cuisine!
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-[#FF4500] hover:bg-[#FF6347] text-white font-bold py-4 px-8 text-xl rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                🔥 GET YOUR SALSA NOW! 🔥
              </button>
            </div>

            <div className="relative">
              <div className="bg-[#CD853F] p-8 rounded-lg shadow-xl transform rotate-2">
                <div className="bg-[#F5E6D3] p-6 rounded-lg transform -rotate-1">
                  <h4 className="text-2xl font-bold text-[#8B4513] mb-4">
                    What Makes Us Special:
                  </h4>
                  <ul className="space-y-3 text-[#5D4E37]">
                    <li className="flex items-center">
                      <span className="text-[#FF4500] mr-2">🌶️</span> 100%
                      Homemade
                    </li>
                    <li className="flex items-center">
                      <span className="text-[#FF4500] mr-2">🔥</span> Authentic
                      Kenyan Recipe
                    </li>
                    <li className="flex items-center">
                      <span className="text-[#FF4500] mr-2">🌿</span> Fresh
                      Local Ingredients
                    </li>
                    <li className="flex items-center">
                      <span className="text-[#FF4500] mr-2">❤️</span> Made with
                      Love
                    </li>
                    <li className="flex items-center">
                      <span className="text-[#FF4500] mr-2">⚡</span> The
                      Perfect Heat Level
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-[#D4B896]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-[#8B4513] mb-6">
              CHOOSE YOUR HEAT LEVEL
            </h2>
            <p className="text-xl text-[#5D4E37]">
              From mild warmth to volcanic fire - we've got your perfect moto!
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#F5E6D3] p-8 rounded-lg shadow-xl text-center transform hover:scale-105 transition-all duration-200">
              <div className="text-6xl mb-4">🌶️</div>
              <h3 className="text-2xl font-bold text-[#8B4513] mb-4">GENTLE</h3>
              <p className="text-[#5D4E37] mb-6">
                Perfect for beginners - a warm introduction to Kenyan flavors
              </p>
              <div className="text-3xl font-bold text-[#FF4500] mb-6">
                KES 899
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-[#FF4500] hover:bg-[#FF6347] text-white font-bold py-3 px-6 rounded-lg shadow-lg w-full"
              >
                ORDER GENTLE
              </button>
            </div>

            <div className="bg-[#F5E6D3] p-8 rounded-lg shadow-xl text-center transform hover:scale-105 transition-all duration-200 border-4 border-[#FF4500]">
              <div className="text-6xl mb-4">🌶️🌶️</div>
              <h3 className="text-2xl font-bold text-[#8B4513] mb-4">
                CLASSIC
              </h3>
              <p className="text-[#5D4E37] mb-6">
                Our signature blend - the perfect balance of heat and flavor
              </p>
              <div className="text-3xl font-bold text-[#FF4500] mb-6">
                KES 899
              </div>
              <div className="bg-[#FF4500] text-white px-3 py-1 rounded-full text-sm mb-4">
                MOST POPULAR
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-[#FF4500] hover:bg-[#FF6347] text-white font-bold py-3 px-6 rounded-lg shadow-lg w-full"
              >
                ORDER CLASSIC
              </button>
            </div>

            <div className="bg-[#F5E6D3] p-8 rounded-lg shadow-xl text-center transform hover:scale-105 transition-all duration-200">
              <div className="text-6xl mb-4">🌶️🌶️🌶️</div>
              <h3 className="text-2xl font-bold text-[#8B4513] mb-4">
                VOLCANIC
              </h3>
              <p className="text-[#5D4E37] mb-6">
                For the brave souls - experience the full power of Kenyan fire!
              </p>
              <div className="text-3xl font-bold text-[#FF4500] mb-6">
                KES 899
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-[#FF4500] hover:bg-[#FF6347] text-white font-bold py-3 px-6 rounded-lg shadow-lg w-full"
              >
                ORDER VOLCANIC
              </button>
            </div>
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#8B4513] hover:bg-[#A0522D] text-white font-bold py-6 px-12 text-2xl rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              🔥 ORDER ALL THREE & SAVE! 🔥
            </button>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-[#F5E6D3]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-[#8B4513] mb-6">
              HANAWARI LOVERS SAY
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#D4B896] p-6 rounded-lg shadow-lg">
              <div className="text-[#FF4500] text-2xl mb-3">⭐⭐⭐⭐⭐</div>
              <p className="text-[#5D4E37] mb-4">
                "This salsa is like none I've had before. The
                blend of spices is incredible!"
              </p>
              <p className="font-bold text-[#8B4513]">- Sarah K.</p>
            </div>

            <div className="bg-[#D4B896] p-6 rounded-lg shadow-lg">
              <div className="text-[#FF4500] text-2xl mb-3">⭐⭐⭐⭐⭐</div>
              <p className="text-[#5D4E37] mb-4">
                "I'm addicted to the Volcano Moto! Perfect heat level and
                amazing taste."
              </p>
              <p className="font-bold text-[#8B4513]">- Mike R.</p>
            </div>

            <div className="bg-[#D4B896] p-6 rounded-lg shadow-lg">
              <div className="text-[#FF4500] text-2xl mb-3">⭐⭐⭐⭐⭐</div>
              <p className="text-[#5D4E37] mb-4">
                "Finally found a salsa that actually has character! Hanawari is
                the real deal."
              </p>
              <p className="font-bold text-[#8B4513]">- Elena M.</p>
            </div>
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#FF4500] hover:bg-[#FF6347] text-white font-bold py-4 px-8 text-xl rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              JOIN THE HANAWARI FAMILY TODAY!
            </button>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-[#8B4513] text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-white mb-6">
            READY TO TASTE THE MOTO?
          </h2>
          <p className="text-xl text-[#F5E6D3] mb-8">
            Don't wait - your taste buds are calling for adventure!
          </p>

          <div className="space-y-4 md:space-y-0 md:space-x-6 md:flex md:justify-center">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#FF4500] hover:bg-[#FF6347] text-white font-bold py-6 px-12 text-2xl rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 animate-pulse"
            >
              🔥 ORDER NOW - FREE SHIPPING! 🔥
            </button>
          </div>

          <p className="text-[#F5E6D3] mt-6">
            Limited time offer - Free shipping on orders over $25!
          </p>
        </div>
      </section>

      <footer className="bg-[#5D4E37] text-white py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <img
              src="assets/logo.png"
              alt="Hanawari Logo"
              className="w-50 h-auto mx-auto mb-4"
            />
            <h3 className="text-2xl font-bold">HANAWARI</h3>
            <p className="text-[#D4B896]">
              Authentic Kenyan Salsa - Taste the Moto
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <button
                onClick={() => handleOrderOption("whatsapp")}
                className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold py-4 px-6 rounded-lg shadow-lg flex items-center justify-center space-x-3 transition-all duration-200 m-1"
              >
                <span className="text-2xl">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-5 h-5"
                    fill="currentColor"
                  >
                    <path d="M20.52 3.48A11.94 11.94 0 0012 .1C5.73.1.88 4.95.88 11.22c0 1.98.52 3.9 1.5 5.6L.1 23.9l6.26-1.64a11.2 11.2 0 005.56 1.44c6.27 0 11.12-4.85 11.12-11.12 0-3-1.17-5.8-3.18-7.9zM12 20.1a9 9 0 01-4.6-1.2l-.33-.2-3.7.97.98-3.6-.21-.36A9 9 0 1112 20.1z" />
                    <path d="M17.2 14.3c-.3-.15-1.78-.87-2.05-.97-.27-.1-.47-.15-.67.15-.2.3-.8.97-.98 1.17-.18.2-.36.22-.67.07-.3-.14-1.26-.46-2.4-1.48-.88-.78-1.47-1.73-1.64-2.03-.17-.3-.02-.46.13-.6.13-.12.3-.32.45-.48.15-.17.2-.28.3-.47.1-.2 0-.37-.02-.52-.02-.15-.67-1.6-.92-2.19-.24-.57-.48-.49-.66-.5l-.57-.01c-.2 0-.52.07-.79.37-.27.3-1.03 1.01-1.03 2.47s1.05 2.87 1.2 3.07c.14.2 2.08 3.2 5.04 4.49 2.97 1.3 2.97.87 3.5.82.53-.05 1.72-.7 1.97-1.38.25-.68.25-1.26.17-1.38-.08-.12-.3-.2-.6-.35z" />
                  </svg>
                </span>
                <span>+25497871209</span>
              </button>
              <button
                onClick={() => handleOrderOption("email")}
                className="w-full bg-[#FF4500] hover:bg-[#FF6347] text-white font-bold py-4 px-6 rounded-lg shadow-lg flex items-center justify-center space-x-3 transition-all duration-200 m-1"
              >
                <span className="text-2xl">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-5 h-5"
                    fill="currentColor"
                  >
                    <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                </span>
                <span>hanawarihomemade@gmail.com</span>
              </button>
            </div>
            <div>
              <h4 className="font-bold mb-4">Follow Us</h4>

              <button
                onClick={() => handleOrderOption("instagram")}
                className="w-full bg-[#E4405F] hover:bg-[#D73652] text-white font-bold py-4 px-6 rounded-lg shadow-lg flex items-center justify-center space-x-3 transition-all duration-200"
              >
                <span className="text-2xl">
                  {" "}
                  <svg
                    viewBox="0 0 24 24"
                    className="w-5 h-5"
                    fill="currentColor"
                  >
                    <path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm5 6.2A4.8 4.8 0 1016.8 13 4.8 4.8 0 0012 8.2zm6.4-2.6a1.2 1.2 0 11-1.2 1.2 1.2 1.2 0 011.2-1.2zM12 10.6A1.4 1.4 0 1110.6 12 1.4 1.4 0 0112 10.6z" />
                  </svg>
                </span>
                <span>@hanawari_salsaI</span>
              </button>
            </div>
            <div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-[#FF4500] hover:bg-[#FF6347] text-white font-bold py-3 px-6 rounded-lg shadow-lg"
              >
                ORDER NOW!
              </button>
            </div>
          </div>

          <div className="border-t border-[#8B4513] pt-8">
            <p>
              {`${new Date().getFullYear()} Hanawari. All rights reserved. Made with 🔥 in Kenya.`}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
