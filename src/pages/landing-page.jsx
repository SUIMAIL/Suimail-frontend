import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useWallet } from "@suiet/wallet-kit";
import { ConnectButton } from "@suiet/wallet-kit";
import InboxPage from "./Inbox";
import { useCustomWallet } from "../utils/contexts/CustomWallet";
// import"../App.css";


const LandingPage = () => {
  const wallet = useWallet();

  const [walletAddress, setWalletAddress] = useState("");

  const { isConnected, address } = useCustomWallet();
  console.log("address", address);

  useEffect(() => {
    if (!wallet.connected) return;
    setWalletAddress(wallet.account?.address); // Set the wallet address
  }, [wallet.connected]);

  // Log the updated wallet address inside the effect or use it wherever needed
  useEffect(() => {
    console.log(walletAddress); // Logs the updated wallet address
  }, [walletAddress]); // This will log when walletAddress state updates

  return (
    <div>
      {isConnected ? (
        <InboxPage />
      ) : (
        <div className="font-sans">
          {/* Header */}
          <header className="flex justify-between items-center p-4 bg-gray-100 ">
            <img src="/png/suimail-mark.png" alt="SuiMail tiny logo" />
            <nav>
              <ul className="flex space-x-4">
                <li>
                  <Link to="/Home-Page" className="text-black-700">
                    Home
                  </Link>
                </li>
                <li>
                  <a href="#about" className="text-black-700">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#contact" className="text-black-700">
                    Contact Us
                  </a>
                </li>
              </ul>
            </nav>
            {/* <Link to="/connect-wallet"> */}
            {/* <ConnectButton style={{
                background: 'linear-gradient(to bottom, #006bf9, #00c1fa)'
              }}
                className=''
                connectText={
                  <div className=''>
                    <img src='logo' alt="" />
                    <p>{walletAddress ? truncateAddress(walletAddress) : 'Login'}</p>
                  </div>
                }
              /> */}
            <Link
              to="/connect-wallet"
              style={{
                background: "linear-gradient(to bottom, #006bf9, #00c1fa)",
              }}
              className="px-6 py-2   text-white rounded hover:bg-blue-700 transition-colors"
            >
              SignUp/Login
            </Link>

            {/* //////divide//// */}
            {/* <ConnectButton  className="px-3 py-3"   style={{  backgroundColor: "blue" }} /> */}
            {/* <button className="px-4 py-2 bg-blue-600 text-white rounded">
            Connect Wallet
          </button> */}
            {/* </Link> */}
          </header>
          {/* ///////////////main/////////////// */}
          <main className="flex flex-col md:flex-row items-center justify-between px-4 md:px-10 py-10 md:py-20 bg-white-50">
            <div className="w-full md:max-w-lg ">
              <img
                src="/png/suimail.sig.png"
                alt="SuiMail logo-illustration"
                className="mb-6 max-w-[250px] "
              />
              <p className="text-gray-600 mb-6 ">
                Build a secure, private, and community-driven email platform
                where users have full control over their data and identity.
              </p>
              <div className="flex space-x-2">
                {/* <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
              Launch App
            </button> */}
                <Link
                  to="/Home-Page"
                  style={{
                    background: "linear-gradient(to bottom, #006bf9, #00c1fa)",
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Launch App
                </Link>
                <button className="px-6 py-2 bg-gray-200 text-blue-600 rounded hover:bg-gray-300 transition-colors">
                  Learn More
                </button>
              </div>
            </div>
            <img
              src="/png/token.png"
              alt="SuiMail guard-illustration"
              className="hidden md:block max-w-[100px] lg:max-w-[400px] bouncing-image "
            />
          </main>

          {/* {Features and benefits} */}
          <section className="py-20 bg-white relative overflow-hidden">
            {/* Background Image */}
            <div
              className="absolute inset-0  bg-center opacity-80"
              style={{ backgroundImage: "url('./png/barrels.jpg')" }}
            ></div>

            <div className="relative z-10 container mx-auto px-6">
              {/* Header Section */}
              <div className="flex flex-col md:flex-row md:justify-between items-center md:items-start mb-12">
                {/* Header Content on the Left */}
                <div className="flex flex-col md:justify-start items-start mb-12">
                  {/* Header Content */}
                  <div className="mt-8 md:mt-0 flex flex-col items-start">
                    {/* Icon Above Header */}
                    <img
                      src="/png/tiny.png"
                      alt="Icon"
                      className="w-16 h-16 mb-4"
                    />
                    <h2 className="text-3xl font-bold text-gray-800">
                      Features & Benefits
                    </h2>
                  </div>
                </div>

                {/* Additional Text Beside Header */}
                <div className="md:w-1/2 mt-4 md:mt-0">
                  <h2 className="text-3xl font-bold text-gray-800">
                    Features & Benefits
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Suimail offers a user-friendly email platform with a focus
                    on privacy and security. Key features include encrypted
                    messaging, an intuitive interface, customizable themes, and
                    seamless integration with other apps. Suimail also provides
                    robust spam protection, unlimited storage, and fast
                    synchronization across devices, ensuring efficient
                    communication while safeguarding user data.{" "}
                  </p>
                </div>
              </div>

              {/* Cards Section */}
              <div
                className="grid gap-14 sm:grid
                    scalability while reducing reliance on centralized servers.-cols-1 md:grid-cols-2 lg:grid-cols-2 mx-auto max-w-5xl"
              >
                {/* Feature 1 */}
                <div className="bg-white bg-opacity-60 shadow-lg  p-6 backdrop-filter backdrop-blur-md">
                  <p className="text-gray-600">
                    Suimail’s end-to-end encryption ensures that only you and
                    your intended recipient can read your messages, safeguarding
                    privacy and security.
                  </p>
                  <h4 className="text-lg font-bold text-gray-800 mt-4">
                    End-to-end encryption
                  </h4>
                </div>

                {/* Feature 2 */}
                <div className="bg-white bg-opacity-60 shadow-lg  p-6 backdrop-filter backdrop-blur-md">
                  <p className="text-gray-600">
                    Suimail integrates Walrus for decentralized storage,
                    securely distributing emails across multiple nodes, ensuring
                    data privacy, redundancy, and reliability without
                    centralized control.
                  </p>
                  <h4 className="text-lg font-bold text-gray-800 mt-4">
                    Decentralized data storage
                  </h4>
                </div>

                {/* Feature 3 */}
                <div className="bg-white bg-opacity-60 shadow-lg  p-6 backdrop-filter backdrop-blur-md">
                  <p className="text-gray-600">
                    Suimail integrates ZkLogin and wallet-based
                    authentication for secure, seamless access, empowering users
                    to manage emails through blockchain technology..
                  </p>
                  <h4 className="text-lg font-bold text-gray-800 mt-4">
                    Integration with ZkLogin and wallet-based authentication
                  </h4>
                </div>

                {/* Feature 4 */}
                <div className="bg-white bg-opacity-60 shadow-lg  p-6 backdrop-filter backdrop-blur-md">
                  <p className="text-gray-600">
                    Suimail offers scalable solutions for both individuals and
                    enterprises, adapting to growing needs with secure, flexible
                    email management and storage.
                  </p>
                  <h4 className="text-lg font-bold text-gray-800 mt-4">
                    Scalability for individuals and enterprises
                  </h4>
                </div>
              </div>
            </div>
          </section>

          {/* {How it works} */}
          <section className="bg-gray-100 py-16 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold mb-4">How It Works</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                Suimail works by combining privacy-focused encryption and
                decentralized storage to secure your communications. When you
                send an email, it is encrypted end-to-end, ensuring that only
                the intended recipient can read it. Suimail utilizes
                decentralized storage, distributing data across multiple nodes
                to ensure redundancy and security. The platform also integrates
                Web3 for wallet-based authentication, providing seamless and
                secure access, while offering scalability for both individuals
                and enterprises with growing needs.
              </p>
              <div className="w-full h-48 bg-gray-300"></div>
            </div>
          </section>

          {/* Customer Segments */}
          <section className="py-20 bg-white">
            <div className="container mx-auto px-6 text-center">
              <h2 className="text-3xl font-bold text-gray-800">
                Customer Segments
              </h2>
              <p className="mt-4 text-gray-600 max-w-2xl mx-auto font-bold">
              Individual Users:
 Privacy-conscious
 individuals, Web3 enthusiasts,
 crypto users, and DAOs.<br/> Journalists, activists,
 and high-risk groups
 needing secure
 communication.<br/>

 <h2 className="py-2">Enterprise Users :
  Businesses requiring
 private, branded email
 solutions.<br/>Government agencies
 focused on compliance
 and secure email-system</h2>
              </p>

              <div className="mt-10 grid gap-8 md:grid-cols-3">
                {/* Card 1 */}
                <div className="bg-white shadow-md rounded-lg p-6">
                  <p className="text-gray-600">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                    ullamco laboris nisi ut aliquip ex ea commodo consequat.
                  </p>
                  <div className="flex items-center mt-4">
                    <img
                      src="/png/avatar.png"
                      alt="Profile"
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="ml-3">
                      <h4 className="text-gray-800 font-semibold">zid</h4>
                      <p className="text-gray-600 text-sm">zid@suimail</p>
                    </div>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="bg-white shadow-md rounded-lg p-6">
                  <p className="text-gray-600">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                    ullamco laboris nisi ut aliquip ex ea commodo consequat.
                  </p>
                  <div className="flex items-center mt-4">
                    <img
                      src="/png/avatar.png"
                      alt="Profile"
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="ml-3">
                      <h4 className="text-gray-800 font-semibold">zid</h4>
                      <p className="text-gray-600 text-sm">zid@suimail</p>
                    </div>
                  </div>
                </div>

                {/* Card 3 */}
                <div className="bg-white shadow-md rounded-lg p-6">
                  <p className="text-gray-600">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                    ullamco laboris nisi ut aliquip ex ea commodo consequat.
                  </p>
                  <div className="flex items-center mt-4">
                    <img
                      src="/png/avatar.png"
                      alt="Profile"
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="ml-3">
                      <h4 className="text-gray-800 font-semibold">zid</h4>
                      <p className="text-gray-600 text-sm">zid@suimail</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Tokenomics and Revenue Model */}
          <section className="py-20 bg-white">
            <h3 className="text-center text-2xl font-bold text-gray-800">
              Tokenomics & Revenue Model
            </h3>
            <p className="text-center text-gray-600 mt-2">
              Visual breakdown of subscription tiers and token ecosystem.
            </p>
            <ul className="list-disc list-inside mt-10 px-6 md:px-20">
              <li>Breakdown of subscription tiers and benefits.</li>
              <li>Details on token utilization and rewards.</li>
            </ul>
          </section>

          <section className="py-20 bg-gray-50">
            {/* Inline Style for Keyframes */}
            <style>
              {`
    @keyframes scrollCards {
      0% {
        transform: translateX(0%);
      }
      100% {
        transform: translateX(-100%);
      }
    }
  `}
            </style>

            {/* Partnerships and Collaborations Section */}
            <h3 className="text-center text-2xl font-bold text-gray-800">
              Partnerships & Collaborations
            </h3>
            <div className="relative mt-10 h-80 overflow-hidden">
              {/* Carousel container */}
              <div
                className="absolute flex items-start space-x-6"
                style={{
                  animation: "scrollCards 12s linear infinite",
                }}
              >
                {/* Repeated structure for looping */}
                {[...Array(8)].map((_, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center space-y-4"
                    style={{ width: "240px" }}
                  >
                    {/* Top Card */}
                    <div className="shadow-md p-6 flex flex-col items-center border border-gray-300 bg-white rounded">
                      <img
                        src="/png/avatar.png"
                        alt={`Partner ${index + 1}`}
                        className="w-16 h-16 rounded-full"
                      />
                      <p className="mt-2 text-center text-gray-600">
                        Partner {index + 1}
                      </p>
                    </div>
                    {/* Bottom Cards */}
                    <div className="flex space-x-4">
                      <div className="shadow-md p-4 flex flex-col items-center border border-gray-300 bg-white rounded">
                        <img
                          src="/png/avatar.png"
                          alt={`Partner ${index + 1} Sub`}
                          className="w-12 h-12 rounded-full"
                        />
                        <p className="mt-2 text-center text-gray-600 text-sm">
                          Partner {index + 1}
                        </p>
                      </div>
                      <div className="shadow-md p-4 flex flex-col items-center border border-gray-300 bg-white rounded">
                        <img
                          src="/png/avatar.png"
                          alt={`Partner ${index + 1} Sub`}
                          className="w-12 h-12 rounded-full"
                        />
                        <p className="mt-2 text-center text-gray-600 text-sm">
                          Partner {index + 1}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Subscribe Section */}
          <section className="py-10 bg-white flex justify-center items-center relative">
            {/* Image */}
            <div className="w-2/5 relative">
              <img
                src="/png/suimail-512w.png"
                alt="SuiMail"
                className="w-full object-cover"
              />
            </div>

            {/* Card */}
            <div className="absolute top-1/2 transform -translate-y-1/2 right-10 max-w-sm bg-white shadow-lg rounded-lg p-6 z-10">
              <h3 className="text-xl font-bold text-gray-800">
                Subscribe to SuiMail
              </h3>
              <p className="mt-4 text-gray-600">
                Join our community and get started with secure and private email
                solutions.
              </p>
              <div className="mt-6 flex items-center gap-4">
                {/* Primary Button */}
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                  Try SuiMail for Free
                </button>
                {/* Secondary Button */}
                <button className="px-2 py-2 bg-gray-100 text-black-700 rounded hover:bg-gray-400 transition">
                  Upgrade to Pro
                </button>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="bg-blue-50 py-6">
            <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 items-center">
              {/* Logo and Copyright */}
              <div className="flex flex-col items-start">
                <img
                  src="/png/suimail.sig.png"
                  alt="SuiMail"
                  className="w-24 mb-2"
                />
                <p className="text-gray-500 text-sm">
                  2025 SUIMAIL. All Rights Reserved
                </p>
              </div>

              {/* Navigation Links */}
              <div className="flex justify-center space-x-4 text-gray-700 text-sm mt-4 md:mt-0">
                <a href="/terms-of-service" className="hover:text-gray-900">
                  Terms of Service
                </a>
                <a href="/privacy-policy" className="hover:text-gray-900">
                  Privacy Policy
                </a>
                <a href="/security" className="hover:text-gray-900">
                  Security
                </a>
                <a href="/roadmap" className="hover:text-gray-900">
                  Roadmap
                </a>
              </div>

              {/* Quick Links and Social Icons */}
              <div className="flex flex-col md:flex-row items-center md:justify-end space-y-4 md:space-y-0 md:space-x-4 mt-4 md:mt-0">
                {/* Quick Links */}
                <div>
                  <h3 className="font-semibold text-gray-800">
                    Getting Started
                  </h3>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li>
                      <a href="/about-us" className="hover:text-gray-900">
                        About Us
                      </a>
                    </li>
                    <li>
                      <a href="/contact-us" className="hover:text-gray-900">
                        Contact Us
                      </a>
                    </li>
                    <li>
                      <a href="/faq" className="hover:text-gray-900">
                        FAQ
                      </a>
                    </li>
                  </ul>
                </div>

                {/* Social Media Icons */}
                <div className="flex space-x-3">
                  <a href="#" aria-label="Instagram">
                    <img
                      src="/png/mdi_instagram.png"
                      alt="Instagram"
                      className="w-5 h-5"
                    />
                  </a>
                  <a href="#" aria-label="Discord">
                    <img
                      src="/png/discord.png"
                      alt="Discord"
                      className="w-5 h-5"
                    />
                  </a>
                  <a href="#" aria-label="Twitter">
                    <img
                      src="/png/twitter.png"
                      alt="Twitter"
                      className="w-5 h-5"
                    />
                  </a>
                  <a href="#" aria-label="LinkedIn">
                    <img
                      src="/png/linkedin.png"
                      alt="LinkedIn"
                      className="w-5 h-5"
                    />
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
