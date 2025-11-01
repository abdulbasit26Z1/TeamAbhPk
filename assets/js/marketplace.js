// Minimal marketplace JS (demo-only, no backend)
const JOBS_URL = '/marketplace/data/jobs.json';

async function fetchJobs(){
  try{
    const res = await fetch(JOBS_URL);
    if(!res.ok) throw new Error('Could not load jobs');
    return await res.json();
  }catch(e){
    console.warn(e);
    return [];
  }
}

function renderJobCard(job){
  const div = document.createElement('div');
  div.className = 'col-md-6';
  div.innerHTML = `
    <div class="card p-3 job-card">
      <div class="d-flex justify-content-between">
        <h5>${escapeHtml(job.title)}</h5>
        <small class="text-muted">${escapeHtml(job.category)}</small>
      </div>
      <p class="mb-1">${escapeHtml(truncate(job.description,120))}</p>
      <a class="btn btn-sm btn-outline-primary" href="listings.html">View</a>
    </div>
  `;
  return div;
}

function escapeHtml(text){
  return (text||'').replace(/[&"'<>]/g, c=>({
    '&':'&amp;','"':'&quot;','\'':'&#39;','<':'&lt;','>':'&gt;'
  })[c]);
}
function truncate(s,n){return s.length>n? s.slice(0,n-1)+'…':s}

// Quick populate for homepage
if(document.getElementById('quick-listings')){
  fetchJobs().then(jobs=>{
    const container = document.getElementById('quick-listings');
    jobs.slice(0,4).forEach(job=>container.appendChild(renderJobCard(job)));
  });
}

// Listings page behavior
if(document.getElementById('jobs-list')){
  (async ()=>{
    const jobs = await fetchJobs();
    const list = document.getElementById('jobs-list');
    const filter = document.getElementById('category-filter');
    function showJobs(category){
      list.innerHTML='';
      const filtered = category && category!=='all' ? jobs.filter(j=>j.category===category) : jobs;
      filtered.forEach(j=>list.appendChild(renderJobCard(j)));
    }
    filter.addEventListener('change', ()=>showJobs(filter.value));
    showJobs('all');
  })();
}

// Post a job (demo: just shows a success message, doesn't persist)
const postForm = document.getElementById('post-job-form');
if(postForm){
  postForm.addEventListener('submit', e=>{
    e.preventDefault();
    const fd = new FormData(postForm);
    const job = {title:fd.get('title'),category:fd.get('category'),description:fd.get('description')};
    document.getElementById('post-result').innerHTML = `<div class="alert alert-success">Job received (demo): <strong>${escapeHtml(job.title)}</strong></div>`;
    postForm.reset();
  });
}

// Dashboard: load "my jobs" from localStorage (demo)
if(document.getElementById('my-jobs')){
  const myJobs = JSON.parse(localStorage.getItem('demo_my_jobs')||'[]');
  const ul = document.getElementById('my-jobs');
  if(myJobs.length===0){ ul.innerHTML='<li class="text-muted">No jobs posted yet (demo)</li>' }
  else myJobs.forEach(j=>{ const li=document.createElement('li'); li.textContent = j.title; ul.appendChild(li) });
}
