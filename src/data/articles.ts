export interface Article {
  id: string
  title: string
  category: '散文' | '童話' | '文言文' | '新聞' | '唐詩'
  content: string
}

export const ARTICLES: Article[] = [
  {
    id: 'tang-poem-spring',
    title: '春曉',
    category: '唐詩',
    content: '春眠不覺曉，處處聞啼鳥。夜來風雨聲，花落知多少。',
  },
  {
    id: 'classical-aiyou',
    title: '愛蓮說（節錄）',
    category: '文言文',
    content: '予獨愛蓮之出淤泥而不染，濯清漣而不妖，中通外直，不蔓不枝，香遠益清，亭亭淨植，可遠觀而不可褻玩焉。',
  },
  {
    id: 'essay-rain',
    title: '雨天',
    category: '散文',
    content: '今日下了一整天的雨，街道安靜了不少。從窗口望出去，行人撐著傘匆匆走過，車聲被雨聲蓋過，整個城市彷彿放慢了腳步。',
  },
  {
    id: 'essay-coffee',
    title: '一杯咖啡的時光',
    category: '散文',
    content: '清晨在巷口的小店點一杯咖啡，看著陽光從玻璃窗灑進來，木桌上有淡淡的木紋光影。手裡握著溫熱的杯子，今天的第一個念頭，就從這口咖啡開始。',
  },
  {
    id: 'fairy-tortoise',
    title: '龜兔賽跑',
    category: '童話',
    content: '從前有一隻烏龜和一隻兔子，他們相約在森林裡賽跑。兔子跑得很快，遠遠把烏龜拋在後面，於是在路邊睡了一覺。烏龜雖然慢，卻一直沒有停下來，最後反而比兔子先到了終點。',
  },
  {
    id: 'news-tech',
    title: '人工智慧的日常應用',
    category: '新聞',
    content: '近年來人工智慧逐漸進入一般民眾的生活。從手機上的語音助理、社群媒體的內容推薦，到自動駕駛、醫療診斷，相關技術正在改變人們的工作方式與生活樣貌。',
  },
]
