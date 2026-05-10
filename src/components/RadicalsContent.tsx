export function RadicalsContent() {
  const imgSrc = `${import.meta.env.BASE_URL}jser.gif`

  return (
    <div className="space-y-6">
      <div>
        <p className="text-muted-foreground">
          大新倉頡共 24 個基本字根（不含特殊鍵「難」），加上 1 個符號鍵 <code>;</code> →「；」。
        </p>
      </div>

      <section>
        <img
          src={imgSrc}
          alt="大新倉頡字根表"
          className="w-full h-auto rounded-lg border bg-white"
        />
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">大新倉頡的規則</h3>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>
            <span className="text-foreground font-medium">最大碼長 4 碼</span>
            ：與一般倉頡可達 5 碼不同，大新倉頡的編碼長度上限為 4 碼，整體更省力。
          </li>
          <li>
            <span className="text-foreground font-medium">取碼規則固定為「頭尾、頭尾」</span>
            ：依字形拆出開頭與結尾的字根，連續組成編碼，不需考慮中間字根。
          </li>
          <li>
            <span className="text-foreground font-medium">多簡碼設計</span>
            ：常用字常常 1–2 碼即可輸入。例如「的」可只打 <code>i</code>、「我」只打 <code>q</code>。簡碼大幅降低高頻字的擊鍵負擔。
          </li>
          <li>
            <span className="text-foreground font-medium">多容錯碼</span>
            ：對拆碼有爭議的字提供多種替代編碼，初學者不必擔心拆錯。完整碼、簡碼、容錯碼皆可正常輸入。
          </li>
          <li>
            <span className="text-foreground font-medium">符號鍵</span>
            ：分號鍵 <code>;</code> 對應全形分號「；」，用以輸入中文標點。
          </li>
          <li>
            <span className="text-foreground font-medium">輸入流程</span>
            ：依字根表將漢字拆解為一串字母後輸入，按空白鍵送出。系統會比對所有可行編碼，命中任一即視為正確。
          </li>
        </ul>
      </section>
    </div>
  )
}
