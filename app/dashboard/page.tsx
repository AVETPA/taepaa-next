'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import TrainerProfileLink from '@/components/TrainerProfileLink';
import ProgressCircle from '@/components/ProgressCircle';
import useUserProfile from '@/hooks/useUserProfile';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const { authUser: user, profile, loading } = useUserProfile();

  const [taeCount, setTaeCount] = useState(0);
  const [vocQualCount, setVocQualCount] = useState(0);
  const [licenceCount, setLicenceCount] = useState(0);
  const [pdEntryCount, setPdEntryCount] = useState(0);
  const [pdCompliance, setPdCompliance] = useState('unknown');
  const [upcomingPD, setUpcomingPD] = useState<any[]>([]);

  const [taeCurrentCount, setTaeCurrentCount] = useState(0);
  const [taeSupersededCount, setTaeSupersededCount] = useState(0);
  const [vocCurrentCount, setVocCurrentCount] = useState(0);
  const [vocSupersededCount, setVocSupersededCount] = useState(0);
  const [licenceCurrentCount, setLicenceCurrentCount] = useState(0);
  const [licenceExpiredCount, setLicenceExpiredCount] = useState(0);
  const [expiringLicencesCount, setExpiringLicencesCount] = useState(0);
  const [pdCurrentCount, setPdCurrentCount] = useState(0);
  const [pdOutdatedCount, setPdOutdatedCount] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }

    const fetchData = async () => {
      if (!user) return;

      const uid = user.id;
      const now = new Date();
      const in3Months = new Date();
      in3Months.setMonth(now.getMonth() + 3);

      const { data: taeData } = await supabase
        .from('training_products')
        .select('code, status, date_awarded')
        .eq('user_id', uid);

      const fullTAEQuals = (taeData || []).filter(
        (q) => ['TAE40110', 'TAE40116', 'TAE40122'].includes(q.code?.trim()) && q.date_awarded
      );

      setTaeCount(fullTAEQuals.length);
      setTaeCurrentCount(fullTAEQuals.filter((q) => q.status === 'Current').length);
      setTaeSupersededCount(fullTAEQuals.filter((q) => q.status === 'Superseded').length);

      const { data: vocData } = await supabase
        .from('vocational_qualifications')
        .select('status, type, date_awarded')
        .eq('user_id', uid);

      const fullVocQuals = (vocData || []).filter((q) => q.type === 'Qualification' && q.date_awarded);
      setVocQualCount(fullVocQuals.length);
      setVocCurrentCount(fullVocQuals.filter((q) => q.status === 'Current').length);
      setVocSupersededCount(fullVocQuals.filter((q) => q.status === 'Superseded').length);

      const { data: licData } = await supabase
        .from('industry_licences')
        .select('date')
        .eq('user_id', uid);

      const licences = licData || [];
      setLicenceCount(licences.length);
      setLicenceCurrentCount(licences.filter((l) => new Date(l.date) >= now).length);
      setLicenceExpiredCount(licences.filter((l) => new Date(l.date) < now).length);
      setExpiringLicencesCount(
        licences.filter((l) => {
          const d = new Date(l.date);
          return d >= now && d <= in3Months;
        }).length
      );

      const { data: pdData } = await supabase
        .from('professional_development')
        .select('activity_date, related_to')
        .eq('user_id', uid);

      const pdEntries = pdData || [];
      setPdEntryCount(pdEntries.length);

      const lastYear = new Date();
      lastYear.setFullYear(now.getFullYear() - 1);

      const recentPD = pdEntries.filter((pd) => {
        const date = new Date(pd.activity_date);
        return !isNaN(date as any) && date >= lastYear;
      });

      const taePD = recentPD.filter((pd) => pd.related_to === 'TAE');
      const vocPD = recentPD.filter((pd) => pd.related_to === 'Vocational');

      setPdCurrentCount(recentPD.length);
      setPdOutdatedCount(pdEntries.length - recentPD.length);
      setPdCompliance(
        taePD.length >= 2 && vocPD.length >= 2 ? 'good' : taePD.length || vocPD.length ? 'partial' : 'none'
      );

      const { data: events } = await supabase
        .from('event_registrations')
        .select('event_id, events(date, title, time, banner_url, type)')
        .eq('user_id', uid);

      const upcoming = (events || []).filter((e) => new Date(e.events?.date) > now);
      setUpcomingPD(upcoming.map((e) => ({ ...e.events, eventId: e.event_id })));
    };

    fetchData();
  }, [loading, user, router, supabase]);

  if (loading || !user || !profile) {
    return (
      <div className="flex justify-center items-center min-h-screen text-teal-600 text-lg">
        Checking authentication...
      </div>
    );
  }

  const pdPieData = [
    { name: 'Current', value: pdCurrentCount },
    { name: 'Outdated', value: pdOutdatedCount },
  ];

  const COLORS = ['#34D399', '#F87171'];

  return (
    <div className="min-h-screen bg-[#f5fbfb] px-6 py-12">
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-2xl p-10">
        <TrainerProfileLink />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10">
          <ProgressCircle percentage={(taeCurrentCount / (taeCount || 1)) * 100} label="TAE Current" color="green" />
          <ProgressCircle percentage={(vocCurrentCount / (vocQualCount || 1)) * 100} label="Vocational Current" color="blue" />
          <ProgressCircle percentage={(licenceCurrentCount / (licenceCount || 1)) * 100} label="Licences Valid" color="orange" />
          <ProgressCircle percentage={(pdCurrentCount / (pdEntryCount || 1)) * 100} label="PD Currency" color="red" />
        </div>

        <div className="mt-12">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">PD Compliance Overview</h2>
          <div className="w-full h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pdPieData} dataKey="value" nameKey="name" outerRadius={80}>
                  {pdPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
