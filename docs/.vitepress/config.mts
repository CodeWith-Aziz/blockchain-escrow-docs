import { defineConfig } from "vitepress";

// https://vitepress.dev
export default defineConfig({
  // Global site baseline setups
  description: "Technical Specification and Smart Contract Architecture",

  head: [["link", { rel: "icon", type: "image/png", href: "/favicon.png" }]],

  // 🌐 MULTI-LANGUAGE SITE ARCHITECTURE CONFIGURATION
  locales: {
    root: {
      label: "English",
      lang: "en",
      title: "Blockchain project",
    },
    // es: {
    //   label: "Español",
    //   lang: "es",
    //   link: "/es/",
    //   title: "Proyecto Blockchain",
    // },
  },

  themeConfig: {
    // 🎨 TOP-LEFT BRAND LOGO INJECTION
    logo: "/favicon.png",

    outline: {
      level: [2, 3],
      label: "On this page",
    },

    // 🤖 INTEGRATED ALGOLIA SEARCH WITH ASK AI SIDE PANEL
    search: {
      provider: "algolia",
      options: {
        appId: "WDEJK9K672",
        apiKey: "c5ae631b152a1e3e087c593cadd8d17a",
        indexName: "blockchain-escrow-docs",
        assistantId: "90c149e4-4ccc-4aa3-86a3-9e3017f8893a",
        mode: "hybrid",
        askAi: {
          sidePanel: {
            panel: {
              suggestedQuestions: [
                "How does the escrow protect the buyer?",
                "What are the roles of the arbiter?",
                "Explain the gas optimization techniques",
              ],
            },
          },
        },
      },
    },

    nav: [
      { text: "Home", link: "/" },
      { text: "Documentation", link: "/page-summary" },
    ],

    // 📂 COLLAPSIBLE MULTI-PHASE SIDEBAR (Cleaned & Flattened)
    sidebar: [
      {
        text: "Conceptual Design",
        collapsed: false,
        items: [
          { text: "1. Conceptual Overview", link: "/page-summary" },
          { text: "2. System Architecture", link: "/page-architecture" },
          { text: "3. Data Structures", link: "/page-data" },
        ],
      },
      {
        text: "Core Engineering",
        collapsed: true,
        items: [
          { text: "4. Core Logic & Breakdown", link: "/page-logic" },
          { text: "5. Access Control Models", link: "/page-access" },
          { text: "6. Threat Modeling & Audit", link: "/page-security" },
          { text: "7. Gas Optimization & EVM", link: "/page-gas" },
        ],
      },
      {
        text: "Operations & Strategy",
        collapsed: true,
        items: [
          { text: "8. Edge Cases & Recovery", link: "/page-recovery" },
          { text: "9. Real-World Case Studies", link: "/page-comparison" },
          { text: "10. Alternative Architectures", link: "/page-conclusion" },
        ],
      },
    ],

    // 🔗 FIX: PROPERLY SYNTAXED GITHUB NAVBAR LINK
    socialLinks: [{ icon: "github", link: "https://github.com/CodeWith-Aziz" }],
  },
});
