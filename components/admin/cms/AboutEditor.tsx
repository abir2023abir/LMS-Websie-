'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import type { AboutContent } from '@/lib/cms-db';

export default function AboutEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<AboutContent>({
    title: '',
    description: '',
    statCards: [],
  });

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const res = await fetch('/api/admin/cms/about');
      const data = await res.json();
      if (data.content) {
        setContent(data.content);
      }
    } catch (error) {
      console.error('Error fetching about content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/cms/about', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      });

      if (res.ok) {
        toast.success('About section saved successfully!');
      } else {
        toast.error('Failed to save about section');
      }
    } catch (error) {
      console.error('Error saving about content:', error);
      toast.error('Failed to save about section');
    } finally {
      setSaving(false);
    }
  };

  const addStatCard = () => {
    setContent({
      ...content,
      statCards: [
        ...content.statCards,
        {
          value: '0' + (content.statCards.length + 1),
          lead: 'New',
          detail: 'Stat card description',
          illustration: 'learning',
          highlighted: false,
        },
      ],
    });
  };

  const updateStatCard = (index: number, field: string, value: any) => {
    const newCards = [...content.statCards];
    newCards[index] = { ...newCards[index], [field]: value };
    setContent({ ...content, statCards: newCards });
  };

  const removeStatCard = (index: number) => {
    setContent({
      ...content,
      statCards: content.statCards.filter((_, i) => i !== index),
    });
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-500">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-500 uppercase">Section Title</label>
          <input
            type="text"
            value={content.title}
            onChange={(e) => setContent({ ...content, title: e.target.value })}
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

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Stat Cards</h3>
            <button
              onClick={addStatCard}
              className="flex items-center gap-2 bg-[#FACC15] text-[#111827] px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-[#eab308] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Card
            </button>
          </div>

          {content.statCards.map((card, index) => (
            <div key={index} className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-bold text-slate-500">Card {index + 1}</span>
                </div>
                <button
                  onClick={() => removeStatCard(index)}
                  className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Value</label>
                  <input
                    type="text"
                    value={card.value}
                    onChange={(e) => updateStatCard(index, 'value', e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Lead</label>
                  <input
                    type="text"
                    value={card.lead}
                    onChange={(e) => updateStatCard(index, 'lead', e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Detail</label>
                <input
                  type="text"
                  value={card.detail}
                  onChange={(e) => updateStatCard(index, 'detail', e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Illustration</label>
                  <select
                    value={card.illustration}
                    onChange={(e) => updateStatCard(index, 'illustration', e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
                  >
                    <option value="learning">Learning</option>
                    <option value="practice">Practice</option>
                    <option value="progress">Progress</option>
                    <option value="goals">Goals</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id={`highlight-${index}`}
                    checked={card.highlighted}
                    onChange={(e) => updateStatCard(index, 'highlighted', e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-[#FACC15] focus:ring-[#FACC15]"
                  />
                  <label htmlFor={`highlight-${index}`} className="text-xs font-medium text-slate-700">
                    Highlighted
                  </label>
                </div>
              </div>
            </div>
          ))}
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
