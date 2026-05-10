import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { loadSessions } from '@/lib/storage'
import { useOpenRadicals } from '@/components/RadicalsSheet'

export default function Home() {
  const recent = useMemo(() => loadSessions().slice(-5).reverse(), [])
  const lastCpm = recent[0]?.cpm
  const openRadicals = useOpenRadicals()

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold">大新倉頡練習</h1>
        <p className="text-muted-foreground mt-2">學會、練熟、然後變快。</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Link to="/practice/character">
          <Card className="hover:border-primary cursor-pointer h-full">
            <CardHeader><CardTitle>單字練習</CardTitle></CardHeader>
            <CardContent className="text-muted-foreground">
              依詞頻分級隨機抽 100 字練習拆碼。
            </CardContent>
          </Card>
        </Link>
        <Link to="/practice/article">
          <Card className="hover:border-primary cursor-pointer h-full">
            <CardHeader><CardTitle>文章練習</CardTitle></CardHeader>
            <CardContent className="text-muted-foreground">
              內建 7 篇文章，或貼上自己的文章計時練習。
            </CardContent>
          </Card>
        </Link>
        <button type="button" onClick={openRadicals} className="text-left">
          <Card className="hover:border-primary cursor-pointer h-full">
            <CardHeader><CardTitle>字根表</CardTitle></CardHeader>
            <CardContent className="text-muted-foreground">
              隨時呼叫的速查面板，或按 <kbd className="px-1.5 py-0.5 rounded border bg-muted text-xs">?</kbd> 鍵開啟。
            </CardContent>
          </Card>
        </button>
        <Link to="/stats">
          <Card className="hover:border-primary cursor-pointer h-full">
            <CardHeader><CardTitle>個人紀錄</CardTitle></CardHeader>
            <CardContent className="text-muted-foreground">
              {lastCpm ? `上次 CPM ${lastCpm}` : '尚無紀錄'}
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
