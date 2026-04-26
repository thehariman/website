// Toast Notification System

function showToast(message, type = 'success', duration = 3000) {

    let container = document.getElementById('toast-container');

    if (!container) {

        container = document.createElement('div');

        container.id = 'toast-container';

        document.body.appendChild(container);

    }



    const toast = document.createElement('div');

    toast.className = `toast toast-${type}`;



    let icon = 'ph-check-circle';

    if (type === 'error') icon = 'ph-x-circle';

    if (type === 'warning') icon = 'ph-warning-circle';



    toast.innerHTML = `

        <i class="ph-fill ${icon}" style="font-size: 1.5rem;"></i>

        <div style="flex: 1;">${message}</div>

    `;



    container.appendChild(toast);



    // Auto-remove

    setTimeout(() => {

        toast.classList.add('toast-closing');

        setTimeout(() => toast.remove(), 300);

    }, duration);

}



// Auth Check



const admin = DB.getCurrentUser();

if (!admin || admin.role !== 'admin') {

    window.location.href = 'admin-login.html';

}



// Initialize App

(async function initAdmin() {

    try {

        // Ensure DB is ready

        // Note: DB.initialize() fetches all data from cloud

        await DB.initialize();



        // Refresh UI

        refreshDashboard();



        // Hide Loader

        const loader = document.getElementById('appLoader');

        if (loader) {

            loader.style.opacity = '0';

            setTimeout(() => loader.remove(), 500);

        }

    } catch (e) {

        console.error("Initialization failed:", e);

        document.getElementById('loaderStatus').innerText = "Error loading data. Please reload.";

        document.getElementById('loaderStatus').style.color = "red";

    }

})();



function switchTab(tabId) {

    // Close mobile sidebar if open

    if (window.innerWidth <= 992) {

        const sidebar = document.querySelector('.sidebar');

        const backdrop = document.getElementById('sidebarBackdrop');

        sidebar.classList.remove('active');

        backdrop.classList.remove('active');

    }



    document.querySelectorAll('.tab-content').forEach(t => t.style.display = 'none');

    document.getElementById(tabId).style.display = 'block';



    let title = tabId.charAt(0).toUpperCase() + tabId.slice(1);

    if (tabId === 'overview') title = 'Dashboard Overview';

    if (tabId === 'registrations') title = 'New Registrations';

    if (tabId === 'offer-letters') title = 'Offer Letters';

    if (tabId === 'manual-cert') title = 'Manual Certificate Generation';

    if (tabId === 'manual-offer') title = 'Manual Offer Letter Generation';

    if (tabId === 'reports') title = 'Batch Status Reports';
    if (tabId === 'referrals') title = 'Referral Management';
    if (tabId === 'group-messages') {
        title = 'Daily WhatsApp Message Generator';
        updateBatchDropdowns();
        generateGroupMessage(); // Initial check
    }



    document.getElementById('tabTitle').innerText = title;

    const mobileTitle = document.getElementById('mobileTabTitle');

    if (mobileTitle) mobileTitle.innerText = title;

    // Sidebar buttons styling

    document.querySelectorAll('.sidebar .btn').forEach(btn => {

        const onclick = btn.getAttribute('onclick');

        if (onclick && onclick.includes(`'${tabId}'`)) {

            btn.classList.add('btn-primary');

            btn.style.background = 'var(--primary)';

            btn.style.color = 'white';

        } else {

            btn.classList.remove('btn-primary');

            btn.style.background = 'transparent';

            btn.style.color = 'var(--text-main)';

        }

    });



    refreshDashboard();

}



function toggleSidebar() {

    const sidebar = document.querySelector('.sidebar');

    const backdrop = document.getElementById('sidebarBackdrop');

    if (sidebar) sidebar.classList.toggle('active');

    if (backdrop) backdrop.classList.toggle('active');

}



// Toggle dropdown menu

function toggleDropdown(dropdownId, event) {

    event.stopPropagation();

    const dropdown = document.getElementById(dropdownId);

    const toggleBtn = event.currentTarget;

    const caretIcon = toggleBtn.querySelector('.ph-caret-down');



    // Close all other dropdowns

    document.querySelectorAll('.dropdown-content').forEach(dd => {

        if (dd.id !== dropdownId) {

            dd.style.display = 'none';

            const otherBtn = dd.previousElementSibling;

            if (otherBtn) {

                const otherCaret = otherBtn.querySelector('.ph-caret-down');

                if (otherCaret) otherCaret.style.transform = 'rotate(0deg)';

            }

        }

    });



    // Toggle current dropdown

    if (dropdown.style.display === 'none' || dropdown.style.display === '') {

        dropdown.style.display = 'block';

        if (caretIcon) caretIcon.style.transform = 'rotate(180deg)';

    } else {

        dropdown.style.display = 'none';

        if (caretIcon) caretIcon.style.transform = 'rotate(0deg)';

    }

}



// Close dropdowns when clicking outside

document.addEventListener('click', function (event) {

    if (!event.target.closest('.dropdown-toggle')) {

        document.querySelectorAll('.dropdown-content').forEach(dd => {

            dd.style.display = 'none';

        });

        document.querySelectorAll('.dropdown-toggle .ph-caret-down').forEach(caret => {

            caret.style.transform = 'rotate(0deg)';

        });

    }

});





// openManualDoc is already defined at the top of this script

// Manual form will be initialized at the end of script



function refreshDashboard() {

    // Wrap in try-catch to ensure one failure doesn't stop others

    try { renderStats(); } catch (e) { console.error(e); }

    try { renderInterns(); } catch (e) { console.error(e); }

    try { renderRegistrations(); } catch (e) { console.error(e); }

    try { renderApprovals(); } catch (e) { console.error(e); }

    try { renderPayments(); } catch (e) { console.error(e); }
    try { renderPaymentAlerts(); } catch (e) { console.error(e); }

    try { renderDomains(); } catch (e) { console.error(e); }

    try { renderSettings(); } catch (e) { console.error(e); }

    try { renderCertTab(); } catch (e) { console.error(e); }

    try { renderOfferTab(); } catch (e) { console.error(e); }

    try { updateDomainDropdowns(); } catch (e) { console.error(e); }

    try { updateBatchDropdowns(); } catch (e) { console.error(e); }

    try { renderReportsTab(); } catch (e) { console.error(e); }

    try { renderReferrals(); } catch (e) { console.error(e); }

    try { renderBatchCountdown(); } catch (e) { console.error(e); }

}



function renderBatchCountdown() {

    const banner = document.getElementById('batchCountdownBanner');

    if (!banner) return;



    const now = new Date();

    const day = now.getDate();

    const month = now.getMonth();

    const year = now.getFullYear();



    // Determine next batch date (1st or 15th of month)

    let nextBatchDate;

    if (day < 15) {

        nextBatchDate = new Date(year, month, 15);

    } else {

        nextBatchDate = new Date(year, month + 1, 1);

    }



    const msLeft = nextBatchDate - now;

    const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));



    // Build next ID prefix

    const nextDay = nextBatchDate.getDate();

    const nextCycle = nextDay === 1 ? '1' : '2';

    const monthNames = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

    const nextMonth = monthNames[nextBatchDate.getMonth()];

    const nextYearShort = String(nextBatchDate.getFullYear()).slice(-2);

    const nextIdPrefix = `THX-${nextMonth}${nextCycle}${nextYearShort}-001`;



    // Only show within 5 days of next batch

    if (daysLeft > 5) {

        banner.style.display = 'none';

        return;

    }



    const isUrgent = daysLeft <= 2;

    const borderColor = isUrgent ? '#EF4444' : '#F59E0B';

    const bgColor    = isUrgent ? '#FEF2F2' : '#FFFBEB';

    const textColor  = isUrgent ? '#991B1B' : '#92400E';

    const subColor   = isUrgent ? '#B91C1C' : '#B45309';

    const icon = isUrgent ? 'ph-fill ph-warning-circle' : 'ph-fill ph-clock-countdown';

    const urgencyLabel = daysLeft === 0 ? '🔴 TODAY' : daysLeft === 1 ? '🟡 TOMORROW' : `🟡 IN ${daysLeft} DAYS`;

    const batchDateStr = nextBatchDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });



    const settings = DB.getSettings();

    const hasWaLink = settings.whatsappLink && settings.whatsappLink.trim() !== '' && settings.whatsappLink.trim() !== '#';



    banner.style.display = 'block';

    banner.style.borderLeft = `5px solid ${borderColor}`;

    banner.style.background = bgColor;

    banner.innerHTML = `

        <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; flex-wrap: wrap;">

            <div style="display: flex; align-items: flex-start; gap: 1rem; flex: 1;">

                <i class="${icon}" style="color: ${borderColor}; font-size: 2rem; flex-shrink: 0; margin-top: 2px;"></i>

                <div>

                    <div style="display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap; margin-bottom: 0.5rem;">

                        <h4 style="color: ${textColor}; margin: 0;">New Batch Starting - ${urgencyLabel}</h4>

                        <span style="background: ${borderColor}; color: white; font-size: 0.72rem; font-weight: 700; padding: 2px 10px; border-radius: 20px;">${batchDateStr}</span>

                    </div>

                    <div style="display: flex; flex-wrap: wrap; gap: 1.5rem; font-size: 0.88rem; color: ${subColor};">

                        <span>

                            <i class="ph ph-identification-badge"></i>

                            New IDs start at:

                            <strong style="font-family: monospace; background: white; padding: 1px 8px; border-radius: 4px; border: 1px solid ${borderColor}50; color: #1e293b;">${nextIdPrefix}</strong>

                        </span>

                        <span>

                            <i class="ph-fill ph-whatsapp-logo" style="color: #25D366;"></i>

                            WhatsApp group link:

                            <strong style="color: ${hasWaLink ? '#16a34a' : '#dc2626'};">

                                ${hasWaLink ? `<a href="${settings.whatsappLink}" target="_blank" style="color: inherit; text-decoration: underline;">\u2713 Set</a>` : '\u2715 NOT SET \u2014 Update required!'}

                            </strong>

                        </span>

                    </div>

                </div>

            </div>

            <button class="btn" style="background: ${borderColor}; color: white; border: none; flex-shrink: 0; align-self: center;" onclick="switchTab('settings')">

                <i class="ph ph-gear"></i> Update Settings

            </button>

        </div>

    `;

}



async function manualSync() {

    const syncBtn = document.getElementById('syncBtnDesktop');

    const syncBtnMobile = document.getElementById('syncBtnMobile');

    const originalHTML = '<i class="ph ph-arrows-clockwise"></i> <span>Sync Data</span>';

    const loadingHTML = '<i class="ph ph-spinner ph-spin"></i> <span>Syncing...</span>';



    if (syncBtn) { syncBtn.innerHTML = loadingHTML; syncBtn.disabled = true; }

    if (syncBtnMobile) { syncBtnMobile.innerHTML = '<i class="ph ph-spinner ph-spin"></i>'; syncBtnMobile.disabled = true; }



    try {

        await DB.initialize();

        refreshDashboard();

        showToast("Data synced from cloud");

    } catch (err) {

        console.error(err);

        showToast("Sync failed", 'error');

    } finally {

        if (syncBtn) { syncBtn.innerHTML = originalHTML; syncBtn.disabled = false; }

        if (syncBtnMobile) { syncBtnMobile.innerHTML = '<i class="ph ph-arrows-clockwise"></i>'; syncBtnMobile.disabled = false; }

    }

}



function renderSettings() {

    const settings = DB.getSettings();

    if (document.getElementById('certFilterStatus')) {

        if (!document.getElementById('certFilterStatus').value) {

            document.getElementById('certFilterStatus').value = 'requested';

        }

    }

    if (document.getElementById('sPreferredMethod')) document.getElementById('sPreferredMethod').value = settings.preferredMethod || 'upi';

    if (document.getElementById('sUpiId')) document.getElementById('sUpiId').value = settings.upiId || '';

    if (document.getElementById('sAccountName')) document.getElementById('sAccountName').value = settings.accountName || '';

    if (document.getElementById('sBankName')) document.getElementById('sBankName').value = settings.bankName || '';

    if (document.getElementById('sIfsc')) document.getElementById('sIfsc').value = settings.ifsc || '';

    if (document.getElementById('sAccountNumber')) document.getElementById('sAccountNumber').value = settings.accountNumber || '';



    // Promo Settings

    if (document.getElementById('sPromoActive')) document.getElementById('sPromoActive').value = settings.promoActive || 'false';

    if (document.getElementById('sPromoImage')) document.getElementById('sPromoImage').value = settings.promoImage || '';

    if (document.getElementById('sPromoLink')) document.getElementById('sPromoLink').value = settings.promoLink || '';

    if (document.getElementById('sPromoBtnText')) document.getElementById('sPromoBtnText').value = settings.promoBtnText || 'Register Now';



    // WhatsApp Settings

    if (document.getElementById('sWhatsappLink')) document.getElementById('sWhatsappLink').value = settings.whatsappLink || '';

    if (document.getElementById('sWhatsappLastUpdated')) document.getElementById('sWhatsappLastUpdated').value = settings.whatsappLastUpdated || '';

    checkWhatsAppLinkAlert();

}



function checkWhatsAppLinkAlert() {

    const settings = DB.getSettings();

    const whatsappLink = settings.whatsappLink || '';

    const lastUpdated = settings.whatsappLastUpdated ? new Date(settings.whatsappLastUpdated) : new Date(0);

    const today = new Date();

    const day = today.getDate();

    const month = today.getMonth();

    const year = today.getFullYear();



    const alertEl = document.getElementById('whatsappLinkAlert');

    if (!alertEl) {

        console.warn('WhatsApp alert element not found!');

        return;

    }



    // Determine current batch period start date

    let currentBatchStart;

    if (day >= 1 && day < 15) {

        // We're in the 1st batch period (1st-14th)

        currentBatchStart = new Date(year, month, 1);

    } else {

        // We're in the 15th batch period (15th-end of month)

        currentBatchStart = new Date(year, month, 15);

    }



    // Show alert if:

    // 1. WhatsApp link is empty/missing, OR

    // 2. Link exists but was last updated BEFORE the current batch period started

    const isLinkEmpty = !whatsappLink || whatsappLink.trim() === '';

    const needsUpdate = lastUpdated < currentBatchStart;



    console.log('=== WhatsApp Alert Check ===');

    console.log('Link:', whatsappLink);

    console.log('Is Empty:', isLinkEmpty);

    console.log('Last Updated:', lastUpdated);

    console.log('Current Batch Start:', currentBatchStart);

    console.log('Needs Update:', needsUpdate);

    console.log('Should Show Alert:', isLinkEmpty || needsUpdate);



    if (isLinkEmpty || needsUpdate) {

        alertEl.style.display = 'block';

        console.log('â Alert SHOWN');

    } else {

        alertEl.style.display = 'none';

        console.log('â Alert HIDDEN');

    }

}



document.getElementById('settingsForm').addEventListener('submit', function (e) {

    e.preventDefault();

    const data = {

        preferredMethod: document.getElementById('sPreferredMethod').value,

        upiId: document.getElementById('sUpiId').value,

        accountName: document.getElementById('sAccountName').value,

        bankName: document.getElementById('sBankName').value,

        ifsc: document.getElementById('sIfsc').value,

        accountNumber: document.getElementById('sAccountNumber').value,



        promoActive: document.getElementById('sPromoActive').value,

        promoImage: document.getElementById('sPromoImage').value,

        promoLink: document.getElementById('sPromoLink').value,

        promoBtnText: document.getElementById('sPromoBtnText').value,



        // WhatsApp Data

        whatsappLink: document.getElementById('sWhatsappLink').value,

        whatsappLastUpdated: new Date().toISOString()

    };

    DB.updateSettings(data);

    checkWhatsAppLinkAlert();

    showToast('Settings updated successfully!');

});







let isRevenueVisible = localStorage.getItem('isRevenueVisible') !== 'false';



// Set initial body class

if (!isRevenueVisible) {

    document.body.classList.add('hide-amounts');

}



function toggleRevenueVisibility() {

    isRevenueVisible = !isRevenueVisible;

    localStorage.setItem('isRevenueVisible', isRevenueVisible);



    if (isRevenueVisible) {

        document.body.classList.remove('hide-amounts');

    } else {

        document.body.classList.add('hide-amounts');

    }



    document.querySelectorAll('.toggle-revenue').forEach(icon => {

        icon.className = isRevenueVisible ? 'ph ph-eye toggle-revenue' : 'ph ph-eye-slash toggle-revenue';

    });

}



function renderStats() {

    const stats = DB.getInternStats();

    const interns = DB.get('interns');

    // Filter out dropped AND pending_verification interns from active calculations

    const activeInternList = interns.filter(i => i.status !== 'dropped' && i.status !== 'pending_verification');



    // Calculate certified vs active

    const certifiedCount = activeInternList.filter(i => i.certificateUrl || i.certApproved).length;

    const learningCount = Math.max(0, activeInternList.length - certifiedCount);



    const submissions = DB.get('submissions');



    document.getElementById('countActiveInterns').innerText = learningCount;

    document.getElementById('countCertifiedInterns').innerText = certifiedCount;

    document.getElementById('totalRevenue').innerText = '₹ ' + stats.totalRevenue.toLocaleString();

    document.getElementById('totalRevenue').classList.add('revenue-amount');



    // Calculate Pending Revenue (Unpaid Active Interns)

    // Excludes 'verified' (paid) and 'pending' (waiting for verification)

    const unpaidRevenue = activeInternList

        .filter(i => i.paymentStatus !== 'verified' && i.paymentStatus !== 'pending')

        .reduce((sum, i) => sum + (parseFloat(i.feeAmount) || 0), 0);



    const pendingRevenueDisplay = document.getElementById('pendingRevenueDisplay');

    if (pendingRevenueDisplay) {

        pendingRevenueDisplay.innerText = '₹ ' + unpaidRevenue.toLocaleString();

        pendingRevenueDisplay.classList.add('revenue-amount');

    }



    // Set initial eye icon classes based on state

    document.querySelectorAll('.toggle-revenue').forEach(icon => {

        icon.className = isRevenueVisible ? 'ph ph-eye toggle-revenue' : 'ph ph-eye-slash toggle-revenue';

    });





    const pendingPayments = activeInternList.filter(i => i.paymentStatus === 'pending').length;

    const pendingTasks = submissions.filter(s => {

        const intern = interns.find(i => String(i.id) === String(s.internId));

        return s.status === 'pending' && intern;

    }).length;



    document.getElementById('countPendingTasks').innerText = pendingTasks;

    document.getElementById('countPendingPayments').innerText = pendingPayments;

    document.getElementById('countPendingCerts').innerText = stats.pendingCerts;



    // Updated Sidebar Badges

    const bApprovals = document.getElementById('badgeApprovals');

    if (bApprovals) {

        bApprovals.innerText = pendingTasks;

        bApprovals.classList.toggle('show', pendingTasks > 0);

    }



    const bPayments = document.getElementById('badgePayments');

    if (bPayments) {

        bPayments.innerText = pendingPayments;

        bPayments.classList.toggle('show', pendingPayments > 0);

    }



    const bCerts = document.getElementById('badgeCerts');

    if (bCerts) {

        bCerts.innerText = stats.pendingCerts;

        bCerts.classList.toggle('show', stats.pendingCerts > 0);

    }



    const pendingOffersCount = interns.filter(i => i.id && i.status === 'active' && !i.offerApproved && i.status !== 'dropped').length;

    const bOffers = document.getElementById('badgeOffers');

    if (bOffers) {

        bOffers.innerText = pendingOffersCount;

        bOffers.classList.toggle('show', pendingOffersCount > 0);

    }







    // Calculate pending registrations

    const pendingRegs = interns.filter(i => i.status === 'pending_verification').length;



    const bRegistrations = document.getElementById('badgeRegistrations');

    if (bRegistrations) {

        bRegistrations.innerText = pendingRegs;

        bRegistrations.classList.toggle('show', pendingRegs > 0);

    }

    if (document.getElementById('countPendingRegs')) {

        document.getElementById('countPendingRegs').innerText = pendingRegs;

    }

}



let isFilterInitialized = false;



function formatBatchDate(dateStr) {

    if (!dateStr) return '';

    // If it looks like an ISO string (e.g. 2024-12-31T...), format it

    if (dateStr.includes('T') || dateStr.includes('-')) {

        const d = new Date(dateStr);

        if (!isNaN(d.getTime())) {

            return d.toLocaleString('default', { month: 'short', year: 'numeric' });

        }

    }

    return dateStr;

}



function renderInterns() {

    let interns = DB.get('interns');



    // --- Read Filter Values ---

    const search = document.getElementById('internSearch').value.toLowerCase().trim();

    const sort = document.getElementById('internSort').value;

    const filterStatus = document.getElementById('internFilterStatus').value;

    const filterDomain = document.getElementById('internFilterDomain').value;

    const filterBatch = document.getElementById('internFilterBatch').value;



    // --- Filtering Logic ---

    interns = interns.filter(i => {

        const matchSearch = !search ||

            i.name.toLowerCase().includes(search) ||

            String(i.id).toLowerCase().includes(search) ||

            String(i.mobile).includes(search);



        let matchStatus = true;

        if (filterStatus === 'active') {

            // Active = Not dropped AND Not certified AND Not pending verification

            matchStatus = i.status !== 'dropped' && i.status !== 'pending_verification' && !i.certificateUrl && !i.certApproved;

        } else if (filterStatus === 'certified') {

            // Certified = Not dropped AND Has certificate or certApproved

            matchStatus = i.status !== 'dropped' && (i.certificateUrl || i.certApproved);

        } else if (filterStatus === 'dropped') {

            matchStatus = i.status === 'dropped';

        } else if (filterStatus === 'offer_pending') {

            matchStatus = i.status === 'active' && !i.offerApproved;

        }



        const matchDomain = !filterDomain || i.domain === filterDomain;

        const matchBatch = !filterBatch || formatBatchDate(i.batch) === filterBatch;



        return i.id && matchSearch && matchStatus && matchDomain && matchBatch;

    });



    // --- Sorting Logic ---

    if (sort === 'az') {

        interns.sort((a, b) => a.name.localeCompare(b.name));

    } else if (sort === 'za') {

        interns.sort((a, b) => b.name.localeCompare(a.name));

    } else if (sort === 'oldest') {

        // Keep original order (oldest first)

    } else {

        // Newest First (default, assumes newly added are at the end, so reverse)

        // If there's a timestamp we could use that, but array order is implicit

        interns.reverse();

    }



    // --- Render ---

    const body = document.getElementById('internTableBody');



    if (interns.length === 0) {

        body.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 2rem; color: var(--text-muted);">No interns found matching your criteria.</td></tr>';

        document.getElementById('selectAllInterns').checked = false;

        updateBulkUI();

        return;

    }



    body.innerHTML = interns.map(i => {

        const tasks = DB.getInternTasks(i.id, i.domain);



        // Count completed tasks - check for 'approved' status (case-insensitive)

        const completed = tasks.filter(t => {

            const status = String(t.status || '').toLowerCase();

            return status === 'approved' || status === 'done';

        }).length;

        const pending = tasks.length - completed; // Show remaining tasks as 'Wait'



        console.log(`[renderInterns] ${i.name} (${i.id}): ${completed}/${tasks.length} completed`);

        console.log(`[renderInterns] Task statuses:`, tasks.map(t => ({

            id: t.id,

            title: t.title,

            status: t.status

        })));



        let payBadge = '';

        if (i.paymentStatus === 'verified') payBadge = '<span class="badge badge-success">Paid</span>';

        else if (i.paymentStatus === 'pending') payBadge = '<span class="badge badge-warning">Review</span>';

        else payBadge = '<span class="badge badge-danger">Unpaid</span>';



        let statusColor = i.status === 'dropped' ? '#94A3B8' : 'inherit';

        let rowStyle = `color: ${statusColor};`;



        // Highlight if active intern has pending offer approval

        if (i.status === 'active' && !i.offerApproved) {

            rowStyle += 'background: #FFF7ED; border-left: 4px solid var(--warning);';

        }



        return `

        <tr style="${rowStyle}">

            <td style="text-align: center;">

                <input type="checkbox" class="intern-checkbox" value="${i.id}" onchange="updateBulkUI()" style="width: 17px; height: 17px; cursor: pointer;">

            </td>

            <td><strong>${i.id}</strong>${!i.offerApproved && i.status === 'active' ? '<br><small style="color: var(--warning); font-weight: 600;">â  Offer Pending Approval</small>' : ''}</td>

            <td><strong>${i.name}</strong><br><small>${i.email}</small></td>

            <td><span class="badge badge-primary">${i.domain}</span><br><small>${formatBatchDate(i.batch)}</small></td>

            <td>

                <span class="badge badge-success">${completed} Done</span>

                <span class="badge badge-warning">${pending} Wait</span>

            </td>

            <td><strong style="color: var(--primary);" class="revenue-amount">₹${i.feeAmount || 0}</strong></td>

            <td>${payBadge}</td>

            <td>
                <div style="display: flex; gap: 0.5rem;">
                    <a href="tel:${i.mobile}" class="btn" style="padding: 0.4rem; background: #3B82F6; color: white;"><i class="ph-fill ph-phone"></i></a>
                </div>
            </td>

            <td style="text-align: center;">

                <div class="action-dropdown">

                    <button class="dots-btn" onclick="toggleActionMenu(event, '${i.id}')">

                        <i class="ph ph-dots-three-outline-vertical"></i>

                    </button>

                    <div class="action-menu" id="menu-${i.id}" onclick="event.stopPropagation()">



                        <button class="action-item" onclick="updateOfferLetter('${i.id}')">

                            <i class="ph ph-file-text"></i> ${i.offerLetterUrl ? 'Update Offer Letter' : 'Add Offer Letter'}

                        </button>

                        ${!i.offerApproved && i.status === 'active' ? `

                        <button class="action-item" style="color: #10B981;" onclick="approveOfferLetter('${i.id}', this)">

                            <i class="ph ph-check-circle"></i> Approve Offer Letter

                        </button>

                        ` : ''}

                        <button class="action-item" onclick="editFee('${i.id}')">

                            <i class="ph ph-currency-inr"></i> Edit Fee Amount

                        </button>

                        ${i.status === 'dropped' ? `

                        <button class="action-item" style="color: #166534;" onclick="markActive('${i.id}')">

                            <i class="ph ph-user-plus"></i> Mark Active

                        </button>

                        ` : `

                        <button class="action-item" onclick="markDropped('${i.id}')">

                            <i class="ph ph-user-minus"></i> Mark Dropped

                        </button>

                        `}

                        <hr style="border: none; border-top: 1px solid var(--border); margin: 0.2rem 0;">

                        <button class="action-item danger" onclick="deleteIntern('${i.id}')">

                            <i class="ph ph-trash"></i> Delete Intern

                        </button>

                    </div>

                </div>

            </td>

        </tr>

    `}).join('');

}



function renderRegistrations() {

    const interns = DB.get('interns');

    const search = document.getElementById('regSearch') ? document.getElementById('regSearch').value.toLowerCase().trim() : '';

    const filterDomainEl = document.getElementById('regDomainFilter');

    const filterDomain = filterDomainEl ? filterDomainEl.value : '';

    const body = document.getElementById('registrationsTableBody');



    if (!body) return;



    // Auto-populate domain filter if needed

    if (filterDomainEl && filterDomainEl.options.length <= 1) {

        const domains = DB.getDomains();

        Object.keys(domains).forEach(d => {

            const opt = document.createElement('option');

            opt.value = d;

            opt.textContent = d;

            filterDomainEl.appendChild(opt);

        });

    }



    // Filter for new registrations (pending_verification)

    const filtered = interns.filter(i => {

        const matchStatus = i.status === 'pending_verification';

        const matchSearch = !search ||

            i.name.toLowerCase().includes(search) ||

            String(i.id || '').toLowerCase().includes(search) ||

            String(i.mobile).includes(search);

        const matchDomain = !filterDomain || i.domain === filterDomain;



        return matchStatus && matchSearch && matchDomain;

    });



    // Sort by oldest first (default array order)

    // filtered.reverse(); // Removed to show oldest first



    if (filtered.length === 0) {

        body.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-muted);">No new registrations found.</td></tr>';

        return;

    }



    body.innerHTML = filtered.map(i => {

        const date = i.joinedDate || 'N/A';

        // Safe check for ID

        const displayId = i.id || 'Pending';



        return `

        <tr>

            <td>${formatFriendlyDate(date)}</td>

            <td>

                <strong>${i.name}</strong><br>

                <span style="font-size: 0.85rem; color: var(--text-muted);">ID: ${displayId}</span>

            </td>

            <td>

                <div style="font-size: 0.9rem;">

                    <div><i class="ph ph-envelope"></i> ${i.email}</div>

                    <div><i class="ph ph-phone"></i> ${i.mobile}</div>

                </div>

            </td>

            <td><span class="badge badge-primary">${i.domain}</span></td>

            <td><span class="badge badge-warning">Pending Review</span></td>

            <td>

                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">

                    <button class="btn" style="background: #10B981; color: white; padding: 0.4rem 0.8rem; font-size: 0.85rem;"

                        onclick="approveRegistration('${i.email}', '${i.domain}', this)">

                        <i class="ph ph-check-circle"></i> Approve & Onboard

                    </button>

                    <button class="btn" style="background: #EF4444; color: white; padding: 0.4rem 0.8rem; font-size: 0.85rem;"

                        onclick="markNotInterested('${i.email}', '${i.domain}', this)">

                        <i class="ph ph-x"></i> Not Interested

                    </button>

                </div>

            </td>

        </tr>

    `}).join('');

}



function markInterested(id) {
    const intern = DB.get('interns').find(i => String(i.id) === String(id));
    if (!intern) return;
    showToast('Marked as potentially interested.');
}





function toggleActionMenu(e, id) {

    e.stopPropagation();

    const menu = document.getElementById(`menu-${id}`);

    const btn = e.currentTarget;



    // Close all other menus

    document.querySelectorAll('.action-menu').forEach(m => {

        if (m.id !== `menu-${id}`) m.classList.remove('show');

    });

    document.querySelectorAll('.dots-btn').forEach(b => {

        if (b !== btn) b.classList.remove('active');

    });



    menu.classList.toggle('show');

    btn.classList.toggle('active');

}



// Close dropdowns on outside click

window.addEventListener('click', () => {

    document.querySelectorAll('.action-menu').forEach(m => m.classList.remove('show'));

    document.querySelectorAll('.dots-btn').forEach(b => b.classList.remove('active'));

});



function addCertificate(id) {

    const url = prompt('Enter Certificate Link (PDF/URL):');

    if (url) {

        DB.updateIntern(id, {

            certificateUrl: url,

            certRequestStatus: 'issued'

        });

        refreshDashboard();

        showToast('Certificate issued successfully!');

        const intern_c = DB.get('interns').find(i => String(i.id) === String(id));

        // Notification removed

    }

}





function updateOfferLetter(id) {

    const intern = DB.get('interns').find(i => String(i.id) === String(id));

    if (!intern) return;



    const currentUrl = intern.offerLetterUrl || '';

    const url = prompt('Enter Offer Letter Link (PDF/URL):', currentUrl);

    if (url !== null) {

        if (url) {

            DB.updateIntern(id, {

                offerLetterUrl: url,

                offerApproved: true

            });



            refreshDashboard();

            showToast('Offer Letter updated and automatically approved!');

            // Notification removed

        }

    }

}



function editFee(id) {

    const intern = DB.get('interns').find(i => String(i.id) === String(id));

    if (!intern) return;



    const currentAmount = intern.feeAmount || 100;

    const newAmount = prompt('Enter new Fee Amount (₹):', currentAmount);

    if (newAmount !== null) {

        const amount = parseFloat(newAmount);

        if (!isNaN(amount)) {

            DB.updateIntern(id, { feeAmount: amount });

            refreshDashboard();

            showToast('Fee amount updated successfully!');

        } else {

            showToast('Please enter a valid number.', 'error');

        }

    }

}



function markDropped(id) {

    if (confirm('Mark this intern as Dropped Out?')) {

        DB.updateIntern(id, { status: 'dropped' });

        refreshDashboard();

    }

}



function markActive(id) {

    if (confirm('Mark this intern as Active again?')) {

        DB.updateIntern(id, { status: 'active' });

        refreshDashboard();

    }

}



function renderPaymentAlerts() {
    let interns = DB.get('interns') || [];
    const body = document.getElementById('paymentAlertsTableBody');
    if (!body) return;
    
    const now = Date.now();
    const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
    const allSubmissions = DB.get('submissions') || [];

    let pendingAlerts = interns.filter(i => {
        if (i.status === 'dropped') return false; // Exclude dropped students
        if (i.paymentStatus === 'verified' || i.paymentStatus === 'pending' || i.paymentStatus === 'rejected') return false;
        const tasks = DB.getInternTasks(i.id, i.domain) || [];
        const coreTasks = tasks.filter(t => !t.isCertificateTask);
        if (coreTasks.length === 0) return false;
        const approvedCoreTasks = coreTasks.filter(t => t.status === 'approved');
        if (approvedCoreTasks.length !== coreTasks.length) return false;

        // Find the timestamp of the most recently approved core task submission
        const mySubs = allSubmissions.filter(s =>
            String(s.internId) === String(i.id) &&
            s.status === 'approved' &&
            coreTasks.some(t => String(t.id) === String(s.taskId))
        );
        if (mySubs.length === 0) return true; // No timestamp data — show anyway

        const latestApprovalTime = Math.max(...mySubs.map(s => new Date(s.timestamp || 0).getTime()));
        // Only show if became eligible within the last 3 days
        return (now - latestApprovalTime) <= threeDaysMs;
    });

    const badge = document.getElementById('badgePaymentAlerts');
    if (badge) {
        badge.innerText = pendingAlerts.length;
        badge.style.display = pendingAlerts.length > 0 ? 'inline-flex' : 'none';
    }

    if (pendingAlerts.length === 0) {
        body.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-muted)"><i class="ph ph-check-circle" style="font-size: 1.5rem; color: #10B981; vertical-align: middle; margin-right: 0.5rem;"></i>No pending payment reminders!</td></tr>';
        return;
    }

    body.innerHTML = pendingAlerts.map(i => {
        const waMsg = `Hey *${i.name}*! 👋 Super proud of you for smashing all your core tasks for the *${i.domain}* internship at Thiranex! 🚀 You're just one tiny step away from your verified certificate! 🏆 Please complete your certification validation from your dashboard to unlock it instantly. Let's finish this journey strong! 💪🔥 Log in here: https://www.thiranex.in/student-login.html`;
        
        return `
            <tr style="border-bottom: 1px solid var(--border);">
                <td><strong>${i.id}</strong></td>
                <td>
                    <div style="font-weight: 700; color: var(--text-main);">${i.name}</div>
                    <div style="font-size: 0.75rem; color: var(--primary); font-weight: 600;">${i.domain}</div>
                </td>
                <td>
                    <div style="font-size: 0.85rem; font-weight: 600;">${i.mobile}</div>
                    <div style="font-size: 0.7rem; color: #64748b;">${i.email || ''}</div>
                </td>
                <td>
                   <span class="badge" style="background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; padding: 4px 8px; font-weight: 600;">${i.batch || 'N/A'}</span>
                </td>
                <td>
                    <button class="btn" style="background: #25D366; color: white; padding: 0.5rem 1rem; border-radius: 8px; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 0.5rem; box-shadow: 0 4px 12px rgba(37, 211, 102, 0.25); font-weight: 700; transform: scale(1); transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'" onclick="openWhatsApp('${i.mobile}', '${waMsg.replace(/'/g, "\\'")}')">
                        <i class="ph-fill ph-whatsapp-logo" style="font-size: 1.1rem;"></i> Remind
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function renderPayments() {

    let interns = DB.get('interns').filter(i => (i.paymentStatus === 'pending' || i.paymentStatus === 'rejected') && i.status !== 'dropped');

    const body = document.getElementById('paymentTableBody');



    // Sort: Pending first, then by timestamp (newest first)

    interns.sort((a, b) => {

        if (a.paymentStatus === 'pending' && b.paymentStatus !== 'pending') return -1;

        if (a.paymentStatus !== 'pending' && b.paymentStatus === 'pending') return 1;



        // If same status, sort by newest time

        const timeA = new Date(a.paymentTimestamp || 0).getTime();

        const timeB = new Date(b.paymentTimestamp || 0).getTime();

        return timeB - timeA;

    });



    if (interns.length === 0) {

        body.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-muted)"><i class="ph ph-check-circle" style="font-size: 1.5rem; color: #10B981; vertical-align: middle; margin-right: 0.5rem;"></i>All payments verified  nothing pending!</td></tr>';

        return;

    }



    body.innerHTML = interns.map(i => {

        let statusBadge = '';

        let actions = '';



        if (i.paymentStatus === 'verified') {

            statusBadge = '<span class="badge badge-success">Verified</span>';

            actions = '<span style="color: var(--success); font-size: 0.8rem;"><i class="ph-fill ph-check-circle"></i> Verification Done</span>';

        } else if (i.paymentStatus === 'rejected') {

            statusBadge = '<span class="badge badge-danger">Rejected</span>';

            actions = `<button class="btn" style="background: #DCFCE7; color: #166534; padding: 0.4rem 0.8rem;" onclick="verifyPayment('${i.id}', 'verified')">Re-verify & Approve</button>`;

        } else {

            statusBadge = '<span class="badge badge-warning">Pending</span>';

            actions = `

                <div style="display: flex; gap: 0.5rem;">

                    <button class="btn" style="background: #FEE2E2; color: #991B1B; padding: 0.4rem 0.8rem;" onclick="verifyPayment('${i.id}', 'rejected')">Reject</button>

                    <button class="btn" style="background: #DCFCE7; color: #166534; padding: 0.4rem 0.8rem;" onclick="verifyPayment('${i.id}', 'verified')">Approve</button>

                </div>

            `;

        }



        return `

            <tr>

                <td><strong>${i.name}</strong><br><small>${i.domain}</small></td>

                <td><code style="font-size: 1.1rem; color: var(--primary); font-weight: bold;">${i.paymentRef || 'N/A'}</code></td>

                <td><span class="revenue-amount">? ${i.feeAmount || 0}</span></td>

                <td>${statusBadge}</td>

                <td>${actions}</td>

            </tr>

        `;

    }).join('');

}



async function verifyPayment(id, status) {
    const intern = DB.get('interns').find(i => String(i.id) === String(id));

        if (intern) {
            let msg = "";
            const tasks = DB.getInternTasks(id, intern.domain);
            const coreTasks = tasks.filter(t => !t.isCertificateTask);
            const approvedCoreCount = coreTasks.filter(t => t.status === 'approved').length;
            const allCoreDone = (approvedCoreCount === coreTasks.length && coreTasks.length > 0);

            if (status === 'verified') {
                if (allCoreDone) {
                    msg = `Hey *${intern.name}*! ✅ Awesome news! Your final payment for the *${intern.domain}* internship is now VERIFIED! 🎊 Your hard work has fully paid off. 🏆 Now, simply head over to your dashboard and click "Request Certificate" to receive your official Thiranex credentials! 🎓✨ Log in at: https://www.thiranex.in/student-login.html Regards, THIRANEX.`;
                } else {
                    msg = `Hey *${intern.name}*! ✅ Awesome news! Your payment for the *${intern.domain}* internship is now VERIFIED! 🎊 You can now jump straight into your tasks and download your official offer letter from the dashboard. Let's start this journey! 🚀✨ Log in at: https://www.thiranex.in/student-login.html Regards, THIRANEX.`;
                }
            } else if (status === 'rejected') {
                msg = `Hi *${intern.name}*! 💡 We had a small issue verifying your payment for *${intern.domain}*. 🧐 Please double-check your transaction ID and re-upload the correct screenshot in your dashboard so we can get you started ASAP! 🚀 Log in here: https://www.thiranex.in/student-login.html Regards, THIRANEX.`;
            }
            // Notification removed as per request
        }

    if (await DB.verifyPayment(id, status)) {
        refreshDashboard();
        showToast(`Payment ${status === 'verified' ? 'approved' : 'rejected'} successfully.`);
    }
}






function renderApprovals() {

    const submissions = DB.get('submissions').filter(s => s.status === 'pending');

    const interns = DB.get('interns');

    const certRequests = interns.filter(i => i.certRequestStatus === 'requested' && i.paymentStatus === 'verified');

    const placeholder = document.getElementById('approvalsPlaceholder');



    let html = '';



    // Task Submissions Section

    if (submissions.length > 0) {

        html += `

            <h4 style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; color: var(--warning);">

                <i class="ph ph-stack"></i> Task Submissions (${submissions.length})

            </h4>

        `;

        html += submissions.map(s => {

            const intern = interns.find(i => String(i.id) === String(s.internId));

            if (!intern) return '';

            const task = DB.getInternTasks(intern.id, intern.domain).find(t => String(t.id) === String(s.taskId));

            return `

                <div class="card" style="margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center; gap: 1.5rem; ${intern.status === 'dropped' ? 'opacity: 0.7; border-left: 4px solid #94A3B8;' : ''}">

                    <div style="flex: 1; min-width: 0;">

                        <h4 style="margin-bottom: 0.2rem;">${task ? task.title : 'Unknown Task'}</h4>

                        <p class="text-muted" style="font-size: 0.9rem;">Submitted by <strong>${intern.name}</strong> (${intern.domain})${intern.status === 'dropped' ? ' <span class="badge" style="background: #94A3B8; color: white; font-size: 0.7rem; padding: 0.1rem 0.4rem;">Dropped</span>' : ''}</p>

                        <p style="margin-top: 0.5rem;"><a href="${s.proof}" target="_blank" style="color: var(--primary); font-weight: 500;"><i class="ph ph-link"></i> View Submission Link</a></p>

                    </div>

                    <div style="display: flex; gap: 0.5rem; flex-shrink: 0;">

                        <button class="btn" style="background: #FEE2E2; color: #991B1B;" onclick="rejectTask('${s.internId}', '${s.taskId}')">Reject</button>

                        <button class="btn" style="background: #DCFCE7; color: #166534;" onclick="approveAction('${s.internId}', '${s.taskId}')">Approve & Unlock Next</button>

                    </div>

                </div>

            `;

        }).join('');

    } else {

        html += '<div class="card" style="text-align: center; padding: 3rem; color: var(--text-muted);">No pending task submissions.</div>';

    }



    // Certificate Requests Section

    if (certRequests.length > 0) {

        html += `

            <h4 style="display: flex; align-items: center; gap: 0.5rem; margin-top: 2rem; margin-bottom: 1rem; color: var(--primary);">

                <i class="ph ph-certificate"></i> Certificate Requests (${certRequests.length})

            </h4>

        `;

        html += certRequests.map(i => `

            <div class="card" style="margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center; gap: 1.5rem; border-left: 4px solid var(--primary);">

                <div style="flex: 1; min-width: 0;">

                    <h4 style="margin-bottom: 0.2rem;">Certificate Requested</h4>

                    <p class="text-muted" style="font-size: 0.9rem;"><strong>${i.name}</strong> (${i.domain}) has completed all tasks.</p>

                </div>

                <div style="display: flex; gap: 0.5rem; flex-shrink: 0;">

                    <button class="btn" style="background: #3B82F6; color: white;" onclick="addCertificate('${i.id}')">

                        <i class="ph ph-plus-circle"></i> Issue Certificate

                    </button>

                </div>

            </div>

        `).join('');

    }



    placeholder.innerHTML = html;

}



async function approveOfferLetter(id, btn) {

    const intern = DB.get('interns').find(i => String(i.id) === String(id));

    if (!intern) return;



    // Removed confirm as per user request





    const originalHTML = btn.innerHTML;

    btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Approving...';

    btn.disabled = true;



    try {

        // Update in DB using the centralized method

        // Updated: WhatsApp notification removed
        await DB.updateInternProfile(id, { offerApproved: true });



        showToast("Offer letter approved!");

        

        renderOfferTab(); // Refresh the tab list

        refreshDashboard(); // Update counts

    } catch (e) {

        showToast("Error: " + e.message, 'error');

    } finally {



        btn.innerHTML = originalHTML;

        btn.disabled = false;

    }

}



async function approveInternCertificate(id, btn) {
    const _i = DB.get('interns').find(i => String(i.id) === String(id));
    // Notification removed

    const intern = DB.get('interns').find(i => String(i.id) === String(id));

    if (!intern) return;



    const originalHTML = btn.innerHTML;

    btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Approving...';

    btn.disabled = true;





    try {

        // Update in DB

        DB.updateIntern(id, {

            certRequestStatus: 'issued',

            certApproved: true

        });



        showToast("Certificate approved!");

        

        refreshDashboard();

    } catch (err) {

        console.error(err);

        showToast("Failed to approve certificate.", "error");

    } finally {

        btn.innerHTML = originalHTML;

        btn.disabled = false;

    }

}



async function approveAction(iId, tId) {

    const intern = DB.get('interns').find(i => String(i.id) === String(iId));



    // 1. Update Database First

    await DB.approveTask(iId, tId);

    refreshDashboard();



    // 2. Push Notification (removed)

    if (intern) {

        showToast('Task approved.'); // Adjusted message

        const tasks = DB.getInternTasks(iId, intern.domain);
        const task = tasks.find(t => String(t.id) === String(tId));
        const taskTitle = task ? task.title : "Task";

        const coreOnly = tasks.filter(t => !t.isCertificateTask);
        const approvedCoreCount = coreOnly.filter(t => t.status === 'approved').length;
        const allCoreDone = (approvedCoreCount === coreOnly.length && coreOnly.length > 0);

        if (allCoreDone) {
            // Notification removed
        } else {
            // Notification removed
        }

    } else {

        showToast('Task approved successfully.');

    }

}





async function rejectTask(iId, tId) {
    const intern = DB.get('interns').find(i => String(i.id) === String(iId));

    // 1. Update Database
    await DB.rejectTask(iId, tId);
    refreshDashboard();

    // 2. Notification
    if (intern) {
        showToast('Task rejected with feedback.');
        const task = DB.getInternTasks(iId, intern.domain).find(t => String(t.id) === String(tId));
        const taskTitle = task ? task.title : "Task";

        // Notification removed
    } else {
        showToast('Task status updated successfully.');
    }
}






// ============================================================

// BULK SELECTION LOGIC

// ============================================================

function toggleSelectAll(master) {

    const checkboxes = document.querySelectorAll('.intern-checkbox');

    checkboxes.forEach(cb => {

        cb.checked = master.checked;

    });

    updateBulkUI();

}



function updateBulkUI() {

    const checkboxes = document.querySelectorAll('.intern-checkbox:checked');

    const bulkBar = document.getElementById('bulkActionsInterns');

    const countText = document.getElementById('selectedCountText');

    

    if (bulkBar && countText) {

        if (checkboxes.length > 0) {

            bulkBar.style.display = 'flex';

            countText.innerText = `${checkboxes.length} Student${checkboxes.length > 1 ? 's' : ''} Selected`;

        } else {

            bulkBar.style.display = 'none';

            if (document.getElementById('selectAllInterns')) {

                document.getElementById('selectAllInterns').checked = false;

            }

        }

    }

}



function deselectAll() {

    const master = document.getElementById('selectAllInterns');

    if (master) {

        master.checked = false;

        toggleSelectAll(master);

    }

}



function bulkMarkDropped() {

    const checkboxes = document.querySelectorAll('.intern-checkbox:checked');

    if (checkboxes.length === 0) return;



    if (confirm(`Are you sure you want to mark ${checkboxes.length} selected students as DROPPED?`)) {

        checkboxes.forEach(cb => {

            const id = cb.value;

            DB.updateIntern(id, { status: 'dropped' });

        });

        

        showToast(`Successfully marked ${checkboxes.length} students as dropped.`);

        deselectAll();

        refreshDashboard();

    }

}



function bulkMarkActive() {

    const checkboxes = document.querySelectorAll('.intern-checkbox:checked');

    if (checkboxes.length === 0) return;



    if (confirm(`Mark ${checkboxes.length} selected students as ACTIVE again?`)) {

        checkboxes.forEach(cb => {

            const id = cb.value;

            DB.updateIntern(id, { status: 'active' });

        });

        

        showToast(`Successfully marked ${checkboxes.length} students as active.`);

        deselectAll();

        refreshDashboard();

    }

}





window.openModal = function (id) {

    const modal = document.getElementById(id);

    if (modal) {

        modal.style.display = 'flex';

        if (id === 'internModal') {

            // Set default batch values

            const today = new Date();

            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

            const mon = months[today.getMonth()];

            const year = today.getFullYear();



            // Always set current month/year and generate ID

            document.getElementById('iMonth').value = mon;

            document.getElementById('iYear').value = String(year);



            // Auto-generate Intern ID

            generateInternId();

        }

    } else {

        console.error("Modal not found: " + id);

    }

};



window.closeModal = function (id) {

    const modal = document.getElementById(id);

    if (modal) {

        modal.style.display = 'none';

        // Reset form when closing intern modal

        if (id === 'internModal') {

            document.getElementById('addInternForm').reset();

        }

    }

};

function closeModal(id) {

    const modal = document.getElementById(id);

    if (modal) {

        modal.style.display = 'none';

        if (id === 'internModal') {

            document.getElementById('addInternForm').reset();

        }

    }

}







function generateInternId() {

    const month = document.getElementById('iMonth').value.toUpperCase();

    const cycle = document.getElementById('iCycle').value;

    const yearFull = document.getElementById('iYear').value;

    const yearShort = yearFull.slice(-2);



    // Format: THX-MMM[Cycle]YY-

    const prefix = `THX-${month}${cycle}${yearShort}-`;



    // Find existing IDs with this prefix to determine the sequence number

    const interns = DB.get('interns');

    let maxSeq = 0;



    interns.forEach(i => {

        if (i.id && i.id.startsWith(prefix)) {

            const parts = i.id.split('-');

            if (parts.length === 3) {

                const seq = parseInt(parts[2]);

                if (!isNaN(seq) && seq > maxSeq) {

                    maxSeq = seq;

                }

            }

        }

    });



    const nextSeq = maxSeq + 1;

    const seqStr = String(nextSeq).padStart(3, '0');



    document.getElementById('iId').value = `${prefix}${seqStr}`;

}



document.getElementById('addInternForm').addEventListener('submit', function (e) {

    e.preventDefault();

    const interns = DB.get('interns');



    const id = document.getElementById('iId').value.trim();

    const email = document.getElementById('iEmail').value.trim();

    const mobile = document.getElementById('iMobile').value.trim();



    const duplicate = interns.find(i =>

        String(i.id) === String(id) ||

        i.email.toLowerCase().trim() === email.toLowerCase() ||

        String(i.mobile).replace(/\D/g, '') === String(mobile).replace(/\D/g, '')

    );



    if (duplicate) {

        alert(`Error: Duplicate found!\nIntern ID, Email, or Mobile matches existing intern: ${duplicate.name}`);

        return;

    }



    const newIntern = {

        id: id,

        name: document.getElementById('iName').value,

        email: document.getElementById('iEmail').value,

        mobile: document.getElementById('iMobile').value,

        domain: document.getElementById('iDomain').value,

        batch: `${document.getElementById('iYear').value}-${document.getElementById('iMonth').value}-${document.getElementById('iCycle').value === '1' ? '01' : '15'}`,

        feeAmount: parseFloat(document.getElementById('iAmount').value) || 0,

        offerLetterUrl: document.getElementById('iOffer').value || '',

        status: 'active',

        paymentStatus: 'unpaid',

        offerApproved: false

    };

    interns.push(newIntern);

    DB.set('interns', interns);

    closeModal('internModal');

    refreshDashboard();

    this.reset();

});



function deleteIntern(id) {

    if (confirm('Are you sure you want to delete this intern? This action cannot be undone.')) {

        const interns = DB.get('interns').filter(i => String(i.id) !== String(id));

        DB.set('interns', interns);



        // Also clean up their submissions

        const subs = DB.get('submissions').filter(s => String(s.internId) !== String(id));

        DB.set('submissions', subs);



        refreshDashboard();

    }

}



// Domain Management Functions

let editingDomain = null;

let taskCounter = 0;



function renderDomains() {

    const domains = DB.getDomains();

    const body = document.getElementById('domainTableBody');



    const domainNames = Object.keys(domains);



    if (domainNames.length === 0) {

        body.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 2rem; color: var(--text-muted)">No domains found. Add your first domain!</td></tr>';

        return;

    }



    body.innerHTML = domainNames.map(name => {

        const tasks = domains[name];

        return `

            <tr>

                <td><strong>${name}</strong></td>

                <td><span class="badge badge-primary">${tasks.length} Tasks</span></td>

                <td>

                    <div style="display: flex; gap: 0.5rem;">

                        <button class="btn" style="background: var(--primary-light); color: var(--primary); padding: 0.4rem 0.8rem;" onclick="editDomain('${name}')">

                            <i class="ph ph-pencil"></i> Edit

                        </button>

                        <button class="btn" style="background: #FEE2E2; color: #991B1B; padding: 0.4rem 0.8rem;" onclick="deleteDomain('${name}')">

                            <i class="ph ph-trash"></i> Delete

                        </button>

                    </div>

                </td>

            </tr>

        `;

    }).join('');

}



function editDomain(domainName) {

    editingDomain = domainName;

    const domains = DB.getDomains();

    const tasks = domains[domainName];



    document.getElementById('domainModalTitle').innerText = 'Edit Domain';

    document.getElementById('domainName').value = domainName;



    // Clear and populate tasks

    const container = document.getElementById('tasksContainer');

    container.innerHTML = '';

    taskCounter = 0;



    tasks.forEach((task, index) => {

        // Map legacy 'desc' to 'objective' if objective is missing

        const objective = task.objective || task.desc || '';

        addTaskField(task.title, objective, task.feature, task.outcome);

    });



    openModal('domainModal');

}



function deleteDomain(domainName) {

    if (confirm(`Are you sure you want to delete the domain "${domainName}"? This will remove all tasks associated with it.`)) {

        DB.deleteDomain(domainName);

        refreshDashboard();

        updateDomainDropdowns();

        alert('Domain deleted successfully!');

    }

}



function addTaskField(title = '', objective = '', feature = '', outcome = '') {

    taskCounter++;

    const container = document.getElementById('tasksContainer');

    const taskDiv = document.createElement('div');

    taskDiv.className = 'task-field';

    taskDiv.id = `task-${taskCounter}`;

    taskDiv.style.cssText = 'border: 1px solid var(--border); border-radius: 8px; padding: 1rem; margin-bottom: 1rem; position: relative; background: #f8fafc;';



    // Process existing features

    // Process existing features (Prioritize newline split to preserve commas in sentences)

    let existingFeatures = [];

    if (feature) {

        const fStr = String(feature);

        // If it contains newlines, it's definitely our new format -> split by newline only

        if (fStr.includes('\n')) {

            existingFeatures = fStr.split('\n').map(f => f.trim()).filter(f => f);

        }

        // If no newlines but has commas, it might be legacy -> split by comma

        else if (fStr.includes(',')) {

            existingFeatures = fStr.split(',').map(f => f.trim()).filter(f => f);

        }

        // Single line, no comma

        else {

            existingFeatures = [fStr.trim()];

        }

    }

    if (existingFeatures.length === 0) existingFeatures = [''];

    if (existingFeatures.length === 0) existingFeatures = [''];



    let featureInputsHtml = existingFeatures.map((feat, i) => `

        <div class="feature-row" style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">

            <input type="text" class="form-input feature-item" placeholder="Add a feature point" value="${feat}" required>

            ${i > 0 || existingFeatures.length > 1 ? `<button type="button" class="btn" style="padding: 0.4rem; background: #FEE2E2; color: #991B1B;" onclick="this.parentElement.remove()"><i class="ph ph-minus"></i></button>` : ''}

        </div>

    `).join('');



    taskDiv.innerHTML = `

        <button type="button" onclick="removeTaskField('task-${taskCounter}')" style="position: absolute; top: 0.5rem; right: 0.5rem; background: #FEE2E2; color: #991B1B; border: none; border-radius: 4px; padding: 0.3rem 0.5rem; cursor: pointer;">

            <i class="ph ph-x"></i>

        </button>

        <div class="form-group">

            <label>Task Title</label>

            <input type="text" class="form-input task-title" placeholder="e.g. HTML/CSS Basics" value="${title}" required>

        </div>

        <div class="form-group">

            <label>Objective</label>

            <textarea class="form-input task-objective" rows="2" placeholder="What is the main goal of this task?" required>${objective}</textarea>

        </div>

        <div class="form-group">

            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">

                <label>Key Features (Bullet Points)</label>

                <button type="button" class="btn" style="font-size: 0.8rem; padding: 0.2rem 0.6rem; background: var(--primary-light); color: var(--primary);" onclick="addFeatureRow('features-${taskCounter}')">

                    <i class="ph ph-plus"></i> Add Point

                </button>

            </div>

            <div id="features-${taskCounter}">

                ${featureInputsHtml}

            </div>

        </div>

        <div class="form-group">

            <label>Outcome</label>

            <textarea class="form-input task-outcome" rows="2" placeholder="Expected result or deliverables" required>${outcome}</textarea>

        </div>

    `;



    container.appendChild(taskDiv);

}



function addFeatureRow(containerId) {

    const container = document.getElementById(containerId);

    const div = document.createElement('div');

    div.className = 'feature-row';

    div.style.cssText = 'display: flex; gap: 0.5rem; margin-bottom: 0.5rem;';

    div.innerHTML = `

        <input type="text" class="form-input feature-item" placeholder="Add a feature point" required>

        <button type="button" class="btn" style="padding: 0.4rem; background: #FEE2E2; color: #991B1B;" onclick="this.parentElement.remove()"><i class="ph ph-minus"></i></button>

    `;

    container.appendChild(div);

}



function removeTaskField(id) {

    document.getElementById(id).remove();

}



function renderOfferTab() {

    const interns = DB.get('interns');

    const search = document.getElementById('offerSearch').value.toLowerCase();

    const body = document.getElementById('offerTableBody');



    // Logic: Interns who are verified (registration) but offer not yet approved

    const filtered = interns.filter(i => {

        if (!i.id || i.status !== 'active') return false;

        if (i.offerApproved) return false;

        if (i.status === 'dropped') return false;

        

        const query = search.trim();

        const name = (i.name || '').toLowerCase();

        const internId = String(i.id).toLowerCase();

        

        return !query || name.includes(query) || internId.includes(query);

    });



    if (filtered.length === 0) {

        body.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-muted);">No pending offer letters to approve.</td></tr>';

        return;

    }



    body.innerHTML = filtered.map(i => `

        <tr>

            <td><strong>${i.id}</strong></td>

            <td>${i.name}</td>

            <td>${i.domain}</td>

            <td><span class="badge badge-warning">Pending Approval</span></td>

            <td>

                <button class="btn btn-primary" onclick="approveOfferLetter('${i.id}', this)">

                    <i class="ph ph-check-circle"></i> Approve Offer

                </button>

            </td>

        </tr>

    `).join('');

}



function renderCertTab() {

    const interns = DB.get('interns');

    const search = (document.getElementById('certSearch').value || '').toLowerCase().trim();

    const filter = document.getElementById('certFilterStatus').value;

    const body = document.getElementById('certTableBody');

    const pendingPlaceholder = document.getElementById('pendingCertPlaceholder');



    // The list will now be purely table-based to match the offer letter workflow

    pendingPlaceholder.innerHTML = '';



    let filtered = interns.filter(i => {

        if (!i.id) return false;

        const matchSearch = !search || i.name.toLowerCase().includes(search) || String(i.id).toLowerCase().includes(search);



        const tasks = DB.getInternTasks(i.id, i.domain).filter(t => !t.isCertificateTask);

        const completed = tasks.filter(t => t.status === 'approved').length;

        const total = tasks.length > 0 ? tasks.length : 1;

        const progress = (completed / total) * 100;

        const isDone = completed === tasks.length;



        let matchFilter = true;

        if (filter === 'requested') matchFilter = i.certRequestStatus === 'requested' && i.paymentStatus === 'verified' && !i.certApproved && i.status !== 'dropped';

        if (filter === 'ready') matchFilter = isDone && i.paymentStatus === 'verified' && !i.certApproved && i.status !== 'dropped' && i.certRequestStatus !== 'requested';

        if (filter === 'issued') matchFilter = !!i.certificateUrl || !!i.certApproved;



        return matchSearch && matchFilter;

    });



    if (filtered.length === 0) {

        body.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-muted);">No interns found matching criteria.</td></tr>';

        return;

    }



    body.innerHTML = filtered.map(i => {

        const tasks = DB.getInternTasks(i.id, i.domain).filter(t => !t.isCertificateTask);

        const completed = tasks.filter(t => t.status === 'approved').length;

        const total = tasks.length > 0 ? tasks.length : 1;

        const progress = Math.round((completed / total) * 100);

        const isDone = completed === tasks.length;



        const status = (i.certificateUrl || i.certApproved) ?

            `<span class="badge badge-success">Approved</span>` :

            (isDone && i.paymentStatus === 'verified' ? `<span class="badge badge-warning">Ready</span>` : `<span class="badge badge-danger">Learning</span>`);



        return `

            <tr>

                <td>${i.id}</td>

                <td><strong>${i.name}</strong></td>

                <td>${i.domain}</td>

                <td>

                    <div style="width: 100px; height: 8px; background: #E2E8F0; border-radius: 4px; overflow: hidden;">

                        <div style="width: ${progress}%; height: 100%; background: var(--primary);"></div>

                    </div>

                    <small>${completed}/${tasks.length} Tasks</small>

                </td>

                <td>${status}</td>

                <td>

                    ${(i.certificateUrl || i.certApproved) ? `

                        <button class="btn" style="padding: 0.4rem 0.8rem; font-size: 0.85rem; background: #64748b; color: white;" 

                            onclick="generateInternCertificate('${i.id}', this)">

                            <i class="ph ph-file-pdf"></i> View/Generate

                        </button>

                    ` : `

                        <button class="btn btn-primary" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;" 

                            onclick="approveInternCertificate('${i.id}', this)" ${(i.status === 'dropped' || !isDone || i.paymentStatus !== 'verified') ? 'disabled' : ''}>

                            <i class="ph ph-check-circle"></i> Approve

                        </button>

                    `}

                </td>

            </tr>

        `;

    }).join('');

}



async function getLogoBase64() {

    try {

        const response = await fetch('thiranex-free-internship-with-certificate-logo.png');

        const blob = await response.blob();

        return new Promise((resolve) => {

            const reader = new FileReader();

            reader.onloadend = () => resolve(reader.result);

            reader.readAsDataURL(blob);

        });

    } catch (e) {

        console.error("Logo fetch failed", e);

        return null;

    }

}



async function getSignatureBase64() {

    try {

        const response = await fetch('signature.png');

        const blob = await response.blob();

        return new Promise((resolve) => {

            const reader = new FileReader();

            reader.onloadend = () => resolve(reader.result);

            reader.readAsDataURL(blob);

        });

    } catch (e) {

        console.error("Signature fetch failed", e);

        return null;

    }

}



async function getCEOSignatureBase64() {

    try {

        const response = await fetch('CEO_SIGNATURE.png');

        const blob = await response.blob();

        return new Promise((resolve) => {

            const reader = new FileReader();

            reader.onloadend = () => resolve(reader.result);

            reader.readAsDataURL(blob);

        });

    } catch (e) {

        console.error("CEO Signature fetch failed", e);

        return null;

    }

}



async function getMSMELogoBase64() {

    try {

        // Try local file first (Renamed for compatibility)

        console.log("Fetching local MSME logo...");

        const response = await fetch('msme-registered-internship-provider-logo.png');

        if (response.ok) {

            const blob = await response.blob();

            return await new Promise((resolve) => {

                const reader = new FileReader();

                reader.onloadend = () => resolve(reader.result);

                reader.readAsDataURL(blob);

            });

        }

        throw new Error("Local file not found or inaccessible");

    } catch (e) {

        console.warn("Local MSME Logo fetch failed, trying official fallback...", e);

        try {

            // Fallback to official Wikimedia mirror

            const response = await fetch('https://upload.wikimedia.org/wikipedia/en/thumb/0/0b/MSME_India_logo.png/600px-MSME_India_logo.png');

            const blob = await response.blob();

            return await new Promise((resolve) => {

                const reader = new FileReader();

                reader.onloadend = () => resolve(reader.result);

                reader.readAsDataURL(blob);

            });

        } catch (err) {

            console.error("All MSME Logo sources failed", err);

            return null;

        }

    }

}



async function generateInternCertificate(id, btnEl) {

    const intern = DB.get('interns').find(i => String(i.id) === String(id));

    if (!intern) return;



    const settings = DB.getSettings();



    if (!confirm(`Generate internship completion certificate for ${intern.name}?`)) return;



    const btn = btnEl || event.currentTarget;

    const originalText = btn.innerHTML;

    btn.innerHTML = '<i class="ph ph-spinner-gap anim-spin"></i> Generating...';

    btn.disabled = true;



    try {

        const logoBase64 = await getLogoBase64();

        const msmeBase64 = await getMSMELogoBase64();

        const sigBase64 = await getCEOSignatureBase64();



        // Derive Start and End dates from Batch if not explicitly stored

        let startDate = intern.startDate || "";

        let endDate = intern.endDate || "";



        if (!startDate && intern.batch) {

            const d = new Date(intern.batch);

            if (!isNaN(d.getTime())) {

                startDate = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

                // End date is roughly 1 month later

                const ed = new Date(d);

                ed.setMonth(ed.getMonth() + 1);

                ed.setDate(ed.getDate() - 1);

                endDate = ed.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

            }

        }



        const certData = {

            internId: intern.id,

            name: intern.name,

            domain: intern.domain,

            batch: formatBatchDate(intern.batch),

            start: startDate,

            end: endDate,

            logo: logoBase64,

            msmeLogo: msmeBase64,

            signature: sigBase64,

            companyName: 'THIRANEX',

            signatory: 'Hariharan M',

            signatoryTitle: 'Founder & CEO',

            templateText: 'This is to certify that {{name}} has successfully completed an internship in {{domain}} from {{start}} to {{end}}.'

        };



        const result = await DB.generateCertificate(certData);

        if (result.status === 'success' && result.base64) {

            // Trigger download

            const link = document.createElement('a');

            link.href = `data:application/pdf;base64,${result.base64}`;

            link.download = result.fileName || `Certificate_${intern.name.replace(/\s+/g, '_')}.pdf`;

            document.body.appendChild(link);

            link.click();

            document.body.removeChild(link);



            alert('Certificate generated and downloaded successfully!');

            DB.updateIntern(id, {

                certRequestStatus: 'issued',

                certApproved: true

            }); // Mark as issued and approved

            refreshDashboard();

        } else {

            throw new Error(result.message || 'Generation failed');

        }

    } catch (e) {

        console.error(e);

        alert('Error: ' + e.message);

    } finally {

        btn.innerHTML = originalText;

        btn.disabled = false;

    }

}











function renderReportsTab() {

    const interns = DB.get('interns');

    const batchFilter = document.getElementById('reportFilterBatch').value;

    const body = document.getElementById('reportTableBody');



    if (!batchFilter) {

        body.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 3rem; color: var(--text-muted);">Please select a batch to view the report preview.</td></tr>';

        // Reset stats

        document.getElementById('repStatMandatory').innerText = '0';

        document.getElementById('repStatT1').innerText = '0';

        document.getElementById('repStatT2').innerText = '0';

        document.getElementById('repStatT3').innerText = '0';

        document.getElementById('repStatT4').innerText = '0';

        document.getElementById('repStatCert').innerText = '0';

        document.getElementById('repStatPaid').innerText = '0';

        return;

    }



    const filtered = interns.filter(i => i.id && formatBatchDate(i.batch) === batchFilter && i.status !== 'dropped');



    // --- Calculate Stats ---

    let counts = { m: 0, t1: 0, t2: 0, t3: 0, t4: 0, c: 0, p: 0 };



    filtered.forEach(i => {

        const allTasks = DB.getInternTasks(i.id, i.domain);



        const mandatoryTask = allTasks.find(t => t.isMandatory); // Offer Task

        const certTask = allTasks.find(t => t.isCertificateTask);

        // Filter properly to get only domain tasks

        const domainTasks = allTasks.filter(t => !t.isMandatory && !t.isCertificateTask);



        if (mandatoryTask && mandatoryTask.status === 'approved') counts.m++;



        if (domainTasks[0] && domainTasks[0].status === 'approved') counts.t1++;

        if (domainTasks[1] && domainTasks[1].status === 'approved') counts.t2++;

        if (domainTasks[2] && domainTasks[2].status === 'approved') counts.t3++;

        if (domainTasks[3] && domainTasks[3].status === 'approved') counts.t4++;



        // Check approved status OR if certificate url exists (meaning issued)

        if (certTask && (certTask.status === 'approved' || i.certificateUrl || i.certApproved)) counts.c++;



        // Check Payment Status

        if (i.paymentStatus === 'verified') counts.p++;

    });



    document.getElementById('repStatMandatory').innerText = counts.m;

    document.getElementById('repStatT1').innerText = counts.t1;

    document.getElementById('repStatT2').innerText = counts.t2;

    document.getElementById('repStatT3').innerText = counts.t3;

    document.getElementById('repStatT4').innerText = counts.t4;

    document.getElementById('repStatCert').innerText = counts.c;

    document.getElementById('repStatPaid').innerText = counts.p;



    if (filtered.length === 0) {

        body.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-muted);">No active interns found for this batch.</td></tr>';

        return;

    }



    body.innerHTML = filtered.map(i => {

        const tasks = DB.getInternTasks(i.id, i.domain).filter(t => !t.isCertificateTask);

        const approvedCount = tasks.filter(t => t.status === 'approved').length;

        const isEligible = approvedCount === tasks.length && tasks.length > 0;

        const paymentStatus = i.paymentStatus === 'verified' ? '<span style="color: #166534; font-weight: 600;">PAID</span>' : '<span style="color: #991b1b;">UNPAID</span>';



        return `

            <tr>

                <td><strong>${i.name}</strong></td>

                <td>${i.id}</td>

                <td>${i.domain}</td>

                <td>${approvedCount} / ${tasks.length} Done</td>

                <td>

                    <span class="badge ${isEligible ? 'badge-success' : 'badge-danger'}">

                        ${isEligible ? 'Eligible' : 'Incomplete'}

                    </span>

                </td>

                <td>${paymentStatus}</td>

            </tr>

        `;

    }).join('');

}







async function generateBatchStatusImage() {

    const batchFilter = document.getElementById('reportFilterBatch').value;

    if (!batchFilter) {

        alert('Please select a batch first to generate the status card.');

        return;

    }



    // Helper to get logo base64 if not already present

    const getLogoBase64Local = async () => {

        // 1. Try to find the specific sidebar logo

        const sidebarLogo = document.querySelector('.sidebar img[src*="logo"]');

        if (sidebarLogo) return sidebarLogo.src;



        // 2. Try any logo

        const anyLogo = document.querySelector('img[src*="logo"], img[alt*="Thiranex"]');

        if (anyLogo) return anyLogo.src;



        return 'thiranex-free-internship-with-certificate-logo.png';

    };



    // Get counts from DOM

    const counts = {

        m: document.getElementById('repStatMandatory').innerText || '0',

        t1: document.getElementById('repStatT1').innerText || '0',

        t2: document.getElementById('repStatT2').innerText || '0',

        t3: document.getElementById('repStatT3').innerText || '0',

        t4: document.getElementById('repStatT4').innerText || '0',

        c: document.getElementById('repStatCert').innerText || '0',

        p: document.getElementById('repStatPaid').innerText || '0'

    };



    const canvas = document.createElement('canvas');

    const ctx = canvas.getContext('2d');



    // 9:16 Aspect Ratio (1080x1920)

    canvas.width = 1080;

    canvas.height = 1920;



    // 1. Background (White)

    ctx.fillStyle = '#FFFFFF';

    ctx.fillRect(0, 0, 1080, 1920);



    // No Blue Header Background (Removed)



    // Decorative shapes (subtle light blue for white theme)

    ctx.fillStyle = '#F0F9FF'; // Very light blue

    ctx.beginPath();

    ctx.arc(950, 100, 300, 0, Math.PI * 2);

    ctx.fill();

    ctx.beginPath();

    ctx.arc(100, 300, 150, 0, Math.PI * 2);

    ctx.fill();



    // 2. Load Logo

    try {

        const logoSrc = await getLogoBase64Local();

        if (logoSrc) {

            const img = new Image();

            img.crossOrigin = "Anonymous";

            img.src = logoSrc;



            await new Promise((resolve, reject) => {

                img.onload = resolve;

                img.onerror = () => reject(new Error('Image failed to load'));

            });



            // Draw Logo Centered Top

            const maxWidth = 500;

            const maxHeight = 150;

            let lw = img.width;

            let lh = img.height;

            const ratio = Math.min(maxWidth / lw, maxHeight / lh);

            lw = lw * ratio;

            lh = lh * ratio;



            // Center vertically in the top area ~150px

            ctx.drawImage(img, 540 - lw / 2, 120 - lh / 2, lw, lh);

        } else {

            throw new Error('No logo source found');

        }

    } catch (e) {

        console.warn("Could not load logo for canvas", e);

        // Fallback text (now Blue since bg is white)

        ctx.fillStyle = '#2563EB'; // Blue 600

        ctx.font = 'bold 70px "Segoe UI", sans-serif';

        ctx.textAlign = 'center';

        ctx.fillText('THIRANEX', 540, 150);

    }



    // Report Title (now Blue since bg is white)

    ctx.fillStyle = '#1E40AF'; // Dark Blue 800

    ctx.font = 'bold 60px "Segoe UI", sans-serif';

    ctx.textAlign = 'center';

    ctx.fillText('Daily Batch Report', 540, 260);



    // Batch Name (Dark Text below header)

    ctx.font = '600 50px "Segoe UI", sans-serif';

    ctx.fillStyle = '#1E293B'; // Slate 800

    ctx.fillText(batchFilter, 540, 450);



    // Date

    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

    ctx.font = '40px "Segoe UI", sans-serif';

    ctx.fillStyle = '#64748B'; // Slate 500

    ctx.fillText(today, 540, 520);



    // Divider line

    ctx.strokeStyle = '#E2E8F0';

    ctx.lineWidth = 3;

    ctx.beginPath();

    ctx.moveTo(100, 560);

    ctx.lineTo(980, 560);

    ctx.stroke();



    // 3. Stats Grid Layout

    const startY = 650;

    const gapY = 160;



    // Polyfill for roundRect

    if (typeof ctx.roundRect !== 'function') {

        ctx.roundRect = function (x, y, w, h, r) { ctx.rect(x, y, w, h); };

    }



    const items = [

        { label: 'Mandatory Task', count: counts.m, color: '#2563EB' }, // Blue

        { label: 'Task 1 Completed', count: counts.t1, color: '#EA580C' }, // Orange 600

        { label: 'Task 2 Completed', count: counts.t2, color: '#059669' }, // Emerald 600

        { label: 'Task 3 Completed', count: counts.t3, color: '#7C3AED' }, // Violet 600

        { label: 'Task 4 Completed', count: counts.t4, color: '#DB2777' }, // Pink 600

        { label: 'Certified Graduates', count: counts.c, color: '#DC2626' }, // Red 600

        { label: 'Paid Interns', count: counts.p, color: '#16A34A' }   // Green 600

    ];



    items.forEach((item, index) => {

        const y = startY + (index * gapY);



        // Item Box Background (Light Gray/Blue Tint)

        ctx.fillStyle = '#F8FAFC'; // Slate 50

        // Add Shadow simulation

        ctx.shadowColor = 'rgba(0,0,0,0.05)';

        ctx.shadowBlur = 15;

        ctx.shadowOffsetX = 0;

        ctx.shadowOffsetY = 5;



        ctx.beginPath();

        ctx.roundRect(100, y - 80, 880, 130, 20);

        ctx.fill();



        // Reset Shadow

        ctx.shadowColor = 'transparent';

        ctx.shadowBlur = 0;

        ctx.shadowOffsetX = 0;

        ctx.shadowOffsetY = 0;



        // Border?

        ctx.strokeStyle = '#E2E8F0';

        ctx.lineWidth = 2;

        ctx.stroke();



        // Left accent Pill

        ctx.fillStyle = item.color;

        ctx.beginPath();

        ctx.roundRect(120, y - 45, 10, 60, 5);

        ctx.fill();



        // Label (Left Aligned)

        ctx.textAlign = 'left';

        ctx.font = '600 45px "Segoe UI", sans-serif';

        ctx.fillStyle = '#334155'; // Slate 700

        ctx.fillText(item.label, 160, y + 5);



        // Count (Right Aligned)

        ctx.textAlign = 'right';

        ctx.font = 'bold 70px "Segoe UI", sans-serif';

        ctx.fillStyle = item.color; // Use accent color for number

        ctx.fillText(item.count, 920, y + 15);

    });





    // 4. Footer

    const footerY = 1800;

    ctx.textAlign = 'center';



    ctx.fillStyle = '#1E40AF'; // Dark Blue

    ctx.font = 'bold 45px "Segoe UI", sans-serif';

    ctx.fillText('THIRANEX EDUTECH', 540, footerY);



    ctx.font = '30px "Segoe UI", sans-serif';

    ctx.fillStyle = '#64748B';

    ctx.fillText('www.thiranex.in', 540, footerY + 50);





    // 5. Download

    // Polyfill for roundRect if needed, but modern browsers support it in Context2D

    // If ctx.roundRect is not a function, fallback to rect

    if (typeof ctx.roundRect !== 'function') {

        ctx.roundRect = function (x, y, w, h, r) { ctx.rect(x, y, w, h); };

    }



    try {

        const dataUrl = canvas.toDataURL('image/png');

        const link = document.createElement('a');

        link.download = `Batch_Report_${batchFilter.replace(/\s+/g, '_')}_${new Date().getTime()}.png`;

        link.href = dataUrl;

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

    } catch (e) {

        console.error("Canvas export failed", e);

        alert("Failed to generate image. Browser may restrict canvas export.");

    }

}



async function generateBatchReport() {

    const batchFilter = document.getElementById('reportFilterBatch').value;

    if (!batchFilter) {

        alert('Please select a batch first.');

        return;

    }



    const btn = document.getElementById('btnGenerateBatchReport');

    const originalText = btn.innerHTML;

    btn.innerHTML = '<i class="ph ph-spinner-gap anim-spin"></i> Generating Report...';

    btn.disabled = true;



    try {

        const interns = DB.get('interns').filter(i => i.id && formatBatchDate(i.batch) === batchFilter && i.status !== 'dropped');

        const logoBase64 = await getLogoBase64();



        // Find max domains tasks to create columns

        let maxTaskCount = 0;

        interns.forEach(i => {

            const tasks = DB.getInternTasks(i.id, i.domain).filter(t => !t.isCertificateTask);

            if (tasks.length > maxTaskCount) maxTaskCount = tasks.length;

        });



        // Prepare intern data with fixed-slot task statuses

        const reportInterns = interns.map(i => {

            const tasks = DB.getInternTasks(i.id, i.domain).filter(t => !t.isCertificateTask);

            const approvedCount = tasks.filter(t => t.status === 'approved').length;



            // Aligned task statuses: [Md, T1, T2, T3, T4...]

            // We map 'done' or 'pending' for each slot

            const rowStatuses = [];

            for (let idx = 0; idx < maxTaskCount; idx++) {

                if (tasks[idx]) {

                    rowStatuses.push(tasks[idx].status === 'approved' ? 'done' : 'pending');

                } else {

                    rowStatuses.push('n/a');

                }

            }



            return {

                name: i.name,

                id: i.id,

                domain: i.domain,

                isEligible: approvedCount === tasks.length && tasks.length > 0,

                paymentStatus: i.paymentStatus === 'verified' ? 'paid' : 'unpaid',

                taskResults: rowStatuses

            };

        });



        // Generate Header Labels: Md, T1, T2...

        const taskHeaders = ['Md'];

        for (let h = 1; h < maxTaskCount; h++) {

            taskHeaders.push(`T${h}`);

        }



        const result = await DB.generateBatchReport({

            batchName: batchFilter,

            logo: logoBase64,

            includePayment: document.getElementById('reportIncludePayment').checked,

            taskHeaders: taskHeaders,

            interns: reportInterns

        });



        if (result.status === 'success' && result.base64) {

            const link = document.createElement('a');

            link.href = `data:application/pdf;base64,${result.base64}`;

            link.download = result.fileName || `Batch_Report_${batchFilter}.pdf`;

            document.body.appendChild(link);

            link.click();

            document.body.removeChild(link);

            alert('Batch report generated and downloaded successfully!');

        } else {

            throw new Error(result.message || 'Report generation failed');

        }

    } catch (e) {

        console.error(e);

        alert('Error: ' + e.message);

    } finally {

        btn.innerHTML = originalText;

        btn.disabled = false;

    }

}



function updateDomainDropdowns() {

    const domains = DB.getDomains();

    const domainNames = Object.keys(domains);



    // Update domain dropdown in Add Intern modal

    const domainSelect = document.getElementById('iDomain');

    if (domainSelect) {

        domainSelect.innerHTML = domainNames.map(name =>

            `<option>${name}</option>`

        ).join('');

    }



    // Update domain filter in management tab

    const filterSelect = document.getElementById('internFilterDomain');

    if (filterSelect) {

        const currentVal = filterSelect.value;

        filterSelect.innerHTML = '<option value="">All Domains</option>' +

            domainNames.map(name => `<option value="${name}">${name}</option>`).join('');

        filterSelect.value = currentVal;

    }



    // Update domain filter in offer letters tab

    const offerDomainSelect = document.getElementById('offerFilterDomain');

    if (offerDomainSelect) {

        const currentVal = offerDomainSelect.value;

        offerDomainSelect.innerHTML = '<option value="">All Domains</option>' +

            domainNames.map(name => `<option value="${name}">${name}</option>`).join('');

        offerDomainSelect.value = currentVal;

    }



    // Update manual cert domain

    const mCertDomainSelect = document.getElementById('mCertDomain');

    if (mCertDomainSelect) {

        const current = mCertDomainSelect.value;

        mCertDomainSelect.innerHTML = '<option value="">Select Domain</option>' +

            domainNames.map(name => `<option value="${name}">${name}</option>`).join('');

        mCertDomainSelect.value = current;

    }



    // Update manual offer domain

    const mOfferDomainSelect = document.getElementById('mOfferDomain');

    if (mOfferDomainSelect) {

        const current = mOfferDomainSelect.value;

        mOfferDomainSelect.innerHTML = '<option value="">Select Domain</option>' +

            domainNames.map(name => `<option value="${name}">${name}</option>`).join('');

        mOfferDomainSelect.value = current;

    }

}



function updateBatchDropdowns() {

    const interns = DB.get('interns');

    const rawBatches = interns.map(i => formatBatchDate(i.batch)).filter(b => b);

    const batches = [...new Set(rawBatches)];



    batches.sort((a, b) => {

        const da = new Date(a);

        const db = new Date(b);

        if (!isNaN(da) && !isNaN(db)) return da - db;

        return a.localeCompare(b);

    });



    const batchSelect = document.getElementById('internFilterBatch');

    if (batchSelect) {

        const currentBatch = batchSelect.value;

        while (batchSelect.options.length > 1) batchSelect.remove(1);

        batches.forEach(b => {

            const opt = document.createElement('option');

            opt.value = b;

            opt.innerText = b;

            batchSelect.appendChild(opt);

        });

        if ([...batchSelect.options].some(o => o.value === currentBatch)) {

            batchSelect.value = currentBatch;

        }

    }



    const offerBatchSelect = document.getElementById('offerFilterBatch');

    if (offerBatchSelect) {

        const currentBatch = offerBatchSelect.value;

        while (offerBatchSelect.options.length > 1) offerBatchSelect.remove(1);

        batches.forEach(b => {

            const opt = document.createElement('option');

            opt.value = b;

            opt.innerText = b;

            offerBatchSelect.appendChild(opt);

        });

        if ([...offerBatchSelect.options].some(o => o.value === currentBatch)) {

            offerBatchSelect.value = currentBatch;

        }

    }



    // New: Populate Group Message Filter
    const msgFilterBatch = document.getElementById('msgFilterBatch');
    if (msgFilterBatch) {
        const current = msgFilterBatch.value;
                // 1. Normalize and find UNIQUE batch dates
        const uniqueDates = [...new Set(interns.map(i => {
            if (!i.batch) return null;
            const d = new Date(i.batch);
            return isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
        }).filter(b => b))].sort((a,b) => new Date(a) - new Date(b));

        // 2. Clear then populate to avoid duplicates
        msgFilterBatch.innerHTML = '<option value="">Select a Batch</option>' +
            uniqueDates.map(dateStr => {
                const [y, m, dom] = dateStr.split('-').map(Number);
                const d = new Date(y, m - 1, dom);
                const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
                
                const month = months[d.getMonth()];
                const cycle = d.getDate() === 1 ? '1' : '2';
                const yearShort = String(d.getFullYear()).slice(-2);
                
                const label = `INTERNS ${month}${cycle}${yearShort}`;
                return `<option value="${dateStr}">${label} (${formatBatchDate(dateStr)})</option>`;
            }).join('');
            
        if (current && [...msgFilterBatch.options].some(o => o.value === current)) {
            msgFilterBatch.value = current;
        } else if (msgFilterBatch.options.length > 1) {
            // Default to most recent if current is removed
            // msgFilterBatch.selectedIndex = 0; 
        }
    }



    const reportBatchSelect = document.getElementById('reportFilterBatch');

    if (reportBatchSelect) {

        const currentBatch = reportBatchSelect.value;

        while (reportBatchSelect.options.length > 1) reportBatchSelect.remove(1);

        batches.forEach(b => {

            const opt = document.createElement('option');

            opt.value = b;

            opt.innerText = b;

            reportBatchSelect.appendChild(opt);

        });

        if ([...reportBatchSelect.options].some(o => o.value === currentBatch)) {

            reportBatchSelect.value = currentBatch;

        }

    }

}



document.getElementById('domainForm').addEventListener('submit', function (e) {

    e.preventDefault();



    const domainName = document.getElementById('domainName').value.trim();

    const taskFields = document.querySelectorAll('.task-field');



    if (taskFields.length === 0) {

        showToast('Please add at least one task for this domain.', 'error');

        return;

    }





    const tasks = [];

    taskFields.forEach((field, index) => {

        const title = field.querySelector('.task-title').value.trim();

        const objective = field.querySelector('.task-objective').value.trim();



        // Collect all feature inputs

        const featureInputs = field.querySelectorAll('.feature-item');

        const featureList = Array.from(featureInputs).map(i => i.value.trim()).filter(val => val);

        const feature = featureList.join('\n');



        const outcome = field.querySelector('.task-outcome').value.trim();



        if (title && objective) { // Basic validation

            tasks.push({

                id: index + 1,

                title: title,

                objective: objective,

                feature: feature,

                outcome: outcome

            });

        }

    });



    if (tasks.length === 0) {

        showToast('Please fill in all task fields.', 'error');

        return;

    }





    if (editingDomain) {

        DB.updateDomain(editingDomain, domainName, tasks);

        showToast('Domain updated successfully!');

    } else {



        const domains = DB.getDomains();

        if (domains[domainName]) {

            showToast('A domain with this name already exists.', 'error');

            return;

        }

        DB.addDomain(domainName, tasks);

        showToast('Domain added successfully!');

    }





    closeModal('domainModal');

    refreshDashboard();

    updateDomainDropdowns();



    this.reset();

    document.getElementById('tasksContainer').innerHTML = '';

    editingDomain = null;

    taskCounter = 0;

});



// Reset modal when opening for new domain

const addDomainTrigger = document.querySelector('[onclick="openModal(\'domainModal\')"]');

if (addDomainTrigger) {

    addDomainTrigger.addEventListener('click', function () {

        editingDomain = null;

        document.getElementById('domainModalTitle').innerText = 'Add New Domain';

        document.getElementById('domainName').value = '';

        document.getElementById('tasksContainer').innerHTML = '';

        taskCounter = 0;

        // Add one empty task field

        addTaskField();

    });

}



// Initializing the application logic

(async function initApp() {



    try {

        await DB.initialize();

    } catch (e) {

        console.error("Cloud init failed, falling back to local storage", e);

    }



    updateDomainDropdowns();

    refreshDashboard();

    switchTab('overview');



})();



// Format date from YYYY-MM-DD to DD MMM YYYY

function formatFriendlyDate(dateStr) {

    if (!dateStr) return "";

    const d = new Date(dateStr);

    if (isNaN(d.getTime())) return dateStr;

    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

}



// Helper to auto-calculate dates for manual forms

function autoFillManualDates(prefix) {

    // Calculate exactly 30 days from today

    const today = new Date();

    const endDate = new Date(today); // End date is today



    // Start date is 30 days before today

    const startDate = new Date(today);

    startDate.setDate(startDate.getDate() - 30);



    // Format for <input type="date"> (YYYY-MM-DD)

    const formatDate = (d) => d.toISOString().split('T')[0];



    const startField = document.getElementById(prefix + 'Start');

    const endField = document.getElementById(prefix + 'End');

    if (startField) startField.value = formatDate(startDate);

    if (endField) endField.value = formatDate(endDate);

}



// ========== MANUAL GENERATION PAGES LOGIC ==========

(function setupManualPages() {

    // Attach auto-fill listeners

    ['mCertMonth', 'mCertYear'].forEach(id => {

        const el = document.getElementById(id);

        if (el) el.addEventListener('change', () => autoFillManualDates('mCert'));

    });

    ['mOfferMonth', 'mOfferYear'].forEach(id => {

        const el = document.getElementById(id);

        if (el) el.addEventListener('change', () => autoFillManualDates('mOffer'));

    });



    // Initial fill

    setTimeout(() => {

        autoFillManualDates('mCert');

        autoFillManualDates('mOffer');

    }, 500);

    // Manual Certificate Form

    const certForm = document.getElementById('manualCertForm');

    if (certForm) {

        certForm.onsubmit = async function (e) {

            e.preventDefault();

            const btn = document.getElementById('mCertSubmitBtn');

            const originalHTML = btn.innerHTML;

            btn.innerHTML = '<i class="ph ph-spinner-gap anim-spin"></i> Generating...';

            btn.disabled = true;



            try {

                const settings = DB.getSettings();

                const logoBase64 = await getLogoBase64();

                const msmeBase64 = await getMSMELogoBase64();

                const sigBase64 = await getCEOSignatureBase64();



                const docData = {

                    name: document.getElementById('mCertName').value.trim(),

                    internId: document.getElementById('mCertId').value.trim(),

                    domain: document.getElementById('mCertDomain').value.trim(),

                    batch: document.getElementById('mCertMonth').value + ' ' + document.getElementById('mCertYear').value,

                    start: formatFriendlyDate(document.getElementById('mCertStart').value),

                    end: formatFriendlyDate(document.getElementById('mCertEnd').value),

                    logo: logoBase64,

                    msmeLogo: msmeBase64,

                    signature: sigBase64,

                    companyName: 'THIRANEX',

                    signatory: 'Hariharan M',

                    signatoryTitle: 'Founder & CEO',

                    templateText: 'This is to certify that {{name}} has successfully completed an internship in {{domain}} from {{start}} to {{end}}.'

                };



                const result = await DB.generateCertificate(docData);

                if (result && result.status === 'success' && result.base64) {

                    const link = document.createElement('a');

                    link.href = `data:application/pdf;base64,${result.base64}`;

                    link.download = result.fileName || `Certificate_${docData.name}.pdf`;

                    document.body.appendChild(link);

                    link.click();

                    document.body.removeChild(link);

                    showToast('Certificate generated and downloaded successfully!');





                    certForm.reset();

                } else {

                    throw new Error(result ? result.message : 'No response from server');

                }

            } catch (err) {

                console.error("Manual cert error:", err);

                showToast('Error: ' + err.message, 'error');



            } finally {

                btn.innerHTML = originalHTML;

                btn.disabled = false;

            }

        };

    }





})();



// Approve Intern registration and Generate ID/Email

async function approveRegistration(email, domain, btn) {

    // Removed confirm as per user request





    const feeAmount = 100;



    const originalHTML = btn.innerHTML;

    btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Processing...';

    btn.disabled = true;



    try {

        // Find SPECIFIC pending registration by email AND domain

        const intern = DB.get('interns').find(i =>

            String(i.email).toLowerCase() === String(email).toLowerCase() &&

            i.domain === domain &&

            i.status === 'pending_verification'

        );

        if (!intern) throw new Error("Intern registration not found (may already be processed)");



        // 1. Calculate Upcoming Batch

        const today = new Date();

        const day = today.getDate();

        let targetDate;



        if (day < 15) {

            // Registering 1-14 -> Start on 15th of current month

            targetDate = new Date(today.getFullYear(), today.getMonth(), 15);

        } else {

            // Registering 15+ -> Start on 1st of next month

            targetDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);

        }



        const batchMonth = targetDate.toLocaleString('default', { month: 'short' }).toUpperCase();

        const batchCycle = (targetDate.getDate() === 1) ? '1' : '2';

        const batchYearShort = String(targetDate.getFullYear()).slice(-2);



        // Format Batch String for Email: e.g. "15th February 2026"

        const getDaySuffix = (n) => {

            if (n > 3 && n < 21) return 'th';

            switch (n % 10) {

                case 1: return "st";

                case 2: return "nd";

                case 3: return "rd";

                default: return "th";

            }

        };



        const batchString = `${targetDate.getDate()}${getDaySuffix(targetDate.getDate())} ${targetDate.toLocaleString('default', { month: 'long' })} ${targetDate.getFullYear()}`;



        // Calculate End Date (30 Days)

        const endDate = new Date(targetDate);

        endDate.setDate(endDate.getDate() + 30);

        const endDateString = `${endDate.getDate()}${getDaySuffix(endDate.getDate())} ${endDate.toLocaleString('default', { month: 'long' })} ${endDate.getFullYear()}`;



        // Format Batch ISO for Database: e.g. "2026-02-15"

        const batchISO = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;



        // 2. Generate ID if not already assigned during registration

        let newId = intern.id;

        

        // Only generate new ID if the current ID is an old format or missing

        if (!newId || !newId.startsWith(`THX-${batchMonth}${batchCycle}${batchYearShort}`)) {

            const prefix = `THX-${batchMonth}${batchCycle}${batchYearShort}-`;

            const existingIDs = DB.get('interns').map(i => i.id).filter(id => id && id.startsWith(prefix));

            let maxSeq = 0;

            existingIDs.forEach(eid => {

                const parts = eid.split('-');

                if (parts.length >= 3) { // THX-APR126-001 has 3 parts

                    const seq = parseInt(parts[2], 10);

                    if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;

                }

            });

            newId = `${prefix}${String(maxSeq + 1).padStart(3, '0')}`;

        }



        // 3. Update Intern Status (Optimized Atomic Update instead of full sync)
        const updateData = {
            id: newId,
            batch: batchISO,
            status: 'active',
            paymentStatus: 'unpaid',
            feeAmount: feeAmount,
            approvalDate: new Date().toISOString(),
            offerApproved: false,
            email: intern.email, // Used by backend for searching if ID is missing
            domain: intern.domain
        };
        
        await DB.updateInternProfile(intern.id, updateData);
        
        // Update local memory for UI consistency
        intern.id = newId;
        intern.status = 'active';
        intern.batch = batchISO;
        intern.paymentStatus = 'unpaid';
        intern.feeAmount = feeAmount;




        // Notification removed
        await DB.syncInterns();



        // 4. Prepare Email Content

        const settings = DB.getSettings();

        const whatsappLink = settings.whatsappLink || "Will be shared soon";



        showToast(`Success! Intern Approved. ID: ${newId} Batch: ${batchString}`);

        





        renderRegistrations();

        refreshDashboard();

    } catch (e) {

        console.error(e);

        showToast("Error: " + e.message, 'error');



    } finally {

        btn.innerHTML = originalHTML;

        btn.disabled = false;

    }

}



async function markNotInterested(email, domain, btn) {

    if (!confirm('Are you sure? This will send a rejection email and DELETE the record.')) return;



    const originalHTML = btn.innerHTML;

    btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Processing...';

    btn.disabled = true;



    try {

        // Find SPECIFIC pending registration

        const intern = DB.get('interns').find(i =>

            String(i.email).toLowerCase() === String(email).toLowerCase() &&

            i.domain === domain &&

            i.status === 'pending_verification'

        );

        if (!intern) throw new Error("Intern registration not found");



        const subject = "Application Update - Thiranex Internship";

        const body = `Hi ${intern.name},\n\nThank you for your interest in Thiranex. We regret to inform you that we are unable to move forward with your application at this time.\n\nRegards,\nThiranex HR Team`;



        // 1. Delete and Sync First (to ensure it disappears automatically)

        const deleteSuccess = await DB.deleteIntern(intern.id || intern.email, intern.domain);



        if (deleteSuccess) {

            renderRegistrations();

            refreshDashboard();

        }



        // 2. Then Trigger Manual Email

        const mailtoUrl = `mailto:${intern.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        window.location.href = mailtoUrl;



        showToast("Record deleted. Email app opening.");



    } catch (e) {

        console.error(e);

        showToast("Error: " + e.message, 'error');



    } finally {

        if (btn && btn.parentNode) {

            btn.innerHTML = originalHTML;

            btn.disabled = false;

        }

    }

}



// Force refresh data from server

async function forceRefreshData() {

    console.log("?? Force refreshing data from server...");

    try {

        await DB.initialize();

        refreshDashboard();

        showToast("? Data refreshed successfully!");

    } catch (e) {

        console.error("Refresh failed:", e);

        showToast("? Failed to refresh data: " + e.message, 'error');

    }

}





// Make it available globally

window.forceRefreshData = forceRefreshData;



// --- Referral Logic ---

let currentFilter = 'all'; // 'requests' or 'all'



function renderReferrals(filter = currentFilter) {

    currentFilter = filter;

    const interns = DB.get('interns');

    // Group by Referrer

    const grouped = {}; // referrerId -> { referrer: obj, referrals: [], totalPending: 0, totalPaid: 0 }



    const search = (document.getElementById('refSearch') ? document.getElementById('refSearch').value : '').toLowerCase().trim();

    const body = document.getElementById('referralTableBody');



    // Highlight active button

    const requestBtn = document.querySelector('button[onclick="renderReferrals(\'requests\')"]');

    const allBtn = document.querySelector('button[onclick="renderReferrals(\'all\')"]');

    if (requestBtn && allBtn) {

        if (filter === 'requests') {

            requestBtn.style.background = 'var(--primary)'; requestBtn.style.color = 'white';

            allBtn.style.background = 'white'; allBtn.style.color = 'var(--text-main)';

        } else {

            allBtn.style.background = 'var(--primary)'; allBtn.style.color = 'white';

            requestBtn.style.background = 'white'; requestBtn.style.color = 'var(--text-main)';

        }

    }





    interns.forEach(intern => {

        if (intern.referredBy && String(intern.referredBy).trim() !== '') {

            const referrerId = String(intern.referredBy).trim().toUpperCase();

            if (!grouped[referrerId]) {

                // Find referrer object

                const referrer = interns.find(i => String(i.id).trim().toUpperCase() === String(referrerId).trim().toUpperCase());

                grouped[referrerId] = {

                    referrer: referrer || { name: 'Unknown', id: referrerId, upiId: null, withdrawalStatus: 'active' },

                    referrals: [],

                    pendingAmount: 0,

                    paidAmount: 0

                };

            }



            const group = grouped[referrerId];

            if (group.referrer) { // Ensure referrer exists to account for

                const refereePaid = intern.paymentStatus === 'verified';

                const referrerPaid = group.referrer.paymentStatus === 'verified';

                const rewardPaid = intern.referralRewardStatus === 'paid';



                // Calculate

                if (rewardPaid) {

                    group.paidAmount += 50;

                } else if (refereePaid && referrerPaid) {

                    group.pendingAmount += 50;

                }



                group.referrals.push(intern);

            }

        }

    });



    // Calculate Totals for Stats

    let totalRequests = 0;

    let totalPaidGlobal = 0;



    const rows = Object.values(grouped).map(group => {

        const referrer = group.referrer;



        // Stats

        totalPaidGlobal += group.paidAmount;

        if (referrer.withdrawalStatus === 'requested' && group.pendingAmount > 0) totalRequests++;



        // Filters

        if (filter === 'requests') {

            if (referrer.withdrawalStatus !== 'requested' || group.pendingAmount === 0) return '';

        }



        // Search

        const upi = referrer.upiId || '';

        const matchSearch = !search ||

            (referrer.name && referrer.name.toLowerCase().includes(search)) ||

            (referrer.id && String(referrer.id).toLowerCase().includes(search)) ||

            upi.toLowerCase().includes(search);



        if (!matchSearch) return '';



        const upiDisplay = referrer.upiId

            ? `<span style="font-family: monospace; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 0.9rem; color: #334155;">${referrer.upiId}</span>`

            : '<span style="color: #ef4444; font-size: 0.85rem;">Not Set</span>';



        let statusBadge = '';

        let actionBtn = '';



        if (referrer.withdrawalStatus === 'requested') {

            statusBadge = '<span class="badge" style="background: #FEF3C7; color: #D97706;">Withdrawal Requested</span>';

            actionBtn = `<button class="btn btn-primary" style="padding: 0.4rem 1rem; font-size: 0.85rem;" onclick="openPayoutModal('${referrer.id}', '${referrer.name}', '${referrer.upiId}', ${group.pendingAmount})">Process Payment</button>`;

        } else if (group.pendingAmount > 0) {

            statusBadge = '<span class="badge" style="background: #F1F5F9; color: #64748B;">Accumulating (₹' + group.pendingAmount + ')</span>';

            actionBtn = '<span style="color: var(--text-muted); font-size: 0.85rem;">No Request</span>';

        } else {

            statusBadge = '<span class="badge" style="background: #ECFDF5; color: #059669;">All Settled</span>';

            actionBtn = '-';

        }



        return `

            <tr>

                <td>

                    <strong>${referrer.name}</strong><br>

                    <span style="font-size: 0.85rem; color: var(--text-muted);">ID: ${referrer.id}</span>

                </td>

                <td>${upiDisplay}</td>

                <td>${statusBadge}</td>

                <td><strong style="color: ${group.pendingAmount > 0 ? '#D97706' : '#64748B'}">₹${group.pendingAmount}</strong></td>

                <td>${actionBtn}</td>

            </tr>

        `;



    }).join('');



    if (body) body.innerHTML = rows.length ? rows : `<tr><td colspan="5" style="text-align: center; padding: 3rem; color: var(--text-muted);">${filter === 'requests' ? 'No pending withdrawal requests.' : 'No referrals found.'}</td></tr>`;



    // Update Stats Cards

    if (document.getElementById('totalWithdrawalRequests')) document.getElementById('totalWithdrawalRequests').innerText = totalRequests;

    if (document.getElementById('totalPaidRewards')) document.getElementById('totalPaidRewards').innerText = '₹' + totalPaidGlobal;

}



function openPayoutModal(id, name, upi, amount) {

    document.getElementById('payoutReferrerId').value = id;

    document.getElementById('payoutAmount').innerText = '₹' + amount;

    document.getElementById('payoutUpiId').innerText = upi || 'No UPI ID';



    // Generate QR Code

    const qrContainer = document.getElementById('payoutQrCode');

    if (upi) {

        // UPI String: upi://pay?pa=address&pn=name&am=amount&cu=INR

        // Using qrserver (public API) or just rely on manual

        const upiString = `upi://pay?pa=${upi}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR`;

        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiString)}`;

        qrContainer.innerHTML = `<img src="${qrUrl}" alt="Scan to Pay" style="width: 200px; height: 200px; display: block;">`;

    } else {

        qrContainer.innerHTML = '<p style="color: #ef4444; padding: 2rem;">UPI ID Missing</p>';

    }



    document.getElementById('payoutModal').style.display = 'flex';

}



document.getElementById('payoutForm').addEventListener('submit', async function (e) {

    e.preventDefault();

    const btn = this.querySelector('button[type="submit"]');

    const originalText = btn.innerHTML;

    btn.innerHTML = 'Processing...';

    btn.disabled = true;



    const referrerId = document.getElementById('payoutReferrerId').value;

    const refNo = document.getElementById('payoutRef').value;



    // We need to mark ALL eligible referrals for this referrer as PAID

    // We can do this via code.gs function `processWithdrawal`

    if (!GOOGLE_SCRIPT_URL) { showToast("Backend not configured", 'error'); return; }





    try {

        // Determine which referee IDs are being paid

        // We re-calculate logically here or let backend do it

        // Backend is safer. Backend will find all 'eligible' referrals for this referrer and mark them paid.

        const response = await fetch(GOOGLE_SCRIPT_URL, {

            method: 'POST',

            headers: { 'Content-Type': 'text/plain;charset=utf-8' },

            body: JSON.stringify({

                action: 'processWithdrawal',

                referrerId: referrerId,

                paymentRef: refNo

            })

        });

        const result = await response.json();



        if (result.status === 'success') {

            showToast("Payout recorded successfully!");

            closeModal('payoutModal');

            // Reset withdrawal status locally optimistically or just refresh

            refreshDashboard(); // Easiest

        } else {

            showToast("Error: " + result.message, 'error');

        }



    } catch (e) {

        console.error(e);

        showToast("Network Error processing payout.", 'error');

    } finally {



        btn.innerHTML = originalText;

        btn.disabled = false;

    }

});



// PWA Installation - Thiranex Control Center

let deferredPrompt;

const installBtn = document.createElement('div');

installBtn.id = 'pwaInstallBtn';

installBtn.innerHTML = '<i class="ph-bold ph-lightning"></i> Install App';

document.body.appendChild(installBtn);





window.addEventListener('beforeinstallprompt', (e) => {

    e.preventDefault();

    deferredPrompt = e;

    installBtn.style.display = 'flex';

});



installBtn.addEventListener('click', async () => {

    if (deferredPrompt) {

        deferredPrompt.prompt();

        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') { installBtn.style.display = 'none'; }

        deferredPrompt = null;

    }

});



if ('serviceWorker' in navigator) {

    window.addEventListener('load', () => {

        navigator.serviceWorker.register('./sw.js').catch(() => { });

    });

}





function openWhatsApp(mobile, message) {
    if (!mobile) return;
    let cleanMobile = String(mobile).replace(/\D/g, "");
    if (cleanMobile.length === 10) cleanMobile = "91" + cleanMobile;
    const url = "https://wa.me/" + cleanMobile + "?text=" + encodeURIComponent(message);
    window.open(url, "_blank");
}

// ========== GROUP MESSAGE GENERATOR LOGIC ==========

function generateGroupMessage() {
    const batchDate = document.getElementById('msgFilterBatch').value;
    const previewBox = document.getElementById('generatedMsgBox');
    const previewCard = document.getElementById('messagePreviewCard');
    const noBatchMsg = document.getElementById('msgNoBatch');
    const dateField = document.getElementById('msgCurrentDate');

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dateField.value = today.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    if (!batchDate) {
        previewCard.style.display = 'none';
        noBatchMsg.style.display = 'block';
        return;
    }

    // Ensure we have a clean YYYY-MM-DD string
    const dateOnly = new Date(batchDate).toISOString().split('T')[0];
    const [y, m, dom] = dateOnly.split('-').map(Number);
    const start = new Date(y, m - 1, dom);
    
    const todayMillis = today.getTime();
    const startMillis = start.getTime();
    const timeDiff = todayMillis - startMillis;
    const elapsedDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1;

    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const month = months[start.getMonth()];
    const cycle = start.getDate() === 1 ? '1' : '2';
    const yearShort = String(start.getFullYear()).slice(-2);
    const groupName = `INTERNS ${month}${cycle}${yearShort}`;

    let message = "";
    
    if (elapsedDays <= 0) {
        // Pre-start phase (Registration/Onboarding)
        message = `*WELCOME TO THIRANEX INTERNSHIPS* 🚀\nBatch: *${groupName}*\n\nCongratulations! 🎉 Your internship application has been *APPROVED*. \n\n✅ *Mandatory Task:* Please download your official Offer Letter from your student portal and post it on LinkedIn tagging Thiranex. This is your first step to start! 🎓✨\n\nDashboard: www.thiranex.in/student-login.html\n\n_Your internship officially begins on ${start.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}._\n\nRegards,\n*THIRANEX*`;
    } else if (elapsedDays <= 30) {
        // Active Internship milstones
        let targetTask = 1;
        let targetDay = 7;
        
        if (elapsedDays <= 7) { targetTask = 1; targetDay = 7; }
        else if (elapsedDays <= 14) { targetTask = 2; targetDay = 14; }
        else if (elapsedDays <= 21) { targetTask = 3; targetDay = 21; }
        else { targetTask = 4; targetDay = 30; }

        const daysRemaining = targetDay - elapsedDays;
        const daysLabel = daysRemaining === 1 ? "1 day" : `${daysRemaining} days`;
        
        if (daysRemaining === 0) {
            message = `*DEADLINE ALERT: TASK ${targetTask}* ⚠️\nBatch: *${groupName}*\n\nToday is the *Last Day* to submit your Task ${targetTask}! 🏁\n\nPlease ensure you upload your work on the dashboard before midnight to stay on track. 🚀🔥\n\nDashboard: www.thiranex.in/student-login.html\n\nRegards,\n*THIRANEX*`;
        } else {
            message = `*THIRANEX DAILY UPDATE* 📢\nBatch: *${groupName}*\n\nIntership Day: *${elapsedDays} / 30*\n\n🚀 *Task Update:* Only *${daysLabel} to go* for Task ${targetTask} submission! 🏁\n\nKeep working on your projects and ensure quality work. Let's complete Phase 1 strong! 💪💪\n\nDashboard: www.thiranex.in/student-login.html\n\nRegards,\n*THIRANEX*`;
        }
    } else if (elapsedDays <= 35) {
        // Payment Phase (5 days)
        const daysLeft = 35 - elapsedDays + 1;
        message = `*INTERNSHIP COMPLETION NOTICE* 🏆\nBatch: *${groupName}*\n\nGreat job finishing your 30 days! 🎉\n\n🚨 *Action Required:* Please complete your certification validation/payment to receive your verified credentials. \n\n⏰ Only *${daysLeft} days* left to secure your certificate before the portal window closes! 🚀✨\n\nDashboard: www.thiranex.in/student-login.html\n\nRegards,\n*THIRANEX*`;
    } else if (elapsedDays <= 38) {
        // Inactivation Alert (3 days)
        const daysLeft = 38 - elapsedDays + 1;
        message = `*PORTAL INACTIVATION WARNING* ⚠️\nBatch: *${groupName}*\n\nAttention! 🧐 Your batch is reaching its final closing date.\n\n🚨 Your access to this batch will be *INACTIVATED* after *${daysLeft} days*. Please download your certificate or handle pending payments IMMEDIATELY. 🏁💎\n\nDashboard: www.thiranex.in/student-login.html\n\nRegards,\n*THIRANEX*`;
    } else {
        // Should be filtered out but just in case
        message = "This batch has officially ended and been archived. Thank you!";
    }

    previewBox.innerText = message;
    previewCard.style.display = 'block';
    noBatchMsg.style.display = 'none';
}

function copyGroupMessage() {
    const text = document.getElementById('generatedMsgBox').innerText;
    navigator.clipboard.writeText(text).then(() => {
        showToast("Message copied to clipboard! ✅");
    }).catch(err => {
        showToast("Failed to copy. Please copy manually.", "error");
    });
}

function openWhatsAppWithMsg() {
    const text = document.getElementById('generatedMsgBox').innerText;
    const url = "https://wa.me/?text=" + encodeURIComponent(text);
    window.open(url, "_blank");
}

