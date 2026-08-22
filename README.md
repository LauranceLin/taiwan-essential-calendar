# Taiwan Essential Calendar

為台灣日常生活精選的繁體中文日曆訂閱，提供符合 RFC 5545 標準的 `.ics` 檔案。

> 收錄一般生活在台灣的人合理可能在意或認得的日期，不為了完整而追求完整。

這是一個刻意保持精簡的個人維護專案，不是政府官方日曆，也不等同每年公布的政府機關辦公日曆。

## 訂閱日曆

| 日曆 | 內容 | 訂閱網址 |
| --- | --- | --- |
| **Taiwan Essential**（推薦） | 下列三份日曆的聯集 | `https://calendar.laurancelin.com/tw-essential.ics` |
| Taiwan Public Holidays | 重要法定假日 | `https://calendar.laurancelin.com/tw-public-holidays.ics` |
| Taiwan Traditional | 未重複法定假日的重要傳統節日 | `https://calendar.laurancelin.com/tw-traditional.ics` |
| Taiwan Modern | 台灣普遍認得的現代節日 | `https://calendar.laurancelin.com/tw-modern.ics` |

所有日曆都使用繁體中文活動名稱，並提供 **2026 至 2125 年**的明確國曆全天日期。日曆名稱保留英文。

## 收錄內容

### Taiwan Public Holidays

- 元旦
- 小年夜
- 除夕
- 正月初一
- 正月初二
- 正月初三
- 和平紀念日
- 兒童節
- 清明節
- 勞動節
- 端午節
- 中秋節
- 教師節
- 國慶日
- 臺灣光復節
- 行憲紀念日

這份日曆只描述有意義的假日日期，刻意不收錄補假、補班、調整上班日或臨時一次性安排。

### Taiwan Traditional

- 元宵節
- 七夕
- 中元節
- 重陽節
- 冬至

已收錄在 Public Holidays 的傳統節日不會在這裡重複出現。

### Taiwan Modern

- 情人節：2 月 14 日
- 母親節：5 月第二個星期日
- 父親節：8 月 8 日
- 萬聖節：10 月 31 日
- 聖誕節：12 月 25 日

### Taiwan Essential

Essential 由程式自動合併 Public Holidays、Traditional 與 Modern，沒有獨立維護的活動清單。

同一天的不同活動會分開保留。例如 12 月 25 日同時包含「行憲紀念日」與「聖誕節」。

## 收錄原則

這份日曆想回答的是：

> 今天是不是台灣生活中重要的法定假日、傳統節日，或大家普遍熟悉的現代節日？

本專案不是節日百科全書，會刻意排除冷僻的職業節日、專業紀念日、宗教神誕，以及只為了名目完整而加入的日期。

## 日期計算

農曆轉國曆、清明與冬至的日期使用 [`lunar-javascript`](https://github.com/6tail/lunar-javascript) 計算。這個套件以壽星天文曆演算法為基礎，不需要在專案中維護一份手動複製的百年對照表。

產生器只使用正常農曆月份，不會因閏月重複產生七夕、中元節等活動。小年夜與除夕則由正月初一往前推算兩天與一天，不假設臘月固定有幾天。

所有農曆節日與節氣最後都會轉成明確的國曆全天事件，因此 Apple Calendar、Google Calendar 或其他客戶端不需要理解農曆重複規則。測試中的代表日期會與[香港天文台公曆與農曆對照表](https://www.hko.gov.hk/tc/gts/time/conversion.htm)交叉確認。

## iCalendar 格式

產生的檔案遵循 RFC 5545，包含：

- UTF-8 編碼與 CRLF 換行；
- `VERSION:2.0`、`CALSCALE:GREGORIAN` 與 `METHOD:PUBLISH`；
- 依 UTF-8 位元組正確進行 75 octet 折行；
- `LANGUAGE=zh-TW` 的繁體中文標題；
- `DTSTART;VALUE=DATE` 全天開始日期；
- 使用下一天作為排他性 `DTEND;VALUE=DATE`；
- `TRANSP:TRANSPARENT`；
- 位於 `calendar.laurancelin.com` 命名空間的固定 UID；
- 可重複產生完全相同檔案的固定建置資訊。

測試會使用 [`ical.js`](https://github.com/mozilla-comm/ical.js) 重新解析每一份日曆，確認 UTF-8、全天事件、中文標題、UID 穩定性與輸出確定性。

## 專案結構

```text
data/                       每個活動唯一的來源定義
src/date-calculation.js     國曆、農曆與節氣規則
src/events.js               展開活動並組合 Essential
src/ics.js                  RFC 5545 序列化
src/generate.js             寫出日曆檔案
scripts/                    本機產生與網站組裝指令
tests/                      日期 fixture 與完整日曆檢查
site/                       純 HTML、CSS 與 JavaScript 網站
dist/                       本機產生的日曆檔案，不提交 Git
_site/                      GitHub Pages 部署成品，不提交 Git
```

產生日曆時不需要資料庫、伺服器、網路爬蟲或執行階段 API。

## 本機開發

需要 Node.js 22 以上版本與 Corepack。

```bash
corepack enable
corepack install
pnpm install --frozen-lockfile
```

執行測試：

```bash
pnpm test
```

只產生四份日曆到 `dist/`：

```bash
pnpm generate
```

產生日曆並組裝完整網站到 `_site/`：

```bash
pnpm build
```

執行提交前的完整檢查：

```bash
pnpm check
```

`dist/` 與 `_site/` 都是可重建的成品，不應提交至 Git。

## GitHub Pages 部署

`.github/workflows/pages.yml` 會在每次推送到 `main` 時：

1. 安裝鎖定版本的相依套件；
2. 執行完整測試；
3. 產生四份日曆；
4. 組裝 `_site/`；
5. 上傳 GitHub Pages artifact；
6. 只有在前述步驟成功後才部署。

部署工作使用 `needs: build` 等待測試與建置，因此錯誤的提交不會取代前一次成功部署。CI 不會把產生檔案提交回儲存庫。

Repository Settings → Pages 的 Source 必須設定為 **GitHub Actions**。

部署成品結構：

```text
_site/
  index.html
  tw-essential.ics
  tw-public-holidays.ics
  tw-traditional.ics
  tw-modern.ics
  assets/
```

四份日曆因此能直接從網域根目錄訂閱。自訂 GitHub Actions 部署不需要儲存庫中的 `CNAME` 檔案。

## 自訂網域與 DNS

正式網域是 `calendar.laurancelin.com`。DNS 只需要：

```text
Type:   CNAME
Name:   calendar
Target: laurancelin.github.io
```

自訂網域在 Repository Settings → Pages 設定，DNS 生效後開啟 **Enforce HTTPS**。這些設定不需要、也不應修改既有的 `laurancelin.com` 網站。

可用下列指令確認正式日曆的回應：

```bash
curl -I https://calendar.laurancelin.com/tw-essential.ics
```

預期狀態為 `200`，Content-Type 為 `text/calendar`。

## Apple Calendar 訂閱

在 iPhone 或 iPad 上，直接開啟網站並點選訂閱按鈕即可。也可以前往「設定 → App → 行事曆 → 行事曆帳號 → 加入帳號 → 其他 → 加入已訂閱的行事曆」，貼上 HTTPS 訂閱網址。

在 macOS 上，開啟「行事曆」，選擇「檔案 → 新增行事曆訂閱」，貼上 HTTPS 網址並設定自動更新頻率。

## 維護方式

本專案由 Laurance Lin 個人維護，目前不徵求節日新增、功能、文件或設計貢獻，也不以社群共筆方式運作。

若發現日期計算、iCalendar 格式或訂閱功能的客觀錯誤，可以透過 GitHub Issues 提供可重現資訊；是否調整內容與收錄範圍仍由維護者決定。

## 授權與免責聲明

原始碼採用 [MIT License](LICENSE)。

本專案不是政府官方日曆，不應作為法律期限、工作日、學校行事曆或政府機關辦公安排的唯一依據。
