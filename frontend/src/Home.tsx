import { useRef } from 'react'
// import './app.css';
import { Link } from 'react-router-dom';
// import Image from "./assets/landing.gif"

const Home = () => {
    const featureRef = useRef<HTMLDivElement>(null);
    const benefitsRef = useRef<HTMLDivElement>(null);

    const handleFeatureClick = () => {
        if (featureRef.current) {
            featureRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleBenefitsClick = () => {
        if (benefitsRef.current) {
            benefitsRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // const [isOpen, setIsOpen] = useState(false);

    // const toggleMenu = () => {
    //   setIsOpen(!isOpen);
    // };

    return (
        <div>
            <main className="flex flex-col">
                {/* nav */}
                <div className="flex justify-between items-center md:mx-[8rem] mx-[1rem] my-[3rem]">
                    <div className="flex justify-center items-center">
                        <img src="https://www.autohangaradvantage.com/static/images/og-logo.jpg" className="md:w-[10rem] w-[3rem]" />
                        {/* <h1>Blue Consultants</h1> */}
                    </div>
                    <div className="flex md:gap-[4rem] gap-[1rem] items-center">
                        <h1 onClick={handleFeatureClick} className='cursor-pointer hidden md:block text-[1.5rem] font-semibold'>Features</h1>
                        <h1 onClick={handleBenefitsClick} className='cursor-pointer hidden md:block text-[1.5rem] font-semibold'>Benefits</h1>

                        <Link to="/login" className="link-styles">
                            <button className="md:px-6 md:py-2 px-4 py-1 md:w-[8rem] font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-[#6f1d62]  hover:bg-[#bb44b1] focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-80">
                                Login
                            </button>
                        </Link>


                    </div>
                </div>

                {/* middle section */}
                <div className='overflow-x-hidden  md:mx-[5.2rem]'>
                    <div className="flex md:flex-row flex-col md:gap-[8rem] gap-[4rem] items-center justify-between mx-[3rem] md:mt-[1rem]">
                        <div className="flex flex-col gap-[2rem] md:w-[28rem]">
                            <div>
                                <h1 className="md:text-[4rem] text-[3rem] font-bold text-[#000] mb-4">AutoHanger</h1>
                                <h1 className="md:text-[2rem] text-[2rem] font-bold text-[#000]">Welcome to Auto Hanger Advantage</h1>
                            </div>
                            <h1 className="md:text-[1.5rem] text-[1.9rem] text-[#000] ">Lorem, ipsum dolor sit amet consectetur adipisicing elit. Mollitia doloremque quod asperiores eum modi quasi, sunt quaerat perspiciatis corporis illum officia magni neque temporibus, repudiandae ad dignissimos voluptatem aliquid necessitatibus!</h1>
                            <Link to="/login" className="link-styles">
                                <button className="px-6 py-2 w-[8rem] font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-[#6f1d62]  hover:bg-[#bb44b1] focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-80">
                                    TRY NOW
                                </button>
                            </Link>
                        </div>
                        <div className='ravelent'>
                            {/* <img src={Image} className="w-[60rem] shadow-2xl" alt="logo" /> */}
                        </div>

                    </div>
                    {/* <br />
          <div
            className="overflow-hidden -translate-y-32 -translate-x-32 w-0 h-0 border-l-[120vw] border-r-[0px] border-b-[300px] border-x-transparent border-solid border-sky-200"
          /> */}
                </div>



                {/* last section */}
                <div className="flex flex-col justify-center items-center mt-[5rem]">
                    <hr className="my-2 border-gray-300 w-[100%] 2xl:mt-[15rem]" />

                    {/* future section */}
                    {/* <div className="timeline-container">
            <div ref={featureRef} className="timeline">
              <h1 className="text-[3.5rem] text-[#3388CC] font-semibold  font-roboto flex justify-center mb-4">Features</h1>
              <div className="timeline__event animated fadeInUp delay-3s timeline__event--type1">
                <div className="timeline__event__icon ">
                  <img width="70" height="70" src="https://img.icons8.com/hands/100/experimental-question-mark-hands.png" alt="experimental-question-mark-hands" />
                  <div className="timeline__event__date">
                    Custom Question Generation
                  </div>
                </div>
                <div className="timeline__event__content ">
                  <div className="timeline__event__title">

                  </div>
                  <div className="timeline__event__description">
                    <p>Enter Job Descriptions, Get AI-Crafted Interview Questions - Tailored to Assess Key Skills and Experience Levels</p>
                  </div>
                </div>
              </div>
              <div className="timeline__event animated fadeInUp delay-2s timeline__event--type2">
                <div className="timeline__event__icon">
                  <img width="60" height="60" src="https://img.icons8.com/dusk/64/faq.png" alt="faq" />

                  <div className="timeline__event__date">
                    Comprehensive Answer Guide
                  </div>
                </div>
                <div className="timeline__event__content">
                  <div className="timeline__event__title">

                  </div>
                  <div className="timeline__event__description">
                    <p>Access Well-Structured Answers and Key Keywords for Each Question, Enabling In-Depth Candidate Evaluation</p>
                  </div>
                </div>
              </div>
              <div className="timeline__event animated fadeInUp delay-1s timeline__event--type3">
                <div className="timeline__event__icon">
                  <img width="70" height="70" src="https://img.icons8.com/clouds/100/level-tool.png" alt="level-tool" />

                  <div className="timeline__event__date">
                    Candidate  Evaluation  Tool
                  </div>
                </div>
                <div className="timeline__event__content">
                  <div className="timeline__event__title">

                  </div>
                  <div className="timeline__event__description">
                    <p>Effortlessly Mark Responses as Correct, Partially Correct, or Wrong - Streamline the Scoring Process for Each Skill.</p>
                  </div>

                </div>
              </div>
              <div className="timeline__event animated fadeInUp timeline__event--type1">
                <div className="timeline__event__icon">
                  <img width="60" height="60" src="https://img.icons8.com/dusk/64/communication-skill.png" alt="communication-skill" />
                  <div className="timeline__event__date">
                    Skill-Based Scoring System
                  </div>
                </div>
                <div className="timeline__event__content">
                  <div className="timeline__event__title">

                  </div>
                  <div className="timeline__event__description">
                    <p>Quantify Candidate Competency with an Automated Scoring System Based on Interview Responses</p>
                  </div>
                </div>

              </div>

              <div className="timeline__event animated fadeInUp delay-2s timeline__event--type2">
                <div className="timeline__event__icon">
                  <img width="60" height="60" src="https://img.icons8.com/fluency/48/business-report.png" alt="business-report" />

                  <div className="timeline__event__date">
                    Downloadable Reports
                  </div>
                </div>
                <div className="timeline__event__content">
                  <div className="timeline__event__title">

                  </div>
                  <div className="timeline__event__description">
                    <p>Easily Download Candidate Evaluations and Comprehensive Reports for Record-Keeping and Analysis.</p>
                  </div>
                </div>
              </div>

            </div>
          </div> */}
                    {/* <h1 className="text-[3.5rem] text-[#3388CC] font-semibold  font-roboto flex justify-center mb-4 mt-[5rem]" ref={featureRef}>Features</h1> */}
                    {/* <Features /> */}
                    <hr className="my-2 border-gray-300 w-[100%]" />


                    {/* benfits section */}
                    {/* <h1 className="text-[3.5rem] text-[#3388CC] font-semibold  font-roboto flex justify-center mb-4 mt-[5rem]" ref={benefitsRef}>Benefits</h1> */}
                    {/* <Benefits /> */}
                    {/* <hr className="my-2 border-gray-300 w-[100%]" /> */}
                </div>


                {/* footer */}
                <div className="relative bg-deep-purple-accent-400 ">
                    <svg
                        className="absolute top-0 w-full h-6 -mt-5 sm:-mt-10 sm:h-16 text-deep-purple-accent-400"
                        preserveAspectRatio="none"
                        viewBox="0 0 1440 54"
                    >
                        {/* <path
            fill="currentColor"
            d="M0 22L120 16.7C240 11 480 1.00001 720 0.700012C960 1.00001 1200 11 1320 16.7L1440 22V54H1320C1200 54 960 54 720 54C480 54 240 54 120 54H0V22Z"
          /> */}
                    </svg>
                    <div className="">
                        <div className="px-4 pt-12 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-0 ">
                            <div className="grid gap-16 row-gap-10 mb-8 lg:grid-cols-6">
                                <div className="md:max-w-md lg:col-span-2">
                                    {/* <img src="https://www.bluetickconsultants.com/images/b-logo.svg" className="w-[8rem]" /> */}

                                    {/* <div className="mt-4 lg:max-w-sm">
                    <p className="text-sm text-deep-purple-50">
                      Sed ut perspiciatis unde omnis iste natus error sit voluptatem
                      accusantium doloremque laudantium, totam rem aperiam.
                    </p>
                    <p className="mt-4 text-sm text-deep-purple-50">
                      Eaque ipsa quae ab illo inventore veritatis et quasi architecto
                      beatae vitae dicta sunt explicabo.
                    </p>
                  </div> */}
                                </div>
                                <div className="grid grid-cols-2 gap-5 row-gap-8 lg:col-span-4 md:grid-cols-4">

                                </div>
                            </div>
                            <div className="flex flex-col justify-between pt-5 pb-10 border-t border-deep-purple-accent-200 sm:flex-row">
                                <p className="text-lg text-[#000]">
                                    2023 © All rights reserved by Bluetick Consultants LLP
                                </p>
                                <div className="flex items-center mt-4 space-x-4 sm:mt-0">
                                    <a
                                        href="https://twitter.com/BluetickConsult"
                                        className="transition-colors duration-300 text-deep-purple-100 hover:text-teal-accent-400"
                                    >
                                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5">
                                            <path d="M24,4.6c-0.9,0.4-1.8,0.7-2.8,0.8c1-0.6,1.8-1.6,2.2-2.7c-1,0.6-2,1-3.1,1.2c-0.9-1-2.2-1.6-3.6-1.6 c-2.7,0-4.9,2.2-4.9,4.9c0,0.4,0,0.8,0.1,1.1C7.7,8.1,4.1,6.1,1.7,3.1C1.2,3.9,1,4.7,1,5.6c0,1.7,0.9,3.2,2.2,4.1 C2.4,9.7,1.6,9.5,1,9.1c0,0,0,0,0,0.1c0,2.4,1.7,4.4,3.9,4.8c-0.4,0.1-0.8,0.2-1.3,0.2c-0.3,0-0.6,0-0.9-0.1c0.6,2,2.4,3.4,4.6,3.4 c-1.7,1.3-3.8,2.1-6.1,2.1c-0.4,0-0.8,0-1.2-0.1c2.2,1.4,4.8,2.2,7.5,2.2c9.1,0,14-7.5,14-14c0-0.2,0-0.4,0-0.6 C22.5,6.4,23.3,5.5,24,4.6z" />
                                        </svg>
                                    </a>
                                    <a
                                        href="https://www.instagram.com/bluetickconsultants/"
                                        className="transition-colors duration-300 text-deep-purple-100 hover:text-teal-accent-400"
                                    >
                                        <svg viewBox="0 0 30 30" fill="currentColor" className="h-6">
                                            <circle cx="15" cy="15" r="4" />
                                            <path d="M19.999,3h-10C6.14,3,3,6.141,3,10.001v10C3,23.86,6.141,27,10.001,27h10C23.86,27,27,23.859,27,19.999v-10   C27,6.14,23.859,3,19.999,3z M15,21c-3.309,0-6-2.691-6-6s2.691-6,6-6s6,2.691,6,6S18.309,21,15,21z M22,9c-0.552,0-1-0.448-1-1   c0-0.552,0.448-1,1-1s1,0.448,1,1C23,8.552,22.552,9,22,9z" />
                                        </svg>
                                    </a>
                                    <a
                                        href="https://www.facebook.com/bluetickconsultants/"
                                        className="transition-colors duration-300 text-deep-purple-100 hover:text-teal-accent-400"
                                    >
                                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5">
                                            <path d="M22,0H2C0.895,0,0,0.895,0,2v20c0,1.105,0.895,2,2,2h11v-9h-3v-4h3V8.413c0-3.1,1.893-4.788,4.659-4.788 c1.325,0,2.463,0.099,2.795,0.143v3.24l-1.918,0.001c-1.504,0-1.795,0.715-1.795,1.763V11h4.44l-1,4h-3.44v9H22c1.105,0,2-0.895,2-2 V2C24,0.895,23.105,0,22,0z" />
                                        </svg>
                                    </a>

                                    <a href='https://www.linkedin.com/company/bluetick-consultants/'>
                                        <img width="25" height="50" src="https://img.icons8.com/ios-filled/50/linkedin.png" alt="linkedin" />
                                    </a>
                                    <a href='https://www.threads.net/@bluetickconsultants'>
                                        <img width="25" height="48" src="https://img.icons8.com/pulsar-line/48/threads.png" alt="threads" />
                                    </a>
                                    <a href='https://www.quora.com/profile/Bluetick-Consultants'>
                                        <img width="25" height="32" src="https://img.icons8.com/windows/32/quora.png" alt="quora" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

            </main>
        </div>
    )
}

export default Home