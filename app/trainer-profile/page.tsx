import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useParams } from "react-router-dom";
import Tabs from "../components/Tabs";
import useAuth from "../hooks/useAuth";
import TrainerProfileAnalyzer from "../components/TrainerProfileAnalyzer";

const TrainerProfile = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(1);

  const { userId } = useParams(); // from /trainerprofile/:userId
const { user } = useAuth();

const uid = userId || user?.id;

console.log("user from useAuth():", user);
console.log("Resolved uid:", uid);
  useEffect(() => {
    const tabFromHash = {
      "#section1": 1,
      "#section2": 2,
      "#section3": 3,
      "#section4": 4,
      "#section5": 5,
      "#section6": 6,
      "#section7": 7,
    };

    if (location.hash && tabFromHash[location.hash]) {
      setActiveTab(tabFromHash[location.hash]);
      setTimeout(() => {
        const el = document.querySelector(location.hash);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
    }
  }, [location]);

  return (
    
    <div className="p-6 max-w-6xl mx-auto bg-white shadow-md rounded-lg mt-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Trainer & Assessor Profile</h1>
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded">
        <p className="text-gray-700 text-sm leading-relaxed">
          This profile helps you document and maintain evidence of your competency and currency as a Trainer and Assessor, in alignment with the <strong>Standards for RTOs 2015</strong> — specifically <strong>Clauses 1.13 to 1.16</strong>.
        </p>
        <p className="text-gray-700 text-sm mt-2">
          As a Trainer/Assessor, you are required to demonstrate:
        </p>
        <ul className="list-disc list-inside text-sm text-gray-700 mt-2 space-y-1">
          <li>Vocational competency for each unit you deliver</li>
          <li>Current industry skills directly relevant to training/assessment</li>
          <li>TAE qualifications and continued professional development</li>
          <li>Currency and sufficiency of evidence to support your role</li>
        </ul>
        <p className="text-gray-700 text-sm mt-2">
          Use the tabs below to enter your qualifications, work history, PD, and regulatory licences. This system helps you stay compliant and prepares you for audits, validation, or internal reviews.
        </p>
      </div>

      <TrainerProfileAnalyzer />
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default TrainerProfile;
