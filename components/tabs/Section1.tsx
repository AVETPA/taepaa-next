// Section1.tsx — Fully typed, route-aware, RTO validation, export-ready
'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import useAuth from '@/hooks/useAuth';
import TAEAnalyzer from '@/components/TaeAnalyzer';
import SectionCard from '@/components/layout/SectionCard';
import rtoLookup from '@/data/current_rto_lookup.json';
import qualificationsData from '@/data/qualifications_and_units.json';
import toast from 'react-hot-toast';
import { useSearchParams } from 'next/navigation';

interface LinkedUnit {
  code: string;
  title: string;
  status: string;
  date_awarded?: string;
  rtoCode?: string;
  provider?: string;
}

interface TrainingProduct {
  id?: string;
  user_id: string;
  code: string;
  title: string;
  status: string;
  superseded_by: string;
  rto_code: string;
  provider: string;
  date_awarded: string;
  type: 'Qualification' | 'Unit';
  linked_units?: LinkedUnit[];
}

interface FormState {
  code: string;
  title: string;
  provider: string;
  rtoCode: string;
  dateAwarded: string;
  status: string;
  supersededBy: string;
  type: 'Qualification' | 'Unit' | '';
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const Section1: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.id || user?.uid;
  const searchParams = useSearchParams();

  const [entries, setEntries] = useState<TrainingProduct[]>([]);
  const [qualifications, setQualifications] = useState<Record<string, any>>({});
  const [form, setForm] = useState<FormState>({
    code: '',
    title: '',
    provider: '',
    rtoCode: '',
    dateAwarded: '',
    status: '',
    supersededBy: '',
    type: ''
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [pendingUnits, setPendingUnits] = useState<LinkedUnit[]>([]);

  useEffect(() => {
    if (!userId) return;
    const map: Record<string, any> = {};
    qualificationsData.qualifications.forEach((q) => {
      map[q.code.toUpperCase()] = {
        title: q.title,
        status: q.status,
        supersededBy: q.supersededBy || '',
        type: 'Qualification'
      };
    });
    qualificationsData.units.forEach((u) => {
      map[u.code.toUpperCase()] = {
        title: u.title,
        status: u.status,
        supersededBy: u.supersededBy || '',
        type: 'Unit'
      };
    });
    setQualifications(map);
    fetchEntries();
  }, [userId]);

  useEffect(() => {
    if (searchParams?.get('tab') === 'tae') {
      const el = document.getElementById('section1-anchor');
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [searchParams]);

  const getProvider = (rtoCode: string): string => (rtoLookup as Record<string, { name: string }>)[rtoCode]?.name || '';

  const fetchEntries = async () => {
    const { data, error } = await supabase.from('training_products').select('*').eq('user_id', userId);
    if (error) toast.error('Failed to load entries');
    else setEntries((data || []).filter((e) => e.code?.startsWith('TAE')));
  };

  const isDuplicate = (code: string) => entries.some((e) => e.code.toUpperCase() === code.toUpperCase());

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'code') {
      const code = value.toUpperCase();
      const match = qualifications[code];
      setForm((prev) => ({
        ...prev,
        code,
        title: match?.title || '',
        status: match?.status || '',
        supersededBy: match?.supersededBy || '',
        type: match?.type || '',
        provider: getProvider(prev.rtoCode)
      }));
    } else if (name === 'rtoCode') {
      const provider = getProvider(value);
      if (!provider) toast.error('⚠️ Invalid RTO code');
      setForm((prev) => ({ ...prev, rtoCode: value, provider }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    if (!form.code || !form.rtoCode || !form.dateAwarded) {
      toast.error('Please complete all required fields');
      return;
    }
    if (!getProvider(form.rtoCode)) {
      toast.error('Invalid RTO code');
      return;
    }

    const payload: TrainingProduct = {
      code: form.code.toUpperCase(),
      title: form.title,
      provider: form.provider,
      rto_code: form.rtoCode,
      date_awarded: new Date(form.dateAwarded).toISOString().split('T')[0],
      status: form.status,
      superseded_by: form.supersededBy,
      type: form.type as 'Qualification' | 'Unit',
      user_id: userId,
      linked_units: pendingUnits
    };

    if (editId) {
      const { error } = await supabase.from('training_products').update(payload).eq('id', editId);
      error ? toast.error('Failed to update entry') : toast.success('Entry updated successfully');
    } else {
      if (isDuplicate(form.code)) {
        toast.error('Duplicate entry');
        return;
      }
      const { error } = await supabase.from('training_products').insert([payload]);
      error ? toast.error('Failed to add entry') : toast.success('Entry added successfully');
    }

    setForm({ code: '', title: '', provider: '', rtoCode: '', dateAwarded: '', status: '', supersededBy: '', type: '' });
    setPendingUnits([]);
    setEditId(null);
    fetchEntries();
  };

  const handleExtracted = async (rows: any[]) => {
    const newEntries: TrainingProduct[] = [];
    for (const row of rows) {
      const code = row.code?.toUpperCase();
      if (!code || isDuplicate(code)) continue;
      const match = qualifications[code];

      const entry: TrainingProduct = {
        code,
        title: match?.title || row.title || '',
        type: match?.type || row.type || 'Qualification',
        status: match?.status || '',
        superseded_by: match?.supersededBy || '',
        rto_code: row.rtoCode || '',
        provider: row.provider || getProvider(row.rtoCode),
        date_awarded: row.dateAwarded || new Date().toISOString().split('T')[0],
        linked_units: row.linkedUnits || [],
        user_id: userId
      };
      const { data, error } = await supabase.from('training_products').insert([entry]).select();
      if (data) newEntries.push(...data);
    }
    if (newEntries.length > 0) {
      toast.success(`${newEntries.length} entries imported`);
      setEntries((prev) => [...prev, ...newEntries]);
    }
  };

  return (
    <div id="section1-anchor">
      <SectionCard title="TAE Qualifications and Units of Competency">
        <div className="p-6">
          <TAEAnalyzer onExtracted={handleExtracted} />
          {/* Manual entry and export buttons coming next */}
        </div>
      </SectionCard>
    </div>
  );
};

export default Section1;
