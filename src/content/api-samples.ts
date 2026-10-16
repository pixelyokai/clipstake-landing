// Illustrative API samples for the code block: create a campaign, then list
// verified views for a submission.

export const API_SAMPLES = [
  {
    label: "cURL",
    lang: "bash",
    code: `# Create a campaign
curl https://api.clipstake.com/v1/campaigns \\
  -H "Authorization: Bearer $CLIPSTAKE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Summer Launch Clips",
    "type": "clipping",
    "cpm": 1.50,
    "budget": 10000
  }'

# List verified views for a submission
curl https://api.clipstake.com/v1/submissions/sub_8Kq2x/views \\
  -H "Authorization: Bearer $CLIPSTAKE_API_KEY"`,
  },
  {
    label: "Node",
    lang: "js",
    code: `const API = "https://api.clipstake.com/v1";
const headers = {
  Authorization: \`Bearer \${process.env.CLIPSTAKE_API_KEY}\`,
  "Content-Type": "application/json",
};

const campaign = await fetch(\`\${API}/campaigns\`, {
  method: "POST",
  headers,
  body: JSON.stringify({ name: "Summer Launch Clips", type: "clipping", cpm: 1.5, budget: 10000 }),
}).then((res) => res.json());

const views = await fetch(\`\${API}/submissions/sub_8Kq2x/views\`, { headers })
  .then((res) => res.json());
console.log(views.verified, views.flagged);`,
  },
  {
    label: "Python",
    lang: "python",
    code: `import os, requests

API = "https://api.clipstake.com/v1"
headers = {"Authorization": f"Bearer {os.environ['CLIPSTAKE_API_KEY']}"}

campaign = requests.post(f"{API}/campaigns", headers=headers, json={
    "name": "Summer Launch Clips",
    "type": "clipping",
    "cpm": 1.50,
    "budget": 10000,
}).json()

views = requests.get(f"{API}/submissions/sub_8Kq2x/views",
                     headers=headers).json()
print(views["verified"], views["flagged"])`,
  },
] as const;
