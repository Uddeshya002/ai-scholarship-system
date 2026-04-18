export async function getDashboard(req, res) {
  res.json({
    summary: {
      totalScholarshipsAvailable: 10,
      applicationsSubmitted: 2,
      approvedApplications: 1,
      pendingApplications: 1,
    },
    recentApplications: [],
    highlightedScholarships: [],
  });
}

export async function getScholarships(req, res) {
  res.json({ scholarships: [] });
}

export async function getScholarshipById(req, res) {
  res.json({});
}

export async function submitApplication(req, res) {
  res.json({ message: "Application submitted" });
}

export async function getMyApplications(req, res) {
  res.json({ applications: [] });
}