import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import CharacterPractice from './pages/CharacterPractice'
import ArticlePractice from './pages/ArticlePractice'
import Radicals from './pages/Radicals'
import Stats from './pages/Stats'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/practice/character" element={<CharacterPractice />} />
        <Route path="/practice/article" element={<ArticlePractice />} />
        <Route path="/radicals" element={<Radicals />} />
        <Route path="/stats" element={<Stats />} />
      </Route>
    </Routes>
  )
}
