'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Check, X, Search, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import AdminModal from './AdminModal';
import RichTextEditor from './RichTextEditor';
import OrientationProgrammesManager from './OrientationProgrammesManager';
import HeroEditor from './cms/HeroEditor';
import AboutEditor from './cms/AboutEditor';
import SuccessStoriesEditor from './cms/SuccessStoriesEditor';
import FeaturesEditor from './cms/FeaturesEditor';
import BlogEditor from './cms/BlogEditor';
import EnquiriesEditor from './cms/EnquiriesEditor';
import BookkeepingPageEditor from './BookkeepingPageEditor';
import ContactBookingEditor from './ContactBookingEditor';

const cmsSections = [
  { id: 'hero', name: 'Hero Section', icon: '🏠' },
  { id: 'bookkeeping', name: 'Bookkeeping Page', icon: '📊' },
  { id: 'contact-booking', name: 'Contact & Booking', icon: '📆' },
  { id: 'about', name: 'About Section', icon: 'ℹ️' },
  { id: 'stories', name: 'Success Stories', icon: '📖' },
  { id: 'orientation', name: 'Orientation Programmes', icon: '📅' },
  { id: 'features', name: 'Why Choose Us', icon: '⭐' },
  { id: 'reviews', name: 'Reviews & Testimonials', icon: '💬' },
  { id: 'blog', name: 'Blog Articles', icon: '📝' },
  { id: 'enquiries', name: 'Contact Enquiries', icon: '📧' },
];

export default function LandingPageCMS() {
  const [activeSection, setActiveSection] = useState('hero');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const currentSection = cmsSections.find((s) => s.id === activeSection);

  const handleSave = async (data: any) => {
    try {
      // This will be connected to API routes later
      toast.success('Saved successfully!');
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (error) {
      toast.error('Failed to save');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      // This will be connected to API routes later
      toast.success('Deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handleToggle = async (id: string, field: string, value: boolean) => {
    try {
      // This will be connected to API routes later
      toast.success('Updated successfully!');
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-[#111827] text-white px-6 py-4">
        <h1 className="text-2xl font-bold">Landing Page CMS</h1>
        <p className="text-slate-400 text-sm mt-1">Manage all landing page content from one place</p>
      </div>

      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-white border-r border-slate-200 min-h-screen p-4">
          <div className="space-y-1">
            {cmsSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeSection === section.id
                    ? 'bg-[#FACC15] text-[#111827]'
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <span className="text-lg">{section.icon}</span>
                {section.name}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {currentSection?.name}
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Manage {currentSection?.name.toLowerCase()} content
              </p>
            </div>
          </div>

          {/* Content Area - Render specific section component */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6">
            {activeSection === 'hero' && <HeroEditor />}
            {activeSection === 'bookkeeping' && <BookkeepingPageEditor />}
            {activeSection === 'contact-booking' && <ContactBookingEditor />}
            {activeSection === 'about' && <AboutEditor />}
            {activeSection === 'stories' && <SuccessStoriesEditor />}
            {activeSection === 'orientation' && <OrientationProgrammesManager />}
            {activeSection === 'features' && <FeaturesEditor />}
            {activeSection === 'reviews' && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Reviews Management</h3>
                <p className="text-slate-500 text-sm mb-4">
                  Reviews are managed via the Reviews & Testimonials section in the main admin dashboard
                </p>
              </div>
            )}
            {activeSection === 'blog' && <BlogEditor />}
            {activeSection === 'enquiries' && <EnquiriesEditor />}
          </div>
        </div>
      </div>
    </div>
  );
}
