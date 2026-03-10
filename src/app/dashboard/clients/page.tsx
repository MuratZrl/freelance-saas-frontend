// src/app/dashboard/clients/page.tsx
'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Pencil } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  companyName: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', companyName: '' });

  async function fetchClients() {
    const res = await api.get('/clients');
    setClients(res.data);
  }

  useEffect(() => { fetchClients(); }, []);

  function openNew() {
    setEditing(null);
    setForm({ name: '', email: '', phone: '', companyName: '' });
    setOpen(true);
  }

  function openEdit(client: Client) {
    setEditing(client);
    setForm({ name: client.name, email: client.email, phone: client.phone, companyName: client.companyName });
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) {
      await api.put(`/clients/${editing.id}`, form);
    } else {
      await api.post('/clients', form);
    }
    setOpen(false);
    fetchClients();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this client?')) return;
    await api.delete(`/clients/${id}`);
    fetchClients();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Clients</h1>
        <Button onClick={openNew}>
          <Plus size={16} className="mr-2" /> Add Client
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Client' : 'New Client'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Company</Label>
              <Input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
            </div>
            <Button type="submit" className="w-full">{editing ? 'Save Changes' : 'Create Client'}</Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4">
        {clients.length === 0 && (
          <Card><CardContent className="py-8 text-center text-gray-500">No clients yet. Add your first client.</CardContent></Card>
        )}
        {clients.map((client) => (
          <Card key={client.id}>
            <CardContent className="flex items-center justify-between py-4">
              <div>
                <p className="font-semibold">{client.name}</p>
                <p className="text-sm text-gray-500">{client.email} {client.phone && `· ${client.phone}`} {client.companyName && `· ${client.companyName}`}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => openEdit(client)}><Pencil size={14} /></Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(client.id)}><Trash2 size={14} /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}