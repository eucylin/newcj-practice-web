const CONTACT_EMAIL = 'pass.willow5658@eagereverest.com'
const OWNER_NAME = '宏全資訊股份有限公司'
const OWNER_SITE = 'http://www.eztyping.com.tw/'

export default function About() {
  return (
    <div className="max-w-3xl mx-auto px-8 py-12 space-y-10">
      <header className="space-y-4">
        <div className="flex items-center gap-3 text-xs tracking-[0.4em] text-muted-foreground uppercase">
          <span className="w-10 h-px bg-vermilion" />
          其五 · 關於本站
        </div>
        <h1 className="font-serif font-black text-5xl tracking-tight leading-tight">
          關於<span className="text-vermilion">本站</span>
        </h1>
        <p className="text-muted-foreground leading-relaxed max-w-2xl">
          這是一個用來練習大新倉頡輸入法的非官方靜態網站，所有練習紀錄都儲存在你的瀏覽器本機，不會上傳到任何伺服器。
        </p>
        <div className="brush-rule w-24" />
      </header>

      <section className="paper-card p-7 space-y-3">
        <h2 className="font-serif text-xl font-semibold flex items-center gap-3">
          <span className="seal-stamp text-xs">信</span>
          意見回饋
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          對於網站有任何意見、bug 回報或功能建議，歡迎來信告知：
        </p>
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="inline-flex items-center gap-2 font-mono text-sm px-4 py-2.5 rounded-md border border-vermilion text-vermilion hover:bg-vermilion-soft/30 dark:hover:bg-vermilion-soft/40 transition-colors cursor-pointer break-all"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
          {CONTACT_EMAIL}
        </a>
      </section>

      <section className="paper-card p-7 space-y-4">
        <h2 className="font-serif text-xl font-semibold flex items-center gap-3">
          <span className="seal-stamp text-xs border-[hsl(var(--gold))] text-[hsl(var(--gold))]">權</span>
          權利聲明
        </h2>
        <ul className="space-y-3 text-sm leading-relaxed">
          <li className="flex gap-4">
            <span className="font-mono text-xs text-vermilion font-medium pt-1 w-6 flex-shrink-0">
              01
            </span>
            <div className="flex-1 pb-3 border-b border-border/60">
              <p>
                <strong className="text-foreground">大新倉頡輸入法</strong>是{OWNER_NAME}基於傳統倉頡設計與開發的輸入法，若有興趣使用可至{' '}
                <a
                  href={OWNER_SITE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-vermilion hover:underline font-medium break-all"
                >
                  {OWNER_SITE}
                </a>{' '}
                自行購買軟體。
              </p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="font-mono text-xs text-vermilion font-medium pt-1 w-6 flex-shrink-0">
              02
            </span>
            <div className="flex-1 pb-3 border-b border-border/60">
              <p>
                本網站僅為<strong className="text-foreground">非官方的練習工具</strong>，與宏全資訊股份有限公司並無從屬或商業關係，亦不提供大新倉頡輸入法軟體的下載與安裝。
              </p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="font-mono text-xs text-vermilion font-medium pt-1 w-6 flex-shrink-0">
              03
            </span>
            <div className="flex-1 pb-3 border-b border-border/60">
              <p>
                由於輸入法的拆碼表並無專利保護，若想使用與大新倉頡相同拆碼原則的非官方輸入法，可以自行上網搜尋
                <strong className="text-foreground">「RIME大新倉頡（自由大新）」</strong>。
              </p>
            </div>
          </li>
        </ul>
      </section>
    </div>
  )
}
