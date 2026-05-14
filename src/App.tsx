import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import CharacterPractice from './pages/CharacterPractice'
import ArticlePractice from './pages/ArticlePractice'
import Stats from './pages/Stats'
import About from './pages/About'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/practice/character" element={<CharacterPractice />} />
        <Route path="/practice/article" element={<ArticlePractice />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/about" element={<About />} />
      </Route>
    </Routes>
  )
}
