import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient"; // ✅ IMPORT HERE
import useAuth from "../hooks/useAuth";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#00C49F", "#FF4C4C"];

export default function TrainerProfileLink() {
  const { user } = useAuth();
  const [taeQuals, setTaeQuals] = useState([]);
  const [vocationalQuals, setVocationalQuals] = useState([]);
  const [licences, setLicences] = useState([]);
  const [pd, setPd] = useState([]);

  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      const { data: trainingProducts } = await supabase
        .from("training_products")
        .select("*")
        .eq("user_id", user.id);

      const tae = (trainingProducts || []).filter(
        (q) => q.code?.startsWith("TAE") && /^[A-Z]{3}\d{5}$/.test(q.code.trim())
      );
      setTaeQuals(tae);

      const { data: vocationalQualifications } = await supabase
        .from("vocational_qualifications")
        .select("*")
        .eq("user_id", user.id);
      setVocationalQuals(vocationalQualifications || []);

      const { data: licencesData } = await supabase
        .from("industry_licences")
        .select("*")
        .eq("user_id", user.id);
      setLicences(licencesData || []);

      const { data: pdData } = await supabase
        .from("professional_development")
        .select("*")
        .eq("user_id", user.id);
      setPd(pdData || []);
    };

    fetchData();
  }, [user]);

  const pdStats = () => {
    const now = new Date();
    let recent = 0;
    let outdated = 0;

    pd.forEach((entry) => {
      const date = new Date(entry.activity_date);
      if (date instanceof Date && !isNaN(date)) {
        const diffMonths =
          (now.getFullYear() - date.getFullYear()) * 12 +
          (now.getMonth() - date.getMonth());
        if (diffMonths <= 12) recent++;
        else outdated++;
      }
    });

    return [
      { name: "< 12 Months", value: recent },
      { name: "> 12 Months", value: outdated },
    ];
  };

  const licenceStats = () => {
    const now = new Date();
    const in3Months = new Date();
    in3Months.setMonth(now.getMonth() + 3);

    let current = 0;
    let expiringSoon = 0;
    let expired = 0;

    licences.forEach((entry) => {
      const rawDate = entry.date || entry.date_awarded || entry.date_attained;
      const date = new Date(rawDate);
      if (date instanceof Date && !isNaN(date)) {
        if (date < now) expired++;
        else if (date <= in3Months) expiringSoon++;
        else current++;
      }
    });

    return { current, expiringSoon, expired };
  };

  const barData = [
    { name: "TAE Quals", count: taeQuals.length },
    { name: "Vocational Quals", count: vocationalQuals.length },
    { name: "Licences", count: licences.length },
    { name: "PD", count: pd.length },
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center gap-4 mb-6">
        <img
          src={user?.avatar_url || "/default-avatar.png"}
          alt="avatar"
          className="w-20 h-20 rounded-full border"
        />
        <div>
          <h2 className="text-xl font-bold text-gray-800">{user?.name || "Trainer"}</h2>
          <p className="text-gray-600 text-sm">{user?.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-teal-50 p-4 rounded-xl shadow text-center">
          <h4 className="text-gray-600">TAE Qualifications</h4>
          <p className="text-2xl font-bold text-teal-700">{taeQuals.length}</p>
        </div>
        <div className="bg-teal-50 p-4 rounded-xl shadow text-center">
          <h4 className="text-gray-600">Vocational Quals</h4>
          <p className="text-2xl font-bold text-teal-700">{vocationalQuals.length}</p>
        </div>
        <div className="bg-teal-50 p-4 rounded-xl shadow text-center">
          <h4 className="text-gray-600">Licences</h4>
          <p className="text-2xl font-bold text-teal-700">{licenceStats().current}</p>
        </div>
        <div className="bg-teal-50 p-4 rounded-xl shadow text-center">
          <h4 className="text-gray-600">PD Entries</h4>
          <p className="text-2xl font-bold text-teal-700">{pd.length}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-4 border rounded-lg shadow">
          <h3 className="text-md font-semibold mb-2">Trainer Profile Snapshot</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#007a7c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 border rounded-lg shadow">
          <h3 className="text-md font-semibold mb-2">PD Currency</h3>
          {pdStats()[1]?.value > 0 && (
            <p className="text-sm text-red-600 mt-2 font-medium">
              ⚠️ Update your PD — some entries are older than 12 months.
            </p>
          )}
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pdStats()}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={70}
                label
              >
                {pdStats().map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
