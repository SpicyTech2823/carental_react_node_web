import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaGithub } from "react-icons/fa";
import Swal from "sweetalert2";
const Contact = () => {
  const onSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);

    formData.append("access_key", "dd64c439-81c3-432c-b88a-9091eaf3aff6");

    const object = Object.fromEntries(formData);
    const json = JSON.stringify(object);

    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: json,
    }).then((res) => res.json());

    if (res.success) {
      Swal.fire({
        title: "Successfully!",
        text: "Your message has been submitted!",
        icon: "success",
      });
      event.target.reset();
    } else {
      console.error("Form submission failed");
    }
    
  };
  const socialLinks = [
      { icon: <FaFacebook />, label: "Facebook", href: "#", color: "blue" },
      { icon: <FaTwitter />, label: "Twitter", href: "#", color: "lightblue" },
      { icon: <FaInstagram />, label: "Instagram", href: "#", color: "purple" },
      { icon: <FaLinkedin />, label: "LinkedIn", href: "#", color: "darkblue" },
      { icon: <FaGithub />, label: "GitHub", href: "#", color: "black" }
    ];
  return (
        <section
      id="contact"
      className="min-h-screen flex items-center justify-center px-10 py-20 mt-15"
    >
      <div className="w-full max-w-5xl rounded-2xl p-8">
        
        {/* Heading */}
        <h2 className="text-4xl font-bold text-center text-red-800 mb-10">
          Contact <span className="text-red-900">Me</span>
        </h2>
        <div className="grid md:grid-cols-2 gap-20">
          {/* Left side */}
          <div>
            <h3 className="text-2xl font-semibold mb-6 text-red-800 font-sans">
              Get in Touch
            </h3>
            <p className="text-lg text-black mb-8">
              Feel free to reach out to me by filling this form or contact our team
              directly via email.
            </p>

            <ul className="space-y-6 text-lg text-black">
              <li>
                <strong>Email:</strong> carent@gmail.com
              </li>
              <li>
                <strong>Phone:</strong> +855 12 345 6789
              </li>
              <li>
                <strong>Location:</strong> Phnom Penh, Cambodia
              </li>
            </ul>
          </div>

          {/* Right side (form) */}
          <form className="space-y-6" onSubmit={onSubmit}>
            <div>
              <label className="block text-lg text-red-800 mb-2">Name</label>
              <input
                name="name"
                type="text"
                placeholder="Your name"
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-gray-200 outline-none text-black  text-lg"
                required
              />
            </div>

            <div>
              <label className="block text-red-800 mb-1">Email</label>
              <input
                name="email"
                type="email"
                placeholder="Your email"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-200 outline-none text-balance"
                required
              />
            </div>

            <div>
              <label className="block text-red-800 mb-1">Message</label>
              <textarea
                name="message"
                rows="4"
                placeholder="Your message"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gray-200 outline-none text-black "
                required
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-red-800 text-white py-2 px-4 rounded-lg hover:bg-red-500 transition cursor-pointer font-semibold"
            >
              Send Message
            </button>
          </form>
        </div>
        <div className="text-center mb-20 mt-15">
          <h2 className="text-4xl font-bold text-center text-red-800 mb-10 mt-20">
          Touch in <span className="text-red-900">Social</span>
          <div className="flex space-x-10 gap-8 justify-center mt-15">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                   style={{ color: social.color }}
                  className=" hover:text-gray-400 transition-colors duration-300 transform hover:scale-110 text-5xl"
                >
                  {social.icon}
                </a>
              ))}
            </div>
        </h2>
        </div>
      </div> 
    </section>
  );
};

export default Contact;
