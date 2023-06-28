import { AppProps } from "next/app";
import "../styles/index.css";
import "../styles/editor.scss";
import "tailwindcss/tailwind.css"; // 引入 Tailwind 的默认样式
import "../tailwind.config.js"; // 引入自定义配置
import "prismjs/themes/prism-okaidia.min.css";

export default function MyApp({ Component, pageProps }: AppProps) {
  // Use the layout defined at the page level, if available
  // @ts-ignore
  const getLayout = Component.getLayout || ((page) => page);
  return getLayout(<Component {...pageProps} />, pageProps);
}
