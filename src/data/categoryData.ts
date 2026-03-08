export interface SubCategory {
  id: string;
  name: string;
}

export interface CategoryGroup {
  id: string;
  name: string;
  subcategories: SubCategory[];
}

export const categoryGroups: CategoryGroup[] = [
  {
    id: "trading",
    name: "Trading",
    subcategories: [
      { id: "intraday-trading", name: "Intraday Trading" },
      { id: "swing-trading", name: "Swing Trading" },
      { id: "scalping", name: "Scalping" },
      { id: "positional-trading", name: "Positional Trading" },
      { id: "trading-strategies", name: "Trading Strategies" },
    ],
  },
  {
    id: "options",
    name: "Options",
    subcategories: [
      { id: "option-buying", name: "Option Buying" },
      { id: "option-selling", name: "Option Selling" },
      { id: "options-strategies", name: "Options Strategies" },
      { id: "options-greeks", name: "Options Greeks" },
      { id: "futures-trading", name: "Futures Trading" },
    ],
  },
  {
    id: "investing",
    name: "Investing",
    subcategories: [
      { id: "long-term-investing", name: "Long-Term Investing" },
      { id: "value-investing", name: "Value Investing" },
      { id: "growth-investing", name: "Growth Investing" },
      { id: "dividend-investing", name: "Dividend Investing" },
      { id: "portfolio-management", name: "Portfolio Management" },
    ],
  },
  {
    id: "technical-analysis",
    name: "Technical Analysis",
    subcategories: [
      { id: "chart-patterns", name: "Chart Patterns" },
      { id: "candlestick-analysis", name: "Candlestick Analysis" },
      { id: "support-resistance", name: "Support & Resistance" },
      { id: "trend-analysis", name: "Trend Analysis" },
    ],
  },
  {
    id: "price-action",
    name: "Price Action / SMC",
    subcategories: [
      { id: "price-action-basics", name: "Price Action" },
      { id: "smart-money-concepts", name: "Smart Money Concepts" },
      { id: "ict-concepts", name: "ICT Concepts" },
      { id: "order-blocks", name: "Order Blocks" },
      { id: "fair-value-gaps", name: "Fair Value Gaps" },
    ],
  },
  {
    id: "indicators",
    name: "Indicators & Tools",
    subcategories: [
      { id: "moving-averages", name: "Moving Averages" },
      { id: "rsi", name: "RSI" },
      { id: "macd", name: "MACD" },
      { id: "bollinger-bands", name: "Bollinger Bands" },
      { id: "tradingview-tools", name: "TradingView Tools" },
    ],
  },
  {
    id: "crypto-forex",
    name: "Crypto & Forex",
    subcategories: [
      { id: "crypto-trading", name: "Crypto Trading" },
      { id: "spot-trading", name: "Spot Trading" },
      { id: "defi", name: "DeFi" },
      { id: "web3", name: "Web3" },
      { id: "forex-basics", name: "Forex Basics" },
      { id: "forex-strategies", name: "Forex Strategies" },
    ],
  },
  {
    id: "algo-ai",
    name: "Algo & AI Skills",
    subcategories: [
      { id: "algo-trading-basics", name: "Algo Trading Basics" },
      { id: "backtesting", name: "Backtesting" },
      { id: "python-for-trading", name: "Python for Trading" },
      { id: "quantitative-strategies", name: "Quantitative Strategies" },
      { id: "trading-bots", name: "Trading Bots" },
      { id: "ai-tools-automation", name: "AI Tools & Automation" },
      { id: "video-editing", name: "Video Editing" },
      { id: "graphic-design", name: "Graphic Design" },
      { id: "digital-productivity", name: "Digital Productivity Tools" },
    ],
  },
];
