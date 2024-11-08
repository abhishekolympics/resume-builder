import React, { useState } from 'react';
// import VoiceInput from '../components/VoiceInput';
import JobList from '../components/JobList';
// import { searchJobs } from '../utils/api';
// import { toast } from 'react-toastify';

const JobSearch = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  // const handleVoiceInput = async (transcript) => {
  //   try {
  //     setLoading(true);
  //     const jobResults = await searchJobs(transcript);
  //     setJobs(jobResults.jobs);
  //   } catch (error) {
  //     toast.error('Error searching jobs');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleJobSelect = (job) => {
    window.open(job.url, '_blank');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Voice-Powered Job Search</h1>
      {/* <VoiceInput onTranscript={handleVoiceInput} /> */}
      {loading ? (
        <div className="mt-4">Searching jobs...</div>
      ) : (
        <JobList jobs={jobs} onJobSelect={handleJobSelect} />
      )}
    </div>
  );
};

export default JobSearch;