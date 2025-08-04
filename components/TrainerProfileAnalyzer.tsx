// TrainerProfileAnalyzer.jsx — Full Analyzer with Tabbed Preview + Firestore Save
import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import useAuth from '../hooks/useAuth';
import Dropzone from 'react-dropzone';
import { toast } from 'react-toastify';
import parseTrainerProfile from '../utils/parser';
import SectionCard from './layout/SectionCard';

const TrainerProfileAnalyzer = () => {
  const { user } = useAuth();
  const [parsedData, setParsedData] = useState(null);
  const [selectedTab, setSelectedTab] = useState('trainingProducts');
  const [selectedItems, setSelectedItems] = useState({});

  const sectionLabels = {
    trainingProducts: 'TAE + Other Qualifications',
    vocationalQualifications: 'Vocational Qualifications',
    vocationalCompetency: 'Vocational Competency Units',
    industryEmployment: 'Employment History',
    industryLicences: 'Licences & Regulatory Outcomes',
    professionaldevelopment: 'Professional Development',
    tertiaryQualifications: 'Tertiary Qualifications'
  };

  const handleFileUpload = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    toast.info('Parsing document…');

    try {
      const result = await parseTrainerProfile(file);
      setParsedData(result);

      // Default all checkboxes to selected
      const defaultSelection = {};
      Object.keys(result).forEach(key => {
        defaultSelection[key] = result[key].map((_, i) => true);
      });
      setSelectedItems(defaultSelection);

      toast.success('Document parsed successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to parse document.');
    }
  };

  const handleCheckboxToggle = (section, index) => {
    setSelectedItems(prev => ({
      ...prev,
      [section]: prev[section].map((val, i) => (i === index ? !val : val))
    }));
  };

  const toggleSelectAll = (section) => {
    const allSelected = selectedItems[section]?.every(val => val);
    setSelectedItems(prev => ({
      ...prev,
      [section]: prev[section].map(() => !allSelected)
    }));
  };

 const saveToFirestore = async () => {
  if (!user || !parsedData) return;
  toast.info('Saving selected items…');

  const validCollections = {
    industryEmployment: true,
    industryLicences: true,
    professionalDevelopment: true,
    tertiaryQualifications: true,
    trainingProducts: true,
    vocationalCompetency: true,
    vocationalQualifications: true
  };

  try {
    const batchWrites = Object.entries(parsedData).map(async ([section, entries]) => {
      if (!validCollections[section]) {
        console.warn(`Skipping invalid section: ${section}`);
        return;
      }

      const selected = selectedItems[section] || [];

      return Promise.all(
        entries.map(async (entry, idx) => {
          if (!selected[idx]) return;

          const id = entry.code || entry.title || `${Date.now()}_${idx}`;
          const ref = doc(db, `trainerProfiles/${user.uid}/${section}/${id}`);
          await setDoc(ref, entry);
        })
      );
    });

    await Promise.all(batchWrites);
    toast.success('All selected data saved to Firestore.');

    // ✅ Clear after saving
    setParsedData(null);
    setSelectedItems({});
  } catch (err) {
    console.error(err);
    toast.error('Save failed.');
  }
};

  return (
    <SectionCard title="">
      <Dropzone onDrop={handleFileUpload} multiple={false} accept={{
        'application/pdf': ['.pdf'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        'application/msword': ['.doc'],
        'text/rtf': ['.rtf'],
        'image/*': ['.png', '.jpg', '.jpeg']
      }}>
        {({ getRootProps, getInputProps }) => (
          <div
            {...getRootProps()}
            className="p-6 border-2 border-dashed rounded-lg text-center text-gray-500 cursor-pointer hover:bg-gray-50"
          >
            <input {...getInputProps()} />
            <p>📂 Drag and drop a trainer profile document here, or click to upload</p>
          </div>
        )}
      </Dropzone>

      {parsedData && (
        <div className="mt-6">
          {/* Tabs */}
          <div className="flex flex-wrap gap-4 border-b mb-4">
            {Object.keys(sectionLabels).map((key) => (
              <button
                key={key}
                onClick={() => setSelectedTab(key)}
                className={`py-2 px-4 font-medium rounded-t ${selectedTab === key ? 'bg-teal-100 text-teal-800 border-t border-l border-r border-teal-300' : 'text-gray-500 hover:text-teal-600'}`}
              >
                {sectionLabels[key]}
              </button>
            ))}
          </div>

          {/* Preview Table */}
          <div className="bg-gray-50 p-4 rounded border">
            {parsedData[selectedTab]?.length > 0 ? (
              <>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-gray-700">{parsedData[selectedTab].length} entries found</h3>
                  <button
                    onClick={() => toggleSelectAll(selectedTab)}
                    className="text-sm text-teal-700 hover:underline"
                  >
                    Toggle Select All
                  </button>
                </div>
                <ul className="divide-y divide-gray-200">
                  {parsedData[selectedTab].map((item, index) => (
                    <li key={index} className="py-2 flex items-start gap-2">
                      <input
                        type="checkbox"
                        checked={selectedItems[selectedTab]?.[index] || false}
                        onChange={() => handleCheckboxToggle(selectedTab, index)}
                        className="mt-1"
                      />
                      <pre className="whitespace-pre-wrap text-sm text-gray-800 bg-white border p-2 rounded w-full overflow-auto">
                        {JSON.stringify(item, null, 2)}
                      </pre>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-sm text-gray-600">No entries found for this section.</p>
            )}
          </div>

          {/* Save Button */}
          <div className="text-right mt-6">
            <button
              onClick={saveToFirestore}
              className="bg-teal-600 text-white px-5 py-2 rounded hover:bg-teal-700"
            >
              💾 Save All Selected
            </button>
          </div>
        </div>
      )}
    </SectionCard>
  );
};

export default TrainerProfileAnalyzer;
