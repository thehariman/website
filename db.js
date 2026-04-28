const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyt1ErtiD4v4uRAfMBONSPNPe5srHvpqu8bawEYKza9rxwHyI0HyCddFZxncLQ6vMoV/exec"; // Final GAS URL

const DB = {
    data: {
        interns: [],
        domains: {},
        submissions: [],
        settings: {}
    },

    // --- Initialization ---
    async initialize() {
        if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes("YOUR_WEB_APP_URL")) {
            alert("Critical Error: Backend URL not configured. Data cannot be loaded.");
            return;
        }

        // Check for file:// protocol which often causes CORS/Fetch issues
        if (window.location.protocol === 'file:') {
            console.warn("Running from file:// origin. This might block fetching data from Google Scripts.");
        }

        try {
            console.log("Fetching data from cloud...");
            // Add cache-busting timestamp
            const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getAllData&_t=${new Date().getTime()}`);
            if (!response.ok) throw new Error("Server returned " + response.status);

            const cloudData = await response.json();

            // Helper to normalize intern objects (Handle header case variations: ID vs id, Name vs name)
            const normalizeIntern = (i) => {
                const n = { ...i };
                
                // 1. Standardize core property names (handle diverse sheet headers)
                // ID
                if (!n.id) {
                    n.id = n.ID || n['Intern ID'] || n['internId'] || n['intern_id'] || '';
                }
                // Name
                if (!n.name) {
                    n.name = n.Name || n['Full Name'] || n['name'] || '';
                }
                n.name = String(n.name).trim();

                // Email
                if (!n.email) n.email = n.Email || n['Email ID'] || '';
                n.email = String(n.email).trim().toLowerCase();

                // Mobile
                if (!n.mobile) n.mobile = n.Mobile || n['Contact Number'] || '';
                n.mobile = String(n.mobile).replace(/\D/g, '');

                // Business logic fields
                if (!n.domain && n.Domain) n.domain = n.Domain;
                if (!n.status && n.Status) n.status = n.Status;
                if (n.status) n.status = n.status.toLowerCase();
                
                // 2. Standardize Offer Approval status
                let approvedVal = n.offerApproved;
                if (approvedVal === undefined || approvedVal === null || approvedVal === '') {
                    // Check alternative keys if main key is missing
                    approvedVal = n.OfferApproved || n['Offer Approved'] || n.offer_approved;
                }
                
                // Robust boolean conversion
                if (approvedVal !== undefined && approvedVal !== null && approvedVal !== '') {
                    n.offerApproved = String(approvedVal).toLowerCase() === 'true';
                } else {
                    // Critical Fix: Only auto-approve if a valid URL exists
                    const hasUrl = n.offerLetterUrl && String(n.offerLetterUrl).trim().startsWith('http');
                    n.offerApproved = hasUrl ? true : false;
                }

                // 3. Normalization fallbacks for other fields
                if (n.feeAmount === undefined) {
                    n.feeAmount = n.fee_amount || n['Fee Amount'] || n.Fee || 0;
                }
                if (n.certApproved !== undefined && n.certApproved !== null) {
                    n.certApproved = String(n.certApproved).toLowerCase() === 'true';
                } else {
                    n.certApproved = String(n.CertApproved || n['Cert Approved'] || n.cert_approved).toLowerCase() === 'true';
                }

                return n;
            };

            // Helper to normalize submission objects
            const normalizeSubmission = (s) => {
                const n = { ...s };
                // Normalize internId
                if (!n.internId) {
                    if (n.InternId) n.internId = n.InternId;
                    else if (n.intern_id) n.internId = n.intern_id;
                    else if (n['Intern ID']) n.internId = n['Intern ID'];
                }
                if (n.internId) n.internId = String(n.internId).trim();

                // Normalize taskId
                if (!n.taskId) {
                    if (n.TaskId) n.taskId = n.TaskId;
                    else if (n.task_id) n.taskId = n.task_id;
                    else if (n['Task ID']) n.taskId = n['Task ID'];
                }
                // Normalize status - CRITICAL for task counting
                if (!n.status) {
                    if (n.Status) n.status = n.Status;
                }
                // Ensure status is lowercase for consistency
                if (n.status) {
                    n.status = String(n.status).toLowerCase().trim();
                }
                // Normalize proof
                if (!n.proof && n.Proof) n.proof = n.Proof;
                // Normalize timestamp
                if (!n.timestamp && n.Timestamp) n.timestamp = n.Timestamp;

                return n;
            };

            this.data.interns = (cloudData.interns || []).map(normalizeIntern);
            this.data.domains = cloudData.domains || this.getDefaultDomains();
            this.data.submissions = (cloudData.submissions || []).map(normalizeSubmission);
            this.data.settings = cloudData.settings || {};

            console.log("=== DATA LOADED ===");
            console.log("Interns:", this.data.interns.length);
            console.log("Submissions:", this.data.submissions.length);
            console.log("Approved tasks:", this.data.submissions.filter(s => s.status === 'approved').length);
            console.log("Pending tasks:", this.data.submissions.filter(s => s.status === 'pending').length);

            // Log a sample to check structure
            if (this.data.submissions.length > 0) {
                console.log("Sample submission:", this.data.submissions[0]);
            }

            console.log("Data successfully synced from Google Sheets");
        } catch (e) {
            console.error("Failed to sync with Google Sheets:", e);
            if (window.location.protocol === 'file:') {
                alert("Connection Error: Access to server is blocked by your browser because you are running the file directly (file://). Please open this project using a local server (like Live Server in VS Code) or host it on a web server.");
            } else {
                alert("Connection Error: Could not fetch data from the server. Detailed error: " + e.message + ". Please check your internet connection and reload.");
            }
        }
    },

    // --- Cloud Sync Helpers ---
    async sync(type) {
        if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes("YOUR_WEB_APP_URL")) return;

        // prepare payload
        const payload = { action: '', [type]: this.data[type] };

        switch (type) {
            case 'interns': payload.action = 'saveInterns'; break;
            case 'domains': payload.action = 'saveDomains'; break;
            case 'submissions': payload.action = 'saveSubmissions'; break;
            case 'settings': payload.action = 'saveSettings'; break;
        }

        try {
            console.log(`[Sync] Initiating ${type} sync...`, payload);
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(payload)
            });
            const resultText = await response.text();
            console.log(`[Sync] ${type} synced successfully. Server response:`, resultText);
        } catch (e) {
            console.error(`[Sync] Failed to sync ${type}:`, e);
            alert(`Warning: Failed to save ${type} to server. Your changes may not be persisted. Check your internet and reload.`);
        }
    },

    // --- Data Accessors (Sync for UI) ---
    get(key) {
        if (key === 'submissions') {
            const now = new Date().getTime();
            const fourHours = 4 * 60 * 60 * 1000;

            this.data.submissions.forEach(sub => {
                if (sub.status === 'pending' && sub.timestamp) {
                    const subTime = new Date(sub.timestamp).getTime();
                    if (now - subTime >= fourHours) {
                        sub.status = 'approved';
                        // Trigger background DB sync to officially mark as approved everywhere
                        setTimeout(() => this.approveTask(sub.internId, sub.taskId, true), 100);
                    }
                }
            });
        }
        return this.data[key];
    },

    set(key, val) {
        this.data[key] = val;
        this.sync(key);
    },

    // Alias for explicit sync
    async syncInterns() {
        await this.sync('interns');
    },

    async registerIntern(data) {
        // Check duplicates: Allow same email/mobile ONLY if domain is different
        // Use normalized comparisons
        const inputEmail = String(data.email).trim().toLowerCase();
        const inputDomain = String(data.domain).trim();
        // NEW: Normalize mobile
        const inputMobile = String(data.mobile).trim();

        // 1. Check for Duplicate Profile (Same Domain) - Always Block
        const exists = this.data.interns.find(i =>
        ((String(i.email).trim().toLowerCase() === inputEmail || String(i.mobile).trim() === inputMobile) &&
            String(i.domain).trim() === inputDomain)
        );

        if (exists) {
            return { success: false, message: 'You have already registered for this domain with this email or mobile number.' };
        }

        // 2. Check for Concurrent Internships (Different Domain)
        // Rule: You cannot start a new domain if you have an "active" or "pending" internship.
        // You MUST complete (have certificate) or be dropped to start a new one.
        const ongoingInternship = this.data.interns.find(i =>
            (String(i.email).trim().toLowerCase() === inputEmail || String(i.mobile).trim() === inputMobile) &&
            (i.status === 'active') &&
            !(i.certificateUrl || i.certApproved) // Certified interns are considered complete and can re-apply.
        );

        if (ongoingInternship) {
            return { success: false, message: `Action Required: You are currently pursuing an internship in "${ongoingInternship.domain}". Please complete it before applying for a new domain.` };
        }

        const newIntern = {
            ...data,
            id: '', // Empty ID initially
            name: data.name,
            email: data.email,
            mobile: data.mobile,
            domain: data.domain,
            batch: new Date().toISOString().slice(0, 7),
            status: 'active', // Auto-approve: students can login immediately
            offerApproved: true, // Auto-approve offer letter
            joinedDate: new Date().toISOString().split('T')[0],
            paymentStatus: 'unpaid',
            feeAmount: '100',
            referredBy: (data.referredBy || '').trim().toUpperCase()
        };

        // CRITICAL: Push directly to cloud for referrals to work reliably
        if (GOOGLE_SCRIPT_URL && !GOOGLE_SCRIPT_URL.includes("YOUR_WEB_APP_URL")) {
            try {
                const response = await fetch(GOOGLE_SCRIPT_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify({ action: 'registerIntern', internData: newIntern })
                });
                const result = await response.json();

                // If cloud sync works, rely on it
                if (result.status !== 'success') {
                    console.error("Cloud registration failed, falling back to local list sync:", result.message);
                } else {
                    console.log("Cloud registration successful");
                }
            } catch (e) {
                console.error("Cloud registration network error:", e);
            }
        }

        this.data.interns.push(newIntern);
        // await this.sync('interns'); // REMOVED: Full sheet overwrite is dangerous and unnecessary after registerIntern action
        return { success: true, message: 'Registration successful! We will contact you shortly.' };
    },

    // --- Domain Management ---
    getDomains() { return this.data.domains; },

    async addDomain(name, tasks) {
        this.data.domains[name] = tasks;
        await this.sync('domains');
        return true;
    },

    async updateDomain(oldName, newName, tasks) {
        if (oldName !== newName) {
            delete this.data.domains[oldName];
            // Update interns
            this.data.interns.forEach(i => {
                if (i.domain === oldName) i.domain = newName;
            });
            await this.sync('interns');
        }
        this.data.domains[newName] = tasks;
        await this.sync('domains');
        return true;
    },

    async deleteDomain(name) {
        delete this.data.domains[name];
        await this.sync('domains');
        return true;
    },

    // --- Intern Management ---
    async updateIntern(id, updates) {
        // Optimized atomic update
        return await this.updateInternProfile(id, updates);
    },

    async updateInternProfile(id, profileData) {
        // 1. Optimistic UI update
        const idx = this.data.interns.findIndex(i => String(i.id) === String(id));
        if (idx > -1) {
            this.data.interns[idx] = { ...this.data.interns[idx], ...profileData };

            // Update session
            const current = this.getCurrentUser();
            if (current && String(current.id) === String(id)) {
                sessionStorage.setItem('portal_user', JSON.stringify({ ...current, ...this.data.interns[idx] }));
            }
        }

        // 2. Server Update (Critical)
        if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes("YOUR_WEB_APP_URL")) {
            console.error("Backend URL missing");
            return false;
        }

        try {
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ action: 'updateInternProfile', internId: id, profileData: profileData })
            });
            const result = await response.json();
            if (result.status === 'success') {
                return true;
            } else {
                console.error("Server failed to update profile:", result.message);
                return false;
            }
        } catch (e) {
            console.error("Network error updating profile:", e);
            return false;
        }
    },

    // --- Auth ---
    login(email, mobile) {
        // Normalize inputs
        const cleanEmail = String(email).trim();
        const cleanMobile = String(mobile).trim();

        // Admin Check – credentials are stored in settings (not hard‑coded)
        const adminSettings = DB.getSettings().admin || {};
        const adminEmails = (adminSettings.emails || []).map(e => e.toLowerCase());
        const adminPassword = adminSettings.password || '';
        const isAdminEmail = adminEmails.includes(cleanEmail.toLowerCase());
        const isCorrectPassword = cleanMobile === adminPassword;
        // Admin credentials now loaded from settings (above)

        if (isAdminEmail && isCorrectPassword) {
            const admin = { 
                email: cleanEmail.toLowerCase(), 
                role: 'admin', 
                name: 'THIRANEX Admin',
                lastLogin: new Date().toISOString()
            };
            localStorage.setItem('portal_user', JSON.stringify(admin));
            return admin;
        }

        // Student Check
        // Student login requires fetching data. Ensure interns are loaded or check against local cache if init not done.
        // Assuming DB.data.interns is populated if initialize() was called or if data is persisted some other way.
        // Note: index.html calls DB.initialize() on load? Let's verify.
        const users = this.data.interns.filter(i =>
            String(i.email).trim().toLowerCase() === cleanEmail.toLowerCase() &&
            String(i.mobile).trim() === cleanMobile
        );

        if (users.length === 0) return null;

        // If multiple matches (multiple domains), return all valid ones
        // If single match, proceed as usual
        if (users.length === 1) {
            const user = users[0];
            if (user.status === 'pending_verification') {
                return { error: 'pending_verification', message: 'Your registration is pending admin verification. Please wait for approval.' };
            }
            user.role = 'student';
            localStorage.setItem('portal_user', JSON.stringify(user));
            return user;
        }

        // Handle multiple profiles
        // Filter out pending ones if you want, or show them with status?
        // Let's return them all and let UI handle selection
        return { multiple: true, profiles: users };
    },
    getCurrentUser() {
        const sessionUser = JSON.parse(localStorage.getItem('portal_user') || sessionStorage.getItem('portal_user'));
        if (!sessionUser) return null;
        if (sessionUser.role === 'admin') return sessionUser;

        // Optimized Search: Trim and lowercase match for Email and Domain
        const sEmail = String(sessionUser.email).trim().toLowerCase();
        const sDomain = String(sessionUser.domain).trim();

        let freshUser = this.data.interns.find(i =>
            String(i.email).trim().toLowerCase() === sEmail &&
            String(i.domain).trim() === sDomain
        );

        if (!freshUser && sessionUser.id) {
            freshUser = this.data.interns.find(i => String(i.id).trim() === String(sessionUser.id).trim());
        }

        return freshUser ? { ...freshUser, role: 'student' } : sessionUser;
    },
    logout() {
        const user = this.getCurrentUser();
        const isAdmin = user && user.role === 'admin';
        localStorage.removeItem('portal_user');
        sessionStorage.removeItem('portal_user');
        window.location.href = isAdmin ? 'admin-login.html' : 'index.html';
    },

    // --- Task Engine ---
    getInternTasks(internId, domain) {
        const domainTasks = this.data.domains[domain] || [];
        const mySubs = this.get('submissions').filter(s => String(s.internId) === String(internId));
        const intern = this.data.interns.find(i => String(i.id) === String(internId));

        console.log(`[getInternTasks] Intern: ${internId}, Domain: ${domain}`);
        console.log(`[getInternTasks] Domain tasks: ${domainTasks.length}, My submissions: ${mySubs.length}`);
        console.log(`[getInternTasks] Submissions:`, mySubs);

        // Inject Brand Tasks
        const offerTask = {
            id: 'mandatory_offer_task',
            title: "Offer Letter & LinkedIn Post",
            objective: "Download your offer letter, post it on LinkedIn tagging Thiranex, and share the post URL here.",
            feature: "Download Offer Letter, Post on LinkedIn, Share URL",
            outcome: "Share your success with your network to unlock further internship modules!",
            isMandatory: true,
            type: 'linkedin'
        };

        const offerSub = mySubs.find(s => String(s.taskId) === 'mandatory_offer_task');
        const offerTaskWithStatus = {
            ...offerTask,
            status: offerSub ? offerSub.status : 'available',
            proof: offerSub ? offerSub.proof : '',
            offerLetterUrl: intern ? intern.offerLetterUrl : ''
        };

        const mappedDomainTasks = domainTasks.map(t => {
            const sub = mySubs.find(s => String(s.taskId) === String(t.id));
            const taskWithStatus = {
                ...t,
                status: sub ? sub.status : 'available',
                proof: sub ? sub.proof : ''
            };
            return taskWithStatus;
        });

        // --- Inject Certificate Task ---
        const certTask = {
            id: 'mandatory_cert_task',
            title: "Share Certificate on LinkedIn",
            objective: "Post your verified certificate on LinkedIn tagging Thiranex.",
            feature: "Establish Professional Brand",
            outcome: "Network Growth",
            isCertificateTask: true
        };
        const certSub = mySubs.find(s => String(s.taskId) === 'mandatory_cert_task');

        // Auto-approve after 2 hours logic
        let certStatus = 'locked';
        let certProof = '';
        if (certSub) {
            certStatus = certSub.status;
            certProof = certSub.proof;
            if (certStatus === 'pending' && certSub.timestamp) {
                const subTime = new Date(certSub.timestamp).getTime();
                const now = new Date().getTime();
                const twoHours = 2 * 60 * 60 * 1000;

                if (now - subTime >= twoHours) {
                    certStatus = 'approved';
                    // Trigger background DB sync to officially mark as approved everywhere
                    setTimeout(() => {
                        this.approveTask(internId, 'mandatory_cert_task', true);
                    }, 100);
                }
            }
        }

        const certTaskWithStatus = {
            ...certTask,
            status: certStatus,
            proof: certProof,
            certificateUrl: intern ? intern.certificateUrl : ''
        };
        // Unlock if certificate is issued? No, renderTasks handles lock logic based on certificateUrl
        // But we should pass status correctly if they submitted it.

        return [offerTaskWithStatus, ...mappedDomainTasks, certTaskWithStatus];
    },

    async submitTask(internId, taskId, proof) {
        const idx = this.data.submissions.findIndex(s => String(s.internId) === String(internId) && String(s.taskId) === String(taskId));
        const newSub = {
            internId: String(internId),
            taskId: String(taskId),
            proof,
            status: 'pending',
            timestamp: new Date().toISOString()
        };

        if (idx > -1) this.data.submissions[idx] = newSub;
        else this.data.submissions.push(newSub);

        // Atomic Cloud Sync - Critical for submissions
        if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes("YOUR_WEB_APP_URL")) return;

        try {
            console.log(`[SubmitTask] Initiating sync for intern: ${internId}, task: ${taskId}`);
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ action: 'submitTask', submission: newSub })
            });
            const resultText = await response.text();
            console.log(`[SubmitTask] Sync successful. Response:`, resultText);
        } catch (e) {
            console.error('Failed to submit task to cloud:', e);
            alert("Submission Error: Failed to send data to server.");
        }
    },

    async approveTask(internId, taskId, silentMode = false) {
        const sub = this.data.submissions.find(s => String(s.internId) === String(internId) && String(s.taskId) === String(taskId));
        if (sub) {
            sub.status = 'approved';

            if (GOOGLE_SCRIPT_URL && !GOOGLE_SCRIPT_URL.includes("YOUR_WEB_APP_URL")) {
                fetch(GOOGLE_SCRIPT_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify({ action: 'updateTaskStatus', internId, taskId, status: 'approved' })
                })
                    .then(res => res.text())
                    .then(text => console.log("[ApproveTask] Sync success:", text))
                    .catch(e => {
                        console.error("[ApproveTask] Cloud update failed", e);
                        if (!silentMode) alert("Update Failed: Could not sync approval to server.");
                    });
            }
            return true;
        }
        return false;
    },

    async rejectTask(internId, taskId) {
        const sub = this.data.submissions.find(s => String(s.internId) === String(internId) && String(s.taskId) === String(taskId));
        if (sub) {
            sub.status = 'rejected';

            if (GOOGLE_SCRIPT_URL && !GOOGLE_SCRIPT_URL.includes("YOUR_WEB_APP_URL")) {
                fetch(GOOGLE_SCRIPT_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify({ action: 'updateTaskStatus', internId, taskId, status: 'rejected' })
                })
                    .then(res => res.text())
                    .then(text => console.log("[RejectTask] Sync success:", text))
                    .catch(e => {
                        console.error("[RejectTask] Cloud update failed", e);
                        alert("Update Failed: Could not sync rejection to server.");
                    });
            }
            return true;
        }
        return false;
    },

    // --- Payment & Certs ---
    submitPayment(internId, ref) {
        return this.updateIntern(internId, { paymentStatus: 'pending', paymentRef: ref, paymentTimestamp: new Date().toISOString() });
    },
    verifyPayment(internId, status) {
        return this.updateIntern(internId, { paymentStatus: status });
    },
    requestCertificate(internId) {
        return this.updateIntern(internId, { certRequestStatus: 'requested', certRequestDate: new Date().toISOString() });
    },

    // --- Statistics ---
    getInternStats() {
        const activeInterns = this.data.interns.filter(i => i.status === 'active').length;
        const totalRevenue = this.data.interns
            .filter(i => i.paymentStatus === 'verified')
            .reduce((sum, i) => sum + (parseFloat(i.feeAmount) || 0), 0);

        const amountPending = this.data.interns
            .filter(i => i.paymentStatus === 'pending')
            .reduce((sum, i) => sum + (parseFloat(i.feeAmount) || 0), 0);

        const pendingCerts = this.data.interns.filter(i => i.certRequestStatus === 'requested' && i.paymentStatus === 'verified').length;

        return { activeInterns, totalRevenue, amountPending, pendingCerts };
    },

    // --- Settings ---
    getSettings() { return this.data.settings; },
    async updateSettings(newSettings) {
        this.data.settings = { ...this.data.settings, ...newSettings };
        await this.sync('settings');
        return true;
    },

    async generateCertificate(certData) {
        if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes("YOUR_WEB_APP_URL")) {
            return { status: 'error', message: 'Google Script URL not configured.' };
        }

        try {
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                // Keep it simple, we need result back so we can't use no-cors if we want result, 
                // but GAS typically requires no-cors for simple POST or redirects. 
                // Actually, for returning data, we might need to handle the redirect or use doGet.
                // Let's use a standard POST and see if CORS allows it with a simple request.
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ action: 'generateCertificate', ...certData })
            });
            const result = await response.json();

            return result;
        } catch (e) {
            console.error("Certificate generation failed:", e);
            return { status: 'error', message: e.message };
        }
    },

    async generateOfferLetter(offerData) {
        if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes("YOUR_WEB_APP_URL")) {
            return { status: 'error', message: 'Google Script URL not configured.' };
        }

        try {
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ action: 'generateOfferLetter', ...offerData })
            });
            const result = await response.json();
            return result;
        } catch (e) {
            console.error("Offer letter generation failed:", e);
            return { status: 'error', message: e.message };
        }
    },



    async deleteIntern(idOrEmail, domain = null) {
        // Remove from local list
        const initialLength = this.data.interns.length;
        this.data.interns = this.data.interns.filter(i => {
            // Check if ID matches (if i.id exists)
            if (i.id && String(i.id).toLowerCase() === String(idOrEmail).toLowerCase()) {
                return false; // Remove
            }

            // Check if Email matches
            if (String(i.email).toLowerCase() === String(idOrEmail).toLowerCase()) {
                // If domain provided, only remove if domain matches
                if (domain) {
                    return i.domain !== domain;
                }
                // If no domain provided, remove all with this email
                return false;
            }

            return true; // Keep
        });

        if (this.data.interns.length === initialLength) return false; // Not found

        // Sync to cloud (this rewrites the whole sheet, effectively deleting the row)
        await this.syncInterns();
        return true;
    },

    async generateBatchReport(reportData) {
        if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes("YOUR_WEB_APP_URL")) {
            return { status: 'error', message: 'Google Script URL not configured.' };
        }

        try {
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ action: 'generateBatchReport', ...reportData })
            });
            const result = await response.json();
            return result;
        } catch (e) {
            console.error("Batch report generation failed:", e);
            return { status: 'error', message: e.message };
        }
    },



    // --- Defaults ---
    getDefaultDomains() {
        return {
            "Web Development": [
                { id: 1, title: "HTML/CSS Basics", objective: "Build a single page responsive profile using semantic HTML and Vanilla CSS.", feature: "Semantic HTML5 tags, Flexbox/Grid layout, Responsive Media Queries", outcome: "A personal profile page deployed on GitHub Pages." },
                { id: 2, title: "JavaScript Fundamentals", objective: "Create a functional calculator or Todo app using ES6+ features.", feature: "Event listeners, Array methods, LocalStorage", outcome: "A working interactive web application." },
                { id: 3, title: "DOM Manipulation", objective: "Build an interactive image gallery with dynamic filtering.", feature: "Dynamic DOM creation, Filter logic, Modal for image preview", outcome: "An image gallery with category filtering." },
                { id: 4, title: "API Integration", objective: "Fetch and display weather data using a public API (OpenWeather).", feature: "Fetch API / Async-Await, Error handling, JSON parsing", outcome: "A weather dashboard displaying real-time data." },
                { id: 5, title: "Final Project", objective: "A full-fledged portfolio with blog section and contact form.", feature: "Multi-page navigation, Form validation, Responsive design", outcome: "A complete professional portfolio website." }
            ],
            // ... (Other default domains can be added here if needed for fallback)
        };
    },
    getDefaultSettings() {
        return {
            upiId: "+919465241129@upi",
            accountName: "THIRANEX",
            bankName: "Indian Bank",
            accountNumber: "50317307045",
            ifsc: "IDIB000P132",
            preferredMethod: "upi",
            whatsappLink: "",
            whatsappLastUpdated: "",
            certCompanyName: "Thiranex IT Solutions",
            certSignatory: "Hariharan M",
            certSignatoryTitle: "Founder & CEO",
            certText: "This is to certify that {{name}} has successfully completed an internship in {{domain}} from {{start}} to {{end}}.",
            // Admin credentials are now stored only in the backend sheet (settings).
        };
    }
};
