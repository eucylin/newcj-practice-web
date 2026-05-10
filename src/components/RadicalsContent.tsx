export function RadicalsContent() {
  const imgSrc = `${import.meta.env.BASE_URL}jser.gif`

  return (
    <div className="space-y-7">
      <p className="text-muted-foreground leading-relaxed">
        大新倉頡共 <strong className="text-foreground">24 個基本字根</strong>（不含特殊鍵「難」），
        加上 1 個符號鍵 <kbd className="font-mono text-xs px-1.5 py-0.5 rounded border border-border bg-card mx-0.5">;</kbd> 對應全形「；」。
      </p>

      <section className="paper-card p-3 bg-white">
        <img
          src={imgSrc}
          alt="大新倉頡字根表"
          className="w-full h-auto rounded"
        />
      </section>

      <section>
        <h3 className="font-serif text-lg font-semibold mb-4 flex items-center gap-3">
          <span className="seal-stamp text-xs">則</span>
          大新倉頡的規則
        </h3>
        <ul className="space-y-3">
          {[
            ['最大碼長 4 碼', '與一般倉頡可達 5 碼不同，大新倉頡的編碼長度上限為 4 碼，整體更省力。'],
            ['取碼規則固定為「頭尾、頭尾」', '依字形拆出開頭與結尾的字根，連續組成編碼，不需考慮中間字根。'],
            [
              '多簡碼設計',
              <>
                常用字常常 1–2 碼即可輸入。例如「的」可只打{' '}
                <kbd className="font-mono text-xs px-1.5 py-0.5 rounded border bg-card mx-0.5">i</kbd>
                、「我」只打{' '}
                <kbd className="font-mono text-xs px-1.5 py-0.5 rounded border bg-card mx-0.5">q</kbd>
                。簡碼大幅降低高頻字的擊鍵負擔。
              </>,
            ],
            ['多容錯碼', '對拆碼有爭議的字提供多種替代編碼，初學者不必擔心拆錯。完整碼、簡碼、容錯碼皆可正常輸入。'],
            [
              '符號鍵',
              <>
                分號鍵{' '}
                <kbd className="font-mono text-xs px-1.5 py-0.5 rounded border bg-card mx-0.5">;</kbd>
                對應全形分號「；」，用以輸入中文標點。
              </>,
            ],
            [
              '輸入流程',
              <>
                依字根表將漢字拆解為一串字母後輸入，按{' '}
                <kbd className="font-mono text-xs px-1.5 py-0.5 rounded border bg-card mx-0.5">space</kbd>
                送出。系統會比對所有可行編碼，命中任一即視為正確。
              </>,
            ],
          ].map(([title, body], i) => (
            <li key={i} className="flex gap-4">
              <span className="font-mono text-xs text-vermilion font-medium pt-1.5 w-6">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="flex-1 pb-2 border-b border-border/60 last:border-0">
                <div className="font-medium text-foreground mb-0.5">{title}</div>
                <div className="text-sm text-muted-foreground leading-relaxed">{body}</div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
