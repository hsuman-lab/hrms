'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  UserCircle, Building2, Phone, CreditCard, AlertCircle,
  FileText, Plus, Trash2, Pencil, Check, X, Upload,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { essService } from '@/services/ess.service';
import {
  EmployeeAddress, BankDetail, EmergencyContact, EmployeeDocument,
} from '@/types';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

type Tab = 'address' | 'bank' | 'emergency' | 'documents';

const TABS = [
  { id: 'address' as Tab,   label: 'Address',            icon: Building2 },
  { id: 'bank' as Tab,      label: 'Bank Details',       icon: CreditCard },
  { id: 'emergency' as Tab, label: 'Emergency Contacts', icon: Phone },
  { id: 'documents' as Tab, label: 'Documents',          icon: FileText },
];

const DOC_TYPES = ['AADHAAR', 'PAN', 'PASSPORT', 'OFFER_LETTER', 'CERTIFICATE', 'OTHER'];

// ─── Address Section ─────────────────────────────────────────────────────────
function AddressSection() {
  const qc = useQueryClient();
  const { data: addresses = [] } = useQuery<EmployeeAddress[]>({ queryKey: ['ess-addresses'], queryFn: essService.getAddresses });
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: (d: object) => essService.upsertAddress(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ess-addresses'] }); setEditing(null); toast.success('Address saved'); },
    onError: () => toast.error('Failed to save address'),
  });

  const startEdit = (addr: EmployeeAddress) => {
    setEditing(addr.address_type);
    setForm({ line1: addr.line1, line2: addr.line2 || '', city: addr.city || '', state: addr.state || '', pincode: addr.pincode || '', country: addr.country });
  };

  const startNew = (type: string) => {
    setEditing(type);
    setForm({ addressType: type, line1: '', line2: '', city: '', state: '', pincode: '', country: 'India' });
  };

  const types = ['CURRENT', 'PERMANENT'];

  return (
    <div className="space-y-4">
      {types.map((type) => {
        const addr = addresses.find(a => a.address_type === type);
        const isEditing = editing === type;
        return (
          <Card key={type} className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800 text-sm">{type.charAt(0) + type.slice(1).toLowerCase()} Address</h3>
              {!isEditing && (
                <button onClick={() => addr ? startEdit(addr) : startNew(type)}
                  className="flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-medium">
                  <Pencil className="w-3.5 h-3.5" />{addr ? 'Edit' : 'Add'}
                </button>
              )}
            </div>
            {isEditing ? (
              <div className="space-y-3">
                <input placeholder="Address Line 1 *" value={form.line1} onChange={e => setForm({ ...form, line1: e.target.value })}
                  className="input-field" />
                <input placeholder="Address Line 2" value={form.line2} onChange={e => setForm({ ...form, line2: e.target.value })}
                  className="input-field" />
                <div className="grid grid-cols-3 gap-3">
                  <input placeholder="City" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="input-field" />
                  <input placeholder="State" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} className="input-field" />
                  <input placeholder="Pincode" value={form.pincode} onChange={e => setForm({ ...form, pincode: e.target.value })} className="input-field" />
                </div>
                <input placeholder="Country" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} className="input-field" />
                <div className="flex gap-2 pt-1">
                  <button onClick={() => mutation.mutate({ ...form, addressType: type })} disabled={!form.line1 || mutation.isPending}
                    className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Save
                  </button>
                  <button onClick={() => setEditing(null)} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1">
                    <X className="w-3.5 h-3.5" /> Cancel
                  </button>
                </div>
              </div>
            ) : addr ? (
              <div className="text-sm text-gray-600 space-y-0.5">
                <p>{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                <p>{[addr.city, addr.state, addr.pincode].filter(Boolean).join(', ')}</p>
                <p className="text-gray-400">{addr.country}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">Not added yet</p>
            )}
          </Card>
        );
      })}
    </div>
  );
}

// ─── Bank Section ─────────────────────────────────────────────────────────────
function BankSection() {
  const qc = useQueryClient();
  const { data: bank } = useQuery<BankDetail | null>({ queryKey: ['ess-bank'], queryFn: essService.getBankDetail });
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ bankName: '', accountNumber: '', ifscCode: '', accountType: 'SAVINGS', branch: '' });

  const mutation = useMutation({
    mutationFn: (d: object) => essService.upsertBankDetail(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ess-bank'] }); setEditing(false); toast.success('Bank details saved'); },
    onError: () => toast.error('Failed to save bank details'),
  });

  const startEdit = () => {
    if (bank) setForm({ bankName: bank.bank_name, accountNumber: bank.account_number, ifscCode: bank.ifsc_code, accountType: bank.account_type, branch: bank.branch || '' });
    setEditing(true);
  };

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800 text-sm">Bank Account Details</h3>
        {!editing && (
          <button onClick={startEdit} className="flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-medium">
            <Pencil className="w-3.5 h-3.5" />{bank ? 'Edit' : 'Add'}
          </button>
        )}
      </div>
      {editing ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Bank Name *" value={form.bankName} onChange={e => setForm({ ...form, bankName: e.target.value })} className="input-field" />
            <select value={form.accountType} onChange={e => setForm({ ...form, accountType: e.target.value })} className="input-field">
              <option value="SAVINGS">Savings</option>
              <option value="CURRENT">Current</option>
            </select>
          </div>
          <input placeholder="Account Number *" value={form.accountNumber} onChange={e => setForm({ ...form, accountNumber: e.target.value })} className="input-field" />
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="IFSC Code *" value={form.ifscCode} onChange={e => setForm({ ...form, ifscCode: e.target.value })} className="input-field" />
            <input placeholder="Branch" value={form.branch} onChange={e => setForm({ ...form, branch: e.target.value })} className="input-field" />
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={() => mutation.mutate(form)} disabled={!form.bankName || !form.accountNumber || !form.ifscCode || mutation.isPending}
              className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Save
            </button>
            <button onClick={() => setEditing(false)} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1">
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
          </div>
        </div>
      ) : bank ? (
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[['Bank', bank.bank_name], ['Account Type', bank.account_type], ['Account No.', bank.account_number], ['IFSC', bank.ifsc_code], ['Branch', bank.branch || '—']].map(([l, v]) => (
            <div key={l}><p className="text-xs text-gray-400 uppercase tracking-wide">{l}</p><p className="font-medium text-gray-800 mt-0.5">{v}</p></div>
          ))}
          {bank.is_verified && <div className="col-span-2"><span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">Verified</span></div>}
        </div>
      ) : (
        <p className="text-sm text-gray-400 italic">No bank details added yet</p>
      )}
    </Card>
  );
}

// ─── Emergency Contacts Section ───────────────────────────────────────────────
function EmergencySection() {
  const qc = useQueryClient();
  const { data: contacts = [] } = useQuery<EmergencyContact[]>({ queryKey: ['ess-emergency'], queryFn: essService.getEmergencyContacts });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', relationship: '', phone: '', email: '', isPrimary: false });

  const addMutation = useMutation({
    mutationFn: (d: object) => essService.addEmergencyContact(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ess-emergency'] }); setShowForm(false); setForm({ name: '', relationship: '', phone: '', email: '', isPrimary: false }); toast.success('Contact added'); },
    onError: () => toast.error('Failed to add contact'),
  });

  const delMutation = useMutation({
    mutationFn: (id: string) => essService.deleteEmergencyContact(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ess-emergency'] }); toast.success('Contact removed'); },
  });

  return (
    <div className="space-y-3">
      {contacts.map((c) => (
        <Card key={c.id} className="p-4 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium text-gray-800 text-sm">{c.name}</p>
              {c.is_primary && <span className="text-[10px] bg-primary-50 text-primary-700 px-1.5 py-0.5 rounded-full font-semibold">Primary</span>}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{c.relationship} · {c.phone}</p>
            {c.email && <p className="text-xs text-gray-400">{c.email}</p>}
          </div>
          <button onClick={() => delMutation.mutate(c.id)} className="text-gray-300 hover:text-red-500 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </Card>
      ))}
      {showForm ? (
        <Card className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" />
            <input placeholder="Relationship *" value={form.relationship} onChange={e => setForm({ ...form, relationship: e.target.value })} className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Phone *" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input-field" />
            <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input-field" />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" checked={form.isPrimary} onChange={e => setForm({ ...form, isPrimary: e.target.checked })} className="rounded" />
            Set as primary contact
          </label>
          <div className="flex gap-2">
            <button onClick={() => addMutation.mutate(form)} disabled={!form.name || !form.relationship || !form.phone || addMutation.isPending}
              className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Add Contact
            </button>
            <button onClick={() => setShowForm(false)} className="btn-secondary text-xs px-3 py-1.5"><X className="w-3.5 h-3.5 inline mr-1" />Cancel</button>
          </div>
        </Card>
      ) : (
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium">
          <Plus className="w-4 h-4" /> Add Emergency Contact
        </button>
      )}
    </div>
  );
}

// ─── Documents Section ────────────────────────────────────────────────────────
function DocumentsSection() {
  const qc = useQueryClient();
  const { data: docs = [] } = useQuery<EmployeeDocument[]>({ queryKey: ['ess-documents'], queryFn: essService.getDocuments });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ docType: 'AADHAAR', docName: '', fileUrl: '', expiresAt: '' });

  const addMutation = useMutation({
    mutationFn: (d: object) => essService.addDocument(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ess-documents'] }); setShowForm(false); setForm({ docType: 'AADHAAR', docName: '', fileUrl: '', expiresAt: '' }); toast.success('Document added'); },
    onError: () => toast.error('Failed to add document'),
  });

  const delMutation = useMutation({
    mutationFn: (id: string) => essService.deleteDocument(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ess-documents'] }); toast.success('Document removed'); },
  });

  return (
    <div className="space-y-3">
      {docs.map((doc) => (
        <Card key={doc.id} className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary-600" />
            </div>
            <div>
              <p className="font-medium text-gray-800 text-sm">{doc.doc_name}</p>
              <p className="text-xs text-gray-400">{doc.doc_type} · Uploaded {format(parseISO(doc.uploaded_at), 'dd MMM yyyy')}</p>
              {doc.expires_at && <p className="text-xs text-amber-500">Expires {format(parseISO(doc.expires_at), 'dd MMM yyyy')}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {doc.is_verified && <span className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full">Verified</span>}
            <a href={doc.file_url} target="_blank" rel="noreferrer" className="text-xs text-primary-600 hover:underline">View</a>
            <button onClick={() => delMutation.mutate(doc.id)} className="text-gray-300 hover:text-red-500 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </Card>
      ))}
      {showForm ? (
        <Card className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <select value={form.docType} onChange={e => setForm({ ...form, docType: e.target.value })} className="input-field">
              {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <input placeholder="Document name *" value={form.docName} onChange={e => setForm({ ...form, docName: e.target.value })} className="input-field" />
          </div>
          <input placeholder="File URL / link *" value={form.fileUrl} onChange={e => setForm({ ...form, fileUrl: e.target.value })} className="input-field" />
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Expiry Date (optional)</label>
            <input type="date" value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })} className="input-field" />
          </div>
          <div className="flex gap-2">
            <button onClick={() => addMutation.mutate(form)} disabled={!form.docName || !form.fileUrl || addMutation.isPending}
              className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1">
              <Upload className="w-3.5 h-3.5" /> Add Document
            </button>
            <button onClick={() => setShowForm(false)} className="btn-secondary text-xs px-3 py-1.5"><X className="w-3.5 h-3.5 inline mr-1" />Cancel</button>
          </div>
        </Card>
      ) : (
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium">
          <Plus className="w-4 h-4" /> Add Document
        </button>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ESSPage() {
  const [tab, setTab] = useState<Tab>('address');

  return (
    <DashboardLayout title="">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <UserCircle className="w-5 h-5 text-primary-600" /> My Profile
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage your personal information, bank details, emergency contacts and documents.</p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 flex-1 justify-center px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                tab === id ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}>
              <Icon className="w-3.5 h-3.5" />{label}
            </button>
          ))}
        </div>

        {tab === 'address'   && <AddressSection />}
        {tab === 'bank'      && <BankSection />}
        {tab === 'emergency' && <EmergencySection />}
        {tab === 'documents' && <DocumentsSection />}
      </div>
    </DashboardLayout>
  );
}
