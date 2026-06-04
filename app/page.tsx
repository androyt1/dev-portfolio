import About from "@/components/About";
import Contact from "@/components/Contact";
import Experience from "@/components/Experience";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import Nav from "@/components/Nav";
import Projects from "@/components/Projects";
import Skills from "@/components/Skills";

export default function Home() {
  return (
    <>
      <Nav />
      <main id="top">
        <Hero />
        <div className="content-bg">
          <Marquee />
          <About />
          <Experience />
          <Projects />
          <Skills />
          <Contact />
        </div>
      </main>
      <Footer />
    </>
  );
}
