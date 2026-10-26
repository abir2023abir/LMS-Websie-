'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import type { HeroContent } from '@/lib/cms-db';

export default function HeroEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<HeroContent>({
    headline: '',
    description: '',
    cta1Text: '',
    cta1Link: '',
    cta2Text: '',
    cta2Link: '',
    imageUrl: '',
    badgeText: '',
  });

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const res = await fetch('/api/admin/cms/hero');
      const data = await res.json();
      if (data.content) {
        setContent({ ...data.content, cta2Link: '/bookkeeping' });
      }
    } catch (error) {
      console.error('Error fetching hero content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/cms/hero', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      });

      if (res.ok) {
        toast.success('Hero section saved successfully!');
      } else {
        toast.error('Failed to save hero section');
      }
    } catch (error) {
      console.error('Error saving hero content:', error);
      toast.error('Failed to save hero section');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-500">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-500 uppercase">Badge Text</label>
          <input
            type="text"
            value={content.badgeText}
            onChange={(e) => setContent({ ...content, badgeText: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-500 uppercase">Headline</label>
          <input
            type="text"
            value={content.headline}
            onChange={(e) => setContent({ ...content, headline: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-500 uppercase">Description</label>
          <textarea
            value={content.description}
            onChange={(e) => setContent({ ...content, description: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15] resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 uppercase">CTA 1 Text</label>
            <input
              type="text"
              value={content.cta1Text}
              onChange={(e) => setContent({ ...content, cta1Text: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 uppercase">CTA 1 Link</label>
            <input
              type="text"
              value={content.cta1Link}
              onChange={(e) => setContent({ ...content, cta1Link: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 uppercase">CTA 2 Text</label>
            <input
              type="text"
              value={content.cta2Text}
              onChange={(e) => setContent({ ...content, cta2Text: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 uppercase">CTA 2 Link (Bookkeeping page)</label>
            <input
              type="text"
              value="/bookkeeping"
              readOnly
              aria-describedby="bookkeeping-cta-hint"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-sm text-slate-600"
            />
            <p id="bookkeeping-cta-hint" className="text-xs text-slate-500">This button always opens the Bookkeeping page.</p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-500 uppercase">Image URL</label>
          <input
            type="text"
            value={content.imageUrl}
            onChange={(e) => setContent({ ...content, imageUrl: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-[#111827] text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
