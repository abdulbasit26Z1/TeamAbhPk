// Helper for actions-only flow: build a ready-to-run curl or gh CLI command
document.addEventListener('DOMContentLoaded', ()=>{
  const form = document.getElementById('post-job-form');
  if(!form) return;

  const output = document.createElement('pre');
  output.style.whiteSpace = 'pre-wrap';
  output.className = 'mt-3 p-3 bg-light border';

  const copyBtn = document.createElement('button');
  copyBtn.type = 'button';
  copyBtn.className = 'btn btn-sm btn-outline-secondary ms-2';
  copyBtn.textContent = 'Copy command';

  const wrapper = document.createElement('div');
  wrapper.className = 'mt-3';
  wrapper.innerHTML = '<div><strong>Ready-to-run command (run locally)</strong></div>';
  wrapper.appendChild(output);
  wrapper.appendChild(copyBtn);

  form.parentNode.insertBefore(wrapper, form.nextSibling);

  form.addEventListener('submit', e=>{
    e.preventDefault();
    const fd = new FormData(form);
    const job = { job: {
      id: Date.now().toString(),
      title: fd.get('title') || '',
      category: fd.get('category') || '',
      description: fd.get('description') || ''
    }};

    const json = JSON.stringify(job);

    const ownerRepoPlaceholder = '<OWNER>/<REPO>';
    const curlCmd = `curl -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: token $GITHUB_PAT" \
  https://api.github.com/repos/${ownerRepoPlaceholder}/dispatches \
  -d '${json.replace(/'/g, "'\\''")}'`;

    const ghCmd = `gh api repos/${ownerRepoPlaceholder}/dispatches -f event_type=create_job -f client_payload='${json.replace(/'/g, "'\\''")}'`;

    output.textContent = `curl (use this locally):\n${curlCmd}\n\nOR with gh CLI:\n${ghCmd}`;

    copyBtn.onclick = ()=>{
      navigator.clipboard.writeText(output.textContent).then(()=>{
        copyBtn.textContent = 'Copied';
        setTimeout(()=>copyBtn.textContent='Copy command',1500);
      });
    };
  });
});
