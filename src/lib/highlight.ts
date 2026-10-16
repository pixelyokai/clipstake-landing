import { createHighlighter, type ThemeRegistration } from "shiki";

// Clipstake code theme from the Paper palette: sand surface, red keywords.
// Highlighting runs at build time in a Server Component, so none of Shiki
// ships to the client.
const theme: ThemeRegistration = {
  name: "clipstake",
  type: "dark",
  colors: {
    "editor.background": "#312c2b", // sand-800
    "editor.foreground": "#e3ded3", // sand-200
  },
  tokenColors: [
    { scope: ["comment", "punctuation.definition.comment"], settings: { foreground: "#b8ae9e", fontStyle: "italic" } },
    {
      scope: ["keyword", "storage", "storage.type", "storage.modifier", "keyword.control", "keyword.operator.new"],
      settings: { foreground: "#e27070" }, // clipstake-red-300
    },
    { scope: ["string", "string.quoted", "string.template"], settings: { foreground: "#f0b8b8" } }, // red-100
    { scope: ["constant.numeric", "constant.language"], settings: { foreground: "#eba0a0" } }, // red-200
    { scope: ["entity.name.function", "support.function", "meta.function-call"], settings: { foreground: "#faf9f7" } },
    { scope: ["variable.other.constant", "support.variable", "variable.parameter"], settings: { foreground: "#f1efea" } },
    { scope: ["constant.other.option", "punctuation", "keyword.operator"], settings: { foreground: "#d1c9bb" } },
  ],
};

let highlighter: ReturnType<typeof createHighlighter> | null = null;

// Token colours become one-letter classes (styled in globals.css) instead of
// inline styles: the HTML ships twice (markup + RSC payload), so it adds up.
const CLASS_FOR = new Map(
  theme.tokenColors!.map((rule, i) => [String(rule.settings.foreground).toLowerCase(), `t${i}`]),
);

export async function highlight(code: string, lang: string) {
  "use cache";
  highlighter ??= createHighlighter({ themes: [theme], langs: ["bash", "js", "python"] });
  const html = (await highlighter).codeToHtml(code, { lang, theme: "clipstake" });
  return html
    .replace(/<pre class="shiki clipstake" style="[^"]*" tabindex="0">/, "<pre>")
    .replace(/ style="color:(#[0-9a-f]{6})(;font-style:italic)?"/gi, (match, color: string) => {
      const name = CLASS_FOR.get(color.toLowerCase());
      return name ? ` class="${name}"` : "";
    });
}
