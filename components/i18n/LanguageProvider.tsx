'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { bn } from '@/lib/bn';

type Lang = 'en' | 'bn';
const KEY = 'cb-lang';

const LanguageContext = createContext<{ lang: Lang; setLang: (lang: Lang) => void }>({
  lang: 'en',
  setLang: () => undefined,
});

export function useLanguage() {
  return useContext(LanguageContext);
}

const originals = new WeakMap<Text, string>();
const attrOriginals = new WeakMap<Element, Record<string, string>>();
const ATTRS = ['placeholder', 'aria-label', 'title', 'alt'] as const;

function leading(value: string) {
  return value.match(/^\s*/)?.[0] || '';
}
function trailing(value: string) {
  return value.match(/\s*$/)?.[0] || '';
}

function translateText(node: Text, lang: Lang) {
  const parent = node.parentElement;
  if (!parent || parent.closest('script,style,noscript,textarea,input,[data-no-translate]')) return;
  const raw = originals.get(node) ?? node.nodeValue ?? '';
  const key = raw.trim();
  if (!key || !bn[key]) return;
  if (!originals.has(node)) originals.set(node, raw);
  const next = lang === 'bn' ? `${leading(raw)}${bn[key]}${trailing(raw)}` : raw;
  if (node.nodeValue !== next) node.nodeValue = next;
}

function translateAttrs(element: Element, lang: Lang) {
  if (element.closest('[data-no-translate]')) return;
  const saved = attrOriginals.get(element) || {};
  let changed = false;
  for (const attr of ATTRS) {
    const current = element.getAttribute(attr);
    const original = saved[attr] ?? current;
    if (!original || !bn[original.trim()]) continue;
    if (!(attr in saved)) {
      saved[attr] = original;
      changed = true;
    }
    element.setAttribute(attr, lang === 'bn' ? bn[original.trim()] : original);
  }
  if (changed) attrOriginals.set(element, saved);
}

function apply(root: ParentNode, lang: Lang) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    translateText(node as Text, lang);
    node = walker.nextNode();
  }
  if (root instanceof Element || root instanceof Document) {
    const list = root instanceof Document ? root.body.querySelectorAll('*') : root.querySelectorAll('*');
    list.forEach((element) => translateAttrs(element, lang));
    if (root instanceof Element) translateAttrs(root, lang);
  }
  const title = document.title.trim();
  const stored = document.documentElement.dataset.enTitle || title;
  if (bn[stored]) {
    document.documentElement.dataset.enTitle = stored;
    document.title = lang === 'bn' ? bn[stored] : stored;
  }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');

  useEffect(() => {
    const saved = window.localStorage.getItem(KEY);
    if (saved === 'bn' || saved === 'en') setLangState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === 'bn' ? 'bn' : 'en';
    document.documentElement.classList.toggle('bn', lang === 'bn');
    apply(document.body, lang);
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        record.addedNodes.forEach((added) => {
          if (added instanceof Text) translateText(added, lang);
          else if (added instanceof Element) apply(added, lang);
        });
        if (record.type === 'characterData' && record.target instanceof Text) translateText(record.target, lang);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [lang]);

  const setLang = (next: Lang) => {
    window.localStorage.setItem(KEY, next);
    setLangState(next);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[90] flex overflow-hidden rounded-full border-2 border-[#D4AF37] bg-white shadow-lg" data-no-translate>
        <button type="button" onClick={() => setLang('en')} className={`px-3 py-2 text-xs font-extrabold ${lang === 'en' ? 'bg-[#FACC15] text-[#111827]' : 'text-[#111827]'}`}>EN</button>
        <button type="button" onClick={() => setLang('bn')} className={`px-3 py-2 text-xs font-extrabold ${lang === 'bn' ? 'bg-[#FACC15] text-[#111827]' : 'text-[#111827]'}`}>বাংলা</button>
      </div>
    </LanguageContext.Provider>
  );
}
