/**
 * THIRANEX Landing Portal Logic
 * Handles: Modals, Auth, Custom FOMO signals, and Dynamic Metrics
 */

function closeSuccessOverlay() {
    document.getElementById('successOverlay').style.display = 'none';
    closeModal('registerModal');
    updateStickyCta();
}

/**
 * FAQ Toggle Function
 */
function toggleFAQ(card) {
    const isActive = card.classList.contains('active');
    
    // Close all other FAQs
    document.querySelectorAll('.faq-card').forEach(c => {
        c.classList.remove('active');
    });

    // Toggle current
    if (!isActive) {
        card.classList.add('active');
    }
}

const registerForm = document.getElementById('registerForm');

// Modal Helpers
function openModal(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    if (window.innerWidth <= 768) closeMobileNav();
    updateStickyCta();

    if (id === 'registerModal') {
        const seats = Math.floor(Math.random() * 6) + 2;
        const seatsEl = document.getElementById('seatsLeft');
        if (seatsEl) seatsEl.innerText = seats;
    }
}

function closeModal(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.display = 'none';
    document.body.style.overflow = 'auto';
    updateStickyCta();
}

// Load Live Platform Metrics from DB
async function loadLiveMetrics() {
    try {
        const internsCount = (DB.data && DB.data.interns) ? DB.data.interns.length : 0;
        const certsCount = (DB.data && DB.data.submissions) ? DB.data.submissions.filter(s => s.status === 'approved').length : 0;
        
        const displayInterns = 1049668 + internsCount;
        const displayCerts = 725601 + certsCount;
        
        const elInterns = document.getElementById('liveStudentsCount');
        const elCerts = document.getElementById('liveCertsCount');
        
        if (elInterns) elInterns.innerText = displayInterns.toLocaleString();
        if (elCerts) elCerts.innerText = displayCerts.toLocaleString();
        
    } catch (e) {
        console.error("Failed to load metrics:", e);
    }
}

// Mobile Nav Toggle
function toggleMobileNav() {
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;
    navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
    if (navLinks.style.display === 'flex') {
        navLinks.style.position = 'absolute';
        navLinks.style.top = '100%';
        navLinks.style.left = '0';
        navLinks.style.width = '100%';
        navLinks.style.flexDirection = 'column';
        navLinks.style.background = 'white';
        navLinks.style.padding = '2rem';
        navLinks.style.boxShadow = 'var(--shadow-lg)';
        navLinks.style.zIndex = '5000';
    }
}

function closeMobileNav() {
    const navLinks = document.querySelector('.nav-links');
    if (navLinks && window.innerWidth <= 768) {
        navLinks.style.display = 'none';
    }
}

// Close on outside click
window.onclick = function (event) {
    if (event.target.classList.contains('modal-overlay')) {
        event.target.style.display = "none";
        document.body.style.overflow = 'auto';
    }
}

async function initPage() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Auto-verify if ?verifyId= provided (from QR codes)
    const verifyId = urlParams.get('verifyId');
    if (verifyId) {
        setTimeout(async () => {
            openModal('verifyModal');
            const input = document.getElementById('verifyInput');
            if (input) {
                input.value = verifyId;
                await verifyCertificate();
            }
        }, 800);
    }

    const refCode = urlParams.get('ref');
    if (refCode) {
        sessionStorage.setItem('referral_code', refCode);
    }

    await DB.initialize();

    const currentUser = DB.getCurrentUser();
    if (currentUser) {
        if (currentUser.role === 'admin') window.location.href = 'admin.html';
        else window.location.href = 'student.html';
        return;
    }

    renderDomains();
    populateDomainSelect();
    loadLiveMetrics();
    updateBatchDates();

    const storedRef = sessionStorage.getItem('referral_code');
    if (storedRef) {
        const refInput = document.getElementById('regReferralCode');
        if (refInput) {
            refInput.value = storedRef;
            refInput.readOnly = true;
            refInput.style.backgroundColor = '#f1f5f9';
            refInput.style.cursor = 'not-allowed';
            refInput.title = "Referral code applied from link. Cannot be changed.";
        }
        openModal('registerModal');
    }

    const waFloat = document.getElementById('waFloat');
    if (waFloat && DB.data && DB.data.settings && DB.data.settings.whatsappLink) {
        waFloat.href = DB.data.settings.whatsappLink;
    }
}

function renderDomains() {
    const domains = DB.getDomains();
    const grid = document.getElementById('domainGrid');
    if (!grid) return;

    const icons = {
        "Web Development": "ph ph-code",
        "Data Science": "ph ph-database",
        "AI & Machine Learning": "ph ph-brain",
        "App Development": "ph ph-device-mobile",
        "Cyber Security": "ph ph-shield-checkered",
        "UI/UX Design": "ph ph-palette"
    };

    grid.innerHTML = Object.keys(domains).map(name => `
        <div class="domain-card">
            <div class="domain-icon"><i class="${icons[name] || 'ph ph-briefcase'}"></i></div>
            <h3>${name}</h3>
            <p>${domains[name].length} curated modules focused on industry-standard workflows.</p>
        </div>
    `).join('');
}

function populateDomainSelect() {
    const domains = DB.getDomains();
    const select = document.getElementById('regDomain');
    if (!select) return;

    while (select.options.length > 1) {
        select.remove(1);
    }

    let domainKeys = Object.keys(domains);

    // Fallback: if no domains loaded from server, use a default list
    if (domainKeys.length === 0) {
        domainKeys = [
            "Web Development",
            "Data Science",
            "AI & Machine Learning",
            "App Development",
            "Cyber Security",
            "UI/UX Design",
            "Python Programming",
            "Digital Marketing",
            "Cloud Computing",
            "MERN Stack",
            "Flutter Development",
            "Software Testing",
            "Blockchain",
            "DevOps",
            "Embedded Systems"
        ];
    }

    domainKeys.forEach(domain => {
        const option = document.createElement('option');
        option.value = domain;
        option.textContent = domain;
        select.appendChild(option);
    });
}

// Login Logic
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const mobile = document.getElementById('mobile').value;
        const btn = this.querySelector('button[type="submit"]');

        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Authenticating...';
        btn.disabled = true;

        setTimeout(() => {
            const result = DB.login(email, mobile);

            if (!result) {
                showLoginError('Invalid email or mobile number.');
                resetLoginBtn(btn, originalText);
            } else if (result.multiple) {
                showProfileSelection(result.profiles);
            } else if (result.error) {
                showLoginError(result.message);
                resetLoginBtn(btn, originalText);
            } else if (result.role === 'admin') {
                showLoginError('Administrative access is restricted to the Secure Control Center.');
                resetLoginBtn(btn, originalText);
                localStorage.removeItem('portal_user');
            } else {
                window.location.href = 'student.html';
            }
        }, 500);
    });
}

function showLoginError(msg) {
    const errorDiv = document.getElementById('loginMsg');
    const errorText = document.getElementById('loginErrorText');
    if (errorDiv && errorText) {
        errorDiv.style.display = 'block';
        errorText.innerText = msg;
    } else {
        alert(msg);
    }
}

function resetLoginBtn(btn, text) {
    btn.innerHTML = text;
    btn.disabled = false;
}

function showProfileSelection(profiles) {
    const modalBody = document.querySelector('#loginModal .modal');

    let html = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <h2 style="margin: 0; font-size: 1.5rem;">Select Profile</h2>
            <button class="dots-btn" onclick="location.reload()"><i class="ph ph-x"></i></button>
        </div>
        <p style="color: var(--text-muted); margin-bottom: 1.5rem;">We found multiple internship profiles linked to your account. Please select one to continue.</p>
        <div style="display: flex; flex-direction: column; gap: 1rem; max-height: 400px; overflow-y: auto;">
    `;

    profiles.forEach(p => {
        const statusColor = p.status === 'active' ? '#10b981' : '#f59e0b';
        const statusIcon = p.status === 'active' ? 'ph-check-circle' : 'ph-clock';

        html += `
            <button class="card profile-select-btn" data-domain="${p.domain}" style="text-align: left; padding: 1.2rem; border: 1px solid var(--border); cursor: pointer; transition: all 0.2s; background: #f8fafc; width: 100%;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                    <div style="font-weight: 700; font-size: 1.1rem; color: var(--primary);">${p.domain}</div>
                    <span style="color: ${statusColor}; font-size: 0.75rem; text-transform: uppercase; font-weight: 700; display: flex; align-items: center; gap: 0.3rem;">
                        <i class="ph ${statusIcon}"></i> ${p.status.replace('_', ' ')}
                    </span>
                </div>
                <div style="font-size: 0.9rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.5rem;">
                     <i class="ph ph-user"></i> ${p.name}
                </div>
                <div style="font-size: 0.8rem; color: #94a3b8; margin-top: 0.4rem;">
                    Joined: ${p.joinedDate ? new Date(p.joinedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Unknown'}
                </div>
            </button>
        `;
    });

    html += `</div>
        <button onclick="location.reload()" class="btn" style="margin-top: 1.5rem; width: 100%; justify-content: center; color: var(--text-muted); background: white; border: 1px solid var(--border);">
            Cancel & Go Back
        </button>
    `;

    modalBody.innerHTML = html;

    const buttons = modalBody.querySelectorAll('.profile-select-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', function () {
            const domain = this.getAttribute('data-domain');
            const selected = profiles.find(p => p.domain === domain);

            if (selected) {
                if (selected.status === 'pending_verification') {
                    alert('This profile is pending admin verification. Please wait for approval.');
                    return;
                }
                selected.role = 'student';
                sessionStorage.setItem('portal_user', JSON.stringify(selected));
                window.location.href = 'student.html';
            }
        });
    });
}

// Registration Logic
if (registerForm) {
    registerForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const btn = registerForm.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;

        btn.innerHTML = '<i class="ph ph-spinner-gap anim-spin"></i> Processing...';
        btn.disabled = true;

        const formData = {
            name: document.getElementById('regName').value,
            email: document.getElementById('regEmail').value,
            mobile: document.getElementById('regMobile').value,
            domain: document.getElementById('regDomain').value,
            referredBy: document.getElementById('regReferralCode').value
        };

        setTimeout(async () => {
            try {
                const result = await DB.registerIntern(formData);

                if (result.success) {
                    closeModal('registerModal');

                    const waSection = document.getElementById('successWhatsappSection');
                    const waLinkElem = document.getElementById('successWhatsappLink');
                    if (DB.data && DB.data.settings && DB.data.settings.whatsappLink) {
                        waLinkElem.href = DB.data.settings.whatsappLink;
                        waSection.style.display = 'block';
                    } else {
                        waSection.style.display = 'none';
                    }

                    document.getElementById('successOverlay').style.display = 'flex';
                    updateStickyCta();
                    if (typeof registerForm.reset === 'function') registerForm.reset();
                } else {
                    const msgBox = document.getElementById('regMsg');
                    const txtBox = document.getElementById('regErrorText');
                    if (msgBox && txtBox) {
                        msgBox.style.display = 'block';
                        txtBox.innerText = result.message;
                        txtBox.style.display = 'block';
                    } else {
                        alert(result.message);
                    }
                }
            } catch (error) {
                console.error(error);
                alert("An error occurred. Please try again.");
            } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        }, 500);
    });
}

// Certificate Verification Logic
async function verifyCertificate() {
    const input = document.getElementById('verifyInput');
    const resultBox = document.getElementById('verifyResult');
    const btn = document.getElementById('verifyBtn');

    if (!input || !resultBox) return;

    const idToVerify = input.value.trim().toUpperCase();
    if (!idToVerify) {
        alert('Please enter a valid Certificate Number or Intern ID.');
        return;
    }

    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="ph ph-spinner-gap ph-spin"></i> Checking...';
    btn.disabled = true;
    resultBox.style.display = 'none';

    try {
        if (!DB.data.interns || DB.data.interns.length === 0) {
            await DB.initialize();
        }

        const intern = DB.data.interns.find(i => String(i.id).toUpperCase() === idToVerify);

        if (intern) {
            let duration = "1 Month";
            if (intern.startDate && intern.endDate) {
                duration = `${intern.startDate} - ${intern.endDate}`;
            } else if (intern.batch) {
                duration = formatBatchDate(intern.batch);
            }

            const isCertified = !!(intern.certificateUrl || intern.certApproved);
            const statusColor = isCertified ? '#10B981' : (intern.status === 'active' ? '#3B82F6' : '#EF4444');
            const statusText = isCertified ? 'Verified & Certified' : (intern.status === 'active' ? 'Active Intern (Ongoing)' : 'Not Certified');
            const statusIcon = isCertified ? 'ph-seal-check' : (intern.status === 'active' ? 'ph-clock' : 'ph-x-circle');

            resultBox.innerHTML = `
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    <div style="display: flex; align-items: start; gap: 1rem;">
                        <div style="width: 50px; height: 50px; border-radius: 50%; background: ${statusColor}20; color: ${statusColor}; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; flex-shrink: 0;">
                            <i class="ph-fill ${statusIcon}"></i>
                        </div>
                        <div style="flex: 1;">
                            <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.2rem;">
                                <h4 style="margin: 0; font-size: 1.2rem; color: #1e293b;">${intern.name}</h4>
                                ${isCertified ? `
                                    <i class="ph-fill ph-medal" style="color: #F59E0B; font-size: 1.2rem;" title="Certified Intern"></i>
                                    <span style="font-size: 0.75rem; background: #DEF7EC; color: #03543F; padding: 2px 8px; border-radius: 12px; border: 1px solid #31C48D; display: inline-flex; align-items: center; gap: 4px; font-weight: 600;">
                                        <i class="ph-fill ph-seal-check"></i> Verified
                                    </span>
                                ` : ''}
                            </div>
                            
                            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.5rem;">
                                <span class="badge" style="background: #F1F5F9; color: #475569;"><i class="ph ph-briefcase"></i> ${intern.domain}</span>
                                <span class="badge" style="background: #F1F5F9; color: #475569;"><i class="ph ph-calendar-blank"></i> ${duration}</span>
                            </div>
                            <div style="margin-top: 0.8rem; font-weight: 600; color: ${statusColor}; font-size: 0.9rem;">
                                ${statusText}
                            </div>
                            
                            ${isCertified && intern.certificateUrl ? `
                            <div style="margin-top: 1rem;">
                                <a href="${intern.certificateUrl}" class="btn" style="padding: 0.5rem 1rem; font-size: 0.85rem; background: #10B981; color: white; text-decoration: none; border-radius: 6px; display: inline-flex; align-items: center; gap: 0.5rem;">
                                    <i class="ph ph-eye"></i> View Certificate
                                </a>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
            resultBox.style.display = 'block';
        } else {
            resultBox.innerHTML = `
                <div style="text-align: center; color: #EF4444;">
                    <i class="ph-fill ph-warning-circle" style="font-size: 2rem; margin-bottom: 0.5rem;"></i>
                    <h4 style="margin: 0;">Certificate Not Found</h4>
                    <p style="font-size: 0.9rem; margin-top: 0.5rem; color: #64748b;">The ID <strong>${idToVerify}</strong> does not match our records. Please check the ID and try again.</p>
                </div>
            `;
            resultBox.style.display = 'block';
        }
    } catch (e) {
        console.error(e);
        alert('An error occurred while verifying. Please try again.');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

function formatBatchDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
        return d.toLocaleString('default', { month: 'short', year: 'numeric' });
    }
    return dateStr;
}

function updateStickyCta() {
    const btn = document.getElementById('mobileStickyCta');
    if (!btn) return;

    const isModalOpen = document.querySelector('.modal-overlay[style*="display: flex"]') || 
                        document.querySelector('.modal-overlay[style*="display: block"]') ||
                        (document.getElementById('successOverlay') && (document.getElementById('successOverlay').style.display === 'flex' || document.getElementById('successOverlay').style.display === 'block'));

    if (window.innerWidth <= 768 && window.scrollY > 400 && !isModalOpen) {
        btn.style.display = 'block';
    } else {
        btn.style.display = 'none';
    }
}

window.addEventListener('scroll', updateStickyCta);

function updateDynamicSeats() {
    const el1 = document.getElementById('dynamicSeats');
    const el2 = document.getElementById('dynamicSeats2');
    let current = parseInt(sessionStorage.getItem('fake_seats') || '14');
    
    if (current > 3 && Math.random() > 0.7) {
        current--;
        sessionStorage.setItem('fake_seats', current);
    }
    
    if (el1) el1.innerText = current;
    if (el2) el2.innerText = current;
}
setInterval(updateDynamicSeats, 5000);
document.addEventListener('DOMContentLoaded', () => {
    initPage();

    // Defer Visitor Tracking to after window load to preserve LCP
    window.addEventListener('load', () => {
        // Visitor Tracking
        setTimeout(() => {
            fetch('https://api.counterapi.dev/v1/thiranex/visits/up')
                .then(res => res.json())
                .then(data => {
                    const el = document.getElementById('footerVisitorCount');
                    if (el) el.innerText = data.count.toLocaleString();
                })
                .catch(err => console.error('Tracking error:', err));
        }, 2000); // 2-second delay after load
    });

    // Social Proof Interval
    setTimeout(() => {
        showRecentReg();
        setInterval(showRecentReg, Math.floor(Math.random() * 10000) + 15000);
    }, 3000);

    // Auto-open registration on scroll (Technical Cleanup: moved from index.html)
    (function () {
        let scrollTriggered = false;
        window.addEventListener('scroll', function () {
            if (!scrollTriggered && window.scrollY > 1500) {
                scrollTriggered = true;
                const activeModal = document.querySelector('.modal-overlay[style*="flex"]');
                const exitVisible = document.getElementById('exitIntentPopup')?.style.display === 'flex';
                // Only open form if nothing else is showing
                if (!activeModal && !exitVisible) {
                    setTimeout(function () { openModal('registerModal'); }, 800);
                }
            }
        }, { passive: true });
    })();

    // Live seat counter logic (Technical Cleanup: moved from index.html)
    (function () {
        const el = document.getElementById('liveRegCount');
        if (!el) return;
        const base = Math.floor(Math.random() * 8) + 12; // 12-19
        el.textContent = base;
        setInterval(() => {
            const curr = parseInt(el.textContent);
            if (curr > 5) el.textContent = curr - Math.floor(Math.random() * 2);
        }, 90000);
    })();
});

function showRecentReg() {
    const names = ["Rahul S.", "Priya M.", "Ankit V.", "Suresh K.", "Megha R.", "Vikram T.", "Sneha P.", "Arjun B.", "Divya N.", "Karthik R.", "Deepika G.", "Manish J."];
    const domains = ["Web Development", "AI & ML", "Data Science", "App Development", "Cyber Security", "UI/UX Design"];
    const cities = ["Bangalore", "Chennai", "Pune", "Hyderabad", "Mumbai", "Delhi", "Kochi", "Ahmedabad"];

    const name = names[Math.floor(Math.random() * names.length)];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];

    const toast = document.createElement('div');
    toast.className = 'recent-reg-toast';

    toast.innerHTML = `
        <div class="toast-icon">
            <i class="ph-fill ph-check-circle"></i>
        </div>
        <div>
            <div class="toast-title">${name} from ${city}</div>
            <div class="toast-sub">Just applied for <span class="toast-domain">${domain}</span></div>
        </div>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = "slideOutLeft 0.5s ease-in forwards";
        setTimeout(() => toast.remove(), 500);
    }, 5000);
}

function updateBatchDates() {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth();
    const year = today.getFullYear();

    let nextBatchYear = year;
    let nextBatchMonth = month;
    let nextBatchDay;

    // Fixed logic for 1st and 15th cycles
    if (day < 15) {
        nextBatchDay = 15;
        nextBatchMonth = month;
    } else {
        nextBatchDay = 1;
        nextBatchMonth = month + 1;
        if (nextBatchMonth > 11) {
            nextBatchMonth = 0;
            nextBatchYear++;
        }
    }

    const nextBatch = new Date(nextBatchYear, nextBatchMonth, nextBatchDay);

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const monthShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const fullDate = `${String(nextBatchDay).padStart(2, '0')} ${monthNames[nextBatchMonth]} ${nextBatchYear}`;
    const shortDate = `${String(nextBatchDay).padStart(2, '0')} ${monthShort[nextBatchMonth]} ${nextBatchYear}`;
    const batchDisplayName = `${monthNames[nextBatchMonth]} ${String(nextBatchDay).padStart(2, '0')}`;

    // Update Banner Batch Date
    const bannerBatchDate = document.getElementById('bannerBatchDate');
    if (bannerBatchDate) bannerBatchDate.innerText = shortDate;

    // Update Hero Batch Date
    const heroBatchDate = document.getElementById('heroBatchDate');
    if (heroBatchDate) heroBatchDate.innerText = fullDate;

    // Update Success Modal Batch Name
    const successBatchName = document.getElementById('successBatchName');
    if (successBatchName) successBatchName.innerText = batchDisplayName;

    // Update Banner Countdown
    const bannerCountdown = document.getElementById('bannerCountdown');
    if (bannerCountdown) {
        // Calculate diff in days
        const oneDay = 24 * 60 * 60 * 1000;
        const diffDays = Math.ceil((nextBatch - today) / oneDay);
        
        if (diffDays <= 0) {
            bannerCountdown.innerText = `TODAY`;
        } else {
            bannerCountdown.innerText = `IN ${diffDays} DAYS`;
        }
    }

    // Dynamic Batch ID tag in Banner (THX-APR126-001 style)
    const bannerLabel = document.getElementById('bannerBatchLabel');
    if (bannerLabel) {
        const cycle = (nextBatchDay === 1) ? '1' : '2';
        const yearShort = String(nextBatchYear).slice(-2);
        const monUpper = monthShort[nextBatchMonth].toUpperCase();
        bannerLabel.innerText = `${monUpper}${cycle}${yearShort}`;
    }
}

