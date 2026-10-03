import { Footer } from './components/Footer'
import { MeshBackground } from './components/MeshBackground'
import { Navbar } from './components/Navbar'
import { About } from './sections/About'
import { Contact } from './sections/Contact'
import { Hero } from './sections/Hero'
import { Skills } from './sections/Skills'

export default function App() {
  return (
    <>
      <MeshBackground />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Skills />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
