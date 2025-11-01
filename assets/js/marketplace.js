// Marketplace front-end (renders Fiverr-like gigs from repo-level db.json)
const JOBS_URL = '/db.json';

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

function escapeHtml(text){
  return (text||'').toString().replace(/[&"'<>]/g, c=>({
    '&':'&amp;','"':'&quot;','\'':'&#39;','<':'&lt;','>':'&gt;'
  })[c]);
}

function renderGigCard(job){
  const div = document.createElement('div');
  div.className = 'gig-card';
  const img = job.image || '/assets/img/portfolio/portfolio-1.jpg';
  const seller = job.seller || {name:'Seller',avatar:'/assets/img/team/team-1.jpg'};
  const rating = job.rating || 4.9;
  const reviews = job.reviews || 12;
  const delivery = job.delivery || '3 Days';
  const price = job.price || (Math.floor(Math.random()*900)+50);

  div.innerHTML = `
    <div class="gig-media"><a href="service.html?id=${escapeHtml(job.id)}"><img src="${escapeHtml(img)}" alt="${escapeHtml(job.title)}"></a></div>
    <div class="gig-body">
      <h4 class="gig-title"><a href="service.html?id=${escapeHtml(job.id)}">${escapeHtml(job.title)}</a></h4>
      <div class="gig-seller"><div class="seller-avatar"><img src="${escapeHtml(seller.avatar||'/assets/img/team/team-1.jpg')}" alt=""></div><div>${escapeHtml(seller.name||'Seller')}</div></div>
      <div class="gig-badges">
        <div class="gig-badge">${escapeHtml(job.category||'General')}</div>
        <div class="gig-badge">${escapeHtml(job.level||'Top Rated')}</div>
      </div>
      <div class="gig-meta">
        <div class="gig-rating">★ ${escapeHtml(rating.toString())} <span style="color:#95a1b3;font-weight:600;font-size:12px">(${reviews})</span></div>
        <div class="gig-price">$${escapeHtml(price.toString())}</div>
      </div>
    </div>
    <div class="gig-footer">
      <div style="font-size:13px;color:#95a1b3">Delivery: ${escapeHtml(delivery)}</div>
      <button class="gig-cta" data-id="${escapeHtml(job.id||'')}">Order</button>
    </div>
  `;
  return div;
}

// Populate quick listings on homepage
if(document.getElementById('quick-listings')){
  fetchJobs().then(jobs=>{
    const container = document.getElementById('quick-listings');
    jobs.slice(0,6).forEach(job=>{
      const col = document.createElement('div'); col.className = 'col-md-4'; col.appendChild(renderGigCard(job)); container.appendChild(col);
    });
  });
}

// Full listings page behavior
if(document.getElementById('gigs-grid')){
  (async ()=>{
    const jobs = await fetchJobs();
    const grid = document.getElementById('gigs-grid');
    const searchInput = document.getElementById('search-input');
    const categorySelect = document.getElementById('category-filter');
    const sortSelect = document.getElementById('sort-select');

    function renderList(list){
      grid.innerHTML = '';
      const fragment = document.createDocumentFragment();
      list.forEach(j=>{ const card = renderGigCard(j); const wrapper = document.createElement('div'); wrapper.className='col-md-6 col-lg-4'; wrapper.appendChild(card); fragment.appendChild(wrapper); });
      grid.appendChild(fragment);
    }

    function applyFilters(){
      const q = (searchInput.value||'').toLowerCase().trim();
      const cat = (categorySelect.value||'all');
      let filtered = jobs.filter(j=>{
        const inTitle = j.title && j.title.toLowerCase().includes(q);
        const inDesc = j.description && j.description.toLowerCase().includes(q);
        const catOk = cat==='all' || j.category===cat;
        return (inTitle || inDesc) && catOk;
      });
      const sort = sortSelect.value;
      if(sort==='price-asc') filtered.sort((a,b)=>(a.price||0)-(b.price||0));
      if(sort==='price-desc') filtered.sort((a,b)=>(b.price||0)-(a.price||0));
      if(sort==='rating') filtered.sort((a,b)=>(b.rating||0)-(a.rating||0));
      renderList(filtered);
    }

    // populate categories
    const cats = Array.from(new Set(jobs.map(j=>j.category))).filter(Boolean);
    cats.forEach(c=>{ const opt = document.createElement('option'); opt.value=c; opt.textContent=c; categorySelect.appendChild(opt); });

    searchInput.addEventListener('input', ()=>applyFilters());
    categorySelect.addEventListener('change', ()=>applyFilters());
    sortSelect.addEventListener('change', ()=>applyFilters());

    renderList(jobs);
  })();
}

// Post a job helper (keeps existing behavior: produce command or show demo message)
const postForm = document.getElementById('post-job-form');
if(postForm){
  postForm.addEventListener('submit', e=>{
    e.preventDefault();
    const fd = new FormData(postForm);
    const job = { id: Date.now().toString(), title:fd.get('title'), category:fd.get('category'), description:fd.get('description'), price: fd.get('price')||null };
    const out = document.getElementById('post-result');
    out.innerHTML = `<div class="alert alert-success">Job prepared (demo). Use the Actions helper to create it in the repository: <code>gh api repos/&lt;OWNER&gt;/&lt;REPO&gt;/dispatches -f event_type=create_job -f client_payload='${escapeHtml(JSON.stringify({job}))}'</code></div>`;
    postForm.reset();
  });
}

// Service detail page: render single service when viewing marketplace/service.html?id=<id>
if(document.getElementById('service-detail')){
  (async ()=>{
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const jobs = await fetchJobs();
    const job = jobs.find(j => (j.id && j.id.toString()) === (id && id.toString()));
    const container = document.getElementById('service-detail');
    if(!job){
      container.innerHTML = '<div class="alert alert-warning">Service not found.</div>';
      return;
    }
    container.innerHTML = `
      <div class="service-detail-card">
        <div class="row">
          <div class="col-md-6">
            <img src="${escapeHtml(job.image||'/assets/img/portfolio/portfolio-1.jpg')}" class="img-fluid rounded" alt="${escapeHtml(job.title)}">
          </div>
          <div class="col-md-6">
            <h2>${escapeHtml(job.title)}</h2>
            <div class="mb-2"><strong>Category:</strong> ${escapeHtml(job.category||'--')}</div>
            <div class="mb-2"><strong>Seller:</strong> ${escapeHtml((job.seller&&job.seller.name)||'Seller')}</div>
            <div class="mb-2"><strong>Price:</strong> $${escapeHtml((job.price||'N/A').toString())}</div>
            <div class="mb-2"><strong>Delivery:</strong> ${escapeHtml(job.delivery||'N/A')}</div>
            <div class="mb-3"><button class="btn btn-success service-buy-btn">Buy Now</button></div>
            <h5>Description</h5>
            <p>${escapeHtml(job.description||'No description provided.')}</p>
            ${job.features ? `<h6>What's included</h6><ul>${job.features.map(f=>`<li>${escapeHtml(f)}</li>`).join('')}</ul>` : ''}
          </div>
        </div>
      </div>
    `;
  })();
}

