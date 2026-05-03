import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArticlePracticeRunner } from '@/components/ArticlePracticeRunner'
import { ARTICLES } from '@/data/articles'

export default function ArticlePractice() {
  const [text, setText] = useState<string | null>(null)
  const [pasted, setPasted] = useState('')

  if (text) {
    return <ArticlePracticeRunner text={text} onFinish={() => setText(null)} />
  }

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-bold">文章練習</h1>

      <section>
        <h2 className="text-lg font-semibold mb-3">內建文章</h2>
        <div className="grid grid-cols-2 gap-3">
          {ARTICLES.map(a => (
            <Card key={a.id} className="cursor-pointer hover:border-primary" onClick={() => setText(a.content)}>
              <CardHeader>
                <CardTitle className="text-base">{a.title}</CardTitle>
                <div className="text-xs text-muted-foreground">{a.category} · {Array.from(a.content).filter(c => /[一-鿿]/.test(c)).length} 字</div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground line-clamp-2">
                {a.content}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">貼上自己的文章</h2>
        <textarea
          className="w-full min-h-[120px] p-3 rounded-md border bg-background"
          placeholder="把要練的文字貼上來……"
          value={pasted}
          onChange={e => setPasted(e.target.value)}
        />
        <Button className="mt-2" disabled={pasted.trim().length < 10} onClick={() => setText(pasted.trim())}>
          開始練習
        </Button>
      </section>
    </div>
  )
}
