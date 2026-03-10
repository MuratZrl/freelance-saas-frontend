'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Eye, FileDown } from 'lucide-react';

interface Client { id: string; name: string; }
interface InvoiceItem { description: string; quantity: number; unitPrice: number; }
interface Invoice {
  id: string;
  invoiceNumber: string;
  status: string;
  issueDate: string;
  dueDate: string;
  total: number;
  client: Client;
  items: InvoiceItem[];
}

const statusColors: Record<string, string> = {
  draft: 'secondary',
  sent: 'default',
  paid: 'default',
  overdue: 'destructive',
};

async function downloadPdf(id: string, invoiceNumber: string) {
  const token = localStorage.getItem('token');
  const res = await fetch(`http://localhost:3000/invoices/${id}/pdf`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `invoice-${invoiceNumber}.pdf`;
  a.click();
  window.URL.revokeObjectURL(url);
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [open, setOpen] = useState(false);
  const [viewing, setViewing] = useState<Invoice | null>(null);
  const [form, setForm] = useState({
    clientId: '',
    issueDate: '',
    dueDate: '',
    taxRate: 0,
    discount: 0,
    notes: '',
  });
  const [items, setItems] = useState<InvoiceItem[]>([{ description: '', quantity: 1, unitPrice: 0 }]);

  async function fetchAll() {
    const [inv, cli] = await Promise.all([api.get('/invoices'), api.get('/clients')]);
    setInvoices(inv.data);
    setClients(cli.data);
  }

  useEffect(() => { fetchAll(); }, []);

  function addItem() {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0 }]);
  }

  function updateItem(index: number, field: keyof InvoiceItem, value: string | number) {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await api.post('/invoices', { ...form, items });
    setOpen(false);
    setForm({ clientId: '', issueDate: '', dueDate: '', taxRate: 0, discount: 0, notes: '' });
    setItems([{ description: '', quantity: 1, unitPrice: 0 }]);
    fetchAll();
  }

  async function updateStatus(id: string, status: string) {
    await api.put(`/invoices/${id}/status`, { status });
    fetchAll();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this invoice?')) return;
    await api.delete(`/invoices/${id}`);
    fetchAll();
  }

  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const tax = (subtotal * form.taxRate) / 100;
  const total = subtotal + tax - form.discount;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Invoices</h1>
        <Button onClick={() => setOpen(true)}><Plus size={16} className="mr-2" />New Invoice</Button>
      </div>

      {/* Create Invoice Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>New Invoice</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Client</Label>
                <Select value={form.clientId} onValueChange={(v) => setForm({ ...form, clientId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Issue Date</Label>
                <Input type="date" value={form.issueDate} onChange={(e) => setForm({ ...form, issueDate: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Tax Rate (%)</Label>
                <Input type="number" value={form.taxRate} onChange={(e) => setForm({ ...form, taxRate: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Discount (€)</Label>
                <Input type="number" value={form.discount} onChange={(e) => setForm({ ...form, discount: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Line Items</Label>
                <Button type="button" variant="outline" size="sm" onClick={addItem}><Plus size={14} className="mr-1" />Add Item</Button>
              </div>
              <div className="space-y-2">
                {items.map((item, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center">
                    <Input className="col-span-5" placeholder="Description" value={item.description} onChange={(e) => updateItem(i, 'description', e.target.value)} required />
                    <Input className="col-span-2" type="number" placeholder="Qty" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', Number(e.target.value))} />
                    <Input className="col-span-3" type="number" placeholder="Unit Price" value={item.unitPrice} onChange={(e) => updateItem(i, 'unitPrice', Number(e.target.value))} />
                    <span className="col-span-1 text-sm text-gray-500">€{(item.quantity * item.unitPrice).toFixed(0)}</span>
                    <Button type="button" variant="ghost" size="sm" className="col-span-1" onClick={() => removeItem(i)}><Trash2 size={14} /></Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4 text-right space-y-1">
              <p className="text-sm text-gray-500">Subtotal: €{subtotal.toFixed(2)}</p>
              <p className="text-sm text-gray-500">Tax ({form.taxRate}%): €{tax.toFixed(2)}</p>
              <p className="text-sm text-gray-500">Discount: €{form.discount.toFixed(2)}</p>
              <p className="font-bold">Total: €{total.toFixed(2)}</p>
            </div>

            <Button type="submit" className="w-full">Create Invoice</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Invoice List */}
      <div className="grid gap-4">
        {invoices.length === 0 && (
          <Card><CardContent className="py-8 text-center text-gray-500">No invoices yet.</CardContent></Card>
        )}
        {invoices.map((inv) => (
          <Card key={inv.id}>
            <CardContent className="flex items-center justify-between py-4">
              <div>
                <p className="font-semibold">{inv.invoiceNumber} — {inv.client?.name}</p>
                <p className="text-sm text-gray-500">Due: {new Date(inv.dueDate).toLocaleDateString()} · €{Number(inv.total).toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={statusColors[inv.status] as any}>{inv.status}</Badge>
                <Select value={inv.status} onValueChange={(v) => updateStatus(inv.id, v)}>
                  <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
                    <Button variant="outline" size="sm" onClick={() => downloadPdf(inv.id, inv.invoiceNumber)}><FileDown size={14} /></Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(inv.id)}><Trash2 size={14} /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}