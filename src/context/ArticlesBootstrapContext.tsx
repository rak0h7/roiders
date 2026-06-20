"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import { setCachedArticles } from "@/lib/articlesClientCache";
import type { Article } from "@/lib/articleTypes";

const ArticlesBootstrapContext = createContext<Article[] | null>(null);

export function ArticlesBootstrapProvider({
  articles,
  children,
}: {
  articles: Article[];
  children: ReactNode;
}) {
  useEffect(() => {
    setCachedArticles(articles);
  }, [articles]);

  return (
    <ArticlesBootstrapContext.Provider value={articles}>{children}</ArticlesBootstrapContext.Provider>
  );
}

export function useArticlesBootstrap(): Article[] | null {
  return useContext(ArticlesBootstrapContext);
}