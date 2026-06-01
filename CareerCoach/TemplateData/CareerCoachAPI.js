// JavaScript Plugin for CareerCoach WebGL Build
// Place this in Assets/Plugins/WebGL/ folder

const CareerCoachAPI = {
    API_BASE_URL: 'https://tfg-demo-project.onrender.com',
    
    // Fetch job by ID from the backend
    fetchJobById: function(jobId, onSuccess, onError) {
        const url = `${this.API_BASE_URL}/jobs/${jobId}`;
        console.log(`📡 Fetching job from: ${url}`);
        
        fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success && data.data) {
                console.log(`✅ Job loaded: ${data.data.title}`);
                if (onSuccess) onSuccess(data.data);
            } else {
                console.error('❌ Job not found');
                if (onError) onError('Job not found');
            }
        })
        .catch(error => {
            console.error(`❌ Error fetching job: ${error}`);
            if (onError) onError(error.message);
        });
    },
    
    // Get all jobs
    fetchAllJobs: function(onSuccess, onError) {
        const url = `${this.API_BASE_URL}/jobs`;
        console.log(`📡 Fetching all jobs from: ${url}`);
        
        fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success && data.data) {
                console.log(`✅ ${data.data.length} jobs loaded`);
                if (onSuccess) onSuccess(data.data);
            } else {
                console.error('❌ No jobs found');
                if (onError) onError('No jobs found');
            }
        })
        .catch(error => {
            console.error(`❌ Error fetching jobs: ${error}`);
            if (onError) onError(error.message);
        });
    },
    
    // Get job ID from URL parameters
    getJobIdFromURL: function() {
        const params = new URLSearchParams(window.location.search);
        return params.get('jobId');
    },
    
    // Initialize interview with job context
    initializeInterview: function(jobData) {
        console.log(`🎯 Initializing interview for: ${jobData.title}`);
        
        // This would typically send the job context to Convai
        const interviewContext = {
            role: jobData.title,
            skills_required: jobData.skills,
            job_description: jobData.description,
            experience_required: jobData.experience,
            company: jobData.company
        };
        
        console.log('📋 Interview Context:', interviewContext);
        
        // Send to Convai SDK
        if (window.ConvaiClient) {
            window.ConvaiClient.initializeWithContext(interviewContext);
        }
        
        return interviewContext;
    }
};

// Make available globally
window.CareerCoachAPI = CareerCoachAPI;

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CareerCoachAPI;
}
