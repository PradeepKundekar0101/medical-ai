/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "media",
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "none",
            color: "#333",
            a: {
              color: "#3182ce",
              "&:hover": {
                color: "#2c5282",
              },
            },
            strong: {
              fontWeight: "700",
            },
            h1: {
              fontWeight: "700",
              fontSize: "1.5rem",
            },
            h2: {
              fontWeight: "700",
              fontSize: "1.25rem",
            },
            h3: {
              fontWeight: "600",
              fontSize: "1.125rem",
            },
            blockquote: {
              fontStyle: "italic",
              borderLeftWidth: "4px",
              borderLeftColor: "#e2e8f0",
              paddingLeft: "1rem",
            },
            code: {
              fontFamily:
                'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              backgroundColor: "#f1f5f9",
              padding: "0.125rem 0.25rem",
              borderRadius: "0.25rem",
              fontSize: "0.875rem",
            },
            pre: {
              fontFamily:
                'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              backgroundColor: "#f1f5f9",
              padding: "1rem",
              borderRadius: "0.25rem",
              overflowX: "auto",
            },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
