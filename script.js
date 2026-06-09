
    // ── Seed data ──
    const today = new Date();
    function addDays(d, n) {
      const r = new Date(d);
      r.setDate(r.getDate() + n);
      return r;
    }
    function fmtDate(d) {
      return d.toISOString().split('T')[0];
    }

    let students = [
      { id: 1, nome: 'Lucas Mendes',     curso: 'Pacote Office',       termino: fmtDate(addDays(today, 3)),  tel: '', status: 'sem-contato', obs: '' },
      { id: 2, nome: 'Fernanda Ramos',   curso: 'Informática Básica',  termino: fmtDate(addDays(today, 7)),  tel: '', status: 'sem-contato', obs: '' },
      { id: 3, nome: 'Carlos Oliveira',  curso: 'Design Gráfico',      termino: fmtDate(addDays(today, 10)), tel: '', status: 'adiou',       obs: 'Liga semana que vem' },
      { id: 4, nome: 'Beatriz Costa',    curso: 'Programação Web',     termino: fmtDate(addDays(today, 14)), tel: '', status: 'rematriculou',obs: '' },
      { id: 5, nome: 'Rafael Souza',     curso: 'Excel Avançado',      termino: fmtDate(addDays(today, 18)), tel: '', status: 'nao-atendeu', obs: '' },
      { id: 6, nome: 'Mariana Lima',     curso: 'Edição de Vídeo',     termino: fmtDate(addDays(today, 22)), tel: '', status: 'sem-contato', obs: '' },
      { id: 7, nome: 'Diego Ferreira',   curso: 'Redes e Infraestrutura', termino: fmtDate(addDays(today, 27)), tel: '', status: 'nao-quis', obs: 'Vai fazer outro curso fora' },
    ];

    let nextId = 8;
    let currentFilter = 'todos';
    let modalStudentId = null;
    let selectedStatusModal = null;

    // ── AUTH ──
    const USERS = { 'admin': '1234', 'samuel': 'sidy' };

    function doLogin() {
      const u = document.getElementById('login-user').value.trim();
      const p = document.getElementById('login-pass').value;
      if (USERS[u] && USERS[u] === p) {
        document.getElementById('login-error').textContent = '';
        document.getElementById('topbar-user-name').textContent = u;
        document.getElementById('login-screen').classList.remove('active');
        document.getElementById('app-screen').classList.add('active');
        renderAll();
      } else {
        document.getElementById('login-error').textContent = 'Usuário ou senha incorretos.';
      }
    }

    document.addEventListener('keydown', e => {
      if (e.key === 'Enter' && document.getElementById('login-screen').classList.contains('active')) {
        doLogin();
      }
    });

    function doLogout() {
      document.getElementById('app-screen').classList.remove('active');
      document.getElementById('login-screen').classList.add('active');
      document.getElementById('login-user').value = '';
      document.getElementById('login-pass').value = '';
    }

    // ── NAV ──
    function switchTab(tab) {
      document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.page-panel').forEach(p => p.classList.remove('active'));
      event.target.classList.add('active');
      document.getElementById('panel-' + tab).classList.add('active');
      if (tab === 'dashboard') renderAll();
    }

    // ── FILTER ──
    function applyFilter(f, btn) {
      currentFilter = f;
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderTable();
    }

    // ── HELPERS ──
    function daysUntil(dateStr) {
      const d = new Date(dateStr + 'T00:00:00');
      const t = new Date(); t.setHours(0,0,0,0);
      return Math.round((d - t) / 86400000);
    }

    function daysBadge(days) {
      if (days <= 7)  return `<span class="days-badge urgent">${days}d</span>`;
      if (days <= 14) return `<span class="days-badge soon">${days}d</span>`;
      return `<span class="days-badge ok">${days}d</span>`;
    }

    const STATUS_LABELS = {
      'sem-contato':  'Sem contato',
      'rematriculou': 'Rematriculou',
      'nao-quis':     'Não quis',
      'adiou':        'Adiou',
      'nao-atendeu':  'Não atendeu',
    };

    function statusBadge(s) {
      return `<span class="status-badge ${s}"><span class="status-dot"></span>${STATUS_LABELS[s]}</span>`;
    }

    function fmtDateBR(str) {
      const [y, m, d] = str.split('-');
      return `${d}/${m}/${y}`;
    }

    // ── RENDER ──
    function renderAll() {
      renderStats();
      renderTable();
    }

    function renderStats() {
      const s = students;
      const total      = s.length;
      const semContato = s.filter(x => x.status === 'sem-contato').length;
      const rematric   = s.filter(x => x.status === 'rematriculou').length;
      const urgentes   = s.filter(x => daysUntil(x.termino) <= 7).length;

      document.getElementById('stats-row').innerHTML = `
        <div class="stat-card blue">
          <div class="stat-label">Monitorados</div>
          <div class="stat-value">${total}</div>
          <div class="stat-sub">próximos 30 dias</div>
        </div>
        <div class="stat-card yellow">
          <div class="stat-label">Sem contato</div>
          <div class="stat-value">${semContato}</div>
          <div class="stat-sub">aguardando ação</div>
        </div>
        <div class="stat-card green">
          <div class="stat-label">Rematriculados</div>
          <div class="stat-value">${rematric}</div>
          <div class="stat-sub">confirmados</div>
        </div>
        <div class="stat-card red">
          <div class="stat-label">Urgentes</div>
          <div class="stat-value">${urgentes}</div>
          <div class="stat-sub">terminam em ≤ 7 dias</div>
        </div>
      `;
    }

    function renderTable() {
      const tbody = document.getElementById('students-tbody');
      let list = [...students].sort((a, b) => new Date(a.termino) - new Date(b.termino));
      if (currentFilter !== 'todos') list = list.filter(s => s.status === currentFilter);

      if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6">
          <div class="empty-state">
            <div class="empty-icon">🔍</div>
            <p>Nenhum aluno encontrado para este filtro.</p>
          </div>
        </td></tr>`;
        return;
      }

      tbody.innerHTML = list.map(s => {
        const days = daysUntil(s.termino);
        return `<tr>
          <td><span class="student-name">${s.nome}</span></td>
          <td>${s.curso}</td>
          <td>${fmtDateBR(s.termino)}</td>
          <td>${daysBadge(days)}</td>
          <td>${statusBadge(s.status)}</td>
          <td><button class="action-btn" onclick="openModal(${s.id})">Registrar contato</button></td>
        </tr>`;
      }).join('');
    }

    // ── CADASTRO ──
    function cadastrarAluno() {
      const nome   = document.getElementById('f-nome').value.trim();
      const curso  = document.getElementById('f-curso').value;
      const data   = document.getElementById('f-data').value;
      const tel    = document.getElementById('f-tel').value.trim();

      if (!nome || !curso || !data) {
        alert('Preencha nome, curso e data de término.');
        return;
      }

      students.push({ id: nextId++, nome, curso, termino: data, tel, status: 'sem-contato', obs: '' });

      document.getElementById('f-nome').value  = '';
      document.getElementById('f-curso').value = '';
      document.getElementById('f-data').value  = '';
      document.getElementById('f-tel').value   = '';

      const msg = document.getElementById('success-msg');
      msg.style.display = 'block';
      setTimeout(() => msg.style.display = 'none', 3000);
    }

    // ── MODAL ──
    function openModal(id) {
      modalStudentId    = id;
      selectedStatusModal = null;
      const s = students.find(x => x.id === id);
      document.getElementById('modal-student-name').textContent = `${s.nome} — ${s.curso}`;
      document.getElementById('modal-obs').value = s.obs || '';
      document.querySelectorAll('.status-option').forEach(o => o.classList.remove('selected'));
      document.getElementById('modal-overlay').classList.add('open');
    }

    function closeModal() {
      document.getElementById('modal-overlay').classList.remove('open');
      modalStudentId = null;
      selectedStatusModal = null;
    }

    function selectStatus(status, el) {
      selectedStatusModal = status;
      document.querySelectorAll('.status-option').forEach(o => o.classList.remove('selected'));
      el.classList.add('selected');
    }

    function saveFollowUp() {
      if (!selectedStatusModal) { alert('Selecione um status.'); return; }
      const s = students.find(x => x.id === modalStudentId);
      s.status = selectedStatusModal;
      s.obs    = document.getElementById('modal-obs').value.trim();
      closeModal();
      renderAll();
    }

    document.getElementById('modal-overlay').addEventListener('click', function(e) {
      if (e.target === this) closeModal();
    });
