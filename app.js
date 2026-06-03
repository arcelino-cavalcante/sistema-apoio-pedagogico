import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, updateDoc, deleteDoc, doc, query, where, getDocs, orderBy } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyAHwuJNBzOwoAPsVOGm7tsPDlnQhKs4254",
  authDomain: "banco-de-dados-impressao-eliel.firebaseapp.com",
  projectId: "banco-de-dados-impressao-eliel",
  storageBucket: "banco-de-dados-impressao-eliel.firebasestorage.app",
  messagingSenderId: "495721934840",
  appId: "1:495721934840:web:ace461eccf79e93db5f00d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Global state for Firebase Listeners
let globalQueue = [];

/* ============================================
   SISTEMA DE APOIO PEDAGÓGICO
   Application Logic
   ============================================ */

// ==========================================
// DATA & CONFIGURATION
// ==========================================

const CONFIG = {
  MONTHLY_LIMIT: 500,
  PRINT_PASSWORD: '12345',
  STORAGE_KEYS: {
    QUEUE: 'print_queue',
    HISTORY: 'print_history',
  },
};

const PROFESSORS = [
  // Anos Finais / EJA
  { id: 1, name: 'ALLAN DANILO BELO RODRIGUES' },
  { id: 2, name: 'ANDRÉIA CARLA PEREIRA EVARISTO' },
  { id: 3, name: 'ANTONIO CARLOS EVARISTO DA SILVA' },
  { id: 4, name: 'BRENO LUCAS RODRIGUES FERREIRA' },
  { id: 5, name: 'BRUNO GOMES DO NASCIMENTO' },
  { id: 6, name: 'CARLOS EDUARDO PONTES CARDOSO' },
  { id: 7, name: 'DÉBORA RODRIGUES DA SILVA' },
  { id: 8, name: 'EDILÃNEIDE FERREIRA DE ALMEIDA' },
  { id: 9, name: 'EDUARDO FERREIRA BARROS' },
  { id: 10, name: 'ÉLIDA IARA FERREIRA DE MELO' },
  { id: 11, name: 'EMANUELA FERREIRA DA ROCHA' },
  { id: 12, name: 'JAIR DA SILVA' },
  { id: 13, name: 'JESSÉ CORDEIRO SOBRAL NETO' },
  { id: 14, name: 'JESSICA MARIA DA SILVA' },
  { id: 15, name: 'JOÃO MARCOS DA SILVA LEITE' },
  { id: 16, name: 'LEILANE DE SOUZA ALVES LIMA' },
  { id: 17, name: 'LÍDIA VILELA DE MORAIS' },
  { id: 18, name: 'LIVIA BEATRIZ ALVES DE MOURA' },
  { id: 19, name: 'MARCIO MICHAEL PONTES' },
  { id: 20, name: 'MARCONE MENDES DA SILVA' },
  { id: 21, name: 'MONALISA PEIXOTO LEONARDO GRACIANO' },
  { id: 22, name: 'NATALY FABIA MARQUES LIMA' },
  { id: 23, name: 'RAMON DAVID SOUTO DE AZEVEDO' },
  { id: 24, name: 'RICARDO JONAS DE MOURA SANTOS' },
  { id: 25, name: 'ROMANA GUILHERME DA SILVA' },
  { id: 26, name: 'SALATIEL DE MOURA CAVALCANTE' },
  { id: 27, name: 'SHEILA SANTOS VASCONCELOS' },
  { id: 28, name: 'SIMONE DEBORA MUNIZ DA SILVA' },
  { id: 29, name: 'VIVIA CATARINA DE MOURA CAVALCANTE' },

  // Educação Infantil e Anos Iniciais
  { id: 30, name: 'ALBANEIDE CAVALCANTI DUARTE' },
  { id: 31, name: 'ANDREIA LINS DA SILVA TEIXEIRA' },
  { id: 32, name: 'CECILIA FERREIRA CARDOSO' },
  { id: 33, name: 'DIANA PATRICIA FERREIRA DA SILVA' },
  { id: 34, name: 'EDIVANE ALVES DA SILVA' },
  { id: 35, name: 'EDNA PATRICIA GALDINO DA SILVA' },
  { id: 36, name: 'JAQUELINE INACIO DA SILVA' },
  { id: 37, name: 'JOSINALDO RODRIGUES DE ARCANTA' },
  { id: 38, name: 'JULIANA INACIO VIANA' },
  { id: 39, name: 'MARCELA TAVARES BATISTA' },
  { id: 40, name: 'MARIA CLAUDENICE DA SILVA' },
  { id: 41, name: 'MARIA DAS DORES BEZERRA DA SILVA' },
  { id: 42, name: 'MARIA DE FATIMA BORBA DA SILVA' },
  { id: 43, name: 'MARIA EDILANEIDE FRAZÃO SILVA' },
  { id: 44, name: 'MARIA HELENA BARROS SILVA' },
  { id: 45, name: 'MARIA ROSILEIDE DA SILVA BRAGA' },
  { id: 46, name: 'MIRIAN RIBEIRO DE MELO' },
  { id: 47, name: 'POLLYANNA RENATA SILVA' },
  { id: 48, name: 'SAMIRES MARIA DE LIMA' },
  { id: 49, name: 'VERONICA DE MOURA CAVALCANTE PEREIRA' }
];


const EQUIPMENTS = [
  { id: 'proj1', name: 'Datashow 01' },
  { id: 'mic1', name: 'Microfone' },
  { id: 'soundbt', name: 'Caixa de Som Bluetooth' },
  { id: 'sound1', name: 'Caixa de Som 01' },
  { id: 'sound2', name: 'Caixa de Som 02' },
  { id: 'sound3', name: 'Caixa de Som 03' },
  { id: 'note1', name: 'Notebook' },
  { id: 'tv1', name: 'TV' }
];

let currentBookings = [];

const TURMAS = [
  { id: 1,  name: 'Pré Escolar I (A)',  students: 22 },
  { id: 2,  name: 'Pré Escolar I (B)',  students: 23 },
  { id: 3,  name: 'Pré Escolar II (A)', students: 15 },
  { id: 4,  name: 'Pré Escolar II (B)', students: 13 },
  { id: 5,  name: 'Pré Escolar II (C)', students: 13 },
  { id: 6,  name: '1º Ano (A)', students: 16 },
  { id: 7,  name: '1º Ano (B)', students: 16 },
  { id: 8,  name: '2º Ano (A)', students: 18 },
  { id: 9,  name: '2º Ano (B)', students: 17 },
  { id: 10, name: '2º Ano (C)', students: 16 },
  { id: 11, name: '3º Ano (A)', students: 20 },
  { id: 12, name: '3º Ano (B)', students: 19 },
  { id: 13, name: '4º Ano (A)', students: 20 },
  { id: 14, name: '4º Ano (B)', students: 18 },
  { id: 15, name: '5º Ano (A)', students: 25 },
  { id: 16, name: '5º Ano (B)', students: 26 },
  { id: 17, name: '6º Ano (A)', students: 31 },
  { id: 18, name: '6º Ano (B)', students: 35 },
  { id: 19, name: '7º Ano (A)', students: 33 },
  { id: 20, name: '7º Ano (B)', students: 32 },
  { id: 21, name: '8º Ano (A)', students: 25 },
  { id: 22, name: '8º Ano (B)', students: 19 },
  { id: 23, name: '8º Ano (C)', students: 21 },
  { id: 24, name: '9º Ano (A)', students: 29 },
  { id: 25, name: '9º Ano (B)', students: 23 },
  { id: 26, name: '1ª Fase',    students: 9 },
  { id: 27, name: '2ª Fase',    students: 9 },
  { id: 28, name: '3ª Fase',    students: 26 },
  { id: 29, name: '4ª Fase',    students: 24 },
];

// ==========================================
// STATE MANAGEMENT (localStorage)
// ==========================================

const Store = {
  isAuthenticated: false,

  async addToQueue(jobData, fileObj) {
    // 1. Upload to Storage
    const fileRef = ref(storage, `print_files/${Date.now()}_${fileObj.name}`);
    await uploadBytes(fileRef, fileObj);
    const downloadUrl = await getDownloadURL(fileRef);

    // 2. Save to Firestore
    const newJob = {
      ...jobData,
      fileUrl: downloadUrl,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    const docRef = await addDoc(collection(db, "print_jobs"), newJob);
    return { id: docRef.id, ...newJob };
  },

  async markAsPrinted(itemId) {
    const jobRef = doc(db, "print_jobs", itemId);
    await updateDoc(jobRef, {
      status: 'printed',
      printedAt: new Date().toISOString()
    });
  },

  async getTeacherUsage(professorId) {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const q = query(
      collection(db, "print_jobs"), 
      where("professorId", "==", professorId)
    );
    
    const querySnapshot = await getDocs(q);
    let total = 0;
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const date = new Date(data.createdAt);
      if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
        total += (data.copies || 0);
      }
    });
    
    return total;
  },

  async getTeacherItems(professorId) {
    const q = query(
      collection(db, "print_jobs"), 
      where("professorId", "==", professorId)
    );
    
    const querySnapshot = await getDocs(q);
    let items = [];
    
    querySnapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() });
    });
    
    return items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
  
  async getHistory() {
    const q = query(collection(db, "print_jobs"), where("status", "==", "printed"));
    const querySnapshot = await getDocs(q);
    let items = [];
    querySnapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() });
    });
    return items;
  }
};

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function formatDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatFileSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function getCurrentMonthName() {
  return new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ==========================================
// TOAST NOTIFICATIONS
// ==========================================

function showToast(title, message, type = 'info') {
  const container = document.getElementById('toast-container');
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  };

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `
    <span class="toast__icon">${icons[type] || icons.info}</span>
    <div class="toast__content">
      <div class="toast__title">${escapeHtml(title)}</div>
      ${message ? `<div class="toast__message">${escapeHtml(message)}</div>` : ''}
    </div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 4000);
}

// ==========================================
// NAVIGATION & SIDEBAR
// ==========================================

let currentView = 'teacher';
let currentTeacherTab = 'upload';
let currentSidebarTab = '';
let selectedFile = null;

const SIDEBAR_CONFIG = {
  teacher: {
    roleLabel: 'Portal do Professor',
    items: [
      { id: 'upload', label: 'Solicitar Impressão', icon: 'upload' },
      { id: 'history', label: 'Minha Quantidade', icon: 'chart' },
      { id: 'equipment', label: 'Agendar Equipamento', icon: 'calendar' }
    ]
  },
  print: {
    roleLabel: 'Sala de Impressão',
    items: [
      { id: 'queue', label: 'Fila de Impressão', icon: 'printer' },
      { id: 'history', label: 'Já Impressas', icon: 'check' },
      { id: 'dashboard', label: 'Dashboard', icon: 'chart' }
    ]
  },
  'equipment-admin': {
    roleLabel: 'Materiais Pedagógicos',
    items: [
      { id: 'bookings', label: 'Reservas', icon: 'box' },
      { id: 'withdrawals', label: 'Retiradas', icon: 'clipboard' }
    ]
  },
  coordination: {
    roleLabel: 'Coordenação',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: 'chart' },
      { id: 'activities', label: 'Atividades', icon: 'upload' }
    ]
  }
};

const SIDEBAR_ICONS = {
  upload: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
  chart: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  calendar: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  printer: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>',
  check: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
  box: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
  clipboard: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>'
};

function buildSidebarNav(view) {
  const config = SIDEBAR_CONFIG[view];
  if (!config) return;

  document.getElementById('sidebar-role-label').textContent = config.roleLabel;
  const mobileRole = document.getElementById('mobile-header-role');
  if (mobileRole) {
    mobileRole.textContent = config.roleLabel;
  }

  const nav = document.getElementById('sidebar-nav');
  let html = '';
  config.items.forEach(item => {
    html += `
      <button class="sidebar__link" data-sidebar="${item.id}">
        ${SIDEBAR_ICONS[item.icon] || ''}
        ${item.label}
      </button>
    `;
  });
  nav.innerHTML = html;

  // Add click listeners
  nav.querySelectorAll('.sidebar__link').forEach(btn => {
    btn.addEventListener('click', () => {
      closeMenuDrawer();
      const tabId = btn.dataset.sidebar;
      currentSidebarTab = tabId;

      if (view === 'teacher') {
        switchTeacherSection(tabId);
      } else if (view === 'print') {
        switchPrintPanel(tabId);
      } else if (view === 'equipment-admin') {
        switchAdminSection(tabId);
      } else if (view === 'coordination') {
        switchCoordPanel(tabId);
      }

      // Update active state in sidebar
      nav.querySelectorAll('.sidebar__link').forEach(b => {
        b.classList.toggle('sidebar__link--active', b.dataset.sidebar === tabId);
      });
    });
  });

  // Set initial active item
  const firstItem = config.items[0].id;
  currentSidebarTab = firstItem;
  const firstBtn = nav.querySelector(`[data-sidebar="${firstItem}"]`);
  if (firstBtn) firstBtn.classList.add('sidebar__link--active');
}

function navigateTo(view) {
  currentView = view;

  // Show views
  document.querySelectorAll('.view').forEach(v => {
    v.classList.remove('view--active');
  });
  document.getElementById(`view-${view}`).classList.add('view--active');

  // Build sidebar
  buildSidebarNav(view);

  // Refresh content
  if (view === 'teacher') {
    switchTeacherSection('upload');
  } else if (view === 'print') {
    switchPrintPanel('queue');
  } else if (view === 'equipment-admin') {
    switchAdminSection('bookings');
  } else if (view === 'coordination') {
    switchCoordPanel('dashboard');
  }
}

function switchTeacherSection(tab) {
  currentTeacherTab = tab;

  document.getElementById('teacher-upload-section').style.display = tab === 'upload' ? 'block' : 'none';
  document.getElementById('teacher-history-section').style.display = tab === 'history' ? 'block' : 'none';
  document.getElementById('teacher-equipment-section').style.display = tab === 'equipment' ? 'block' : 'none';

  if (tab === 'history') {
    renderTeacherHistory();
  } else if (tab === 'equipment') {
    renderScheduleGrid();
  }

  // Sync sidebar active state (may be called from old code paths)
  document.querySelectorAll('.sidebar__link').forEach(b => {
    b.classList.toggle('sidebar__link--active', b.dataset.sidebar === tab);
  });
}

function switchAdminSection(tab) {
  document.getElementById('view-equipment-admin').classList.toggle('view--active', tab === 'bookings');
  document.getElementById('view-withdrawals-admin').classList.toggle('view--active', tab === 'withdrawals');

  if (tab === 'bookings') {
    renderAdminBookings();
  } else if (tab === 'withdrawals') {
    renderWithdrawals();
  }

  document.querySelectorAll('.sidebar__link').forEach(b => {
    b.classList.toggle('sidebar__link--active', b.dataset.sidebar === tab);
  });
}

function switchPrintPanel(tab) {
  // Tab buttons
  document.querySelectorAll('#view-print .tab-btn').forEach(btn => {
    btn.classList.toggle('tab-btn--active', btn.dataset.tab === tab);
  });
  // Panels
  document.getElementById('print-queue-panel').classList.toggle('tab-panel--active', tab === 'queue');
  document.getElementById('print-history-panel').classList.toggle('tab-panel--active', tab === 'history');
  document.getElementById('print-dashboard-panel').classList.toggle('tab-panel--active', tab === 'dashboard');

  if (tab === 'queue') {
    renderPrintQueue();
  } else if (tab === 'history') {
    renderPrintHistory();
  } else if (tab === 'dashboard') {
    renderTeacherDashboard();
  }

  // Sync sidebar active state
  document.querySelectorAll('.sidebar__link').forEach(b => {
    b.classList.toggle('sidebar__link--active', b.dataset.sidebar === tab);
  });
}

function switchCoordPanel(tab) {
  document.querySelectorAll('#view-coordination .tab-btn').forEach(btn => {
    btn.classList.toggle('tab-btn--active', btn.dataset.tab === tab);
  });
  document.getElementById('coord-dashboard-panel').classList.toggle('tab-panel--active', tab === 'dashboard');
  document.getElementById('coord-activities-panel').classList.toggle('tab-panel--active', tab === 'activities');

  if (tab === 'dashboard') {
    renderCoordDashboard();
  } else if (tab === 'activities') {
    renderCoordActivities();
  }

  document.querySelectorAll('.sidebar__link').forEach(b => {
    b.classList.toggle('sidebar__link--active', b.dataset.sidebar === tab);
  });
}

// ==========================================
// LOGIN / INTERFACE SELECTION
// ==========================================

function selectInterface(interfaceType) {
  if (interfaceType === 'teacher') {
    openInterface(interfaceType);
  } else {
    pendingAuthView = interfaceType;
    openPasswordModal(interfaceType);
  }
}
window.selectInterface = selectInterface;

function openInterface(view) {
  document.getElementById('login-overlay').style.display = 'none';
  document.getElementById('app-layout').style.display = 'flex';
  navigateTo(view);
  if (view === 'equipment-admin' || view === 'coordination' || view === 'print') {
    Store.isAuthenticated = true;
  }
}

function showLoginScreen() {
  Store.isAuthenticated = false;
  closeMenuDrawer();
  document.getElementById('app-layout').style.display = 'none';
  document.getElementById('login-overlay').style.display = 'flex';
}
window.showLoginScreen = showLoginScreen;

function closeMenuDrawer() {
  document.getElementById('sidebar').classList.remove('sidebar--open');
  const overlay = document.getElementById('sidebar-overlay');
  if (overlay) {
    overlay.classList.remove('sidebar-overlay--visible');
  }
  document.body.classList.remove('menu-open');
}

// ==========================================
// PASSWORD MODAL
// ==========================================

let pendingAuthView = 'print';

function openPasswordModal(targetView) {
  if (targetView) pendingAuthView = targetView;
  const overlay = document.getElementById('password-modal');
  overlay.classList.add('modal-overlay--visible');
  const input = document.getElementById('password-input');
  input.value = '';
  input.focus();
  document.getElementById('password-error').classList.remove('modal__error--visible');
}

function closePasswordModal() {
  const overlay = document.getElementById('password-modal');
  overlay.classList.remove('modal-overlay--visible');
  document.getElementById('password-error').classList.remove('modal__error--visible');
  document.getElementById('password-input').value = '';
}

function submitPassword() {
  const input = document.getElementById('password-input');
  const errorEl = document.getElementById('password-error');

  if (input.value === CONFIG.PRINT_PASSWORD) {
    closePasswordModal();
    openInterface(pendingAuthView);
    showToast('Acesso liberado', 'Bem-vindo ao painel restrito', 'success');
  } else {
    errorEl.classList.add('modal__error--visible');
    input.value = '';
    input.focus();
  }
}

// ==========================================
// TEACHER UPLOAD FORM
// ==========================================

function populateProfessorSelect(turnoSelectId, profSelectId) {
  const turno = document.getElementById(turnoSelectId).value;
  const profSelect = document.getElementById(profSelectId);
  
  profSelect.innerHTML = '<option value="">Selecione o professor...</option>';
  
  if (!turno) {
    profSelect.disabled = true;
    profSelect.innerHTML = '<option value="">Primeiro selecione o turno...</option>';
    return;
  }
  
  profSelect.disabled = false;
  
  const filteredProfs = PROFESSORS.filter(p => {
    if (turno === 'tarde-noite') return p.id <= 29;
    if (turno === 'manha') return p.id >= 30;
    return false;
  });
  
  filteredProfs.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = p.name;
    profSelect.appendChild(opt);
  });
}

function initUploadForm() {
  // Listen to turno change
  document.getElementById('turno-select').addEventListener('change', () => {
    populateProfessorSelect('turno-select', 'professor-select');
    updateSubmitButton();
  });

  // Populate turmas checkboxes
  const turmasList = document.getElementById('turmas-list');
  TURMAS.forEach(t => {
    const label = document.createElement('label');
    label.className = 'checkbox-label';
    label.innerHTML = `<input type="checkbox" name="turmas" value="${t.id}" data-students="${t.students}"> ${t.name} (${t.students})`;
    turmasList.appendChild(label);
  });

  // Event listeners for recalculating quantity
  document.querySelectorAll('input[name="turmas"]').forEach(cb => {
    cb.addEventListener('change', () => {
      recalculateCopies();
      updateSubmitButton();
    });
  });

  document.querySelectorAll('input[name="qty-type"]').forEach(radio => {
    radio.addEventListener('change', e => {
      const customInput = document.getElementById('custom-qty-input');
      customInput.style.display = e.target.value === 'custom' ? 'block' : 'none';
      recalculateCopies();
      updateSubmitButton();
    });
  });

  document.getElementById('custom-qty-input').addEventListener('input', () => {
    recalculateCopies();
    updateSubmitButton();
  });

  // Upload area
  const uploadArea = document.getElementById('upload-area');
  const fileInput = document.getElementById('file-input');

  uploadArea.addEventListener('click', () => fileInput.click());

  uploadArea.addEventListener('dragover', e => {
    e.preventDefault();
    uploadArea.classList.add('upload-area--dragover');
  });

  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('upload-area--dragover');
  });

  uploadArea.addEventListener('drop', e => {
    e.preventDefault();
    uploadArea.classList.remove('upload-area--dragover');
    if (e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
      handleFileSelect(fileInput.files[0]);
    }
  });

  // Submit
  document.getElementById('submit-print-btn').addEventListener('click', submitPrintJob);
}

function handleFileSelect(file) {
  selectedFile = file;
  const uploadArea = document.getElementById('upload-area');
  uploadArea.classList.add('upload-area--has-file');

  const icon = uploadArea.querySelector('.upload-area__icon');
  icon.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M9 12l2 2 4-4"/>
      <circle cx="12" cy="12" r="10"/>
    </svg>
  `;

  const textEl = uploadArea.querySelector('.upload-area__text');
  textEl.innerHTML = `<strong>${escapeHtml(file.name)}</strong>`;

  const hintEl = uploadArea.querySelector('.upload-area__hint');
  hintEl.textContent = formatFileSize(file.size) + ' — Clique para trocar o arquivo';

  updateSubmitButton();
}

function resetUploadArea() {
  selectedFile = null;
  const uploadArea = document.getElementById('upload-area');
  uploadArea.classList.remove('upload-area--has-file');

  const icon = uploadArea.querySelector('.upload-area__icon');
  icon.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  `;

  const textEl = uploadArea.querySelector('.upload-area__text');
  textEl.innerHTML = `Arraste o arquivo aqui ou <strong>clique para selecionar</strong>`;

  const hintEl = uploadArea.querySelector('.upload-area__hint');
  hintEl.textContent = 'PDF, DOC, DOCX, JPG, PNG — Máximo 50MB';

  document.getElementById('file-input').value = '';
}

function calculateTotalCopies() {
  const selectedCbs = Array.from(document.querySelectorAll('input[name="turmas"]:checked'));
  const totalStudents = selectedCbs.reduce((sum, cb) => sum + parseInt(cb.dataset.students), 0);
  
  if (totalStudents === 0) return 0;

  const qtyType = document.querySelector('input[name="qty-type"]:checked').value;
  
  if (qtyType === 'individual') return totalStudents;
  if (qtyType === 'dupla') return Math.ceil(totalStudents / 2);
  if (qtyType === 'trio') return Math.ceil(totalStudents / 3);
  if (qtyType === 'custom') {
    const customVal = parseInt(document.getElementById('custom-qty-input').value);
    return isNaN(customVal) || customVal < 1 ? 0 : customVal;
  }
  return 0;
}

function recalculateCopies() {
  const badge = document.getElementById('student-count-badge');
  const copies = calculateTotalCopies();
  const selectedCbs = document.querySelectorAll('input[name="turmas"]:checked');
  
  if (selectedCbs.length > 0 && copies > 0) {
    const totalStudents = Array.from(selectedCbs).reduce((sum, cb) => sum + parseInt(cb.dataset.students), 0);
    badge.textContent = `👥 ${totalStudents} alunos selecionados — serão impressas ${copies} cópias`;
    badge.style.display = 'block';
    setTimeout(() => badge.classList.add('info-badge--visible'), 10);
  } else {
    badge.classList.remove('info-badge--visible');
    setTimeout(() => badge.style.display = 'none', 300);
  }
}

function updateSubmitButton() {
  // We no longer disable the button. 
  // Validation will be handled on click to show specific error messages.
  const btn = document.getElementById('submit-print-btn');
  btn.disabled = false;
}

async function submitPrintJob() {
  const profSelect = document.getElementById('professor-select');
  const professor = PROFESSORS.find(p => p.id === parseInt(profSelect.value));
  
  const selectedCbs = Array.from(document.querySelectorAll('input[name="turmas"]:checked'));
  const turmaIds = selectedCbs.map(cb => parseInt(cb.value));
  const turmaNames = selectedCbs.map(cb => cb.parentNode.textContent.trim().replace(/\s*\(\d+\)$/, ''));
  const turmasStr = turmaNames.join(', ');
  
  const totalCopies = calculateTotalCopies();
  const obs = document.getElementById('obs-input').value.trim();
  const docType = document.querySelector('input[name="doc-type"]:checked').value;

  if (!professor) {
    showToast('Atenção', 'Selecione o Turno e o nome do Professor.', 'warning');
    return;
  }

  if (turmaIds.length === 0) {
    showToast('Atenção', 'Selecione pelo menos uma turma marcando a caixinha.', 'warning');
    return;
  }

  if (totalCopies <= 0) {
    const qtyType = document.querySelector('input[name="qty-type"]:checked').value;
    if (qtyType === 'custom') {
      showToast('Atenção', 'Digite a quantidade exata de cópias no campo Personalizado.', 'warning');
    } else {
      showToast('Atenção', 'A quantidade de cópias não pode ser zero.', 'warning');
    }
    return;
  }

  if (!selectedFile) {
    showToast('Atenção', 'Faça o upload do arquivo da atividade clicando na área indicada.', 'warning');
    return;
  }

  // Check quota
  const currentUsage = await Store.getTeacherUsage(professor.id);
  const newTotal = currentUsage + totalCopies;

  if (newTotal > CONFIG.MONTHLY_LIMIT) {
    const remaining = CONFIG.MONTHLY_LIMIT - currentUsage;
    showToast(
      'Cota excedida!',
      `Você já usou ${currentUsage} de ${CONFIG.MONTHLY_LIMIT} folhas. Restam ${remaining} folhas. Este pedido precisa de ${totalCopies} cópias.`,
      'error'
    );
    return;
  }

  // Read the file as dataURL so it can be previewed/printed later
  const btn = document.getElementById('submit-print-btn');
  btn.disabled = true;
  btn.textContent = 'Enviando...';

  try {
    const item = await Store.addToQueue({
      professorId: professor.id,
      professorName: professor.name,
      turmaId: turmaIds.length === 1 ? turmaIds[0] : null,
      turmaName: turmasStr,
      copies: totalCopies,
      fileName: selectedFile.name,
      fileSize: selectedFile.size,
      fileType: selectedFile.type,
      observations: obs,
      docType: docType,
    }, selectedFile);

    showToast(
      'Enviado para impressão!',
      `${totalCopies} cópias de "${selectedFile.name}" para ${turmasStr}`,
      'success'
    );

    // Reset form
    document.getElementById('turno-select').value = '';
    populateProfessorSelect('turno-select', 'professor-select');
    document.querySelectorAll('input[name="turmas"]').forEach(cb => cb.checked = false);
    document.getElementById('obs-input').value = '';
    document.querySelector('input[name="qty-type"][value="individual"]').checked = true;
    document.querySelector('input[name="doc-type"][value="atividade"]').checked = true;
    document.getElementById('custom-qty-input').value = '';
    document.getElementById('custom-qty-input').style.display = 'none';
    recalculateCopies();
    resetUploadArea();
    updateSubmitButton();
  } catch (error) {
    console.error(error);
    showToast('Erro', 'Ocorreu um erro no envio. Tente novamente.', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Enviar para Impressão';
  }
}

// ==========================================
// TEACHER HISTORY VIEW
// ==========================================

async function renderTeacherHistory() {
  const historyTurnoSelect = document.getElementById('history-turno-select');
  const historyProfSelect = document.getElementById('history-professor-select');

  const profId = parseInt(historyProfSelect.value);
  if (!profId) {
    document.getElementById('teacher-quota-section').style.display = 'none';
    document.getElementById('teacher-history-list').innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">👆</div>
        <div class="empty-state__text">Selecione um professor acima</div>
        <div class="empty-state__subtext">para ver a cota e o histórico de impressões</div>
      </div>
    `;
    return;
  }

  // Show quota
  const usage = await Store.getTeacherUsage(profId);
  const percentage = Math.min((usage / CONFIG.MONTHLY_LIMIT) * 100, 100);

  document.getElementById('teacher-quota-section').style.display = 'block';
  document.getElementById('quota-used-value').textContent = usage;
  document.getElementById('quota-limit-value').textContent = CONFIG.MONTHLY_LIMIT;
  document.getElementById('quota-remaining-value').textContent =
    CONFIG.MONTHLY_LIMIT - usage;
  document.getElementById('quota-month-name').textContent = getCurrentMonthName();

  const bar = document.getElementById('quota-bar-fill');
  bar.style.width = percentage + '%';
  bar.className = 'quota-bar__fill';
  if (percentage >= 90) bar.classList.add('quota-bar__fill--danger');
  else if (percentage >= 70) bar.classList.add('quota-bar__fill--warning');

  // Show history
  const items = await Store.getTeacherItems(profId);
  const historyContainer = document.getElementById('teacher-history-list');

  if (items.length === 0) {
    historyContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">📄</div>
        <div class="empty-state__text">Nenhuma impressão este mês</div>
        <div class="empty-state__subtext">Envie atividades na aba "Enviar Atividade"</div>
      </div>
    `;
    return;
  }

  historyContainer.innerHTML = `
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Arquivo</th>
            <th>Turma</th>
            <th>Cópias</th>
            <th>Data</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${items
            .map(
              item => `
            <tr>
              <td>${escapeHtml(item.fileName)}</td>
              <td>${escapeHtml(item.turmaName)}</td>
              <td>${item.copies}</td>
              <td>${formatDate(item.createdAt)}</td>
              <td>
                ${
                  item.status === 'printed'
                    ? '<span class="badge badge--printed">✅ Impressa</span>'
                    : '<span class="badge badge--pending">🟡 Na Fila</span>'
                }
              </td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ==========================================
// PRINT PANEL
// ==========================================

function renderPrintQueue() {
  const allQueue = globalQueue;
  const filter = document.getElementById('queue-filter-select')?.value || 'todos';
  const queue = filter === 'todos' ? allQueue : allQueue.filter(item => item.docType === filter);
  
  const container = document.getElementById('print-queue-list');
  const countEl = document.getElementById('queue-count');

  countEl.textContent = allQueue.length;

  if (queue.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">✨</div>
        <div class="empty-state__text">${filter === 'todos' ? 'Nenhuma impressão na fila' : 'Nenhum documento deste tipo na fila'}</div>
        <div class="empty-state__subtext">Quando professores enviarem atividades, elas aparecerão aqui</div>
      </div>
    `;
    return;
  }

  const typeLabels = {
    atividade: '<span class="badge badge--atividade">📘 Atividade</span>',
    avaliacao: '<span class="badge badge--avaliacao">🛑 Avaliação Bimestral</span>',
    recuperacao: '<span class="badge badge--recuperacao">⚠️ Recuperação</span>',
  };

  container.innerHTML = queue
    .map(
      (item, index) => `
      <div class="queue-item" id="queue-item-${item.id}">
        <div class="queue-item__number">${index + 1}</div>
        <div class="queue-item__info">
          <div class="queue-item__professor queue-professor-row">
            ${escapeHtml(item.professorName)}
            ${item.docType ? typeLabels[item.docType] : typeLabels.atividade}
          </div>
          <div class="queue-item__details">
            <span class="queue-item__detail">📄 ${escapeHtml(item.fileName)}</span>
            <span class="queue-item__detail" title="${escapeHtml(item.turmaName)}">🏫 ${escapeHtml(item.turmaName).length > 30 ? escapeHtml(item.turmaName).substring(0, 30) + '...' : escapeHtml(item.turmaName)}</span>
            <span class="queue-item__detail">📋 ${item.copies} cópias</span>
            <span class="queue-item__detail">🕐 ${formatDate(item.createdAt)}</span>
            ${item.observations ? `<div class="obs-box"><strong>Obs:</strong> ${escapeHtml(item.observations)}</div>` : ''}
          </div>
        </div>
        <div class="queue-item__actions">
          ${item.fileUrl ? `
            <button class="btn btn--outline btn--sm" onclick="openFile('${item.id}')">
              👁 Ver Arquivo
            </button>
            <button class="btn btn--yellow btn--sm" onclick="printFile('${item.id}')">
              🖨 Imprimir
            </button>
          ` : ''}
          <button class="btn btn--success btn--sm" onclick="markPrinted('${item.id}')">
            ✓ Impressa
          </button>
        </div>
      </div>
    `
    )
    .join('');
}

async function renderPrintHistory() {
  const history = await Store.getHistory();
  const container = document.getElementById('print-history-list');
  const countEl = document.getElementById('history-count');

  countEl.textContent = history.length;

  if (history.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">📋</div>
        <div class="empty-state__text">Nenhuma impressão realizada ainda</div>
      </div>
    `;
    return;
  }

  const sorted = [...history].sort(
    (a, b) => new Date(b.printedAt) - new Date(a.printedAt)
  );

  container.innerHTML = `
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Professor</th>
            <th>Arquivo</th>
            <th>Turma</th>
            <th>Cópias</th>
            <th>Enviado em</th>
            <th>Impresso em</th>
          </tr>
        </thead>
        <tbody>
          ${sorted
            .map(
              item => `
            <tr>
              <td><strong>${escapeHtml(item.professorName)}</strong></td>
              <td>${escapeHtml(item.fileName)}</td>
              <td>${escapeHtml(item.turmaName)}</td>
              <td>${item.copies}</td>
              <td>${formatDate(item.createdAt)}</td>
              <td>${formatDate(item.printedAt)}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </div>
  `;
}

async function markPrinted(itemId) {
  await Store.markAsPrinted(itemId);
  if (true) {
    showToast(
      'Impressão concluída!',
      `Impressão marcada como concluída!`,
      'success'
    );
    renderPrintQueue();
    renderPrintHistory();
  }
}

function openFile(itemId) {
  const item = globalQueue.find(i => i.id === itemId);
  if (!item || !item.fileUrl) {
    showToast('Erro', 'Arquivo não encontrado', 'error');
    return;
  }
  window.open(item.fileUrl, '_blank');
}

function printFile(itemId) {
  const item = globalQueue.find(i => i.id === itemId);
  if (!item || !item.fileUrl) {
    showToast('Erro', 'Arquivo não encontrado', 'error');
    return;
  }
  const printWindow = window.open(item.fileUrl, '_blank');
  // Note: Modern browsers block window.print() inside cross-origin documents. 
  // The user will need to click the print button in the PDF viewer that opens.
}

window.markPrinted = markPrinted;
window.openFile = openFile;
window.printFile = printFile;

// ==========================================
// TEACHER USAGE DASHBOARD
// ==========================================

let dashboardJobs = [];
let dashboardUnsubscribe = null;

function setupDashboardListener() {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const q = query(collection(db, "print_jobs"));
  
  dashboardUnsubscribe = onSnapshot(q, (snapshot) => {
    dashboardJobs = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      const date = new Date(data.createdAt);
      if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
        dashboardJobs.push({ id: doc.id, ...data });
      }
    });

    const printDashboard = document.getElementById('print-dashboard-panel');
    if (currentView === 'print' && printDashboard && printDashboard.classList.contains('tab-panel--active')) {
      renderTeacherDashboard();
    }
    const coordDashboard = document.getElementById('coord-dashboard-panel');
    if (currentView === 'coordination' && coordDashboard && coordDashboard.classList.contains('tab-panel--active')) {
      renderCoordDashboard();
    }
  });
}

function renderTeacherDashboard() {
  const container = document.getElementById('dashboard-list');
  const summaryEl = document.getElementById('dashboard-summary');
  const filter = document.getElementById('dashboard-filter')?.value || 'all';

  if (dashboardJobs.length === 0) {
    summaryEl.innerHTML = '';
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">📊</div>
        <div class="empty-state__text">Nenhuma impressão este mês</div>
        <div class="empty-state__subtext">Os dados aparecerão aqui conforme professores enviarem atividades</div>
      </div>
    `;
    document.getElementById('dashboard-count').textContent = '0';
    return;
  }

  // Group by professor
  const usageMap = {};
  dashboardJobs.forEach(job => {
    if (!usageMap[job.professorId]) {
      usageMap[job.professorId] = {
        id: job.professorId,
        name: job.professorName,
        copies: 0
      };
    }
    usageMap[job.professorId].copies += (job.copies || 0);
  });

  // Filter by shift if needed
  let teachers = Object.values(usageMap);
  if (filter === 'manha') {
    teachers = teachers.filter(t => t.id >= 30);
  } else if (filter === 'tarde-noite') {
    teachers = teachers.filter(t => t.id <= 29);
  }

  // Sort by copies (highest first)
  teachers.sort((a, b) => b.copies - a.copies);

  // Summary
  const activeTeachers = teachers.filter(t => t.copies > 0);
  const totalCopies = teachers.reduce((sum, t) => sum + t.copies, 0);

  summaryEl.innerHTML = `
    <div class="dashboard-stat">
      <div class="dashboard-stat__value">${activeTeachers.length}</div>
      <div class="dashboard-stat__label">Professores ativos</div>
    </div>
    <div class="dashboard-stat">
      <div class="dashboard-stat__value">${totalCopies}</div>
      <div class="dashboard-stat__label">Total de cópias</div>
    </div>
    <div class="dashboard-stat">
      <div class="dashboard-stat__value">${teachers.filter(t => (t.copies / CONFIG.MONTHLY_LIMIT * 100) >= 90).length}</div>
      <div class="dashboard-stat__label">No limite (90%+)</div>
    </div>
  `;

  document.getElementById('dashboard-count').textContent = activeTeachers.length;

  // Build list
  let html = '';
  teachers.forEach((t, index) => {
    const pct = Math.min((t.copies / CONFIG.MONTHLY_LIMIT) * 100, 100);
    let barClass = 'dashboard-bar__fill--safe';
    if (pct >= 90) barClass = 'dashboard-bar__fill--danger';
    else if (pct >= 70) barClass = 'dashboard-bar__fill--warn';

    const rankClass = index < 3 ? 'dashboard-item__rank--top' : '';

    html += `
      <div class="dashboard-item">
        <div class="dashboard-item__rank ${rankClass}">${index + 1}</div>
        <div class="dashboard-item__info">
          <div class="dashboard-item__name" title="${escapeHtml(t.name)}">${escapeHtml(t.name)}</div>
          <div class="dashboard-bar">
            <div class="dashboard-bar__fill ${barClass}" style="width: ${pct}%"></div>
          </div>
          <div class="dashboard-item__meta">
            <span class="dashboard-item__usage">${t.copies} de ${CONFIG.MONTHLY_LIMIT} folhas</span>
            <span class="dashboard-item__pct ${pct >= 90 ? 'pct--danger' : pct >= 70 ? 'pct--warn' : 'pct--safe'}">${Math.round(pct)}%</span>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function renderCoordDashboard() {
  const container = document.getElementById('coord-dashboard-list');
  const summaryEl = document.getElementById('coord-dashboard-summary');
  const filter = document.getElementById('coord-dashboard-filter')?.value || 'all';

  if (dashboardJobs.length === 0) {
    summaryEl.innerHTML = '';
    container.innerHTML = `<div class="empty-state"><div class="empty-state__icon">📊</div><div class="empty-state__text">Nenhuma impressão este mês</div></div>`;
    document.getElementById('coord-dashboard-count').textContent = '0';
    return;
  }

  const usageMap = {};
  dashboardJobs.forEach(job => {
    if (!usageMap[job.professorId]) {
      usageMap[job.professorId] = { id: job.professorId, name: job.professorName, copies: 0 };
    }
    usageMap[job.professorId].copies += (job.copies || 0);
  });

  let teachers = Object.values(usageMap);
  if (filter === 'manha') teachers = teachers.filter(t => t.id >= 30);
  else if (filter === 'tarde-noite') teachers = teachers.filter(t => t.id <= 29);
  teachers.sort((a, b) => b.copies - a.copies);

  const activeTeachers = teachers.filter(t => t.copies > 0);
  const totalCopies = teachers.reduce((sum, t) => sum + t.copies, 0);

  summaryEl.innerHTML = `
    <div class="dashboard-stat"><div class="dashboard-stat__value">${activeTeachers.length}</div><div class="dashboard-stat__label">Professores ativos</div></div>
    <div class="dashboard-stat"><div class="dashboard-stat__value">${totalCopies}</div><div class="dashboard-stat__label">Total de cópias</div></div>
    <div class="dashboard-stat"><div class="dashboard-stat__value">${teachers.filter(t => (t.copies / CONFIG.MONTHLY_LIMIT * 100) >= 90).length}</div><div class="dashboard-stat__label">No limite (90%+)</div></div>
  `;

  document.getElementById('coord-dashboard-count').textContent = activeTeachers.length;

  let html = '';
  teachers.forEach((t, index) => {
    const pct = Math.min((t.copies / CONFIG.MONTHLY_LIMIT) * 100, 100);
    let barClass = 'dashboard-bar__fill--safe';
    if (pct >= 90) barClass = 'dashboard-bar__fill--danger';
    else if (pct >= 70) barClass = 'dashboard-bar__fill--warn';
    const rankClass = index < 3 ? 'dashboard-item__rank--top' : '';
    html += `
      <div class="dashboard-item">
        <div class="dashboard-item__rank ${rankClass}">${index + 1}</div>
        <div class="dashboard-item__info">
          <div class="dashboard-item__name" title="${escapeHtml(t.name)}">${escapeHtml(t.name)}</div>
          <div class="dashboard-bar"><div class="dashboard-bar__fill ${barClass}" style="width: ${pct}%"></div></div>
          <div class="dashboard-item__meta">
            <span class="dashboard-item__usage">${t.copies} de ${CONFIG.MONTHLY_LIMIT} folhas</span>
            <span class="dashboard-item__pct ${pct >= 90 ? 'pct--danger' : pct >= 70 ? 'pct--warn' : 'pct--safe'}">${Math.round(pct)}%</span>
          </div>
        </div>
      </div>`;
  });
  container.innerHTML = html;
}

// ==========================================
// COORDINATION ACTIVITIES
// ==========================================

let allJobs = [];
let allJobsUnsubscribe = null;

function setupAllJobsListener() {
  const q = query(collection(db, "print_jobs"));
  allJobsUnsubscribe = onSnapshot(q, (snapshot) => {
    allJobs = [];
    snapshot.forEach((doc) => {
      allJobs.push({ id: doc.id, ...doc.data() });
    });
    allJobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const coordActPanel = document.getElementById('coord-activities-panel');
    if (currentView === 'coordination' && coordActPanel && coordActPanel.classList.contains('tab-panel--active')) {
      renderCoordActivities();
    }
  });
}

function renderCoordActivities() {
  const filter = document.getElementById('coord-activities-filter')?.value || 'all';
  const container = document.getElementById('coord-activities-list');
  const countEl = document.getElementById('coord-activities-count');

  let filtered = filter === 'all' ? allJobs : allJobs.filter(j => j.docType === filter);
  countEl.textContent = filtered.length;

  if (filtered.length === 0) {
    container.innerHTML = `<div class="empty-state"><div class="empty-state__icon">📄</div><div class="empty-state__text">Nenhuma atividade encontrada</div></div>`;
    return;
  }

  const typeLabels = {
    atividade: '<span class="badge badge--atividade">📘 Atividade</span>',
    avaliacao: '<span class="badge badge--avaliacao">🛑 Avaliação</span>',
    recuperacao: '<span class="badge badge--recuperacao">⚠️ Recuperação</span>'
  };

  container.innerHTML = filtered.map(item => `
    <div class="queue-item">
      <div class="queue-item__info">
        <div class="queue-item__professor queue-professor-row">
          ${escapeHtml(item.professorName)}
          ${typeLabels[item.docType] || typeLabels.atividade}
        </div>
        <div class="queue-item__details">
          <span class="queue-item__detail">📄 ${escapeHtml(item.fileName)}</span>
          <span class="queue-item__detail" title="${escapeHtml(item.turmaName)}">🏫 ${escapeHtml(item.turmaName).length > 30 ? escapeHtml(item.turmaName).substring(0,30)+'...' : escapeHtml(item.turmaName)}</span>
          <span class="queue-item__detail">📋 ${item.copies} cópias</span>
          <span class="queue-item__detail">🕐 ${formatDate(item.createdAt)}</span>
          <span class="queue-item__detail">${item.status === 'printed' ? '✅ Impressa' : '🟡 Na fila'}</span>
          ${item.observations ? `<div class="obs-box"><strong>Obs:</strong> ${escapeHtml(item.observations)}</div>` : ''}
        </div>
      </div>
      <div class="queue-item__actions">
        ${item.fileUrl ? `
          <button class="btn btn--outline btn--sm" onclick="openCoordFile('${item.id}')">👁 Ver</button>
          <button class="btn btn--yellow btn--sm" onclick="printCoordFile('${item.id}')">🖨 Imprimir</button>
        ` : ''}
      </div>
    </div>
  `).join('');
}

function openCoordFile(itemId) {
  const item = allJobs.find(i => i.id === itemId);
  if (!item || !item.fileUrl) { showToast('Erro', 'Arquivo não encontrado', 'error'); return; }
  window.open(item.fileUrl, '_blank');
}
window.openCoordFile = openCoordFile;

function printCoordFile(itemId) {
  const item = allJobs.find(i => i.id === itemId);
  if (!item || !item.fileUrl) { showToast('Erro', 'Arquivo não encontrado', 'error'); return; }
  window.open(item.fileUrl, '_blank');
}
window.printCoordFile = printCoordFile;

// ==========================================
// AUTO CLEANUP
// ==========================================

async function runAutoCleanup() {
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;

  // 1. Limpar print_jobs criados há mais de 7 dias
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  try {
    const oldJobsQuery = query(collection(db, "print_jobs"), where("createdAt", "<=", sevenDaysAgo));
    const snapshot = await getDocs(oldJobsQuery);
    let deleted = 0;
    for (const docSnap of snapshot.docs) {
      await deleteDoc(doc(db, "print_jobs", docSnap.id));
      deleted++;
    }
    if (deleted > 0) console.log(`Auto-cleanup: ${deleted} impressões antigas removidas`);
  } catch (e) {
    console.warn("Auto-cleanup print_jobs:", e.message);
  }

  // 2. Limpar equipment_bookings de datas passadas
  try {
    const bookingsQuery = query(collection(db, "equipment_bookings"), where("date", "<", todayStr));
    const snapshot = await getDocs(bookingsQuery);
    let deleted = 0;
    for (const docSnap of snapshot.docs) {
      await deleteDoc(doc(db, "equipment_bookings", docSnap.id));
      deleted++;
    }
    if (deleted > 0) console.log(`Auto-cleanup: ${deleted} reservas antigas removidas`);
  } catch (e) {
    console.warn("Auto-cleanup equipment_bookings:", e.message);
  }
}

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  initUploadForm();

  // Auto-cleanup de dados antigos (roda em background)
  runAutoCleanup();

  // Firebase realtime listener for queue
  const q = query(collection(db, "print_jobs"), where("status", "==", "pending"));
  onSnapshot(q, (snapshot) => {
    globalQueue = [];
    snapshot.forEach((doc) => {
      globalQueue.push({ id: doc.id, ...doc.data() });
    });
    // Sort by oldest first
    globalQueue.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    
    // Auto re-render if in print view
    if (currentView === 'print') {
      renderPrintQueue();
    }
  });

  // Login card click handlers
  document.querySelectorAll('.login-card').forEach(card => {
    card.addEventListener('click', () => {
      selectInterface(card.dataset.interface);
    });
  });

  // Sidebar back button
  document.getElementById('sidebar-back-btn').addEventListener('click', () => {
    closeMenuDrawer();
    showLoginScreen();
  });

  // Hamburger menu toggle
  document.getElementById('sidebar-hamburger').addEventListener('click', () => {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const isOpen = sidebar.classList.toggle('sidebar--open');
    if (isOpen) {
      overlay.classList.add('sidebar-overlay--visible');
      document.body.classList.add('menu-open');
    } else {
      overlay.classList.remove('sidebar-overlay--visible');
      document.body.classList.remove('menu-open');
    }
  });

  // Close menu on close button click
  const closeBtn = document.getElementById('sidebar-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeMenuDrawer);
  }

  // Close drawer on overlay click
  document.getElementById('sidebar-overlay').addEventListener('click', closeMenuDrawer);

  // Init schedule grid
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const localDateStr = `${year}-${month}-${day}`;
  
  document.getElementById('booking-date').value = localDateStr;
  document.getElementById('admin-booking-date').value = localDateStr;
  
  document.getElementById('booking-date').addEventListener('change', renderScheduleGrid);
  document.getElementById('admin-booking-date').addEventListener('change', renderAdminBookings);

  // Init withdrawals
  document.getElementById('withdrawal-date').value = localDateStr;
  document.getElementById('withdrawal-filter-date').value = localDateStr;
  setupWithdrawalsListener(localDateStr);

  document.getElementById('withdrawal-filter-date').addEventListener('change', () => {
    const dateStr = document.getElementById('withdrawal-filter-date').value;
    setupWithdrawalsListener(dateStr);
  });

  document.getElementById('withdrawal-submit-btn').addEventListener('click', saveWithdrawal);

  document.getElementById('withdrawal-turno-select').addEventListener('change', () => {
    populateProfessorSelect('withdrawal-turno-select', 'withdrawal-professor-select');
  });

  document.getElementById('withdrawal-item').addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveWithdrawal();
    }
  });

  // Confirm modal
  document.getElementById('confirm-modal-yes').addEventListener('click', () => {
    if (confirmCallback) confirmCallback();
    closeConfirmModal();
  });
  document.getElementById('confirm-modal-no').addEventListener('click', closeConfirmModal);
  document.getElementById('confirm-modal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeConfirmModal();
  });
  
  document.getElementById('booking-turno-select').addEventListener('change', () => {
    populateProfessorSelect('booking-turno-select', 'booking-professor-select');
  });

  const closeBookingModalFn = () => {
    document.getElementById('booking-modal').classList.remove('modal-overlay--visible');
  };
  document.getElementById('booking-cancel-btn').addEventListener('click', closeBookingModalFn);
  document.getElementById('booking-close-btn').addEventListener('click', closeBookingModalFn);

  document.getElementById('booking-submit-btn').addEventListener('click', saveBooking);

  // Setup realtime listener for bookings on today by default
  setupBookingsListener(document.getElementById('booking-date').value);

  // Form change → update submit button
  document.getElementById('professor-select').addEventListener('change', updateSubmitButton);

  // History turno & professor select
  document.getElementById('history-turno-select').addEventListener('change', () => {
    populateProfessorSelect('history-turno-select', 'history-professor-select');
    renderTeacherHistory();
  });
  document.getElementById('history-professor-select').addEventListener('change', renderTeacherHistory);

  // Print queue filter
  const filterSelect = document.getElementById('queue-filter-select');
  if (filterSelect) {
    filterSelect.addEventListener('change', renderPrintQueue);
  }

  // Dashboard
  setupDashboardListener();
  const dashFilter = document.getElementById('dashboard-filter');
  if (dashFilter) {
    dashFilter.addEventListener('change', renderTeacherDashboard);
  }

  // Coordination
  setupAllJobsListener();
  const coordDashFilter = document.getElementById('coord-dashboard-filter');
  if (coordDashFilter) {
    coordDashFilter.addEventListener('change', renderCoordDashboard);
  }
  const coordActFilter = document.getElementById('coord-activities-filter');
  if (coordActFilter) {
    coordActFilter.addEventListener('change', renderCoordActivities);
  }
  document.querySelectorAll('#view-coordination .tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchCoordPanel(btn.dataset.tab));
  });

  // Password modal buttons
  document.getElementById('password-submit-btn').addEventListener('click', submitPassword);
  document.getElementById('password-cancel-btn').addEventListener('click', () => {
    closePasswordModal();
    pendingAuthView = 'print';
  });
  document.getElementById('password-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      document.getElementById('password-submit-btn').click();
    }
  });

  // Close password modal on overlay click
  document.getElementById('password-modal').addEventListener('click', e => {
    if (e.target === e.currentTarget) {
      closePasswordModal();
      pendingAuthView = 'print';
    }
  });

  // Print tabs
  document.querySelectorAll('#view-print .tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchPrintPanel(btn.dataset.tab));
  });

  // Start with login overlay
  document.getElementById('login-overlay').style.display = 'flex';
  document.getElementById('app-layout').style.display = 'none';
});

// ==========================================
// EQUIPMENT SCHEDULING LOGIC
// ==========================================

let bookingsUnsubscribe = null;
let currentBookingSlot = null; // { shift, classSlot, date }
let currentListenerDate = null;

function setupBookingsListener(dateStr) {
  if (!dateStr || currentListenerDate === dateStr) return;
  
  if (bookingsUnsubscribe) {
    bookingsUnsubscribe();
  }
  
  currentListenerDate = dateStr;
  
  const q = query(
    collection(db, "equipment_bookings"),
    where("date", "==", dateStr)
  );

  bookingsUnsubscribe = onSnapshot(q, (snapshot) => {
    currentBookings = [];
    snapshot.forEach((doc) => {
      currentBookings.push({ id: doc.id, ...doc.data() });
    });
    
    const teacherSection = document.getElementById('teacher-equipment-section');
    if (teacherSection && teacherSection.style.display === 'block') {
      renderScheduleGrid();
    }
    const equipView = document.getElementById('view-equipment-admin');
    if (equipView && equipView.classList.contains('view--active')) {
      renderAdminBookings();
    }
  });
}

function renderScheduleGrid() {
  const dateStr = document.getElementById('booking-date').value;
  if (!dateStr) return;
  setupBookingsListener(dateStr); // Ensures we listen to the correct date
  
  const grid = document.getElementById('schedule-grid');
  let html = `
    <div class="schedule-header"></div>
    <div class="schedule-header">Manhã</div>
    <div class="schedule-header">Tarde</div>
    <div class="schedule-header">Noite</div>
  `;

  const shifts = [
    { id: 'manha', name: 'Manhã' },
    { id: 'tarde', name: 'Tarde' },
    { id: 'noite', name: 'Noite' }
  ];

  for (let classSlot = 1; classSlot <= 5; classSlot++) {
    html += `<div class="schedule-row-label">${classSlot}ª Aula</div>`;
    
    shifts.forEach(shift => {
      // Find how many equipments are booked for this slot
      const bookedCount = currentBookings.filter(b => b.shift === shift.id && b.classSlot === classSlot).length;
      const totalEquip = EQUIPMENTS.length;
      
      let statusClass = 'schedule-cell--available';
      let statusText = 'Livre';
      let statusBadge = 'schedule-status--available';

      if (bookedCount >= totalEquip) {
        statusClass = 'schedule-cell--full';
        statusText = 'Esgotado';
        statusBadge = 'schedule-status--full';
      } else if (bookedCount > 0) {
        statusClass = 'schedule-cell--partial';
        statusText = `${totalEquip - bookedCount} livres`;
        statusBadge = 'schedule-status--partial';
      }

      html += `
        <div class="schedule-cell ${statusClass}" onclick="openBookingModal('${shift.id}', ${classSlot}, '${dateStr}')">
          <div class="schedule-status ${statusBadge}">${statusText}</div>
          <div class="schedule-cell__count">${bookedCount} agendados</div>
        </div>
      `;
    });
  }

  grid.innerHTML = html;
}

function openBookingModal(shiftId, classSlot, dateStr) {
  const totalEquip = EQUIPMENTS.length;
  const bookedEquipments = currentBookings.filter(b => b.shift === shiftId && b.classSlot === classSlot).map(b => b.equipmentId);
  
  if (bookedEquipments.length >= totalEquip) {
    showToast('Atenção', 'Todos os equipamentos já estão agendados para este horário.', 'warning');
    return;
  }

  currentBookingSlot = { shift: shiftId, classSlot, date: dateStr };
  
  const shiftName = shiftId === 'manha' ? 'Manhã' : shiftId === 'tarde' ? 'Tarde' : 'Noite';
  
  // Format Date (YYYY-MM-DD to DD/MM/YYYY)
  const parts = dateStr.split('-');
  const dateFormatted = `${parts[2]}/${parts[1]}/${parts[0]}`;

  document.getElementById('booking-modal-title').textContent = `Agendar Equipamento`;
  document.getElementById('booking-modal-subtitle').textContent = `${dateFormatted} - ${shiftName}, ${classSlot}ª Aula`;

  // Render available equipment list
  const listContainer = document.getElementById('available-equipment-list');
  let listHtml = '';
  
  EQUIPMENTS.forEach(eq => {
    if (!bookedEquipments.includes(eq.id)) {
      listHtml += `
        <label class="equipment-item">
          <input type="radio" name="equipment-select" value="${eq.id}">
          <span>${eq.name}</span>
        </label>
      `;
    }
  });

  listContainer.innerHTML = listHtml;
  
  // Reset prof selection
  document.getElementById('booking-turno-select').value = '';
  document.getElementById('booking-professor-select').innerHTML = '<option value="">Primeiro selecione o turno...</option>';
  document.getElementById('booking-professor-select').disabled = true;

  document.getElementById('booking-modal').classList.add('modal-overlay--visible');
}
window.openBookingModal = openBookingModal;

async function saveBooking() {
  const profId = document.getElementById('booking-professor-select').value;
  const equipRadio = document.querySelector('input[name="equipment-select"]:checked');
  const btn = document.getElementById('booking-submit-btn');

  if (!profId) {
    showToast('Atenção', 'Selecione seu turno e nome antes de continuar.', 'warning');
    return;
  }

  if (!equipRadio) {
    showToast('Atenção', 'Selecione um equipamento disponível.', 'warning');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Agendando...';

  try {
    const profObj = PROFESSORS.find(p => p.id == profId);
    const equipObj = EQUIPMENTS.find(e => e.id === equipRadio.value);

    const bookingData = {
      equipmentId: equipObj.id,
      equipmentName: equipObj.name,
      date: currentBookingSlot.date,
      shift: currentBookingSlot.shift,
      classSlot: currentBookingSlot.classSlot,
      professorId: profObj.id,
      professorName: profObj.name,
      createdAt: new Date().toISOString()
    };

    await addDoc(collection(db, "equipment_bookings"), bookingData);

    showToast('Sucesso', 'Equipamento agendado com sucesso!', 'success');
    document.getElementById('booking-modal').classList.remove('modal-overlay--visible');
    
  } catch (err) {
    console.error("Error booking equipment: ", err);
    showToast('Erro', 'Ocorreu um erro ao agendar. Tente novamente.', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Confirmar Reserva';
  }
}

function renderAdminBookings() {
  const dateStr = document.getElementById('admin-booking-date').value;
  if (!dateStr) return;
  setupBookingsListener(dateStr);

  const container = document.getElementById('admin-bookings-list');
  
  if (currentBookings.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">📦</div>
        <div class="empty-state__text">Nenhuma reserva para este dia</div>
      </div>
    `;
    return;
  }

  const sorted = [...currentBookings].sort((a, b) => {
    const shiftOrder = { 'manha': 1, 'tarde': 2, 'noite': 3 };
    if (shiftOrder[a.shift] !== shiftOrder[b.shift]) {
      return shiftOrder[a.shift] - shiftOrder[b.shift];
    }
    return a.classSlot - b.classSlot;
  });

  let html = '';
  sorted.forEach(b => {
    const shiftName = b.shift === 'manha' ? 'Manhã' : b.shift === 'tarde' ? 'Tarde' : 'Noite';
    html += `
      <div class="admin-booking-item">
        <div class="admin-booking-info">
          <h4>${b.equipmentName}</h4>
          <p><strong>${shiftName} - ${b.classSlot}ª Aula</strong></p>
          <p class="booking-professor">👤 Prof(a). ${b.professorName}</p>
        </div>
        <div class="booking-status">
           <span class="schedule-status schedule-status--partial booking-status-label">Agendado</span>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// ==========================================
// MATERIAL WITHDRAWALS LOGIC
// ==========================================

let withdrawalsUnsubscribe = null;
let currentWithdrawals = [];
let currentWithdrawalListenerDate = null;

function setupWithdrawalsListener(dateStr) {
  if (!dateStr || currentWithdrawalListenerDate === dateStr) return;

  if (withdrawalsUnsubscribe) {
    withdrawalsUnsubscribe();
  }

  currentWithdrawalListenerDate = dateStr;

  const q = query(
    collection(db, "material_withdrawals"),
    where("date", "==", dateStr)
  );

  withdrawalsUnsubscribe = onSnapshot(q, (snapshot) => {
    currentWithdrawals = [];
    snapshot.forEach((doc) => {
      currentWithdrawals.push({ id: doc.id, ...doc.data() });
    });
    currentWithdrawals.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const withdrawalsView = document.getElementById('view-withdrawals-admin');
    if (withdrawalsView && withdrawalsView.classList.contains('view--active')) {
      renderWithdrawals();
    }
  });
}

function renderWithdrawals() {
  const container = document.getElementById('withdrawals-list');

  if (currentWithdrawals.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">📋</div>
        <div class="empty-state__text">Nenhuma retirada registrada</div>
        <div class="empty-state__subtext">Use o formulário acima para registrar</div>
      </div>
    `;
    return;
  }

  const totalItems = currentWithdrawals.length;
  const totalQty = currentWithdrawals.reduce((sum, w) => sum + (w.quantity || 0), 0);

  let html = `
    <div class="withdrawal-summary">
      <span>📦 <strong>${totalItems}</strong> ${totalItems === 1 ? 'item registrado' : 'itens registrados'}</span>
      <span>📊 <strong>${totalQty}</strong> ${totalQty === 1 ? 'unidade' : 'unidades'} no total</span>
    </div>
  `;

  currentWithdrawals.forEach(w => {
    const time = w.createdAt ? new Date(w.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '';
    html += `
      <div class="withdrawal-item">
        <div class="withdrawal-item__info">
          <span class="withdrawal-item__name">${escapeHtml(w.item)}</span>
          <span class="withdrawal-item__qty">${w.quantity}x</span>
          ${w.person ? `<span class="withdrawal-item__person">👤 ${escapeHtml(w.person)}</span>` : ''}
          ${time ? `<span class="withdrawal-item__time">${time}</span>` : ''}
        </div>
        <button class="withdrawal-item__delete" onclick="deleteWithdrawal('${w.id}')" title="Remover">✕</button>
      </div>
    `;
  });

  container.innerHTML = html;
}

async function saveWithdrawal() {
  const itemInput = document.getElementById('withdrawal-item');
  const qtyInput = document.getElementById('withdrawal-qty');
  const turnoSelect = document.getElementById('withdrawal-turno-select');
  const profSelect = document.getElementById('withdrawal-professor-select');
  const dateInput = document.getElementById('withdrawal-date');

  const item = itemInput.value.trim();
  const quantity = parseInt(qtyInput.value);
  const professorId = parseInt(profSelect.value);
  const professor = PROFESSORS.find(p => p.id === professorId);
  const person = professor ? professor.name : '';
  const date = dateInput.value;

  if (!item) {
    showToast('Atenção', 'Digite o nome do material.', 'warning');
    itemInput.focus();
    return;
  }

  if (!quantity || quantity < 1) {
    showToast('Atenção', 'A quantidade deve ser pelo menos 1.', 'warning');
    qtyInput.focus();
    return;
  }

  if (!date) {
    showToast('Atenção', 'Selecione a data.', 'warning');
    dateInput.focus();
    return;
  }

  const btn = document.getElementById('withdrawal-submit-btn');
  btn.disabled = true;
  btn.textContent = 'Registrando...';

  try {
    await addDoc(collection(db, "material_withdrawals"), {
      item,
      quantity,
      person,
      professorId: professorId || null,
      date,
      createdAt: new Date().toISOString()
    });

    const teacherLabel = professor ? ` para ${professor.name}` : '';
    showToast('Registrado!', `${quantity}x ${item}${teacherLabel}`, 'success');

    itemInput.value = '';
    qtyInput.value = '1';
    turnoSelect.value = '';
    profSelect.innerHTML = '<option value="">Primeiro selecione o turno</option>';
    profSelect.disabled = true;
    itemInput.focus();
  } catch (err) {
    console.error("Error saving withdrawal: ", err);
    showToast('Erro', 'Ocorreu um erro ao registrar. Tente novamente.', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Registrar Retirada';
  }
}

// ==========================================
// CUSTOM CONFIRM MODAL
// ==========================================

let confirmCallback = null;

function showConfirmModal(title, message, onConfirm) {
  document.getElementById('confirm-modal-title').textContent = title;
  document.getElementById('confirm-modal-message').textContent = message;
  confirmCallback = onConfirm;
  document.getElementById('confirm-modal').classList.add('modal-overlay--visible');
}

function closeConfirmModal() {
  document.getElementById('confirm-modal').classList.remove('modal-overlay--visible');
  confirmCallback = null;
}

async function deleteWithdrawal(id) {
  showConfirmModal(
    'Remover registro',
    'Tem certeza que deseja remover este registro de retirada?',
    async () => {
      try {
        await deleteDoc(doc(db, "material_withdrawals", id));
        showToast('Removido', 'Registro de retirada removido.', 'success');
      } catch (err) {
        console.error("Error deleting withdrawal: ", err);
        showToast('Erro', 'Não foi possível remover o registro.', 'error');
      }
    }
  );
}
window.deleteWithdrawal = deleteWithdrawal;
