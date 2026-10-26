'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Trash2, CheckCircle, Clock, Archive } from 'lucide-react';
import type { ContactEnquiry } from '@/lib/cms-db';

export default function EnquiriesEditor() {
  const [loading, setLoading] = useState(true);
  const [enquiries, setEnquiries] = useState<ContactEnquiry[]>([]);

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    try {
      const res = await fetch('/api/admin/cms/enquiries');
      const data = await res.json();
      if (data.enquiries) {
        setEnquiries(data.enquiries);
      }
    } catch (error) {
      console.error('Error fetching enquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: ContactEnquiry['status']) => {
    try {
      await fetch('/api/admin/cms/enquiries', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      toast.success('Status updated successfully!');
      fetchEnquiries();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this enquiry?')) return;
    try {
      await fetch(`/api/admin/cms/enquiries?id=${id}`, {
        method: 'DELETE',
      });
      toast.success('Enquiry deleted successfully!');
      fetchEnquiries();
    } catch (error) {
      console.error('Error deleting enquiry:', error);
      toast.error('Failed to delete enquiry');
    }
  };

  const getStatusBadge = (status: ContactEnquiry['status']) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case 'responded':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            Responded
          </span>
        );
      case 'archived':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
            <Archive className="w-3 h-3" />
            Archived
          </span>
        );
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-500">Loading...</div>;
  }

  if (enquiries.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">No enquiries yet</h3>
        <p className="text-sm text-slate-500">Contact form submissions will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-bold text-slate-900">Contact Enquiries ({enquiries.length})</h3>

      <div className="space-y-3">
        {enquiries.map((enquiry) => (
          <div key={enquiry.id} className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">{enquiry.name}</span>
                  <span className="text-xs text-slate-500">{enquiry.email}</span>
                  {getStatusBadge(enquiry.status)}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{enquiry.message}</p>
                {enquiry.createdAt && (
                  <p className="text-xs text-slate-400">
                    {new Date(enquiry.createdAt.seconds * 1000).toLocaleString()}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1">
                {enquiry.status === 'pending' && (
                  <button
                    onClick={() => handleUpdateStatus(enquiry.id!, 'responded')}
                    className="p-1 hover:bg-emerald-50 rounded text-slate-500 hover:text-emerald-600"
                    title="Mark as responded"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                )}
                {enquiry.status !== 'archived' && (
                  <button
                    onClick={() => handleUpdateStatus(enquiry.id!, 'archived')}
                    className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-700"
                    title="Archive"
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(enquiry.id!)}
                  className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-600"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
