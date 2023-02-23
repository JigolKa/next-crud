const cfg = {
  logo: <span>Next Crud Documentation</span>,
  project: {
    link: "https://github.com/JigolKa/next-crud",
  },
  docsRepositoryBase:
    "https://github.com/JigolKa/next-crud/tree/main/docs/pages",
  darkMode: true,
  primaryHue: 205,
  navigation: true,
  footer: {
    component: null,
  },
  feedback: {
    content: null,
  },
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Language" content="en" />
      <meta
        name="description"
        content="Next Crud is an api wrapper for Next.js and Prisma that handle automatically CRUD endpoints."
      />
      <meta
        name="og:description"
        content="Next Crud is an api wrapper for Next.js and Prisma that handle automatically CRUD endpoints."
      />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@jigolka" />
      <meta
        name="og:title"
        content="Next Crud: Api wrapper for Next.js and Prisma"
      />
      <meta name="og:url" content="https://next-crud-docs.vercel.app/" />
      <meta name="apple-mobile-web-app-title" content="Next Crud" />
    </>
  ),
  // ...
}

export default cfg
