<script>
        const student = DB.getCurrentUser();
        if (!student || student.role !== 'student') window.location.href = 'index.html';

        document.getElementById('userName').innerText = student.name;
        document.getElementById('userDomain').innerText = student.domain;


        async function generateMyOfferLetter(btn) {
            const current = DB.getCurrentUser();
            if (!current) return;

            // If no btn passed, default to the header one
            const targetBtn = btn || document.getElementById('offerLink');
            const originalHTML = targetBtn.innerHTML;
            targetBtn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Generating...';
            targetBtn.style.pointerEvents = 'none';

            try {
                // Get standard values for offer letter
                const settings = DB.getSettings();

                const logoBase64 = await getLogoBase64();
                const msmeBase64 = await getMSMELogoBase64();
                const sigBase64 = await getHRSignatureBase64(); // Reverted to HR Signature

                // Derive Start and End dates from Batch if not explicitly stored
                let startDate = current.startDate || "";
                let endDate = current.endDate || "";

                if (!startDate && current.batch) {
                    const d = new Date(current.batch);
                    if (!isNaN(d.getTime())) {
                        startDate = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                        // End date is roughly 1 month later
                        const ed = new Date(d);
                        ed.setMonth(ed.getMonth() + 1);
                        ed.setDate(ed.getDate() - 1);
                        endDate = ed.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                    }
                }

                const studentData = {
                    name: current.name,
                    internId: current.id,
                    domain: current.domain,
                    batch: formatBatchDate(current.batch),
                    start: startDate,
                    end: endDate,
                    signatory: 'Keerthana S',
                    signatoryTitle: 'HR - Manager',
                    signatoryContact: 'thiranex.internships@outlook.com | +91 9465241129',
                    logo: logoBase64,
                    msmeLogo: msmeBase64,
                    signature: sigBase64,
                    approvalDate: current.approvalDate || new Date().toISOString()
                };

                const result = await DB.generateOfferLetter(studentData);

                if (result.status === 'success' && result.base64) {
                    const linkSource = `data:application/pdf;base64,${result.base64}`;
                    const downloadLink = document.createElement("a");
                    downloadLink.href = linkSource;
                    downloadLink.download = result.fileName;
                    downloadLink.click();

                    alert('Offer letter generated successfully! Please download and post it on LinkedIn to complete your first task.');
                } else {
                    throw new Error(result.message || 'Generation failed');
                }
            } catch (err) {
                console.error("Failed to generate offer letter:", err);
                alert("Error: " + err.message);
            } finally {
                targetBtn.innerHTML = originalHTML;
                targetBtn.style.pointerEvents = 'auto';
            }
        }


        async function generateMyCertificate(btn) {
            const current = DB.getCurrentUser();
            if (!current) return;

            const targetBtn = btn;
            const originalHTML = targetBtn.innerHTML;
            targetBtn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Generating...';
            targetBtn.style.pointerEvents = 'none';

            try {
                const settings = DB.getSettings();
                const logoBase64 = await getLogoBase64();
                const msmeBase64 = await getMSMELogoBase64();
                const sigBase64 = await getCEOSignatureBase64();

                // Dates logic
                let startDate = current.startDate || "";
                let endDate = current.endDate || "";
                if (!startDate && current.batch) {
                    const d = new Date(current.batch);
                    if (!isNaN(d.getTime())) {
                        startDate = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                        const ed = new Date(d);
                        ed.setMonth(ed.getMonth() + 1);
                        ed.setDate(ed.getDate() - 1);
                        endDate = ed.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                    }
                }

                const certData = {
                    name: current.name,
                    internId: current.id,
                    domain: current.domain,
                    batch: formatBatchDate(current.batch),
                    start: startDate,
                    end: endDate,
                    signatory: settings.certSignatory || 'Hariharan M',
                    signatoryTitle: settings.certSignatoryTitle || 'Founder & CEO',
                    templateText: settings.certText || 'This is to certify that {{name}} has successfully completed an internship in {{domain}} from {{start}} to {{end}}.',
                    companyName: settings.certCompanyName || 'THIRANEX',
                    logo: logoBase64,
                    msmeLogo: msmeBase64,
                    signature: sigBase64
                };

                const result = await DB.generateCertificate(certData);

                if (result.status === 'success' && result.base64) {
                    const linkSource = `data:application/pdf;base64,${result.base64}`;
                    const downloadLink = document.createElement("a");
                    downloadLink.href = linkSource;
                    downloadLink.download = result.fileName;
                    downloadLink.click();
                } else {
                    throw new Error(result.message || 'Generation failed');
                }
            } catch (err) {
                console.error("Failed to generate certificate:", err);
                alert("Error: " + err.message);
            } finally {
                targetBtn.innerHTML = originalHTML;
                targetBtn.style.pointerEvents = 'auto';
            }
        }


        async function getLogoBase64() {
            try {
                const response = await fetch('thiranex-free-internship-with-certificate-logo.png');
                if (!response.ok) return null;
                const blob = await response.blob();
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(blob);
                });
            } catch (e) {
                return null;
            }
        }

        async function getHRSignatureBase64() {
            try {
                const response = await fetch('HR SIGNATURE.png');
                if (!response.ok) return null;
                const blob = await response.blob();
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(blob);
                });
            } catch (e) {
                return null;
            }
        }

        async function getCEOSignatureBase64() {
            try {
                const response = await fetch('CEO_SIGNATURE.png');
                if (!response.ok) return null;
                const blob = await response.blob();
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(blob);
                });
            } catch (e) {
                return null;
            }
        }

        async function getMSMELogoBase64() {
            try {
                const response = await fetch('msme-registered-internship-provider-logo.png');
                if (response.ok) {
                    const blob = await response.blob();
                    return await new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result);
                        reader.readAsDataURL(blob);
                    });
                }
                // Fallback
                const fallback = await fetch('https://upload.wikimedia.org/wikipedia/en/thumb/0/0b/MSME_India_logo.png/600px-MSME_India_logo.png');
                const blob = await fallback.blob();
                return await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(blob);
                });
            } catch (e) {
                return null;
            }
        }

        function switchTab(tab) {
            const tasksSec = document.getElementById('sectionTasks');
            const helpSec = document.getElementById('sectionHelp');
            const referSec = document.getElementById('sectionRefer');
            const btnTasks = document.getElementById('tabTasks');
            const btnHelp = document.getElementById('tabHelp');
            const btnRefer = document.getElementById('tabRefer');
            const btnPayment = document.getElementById('tabPayment');

            tasksSec.style.display = 'none';
            helpSec.style.display = 'none';
            if (referSec) referSec.style.display = 'none'; // Keep conditional check for referSec

            btnTasks.classList.remove('active');
            if (btnPayment) btnPayment.classList.remove('active');
            btnHelp.classList.remove('active');
            if (btnRefer) btnRefer.classList.remove('active');

            if (tab === 'tasks') {
                tasksSec.style.display = 'block';
                btnTasks.classList.add('active');
            } else if (tab === 'payment') {
                // Payment is now a modal, don't hide everything else, just open it
                tasksSec.style.display = 'block'; // Keep tasks as background
                btnTasks.classList.add('active');
                if (btnPayment) btnPayment.classList.add('active');
                openPaymentModal();
            } else if (tab === 'help') {
                helpSec.style.display = 'block';
                btnHelp.classList.add('active');
                renderHelp();
            } else if (tab === 'refer') {
                referSec.style.display = 'block';
                btnRefer.classList.add('active');
                renderMyReferrals();
            }
        }

        function renderHelp() {
            const settings = DB.getSettings();
            const batchLink = settings.whatsappLink;
            const batchArea = document.getElementById('batchGroupArea');
            const batchGroupLink = document.getElementById('batchGroupLink');

            if (batchLink && batchLink.trim() !== "" && batchLink.trim() !== "#") {
                if (batchArea) batchArea.style.display = 'block';
                if (batchGroupLink) batchGroupLink.href = batchLink;
            } else {
                if (batchArea) batchArea.style.display = 'none';
            }
        }


        function renderPaymentStatus() {
            // Refresh student data from DB using the centralized method
            const updatedStudent = DB.getCurrentUser();

            if (updatedStudent) {
                // --- Offer Letter Logic ---
                const offerLink = document.getElementById('offerLink');
                offerLink.className = 'btn doc-btn'; // Preserve class

                const isValidOfferUrl = updatedStudent.offerLetterUrl && String(updatedStudent.offerLetterUrl).trim().startsWith('http');

                if (isValidOfferUrl) {
                    offerLink.href = updatedStudent.offerLetterUrl;
                    offerLink.style.background = 'white';
                    offerLink.style.color = '#10B981';
                    offerLink.style.border = '1px solid #10B981';
                    offerLink.style.cursor = 'pointer';
                    offerLink.style.opacity = '1';
                    offerLink.innerHTML = '<i class="ph ph-download-simple"></i> Offer Letter';
                    offerLink.onclick = null;
                } else if (updatedStudent.offerApproved) {

                    // Automate Offer Letter Generation from Student End (If Approved)
                    offerLink.removeAttribute('href');
                    offerLink.style.background = 'white';
                    offerLink.style.color = '#10B981';
                    offerLink.style.border = '1px solid #10B981';
                    offerLink.style.cursor = 'pointer';
                    offerLink.style.opacity = '1';
                    offerLink.innerHTML = '<i class="ph ph-file-pdf"></i> Download Offer Letter';
                    offerLink.onclick = (e) => {
                        e.preventDefault();
                        generateMyOfferLetter(offerLink);
                    };
                } else {
                    offerLink.removeAttribute('href');
                    offerLink.style.background = '#F3F4F6';
                    offerLink.style.color = '#9CA3AF';
                    offerLink.style.border = '1px solid #E5E7EB';
                    offerLink.style.cursor = 'help';
                    offerLink.title = 'Please wait for admin verification';
                    offerLink.innerHTML = '<i class="ph ph-clock"></i> Offer Pending';
                    offerLink.onclick = (e) => { e.preventDefault(); alert('Your registration is pending verification. Please wait for approval.'); };
                }

                // --- Certificate Logic ---
                const certLink = document.getElementById('certLink');
                certLink.className = 'btn doc-btn'; // Preserve class

                // Eligibility check
                const tasks = DB.getInternTasks(updatedStudent.id, updatedStudent.domain);
                const coreTasks = tasks.filter(t => !t.isCertificateTask);
                const coreComplete = coreTasks.length > 0 && coreTasks.every(t => t.status === 'approved');
                const paymentComplete = updatedStudent.paymentStatus === 'verified';
                const certRequested = updatedStudent.certRequestStatus === 'requested';

                if (updatedStudent.certificateUrl || updatedStudent.certApproved) {
                    // Admin has approved certificate â€” allow student to generate/download it
                    if (updatedStudent.certificateUrl) {
                        certLink.href = updatedStudent.certificateUrl;
                        certLink.onclick = null;
                    } else {
                        certLink.removeAttribute('href');
                        certLink.onclick = (e) => {
                            e.preventDefault();
                            generateMyCertificate(certLink);
                        };
                    }
                    certLink.style.background = 'white';
                    certLink.style.color = '#3B82F6';
                    certLink.style.border = '1px solid #3B82F6';
                    certLink.style.cursor = 'pointer';
                    certLink.style.opacity = '1';
                    certLink.innerHTML = '<i class="ph ph-certificate"></i> Download Certificate';
                } else if (coreComplete && paymentComplete) {
                    if (certRequested) {
                        certLink.removeAttribute('href');
                        certLink.style.background = 'white';
                        certLink.style.color = '#F59E0B';
                        certLink.style.border = '1px solid #F59E0B';
                        certLink.style.cursor = 'wait';
                        certLink.style.opacity = '1';
                        certLink.innerHTML = '<i class="ph ph-hourglass-high"></i> Awaiting Approval';
                        certLink.onclick = (e) => { e.preventDefault(); alert('Your certificate request has been submitted. Admin will approve it soon â€” this page will update automatically.'); };
                    } else {
                        certLink.removeAttribute('href');
                        certLink.style.background = '#10B981';
                        certLink.style.color = 'white';
                        certLink.style.border = 'none';
                        certLink.style.cursor = 'pointer';
                        certLink.style.opacity = '1';
                        certLink.innerHTML = '<i class="ph ph-certificate"></i> Request Certificate';
                        certLink.onclick = (e) => { e.preventDefault(); handleFinalCertificateRequest(); };
                    }
                } else if (coreComplete && !paymentComplete) {
                    certLink.removeAttribute('href');
                    certLink.style.background = '#FFF7ED';
                    certLink.style.color = '#C2410C';
                    certLink.style.border = '1px solid #FDBA74';
                    certLink.style.cursor = 'pointer';
                    certLink.style.opacity = '1';
                    certLink.innerHTML = '<i class="ph ph-credit-card"></i> Pay & Request';
                    certLink.onclick = (e) => { e.preventDefault(); goToPayment(); };
                } else {
                    certLink.removeAttribute('href');
                    certLink.style.background = '#F3F4F6';
                    certLink.style.color = '#9CA3AF';
                    certLink.style.border = '1px solid #E5E7EB';
                    certLink.style.cursor = 'help';
                    certLink.style.opacity = '0.8';
                    certLink.innerHTML = '<i class="ph ph-lock-key"></i> Certificate Locked';
                    
                    let reason = 'Complete all tasks and payment to unlock your certificate.';
                    if (coreComplete && !paymentComplete) reason = 'Tasks completed! Complete payment to request your certificate.';
                    else if (!coreComplete && paymentComplete) reason = 'Payment verified! Complete all tasks to request your certificate.';
                    
                    certLink.onclick = (e) => { e.preventDefault(); alert(reason); };
                }
            }

             const formArea = document.getElementById('paymentUIArea');
            const statusArea = document.getElementById('paymentStatusArea');

            if (!updatedStudent) return;

            if (updatedStudent.paymentStatus === 'verified') {
                if (formArea) formArea.style.display = 'none';
                statusArea.style.display = 'block';
                document.getElementById('statusIcon').innerHTML = '<i class="ph-fill ph-check-circle" style="color: #10B981;"></i>';
                document.getElementById('statusTitle').innerText = 'Payment Verified!';
                document.getElementById('statusDesc').innerText = `Your convenience fee of â‚¹${updatedStudent.feeAmount || 0} has been successfully verified. You have unlocked all gifts and features.`;
                document.getElementById('verifiedBadge').style.display = 'block';
            } else if (updatedStudent.paymentStatus === 'pending') {
                if (formArea) formArea.style.display = 'none';
                statusArea.style.display = 'block';
                document.getElementById('statusIcon').innerHTML = '<i class="ph-bold ph-clock-countdown" style="color: #3b82f6;"></i>';
                document.getElementById('statusTitle').innerText = 'Verification Pending';
                document.getElementById('statusDesc').innerText = `Our admin team is verifying your payment of â‚¹${updatedStudent.feeAmount || 0} (Ref: ${updatedStudent.paymentRef}). This usually takes a few hours.`;
                document.getElementById('verifiedBadge').style.display = 'none';
            } else {
                if (formArea) formArea.style.display = 'block';
                statusArea.style.display = 'none';


                // Update Dynamic QR Logic
                const settings = DB.getSettings();
                const upiID = settings.upiId;
                const name = settings.accountName;
                const amount = (parseFloat(updatedStudent.feeAmount) || 0).toFixed(2);
                const method = settings.preferredMethod || 'upi';

                // Generate Dynamic URL based on method (VPA or Bank Account)
                let upiUrl = '';
                const note = "Intern ID: " + (updatedStudent.id || "");
                if (method === 'bank') {
                    // Hidden Bank Account Logic: accountNumber@IFSC.ifsc.npci
                    const bankVPA = `${settings.accountNumber}@${settings.ifsc}.ifsc.npci`;
                    upiUrl = `upi://pay?pa=${bankVPA}&pn=${encodeURIComponent(name)}&am=${amount}&tn=${encodeURIComponent(note)}&cu=INR`;
                } else {
                    upiUrl = `upi://pay?pa=${upiID}&pn=${encodeURIComponent(name)}&am=${amount}&tn=${encodeURIComponent(note)}&cu=INR`;
                }

                const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUrl)}`;
                document.getElementById('dynamicQR').src = qrUrl;

                // Fill Summary Fields for the new Razorpay-style design
                const summaryName = document.getElementById('summaryName');
                const summaryDomain = document.getElementById('summaryDomain');
                const summaryBatch = document.getElementById('summaryBatch');
                const summaryAmount = document.getElementById('summaryAmount');

                if (summaryName) summaryName.innerText = updatedStudent.name || '-';
                if (summaryDomain) summaryDomain.innerText = updatedStudent.domain || '-';
                if (summaryAmount) summaryAmount.innerText = `â‚¹${updatedStudent.feeAmount || 0}`;
            }
        }

        function renderTasks() {
            const student = DB.getCurrentUser(); // Ensure fresh data
            const tasks = DB.getInternTasks(student.id, student.domain);
            const list = document.getElementById('taskList');
            list.innerHTML = '';

            const coreTasks = tasks.filter(t => !t.isCertificateTask);
            const approvedCount = coreTasks.filter(t => t.status === 'approved').length;
            const coreComplete = approvedCount === coreTasks.length && coreTasks.length > 0;

            // Updated Payment Tab visibility
            const tabPayment = document.getElementById('tabPayment');
            const mobileTabPayment = document.getElementById('mobileTabPayment');
            if (tabPayment) tabPayment.style.display = coreComplete ? 'flex' : 'none';
            if (mobileTabPayment) mobileTabPayment.style.display = coreComplete ? 'flex' : 'none';

            tasks.forEach((task, index) => {
                const isApproved = task.status === 'approved';
                const isPending = task.status === 'pending';
                const isRejected = task.status === 'rejected';


                const coreOnly = tasks.filter(t => !t.isCertificateTask);
                const approvedCoreCount = coreOnly.filter(t => t.status === 'approved').length;
                const coreComplete = approvedCoreCount === coreOnly.length && coreOnly.length > 0;

                let isLocked = false;

                if (task.isCertificateTask) {
                    // Lock if core tasks not complete
                    if (!coreComplete) {
                        isLocked = true;
                    }
                }

                const card = document.createElement('div');
                card.className = `card task-card ${isLocked ? 'locked' : ''} ${isApproved ? 'completed' : ''}`;

                let statusBadge = '';
                if (isApproved) statusBadge = '<span class="badge badge-success">Completed</span>';
                else if (isPending) statusBadge = '<span class="badge badge-warning">Reviewing</span>';
                else if (isRejected) statusBadge = '<span class="badge badge-danger">Revision Needed</span>';
                else if (isLocked) statusBadge = '<span class="badge" style="background: #E2E8F0;">Locked</span>';
                else statusBadge = '<span class="badge badge-primary">Available</span>';

                // Safely handle click events by using the index
                const openModalClick = `handleTaskSubmit(${index})`;

                // Custom content for derived types
                let cardBody = '';
                if (task.isMandatory) {
                    cardBody = `
                        <h3 style="margin-bottom: 0.5rem; color: #0077B5;"><i class="ph-fill ph-linkedin-logo"></i> Mandatory: ${task.title}</h3>
                        <p class="text-muted" style="font-size: 0.9rem; margin-bottom: 1.5rem;">${task.objective}</p>
                        
                        ${!isApproved && !isPending ? `
                            <div style="margin-top: 1rem;">
                                ${student.offerLetterUrl ? `
                                    <div style="display: flex; flex-direction: column; gap: 0.8rem;">
                                        <a href="${student.offerLetterUrl}" target="_blank" class="btn" style="background: #10B981; color: white; justify-content: center; width: 100%;">
                                            <i class="ph ph-download-simple"></i> 1. Download Offer Letter
                                        </a>
                                        <button class="btn btn-primary" style="justify-content: center; width: 100%;" onclick="handleMandatorySubmit()">
                                            <i class="ph ph-linkedin-logo"></i> 2. Submit LinkedIn Post URL
                                        </button>
                                    </div>
                                ` : (student.offerApproved ? `
                                    <div style="display: flex; flex-direction: column; gap: 0.8rem;">
                                        <button class="btn" style="background: #10B981; color: white; justify-content: center; width: 100%; border: none;" onclick="generateMyOfferLetter(this)">
                                            <i class="ph ph-file-pdf"></i> 1. Download Offer Letter
                                        </button>
                                        <button class="btn btn-primary" style="justify-content: center; width: 100%;" onclick="handleMandatorySubmit()">
                                            <i class="ph ph-linkedin-logo"></i> 2. Submit LinkedIn Post URL
                                        </button>
                                    </div>
                                ` : `
                                    <div style="background: #FFF7ED; padding: 1.2rem; border-radius: 12px; border: 1px solid #FFEDD5; text-align: center;">
                                        <p style="color: #9A3412; font-size: 0.9rem; font-weight: 600; margin-bottom: 0.3rem;">
                                            <i class="ph ph-clock-countdown ph-spin"></i> Offer Pending Approval
                                        </p>
                                        <p style="color: #C2410C; font-size: 0.8rem;">Your registration is approved! Admin is currently reviewing your offer letter details. Please check back soon.</p>
                                    </div>
                                `)}
                            </div>
                        ` : ''}
                    `;
                } else if (task.isCertificateTask) {
                    cardBody = `
                        <h3 style="margin-bottom: 0.5rem; color: #0077B5;"><i class="ph-fill ph-linkedin-logo"></i> ${task.title}</h3>
                        <p class="text-muted" style="font-size: 0.9rem; margin-bottom: 1.5rem;">${task.objective}</p>
                        
                        ${isLocked ? `
                            <div style="background: #FFF7ED; padding: 1.2rem; border-radius: 12px; border: 1px solid #FFEDD5; text-align: center;">
                                <p style="color: #9A3412; font-size: 0.9rem; font-weight: 600; margin-bottom: 0.3rem;">
                                    <i class="ph ph-lock-key"></i> Certificate Pending
                                </p>
                                <p style="color: #C2410C; font-size: 0.8rem;">Complete all domain tasks and request your certificate to unlock this step.</p>
                            </div>
                        ` : ''}

                         ${!isLocked && !isApproved && !isPending ? `
                             <div style="margin-top: 1rem; display: flex; flex-direction: column; gap: 0.8rem;">
                                 ${(student.certificateUrl || student.certApproved) ? `
                                     <button class="btn" style="background: #3B82F6; color: white; justify-content: center; width: 100%;" onclick="generateMyCertificate(this)">
                                         <i class="ph ph-certificate"></i> 1. Download Certificate
                                     </button>
                                 ` : `
                                     <div style="background: #FFF7ED; padding: 1rem; border-radius: 12px; border: 1px solid #FFEDD5; text-align: center;">
                                         <p style="color: #9A3412; font-size: 0.85rem; font-weight: 600;">
                                             <i class="ph ph-clock-countdown ph-spin"></i> Certificate Pending Approval
                                         </p>
                                         <p style="color: #C2410C; font-size: 0.75rem;">Your request is received! Admin is verifying your eligibility and generating your verified certificate. Please check back soon.</p>
                                     </div>
                                 `}
                                 <button class="btn btn-primary" style="justify-content: center; width: 100%; font-weight: 600;" onclick="${openModalClick}">
                                     <i class="ph ph-linkedin-logo"></i> 2. Submit LinkedIn Post URL
                                 </button>
                             </div>
                         ` : ''}
                     `;
                } else {
                    cardBody = `
                        <h3 style="margin-bottom: 0.5rem;">${task.title}</h3>
                        <p class="text-muted" style="font-size: 0.9rem; margin-bottom: 1rem;">${task.objective || task.desc || ''}</p>
                        
                        ${task.feature ? `
                            <div style="margin-bottom: 0.5rem;">
                                <small style="font-weight: 600; color: var(--primary);">Key Features:</small>
                                <ul style="font-size: 0.85rem; color: #475569; margin-top: 0.2rem; padding-left: 1.2rem;">
                                    ${String(task.feature).includes('\n') ?
                                String(task.feature).split('\n').map(f => f.trim()).filter(f => f).map(f => `<li style="margin-bottom: 0.2rem;">${f}</li>`).join('') :
                                String(task.feature).split(',').map(f => f.trim()).filter(f => f).map(f => `<li style="margin-bottom: 0.2rem;">${f}</li>`).join('')
                            }
                                </ul>
                            </div>` : ''}
                        ${task.outcome ? `<div style="margin-bottom: 1.5rem;"><small style="font-weight: 600; color: var(--success);">Expected Outcome:</small><p style="font-size: 0.85rem; color: #475569;">${task.outcome}</p></div>` : ''}

                        ${!isLocked && !isApproved && !isPending ? `
                            <div style="display: flex; justify-content: center; margin-top: 1rem;">
                                <button class="btn btn-primary" onclick="${openModalClick}">
                                    Submit Work
                                </button>
                            </div>` : ''}
                    `;
                }

                // --- Deadline Logic ---
                // Always base deadlines on the internship start date (batch date)
                let baseDate = new Date();
                if (student.batch) {
                    // batch is stored as "YYYY-MM" — use day 1 of that month as the start
                    const parsed = new Date(student.batch + "-01");
                    if (!isNaN(parsed.getTime())) baseDate = parsed;
                } else if (student.startDate) {
                    const parsed = new Date(student.startDate);
                    if (!isNaN(parsed.getTime())) baseDate = parsed;
                }
                if (isNaN(baseDate.getTime())) baseDate = new Date();

                let deadlineDays = 0;
                let isImmediate = false;
                
                if (task.isMandatory) {
                     isImmediate = true;
                } else if (task.isCertificateTask) {
                     deadlineDays = 40; 
                } else {
                     if (index === 1) deadlineDays = 7;
                     else if (index === 2) deadlineDays = 14;
                     else if (index === 3) deadlineDays = 21;
                     else if (index === 4) deadlineDays = 30;
                     else deadlineDays = 30 + ((index - 4) * 7);
                }
                
                let deadlineDateStr = "Immediate Submission";
                let daysLeftStr = "";
                
                if (!isImmediate) {
                    const deadlineDate = new Date(baseDate);
                    deadlineDate.setDate(deadlineDate.getDate() + deadlineDays);
                    deadlineDateStr = deadlineDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
                    
                    const now = new Date();
                    deadlineDate.setHours(23, 59, 59, 999);
                    const diffTime = deadlineDate - now;
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    
                    if (isApproved || isPending) {
                        daysLeftStr = `<span style="color: #64748b; font-size: 0.8rem;"><i class="ph-fill ph-check-circle" style="color: #10B981;"></i> Submitted on track</span>`;
                    } else if (diffDays < 0) {
                        daysLeftStr = `<span style="color: #991B1B; font-size: 0.8rem; font-weight: 600; background: #FEE2E2; padding: 4px 10px; border-radius: 12px; border: 1px solid #FECACA;">Overdue by ${Math.abs(diffDays)} Days</span>`;
                    } else if (diffDays === 0) {
                        daysLeftStr = `<span style="color: #B45309; font-size: 0.8rem; font-weight: 600; background: #FEF3C7; padding: 4px 10px; border-radius: 12px; border: 1px solid #FDE68A;">Due Today</span>`;
                    } else {
                        daysLeftStr = `<span style="color: #065F46; font-size: 0.8rem; font-weight: 600; background: #D1FAE5; padding: 4px 10px; border-radius: 12px; border: 1px solid #A7F3D0;">${diffDays} Days Left</span>`;
                    }
                } else {
                    if (isApproved || isPending) {
                        daysLeftStr = `<span style="color: #64748b; font-size: 0.8rem;"><i class="ph-fill ph-check-circle" style="color: #10B981;"></i> Submitted</span>`;
                    } else {
                        daysLeftStr = `<span style="color: #991B1B; font-size: 0.8rem; font-weight: 600; background: #FEE2E2; padding: 4px 10px; border-radius: 12px; border: 1px solid #FECACA;">Immediate Action required</span>`;
                    }
                }

                card.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                        <div style="width: 40px; height: 40px; border-radius: 8px; background: ${isLocked ? '#E2E8F0' : (task.isMandatory || task.isCertificateTask ? '#0077B5' : 'var(--primary-light)')}; display: flex; align-items: center; justify-content: center; color: ${isLocked ? '#94A3B8' : (task.isMandatory || task.isCertificateTask ? 'white' : 'var(--primary)')}; font-weight: bold; font-size: 1.2rem;">
                            ${task.isMandatory || task.isCertificateTask ? '<i class="ph-fill ph-linkedin-logo"></i>' : index}
                        </div>
                        ${statusBadge}
                    </div>
                    
                    ${!task.isCertificateTask ? `
                    <div style="margin-bottom: 1rem; padding-bottom: 0.8rem; border-bottom: 1px dashed #E2E8F0; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
                        <div style="color: #64748B; font-size: 0.85rem;"><i class="ph ph-calendar-blank" style="margin-right: 0.2rem;"></i> Due Date: <strong style="color: #334155;">${deadlineDateStr}</strong></div>
                        <div>${daysLeftStr}</div>
                    </div>` : ''}
                    
                    ${cardBody}
                    
                    ${isPending ? `<div style="background: var(--primary-light); padding: 1rem; border-radius: 8px; margin-top: 1rem; text-align: center;"><p style="font-size: 0.85rem; color: var(--primary-dark); font-weight: 500;"><i class="ph ph-hourglass-high"></i> Under review by admin...</p></div>` : ''}
                    
                    ${isApproved ? `<div style="background: #DCFCE7; padding: 1rem; border-radius: 8px; margin-top: 1rem; text-align: center;"><p style="font-size: 0.85rem; color: #166534; font-weight: 600;"><i class="ph ph-check-circle"></i> Completed Successfully!</p></div>` : ''}
                    
                    ${isRejected ? `
                        <div style="margin-top: 1rem;">
                            <div style="background: #FEE2E2; padding: 0.8rem; border-radius: 8px; margin-bottom: 1rem; text-align: center;">
                                <p style="font-size: 0.85rem; color: #991B1B; font-weight: 500;"><i class="ph ph-warning-circle"></i> Changes requested by mentor.</p>
                            </div>
                            <div style="display: flex; justify-content: center;">
                                <button class="btn" style="background: #991B1B; color: white;" onclick="${openModalClick}">
                                    Resubmit Work
                                </button>
                            </div>
                        </div>` : ''}
                `;

                list.appendChild(card);
            });


            // Update Progress
            const coreOnly = tasks.filter(t => !t.isCertificateTask);
            const approvedCore = coreOnly.filter(t => t.status === 'approved').length;
            const progress = (approvedCore / (coreOnly.length || 1)) * 100;
            if (document.getElementById('progressBar')) {
                document.getElementById('progressBar').style.width = `${progress}%`;
                document.getElementById('userLevel').innerText = `${Math.round(progress)}%`;
            }

            // Gamified stats removed as requested

            // Streak and Achievements logic removed as requested

            // Certificate Request Logic
            const certRequested = student.certRequestStatus === 'requested';
            const certIssued = student.certificateUrl || student.certApproved;
            const paymentComplete = student.paymentStatus === 'verified';
            const requestArea = document.getElementById('certificateRequestArea');

            if (coreComplete && !certIssued) {
                requestArea.style.display = 'block';
                if (certRequested) {
                    requestArea.innerHTML = `
                        <div class="card" style="text-align: center; border: 2px solid var(--primary); background: var(--primary-light); display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 2rem; border-radius: 16px;">
                            <div style="width: 60px; height: 60px; border-radius: 50%; background: white; display: flex; align-items: center; justify-content: center; color: var(--primary); font-size: 2rem; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                                <i class="ph-fill ph-clock-countdown"></i>
                            </div>
                            <div>
                                <h3 style="color: var(--primary-dark)">Certificate Requested!</h3>
                                <p class="text-muted">You've completed all tasks. Admin will issue your certificate soon.</p>
                            </div>
                        </div>
                    `;
                } else {
                    requestArea.innerHTML = `
                        <div class="card" style="text-align: center; background: #0f172a; color: white; padding: 2rem 1.5rem; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); position: relative; overflow: hidden; box-shadow: 0 15px 35px rgba(0,0,0,0.25); margin-bottom: 2rem;">
                            <!-- Background Decor -->
                            <div style="position: absolute; top: -40px; right: -40px; width: 100px; height: 100px; background: rgba(59, 130, 246, 0.1); border-radius: 50%; filter: blur(30px);"></div>
                            <div style="position: absolute; bottom: -40px; left: -40px; width: 100px; height: 100px; background: rgba(16, 185, 129, 0.1); border-radius: 50%; filter: blur(30px);"></div>
                            
                            <div style="position: relative; z-index: 1;">
                                <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #3b82f6 0%, #2dd4bf 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 2.2rem; margin: 0 auto 1rem; transform: rotate(-5deg); box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4); animation: floatTask 4s ease-in-out infinite;">
                                    <i class="ph-fill ph-trophy" style="color: white;"></i>
                                </div>
                                
                                <h2 style="font-size: 1.5rem; font-weight: 800; margin-bottom: 0.75rem; color: #ffffff; letter-spacing: -0.3px;">
                                    ${paymentComplete ? 'Eligibility Unlocked!' : 'Milestone Reached! ðŸš€'}
                                </h2>
                                
                                <p style="color: #94a3b8; font-size: 0.95rem; line-height: 1.5; max-width: 500px; margin: 0 auto 1.5rem; font-weight: 500;">
                                    ${paymentComplete 
                                        ? 'Extraordinary work! Both tasks and payment are verified. You can now request your official credentials.' 
                                        : 'Outstanding performance! You have finished all modules. Complete the processing fee to request your certificate.'}
                                </p>
                                
                                <button class="btn" style="padding: 1rem 2rem; font-size: 0.95rem; font-weight: 800; border-radius: 12px; background: ${paymentComplete ? '#10b981' : '#ffffff'}; color: ${paymentComplete ? '#ffffff' : '#0f172a'}; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 0.6rem; transition: transform 0.2s; box-shadow: 0 8px 20px rgba(0,0,0,0.15); text-transform: uppercase; letter-spacing: 1px;"
                                    onclick="${paymentComplete ? 'handleFinalCertificateRequest()' : 'goToPayment()'}">
                                    <i class="${paymentComplete ? 'ph-fill ph-certificate' : 'ph-bold ph-credit-card'}" style="font-size: 1.1rem;"></i>
                                    ${paymentComplete ? 'Request Now' : 'Complete Verification'}
                                </button>
                                
                                <div style="margin-top: 1.5rem; display: flex; justify-content: center; gap: 1.5rem; opacity: 0.6;">
                                    <div style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.75rem; color: #94a3b8;">
                                        <i class="ph ph-shield-check" style="color: #10b981;"></i> 100% Secured
                                    </div>
                                    <div style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.75rem; color: #94a3b8;">
                                        <i class="ph ph-medal" style="color: #f59e0b;"></i> Certified
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }
            } else {
                requestArea.style.display = 'none';
            }

            // Auto Popup for Payment
            if (coreComplete && student.paymentStatus !== 'verified' && student.paymentStatus !== 'pending') {
                if (!sessionStorage.getItem('paymentPopupShown')) {
                    sessionStorage.setItem('paymentPopupShown', 'true');
                    setTimeout(() => {
                         const popup = document.createElement('div');
                         popup.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;animation:fadeIn 0.3s ease;";
                         popup.innerHTML = `
                             <div class="card" style="background:white;padding:2.5rem 2rem;border-radius:16px;text-align:center;max-width:90%;width:400px;box-shadow:0 20px 25px -5px rgba(0,0,0,0.1),0 10px 10px -5px rgba(0,0,0,0.04);">
                                  <div style="width:70px;height:70px;border-radius:50%;background:#D1FAE5;display:flex;align-items:center;justify-content:center;color:#10B981;font-size:2.5rem;margin:0 auto 1.5rem;">
                                      <i class="ph-fill ph-check-circle"></i>
                                  </div>
                                  <h2 style="font-size:1.5rem;font-weight:700;margin-bottom:0.5rem;color:#1e293b;">Milestone Reached!</h2>
                                  <p style="color:#64748b;margin-bottom:1.5rem;font-size:0.95rem;line-height:1.5;">You have successfully completed all your core internship modules. Please proceed to complete the verification payment to request your certificate.</p>
                                  <button class="btn btn-primary" style="width:100%;justify-content:center;font-size:1rem;padding:0.8rem;border-radius:8px;" onclick="this.parentElement.parentElement.remove(); switchTab('payment');">
                                      Pay & Unlock Certificate
                                  </button>
                             </div>
                         `;
                         document.body.appendChild(popup);
                    }, 800);
                }
            }

            renderPaymentStatus();
        }

        // New Helper Handlers to prevent syntax errors in onclick attributes
        function handleTaskSubmit(index) {
            const tasks = DB.getInternTasks(student.id, student.domain);
            const task = tasks[index];
            if (task) {
                openSubmitModal(task.id, task.title, task.objective || task.desc || 'Submit your project link for review.');
            }
        }

        function handleMandatorySubmit() {
            const tasks = DB.getInternTasks(student.id, student.domain);
            const task = tasks[0]; // Always first
            if (task) {
                openSubmitModal(task.id, task.title, 'Post your offer letter on LinkedIn, tag Thiranex, and paste the post URL below.');
            }
        }

        async function handleFinalCertificateRequest() {
            const current = DB.getCurrentUser();
            const success = await DB.requestCertificate(current.id);
            if (success) {
                alert('Success! Your certificate request has been sent to the admin. You will be notified once it is issued.');
                renderTasks();
                renderPaymentStatus();
            } else {
                alert('Request failed. Please try again or contact support.');
            }
        }

        function openSubmitModal(id, title, objective) {
            document.getElementById('modalTaskId').value = id;
            document.getElementById('modalTaskTitle').innerText = title;
            document.getElementById('modalTaskDesc').innerText = objective;
            document.getElementById('submitModal').style.display = 'flex';
        }

        function closeModal() { document.getElementById('submitModal').style.display = 'none'; }

        document.getElementById('submitTaskForm').addEventListener('submit', function (e) {
            e.preventDefault();
            const taskId = document.getElementById('modalTaskId').value;
            const proof = document.getElementById('taskProof').value;

            DB.submitTask(student.id, taskId, proof);
            alert('Task submitted successfully! The admin will review it soon.');
            closeModal();
            renderTasks();
            renderPaymentStatus();
        });

        document.getElementById('paymentForm').addEventListener('submit', async function (e) {
            e.preventDefault();
            const refId = document.getElementById('payRef').value;
            const success = await DB.submitPayment(student.id, refId);
            if (success) {
                alert('Transaction submitted! Admin will verify your payment soon. Once verified, you can formally request your certificate.');
            } else {
                alert('Submission failed. Please try again.');
            }
            renderPaymentStatus();
            renderTasks();
        });

        // Toggle Mobile Menu
        function toggleMobileMenu() {
            const menu = document.getElementById('mobileMenu');
            const backdrop = document.getElementById('menuBackdrop');
            menu.classList.toggle('active');
            backdrop.style.display = menu.classList.contains('active') ? 'block' : 'none';
        }

        function formatBatchDate(dateStr) {
            if (!dateStr) return '';
            if (dateStr.includes('T') || dateStr.includes('-')) {
                const d = new Date(dateStr);
                if (!isNaN(d.getTime())) {
                    return d.toLocaleString('default', { month: 'short', year: 'numeric' });
                }
            }
            return dateStr;
        }

        // Profile Modal Logic
        function openProfileModal() {
            const current = DB.getCurrentUser();
            document.getElementById('pInternId').value = current.id || 'N/A';
            document.getElementById('pBatch').value = formatBatchDate(current.batch) || 'N/A';
            document.getElementById('pName').value = current.name || '';
            document.getElementById('pCollege').value = current.college || '';
            document.getElementById('pSkills').value = current.skills || '';
            document.getElementById('profileModal').style.display = 'flex';
        }

        function closeProfileModal() {
            document.getElementById('profileModal').style.display = 'none';
        }

        document.getElementById('profileForm').addEventListener('submit', function (e) {
            e.preventDefault();
            const updatedData = {
                name: document.getElementById('pName').value,
                college: document.getElementById('pCollege').value,
                skills: document.getElementById('pSkills').value
            };

            if (DB.updateIntern(student.id, updatedData)) {
                alert('Profile updated successfully!');
                closeProfileModal();
                const refreshed = DB.getCurrentUser();
                document.getElementById('userName').innerText = refreshed.name;
                Object.assign(student, refreshed);
            }
        });

        // ID Card Logic
        function toggleIDCardModal(show) {
            const modal = document.getElementById('idCardModal');
            if (show) {
                const current = DB.getCurrentUser();
                document.getElementById('idCardName').innerText = current.name || 'N/A';
                document.getElementById('idCardDomain').innerText = current.domain || 'N/A';
                document.getElementById('idCardInternId').innerText = current.id || 'N/A';
                document.getElementById('idCardBatch').innerText = formatBatchDate(current.batch) || 'N/A';
                document.getElementById('idAvatar').innerText = (current.name || 'A').charAt(0).toUpperCase();

                const statusValue = document.getElementById('idCardStatus');
                if (current.certificateUrl || current.certApproved) {
                    statusValue.innerText = 'Certified Graduate';
                    statusValue.style.color = 'var(--success)';
                } else if (current.status === 'dropped') {
                    statusValue.innerText = 'Inactive';
                    statusValue.style.color = 'var(--danger)';
                } else {
                    statusValue.innerText = 'Active Intern';
                    statusValue.style.color = '#10B981';
                }

                modal.style.display = 'flex';
            } else {
                modal.style.display = 'none';
            }
        }

        function shareIDCard() {
            if (navigator.share) {
                navigator.share({
                    title: 'My Thiranex Internship ID Card',
                    text: `I'm officially an intern at Thiranex in the ${student.domain} domain! ðŸš€`,
                    url: window.location.href
                }).catch(err => console.log('Error sharing', err));
            } else {
                alert('Success! To share your professional ID card, please take a screenshot or save the professional ID view above. You can post this on LinkedIn to share your achievement!');
            }
        }


        function getDriveDirectLink(url) {
            if (!url) return '';
            let id = '';
            // Try matching /d/ID/ or /d/ID patterns
            const parts = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
            if (parts && parts[1]) {
                id = parts[1];
            } else {
                const idParts = url.match(/id=([a-zA-Z0-9_-]+)/);
                if (idParts && idParts[1]) {
                    id = idParts[1];
                }
            }
            return id ? `https://drive.google.com/uc?id=${id}&export=download` : url;
        }

        function closePromoModal() {
            const modal = document.getElementById('promoModal');
            if (modal) modal.style.display = 'none';
        }

        function checkPromotion() {
            const settings = DB.getSettings();
            if (!settings) return;

            console.log("Checking Promotion:", settings);

            // Allow string 'true' or boolean true
            const isActive = String(settings.promoActive).toLowerCase() === 'true';

            if (isActive && settings.promoImage) {
                const modal = document.getElementById('promoModal');
                const img = document.getElementById('promoImage');
                if (!modal || !img) return;

                img.src = getDriveDirectLink(settings.promoImage);

                const promoLinkBtn = document.getElementById('promoLink');
                const linkUrl = settings.promoLink ? settings.promoLink.trim() : '';

                if (linkUrl && linkUrl !== '#' && linkUrl !== '') {
                    promoLinkBtn.href = linkUrl;
                    promoLinkBtn.style.display = 'flex'; // Show button
                    
                    const btnText = settings.promoBtnText || 'Enroll Now';
                    const btnSpan = document.getElementById('promoBtn');
                    if (btnSpan) btnSpan.innerText = btnText;
                } else {
                    promoLinkBtn.style.display = 'none'; // Hide button if no link
                }

                // Show modal with a slight delay for dramatic effect
                setTimeout(() => {
                    modal.style.display = 'flex';
                }, 800);
            }
        }
        // --- Referral Logic ---
        // --- Referral Logic ---
        function renderMyReferrals() {
            const current = DB.getCurrentUser();

            // GATE: Check UPI
            const gate = document.getElementById('referralUpiGate');
            const content = document.getElementById('referralDashboardContent');

            if (!current.upiId || current.upiId.trim() === '') {
                gate.style.display = 'block';
                content.style.display = 'none';
                return; // Stop rendering dashboard if no UPI
            } else {
                gate.style.display = 'none';
                content.style.display = 'block';
            }

            const interns = DB.get('interns');
            const body = document.getElementById('myReferralsBody');

            // Set Link
            const baseUrl = 'https://www.thiranex.in/index.html';
            const refLink = `${baseUrl}?ref=${current.id}`;
            document.getElementById('referralLinkInput').value = refLink;

            // Find my referrals (people who used my ID)
            // Note: referral code stored in referredBy is the Intern ID
            const myReferees = interns.filter(i => i.referredBy && String(i.referredBy).trim().toLowerCase() === String(current.id).trim().toLowerCase());

            document.getElementById('statTotalReferrals').innerText = myReferees.length;

            if (myReferees.length === 0) {
                body.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 2rem; color: var(--text-muted);">You haven\'t referred anyone yet. Share your link!</td></tr>';
                document.getElementById('statTotalEarned').innerText = 'â‚¹0';
                return;
            }

            let totalEarned = 0;
            let pendingWithdrawal = 0;

            const rows = myReferees.map(referee => {
                const refereePaid = referee.paymentStatus === 'verified';
                const myPaid = current.paymentStatus === 'verified';
                const rewardPaid = referee.referralRewardStatus === 'paid';

                let status = '';
                let reward = '';

                if (rewardPaid) {
                    status = '<span class="badge badge-success">Completed</span>';
                    reward = '<span style="color: #10B981; font-weight: 600;">â‚¹50 Paid</span>';
                    totalEarned += 50;
                } else if (refereePaid && myPaid) {
                    status = '<span class="badge badge-primary">Eligible</span>';
                    reward = '<span style="color: #3B82F6; font-weight: 600;">â‚¹50 Pending</span>';
                    totalEarned += 50;
                    pendingWithdrawal += 50;
                } else {
                    status = '<span class="badge badge-warning">Pending</span>';
                    reward = '<span style="color: #94A3B8;">Locked</span>';
                    if (!refereePaid) status += ' (Friend Unpaid)';
                    else if (!myPaid) status += ' (You Unpaid)';
                }

                return `
                    <tr style="border-bottom: 1px solid #F1F5F9;">
                        <td style="padding: 1rem;"><strong>${referee.name}</strong></td>
                        <td style="padding: 1rem;">${status}</td>
                        <td style="padding: 1rem;">${reward}</td>
                    </tr>
                `;
            }).join('');

            document.getElementById('statTotalEarned').innerText = 'â‚¹' + totalEarned;

            // Withdraw UI Logic
            const withdrawSec = document.getElementById('withdrawSection');
            const withdrawBtn = document.getElementById('btnWithdraw');
            const withdrawMsg = document.getElementById('withdrawMsg');
            const withdrawAmt = document.getElementById('statPendingWithdraw');

            if (withdrawSec) {
                if (pendingWithdrawal > 0) {
                    withdrawSec.style.display = 'block';
                    withdrawAmt.innerText = 'â‚¹' + pendingWithdrawal;

                    if (current.withdrawalStatus === 'requested') {
                        withdrawBtn.disabled = true;
                        withdrawBtn.innerText = 'Request Sent';
                        withdrawBtn.style.background = '#94A3B8';
                        withdrawMsg.innerText = 'Admin is processing your request...';
                    } else {
                        withdrawBtn.disabled = false;
                        withdrawBtn.innerText = 'Request Withdrawal';
                        withdrawBtn.style.background = '#F59E0B';
                        withdrawMsg.innerText = '';
                    }
                } else {
                    withdrawSec.style.display = 'none';
                }
            }

            body.innerHTML = rows;
            document.getElementById('statTotalEarned').innerText = 'â‚¹' + totalEarned;
        }

        // UPI Form Listener
        document.getElementById('referralUpiForm').addEventListener('submit', async function (e) {
            e.preventDefault();
            const upiId = document.getElementById('userUpiId').value.trim();
            if (!upiId) return;

            const current = DB.getCurrentUser();
            const btn = e.target.querySelector('button');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Saving...';
            btn.disabled = true;

            const success = await DB.updateInternProfile(current.id, { upiId: upiId });

            if (success) {
                alert('UPI ID saved safely to the server! You can now start referring.');
                // Refresh local user data slightly redundant as updateInternProfile does it, but good for safety
                // Trigger re-render
                renderMyReferrals();
            } else {
                alert('Failed to save UPI ID. Please try again.');
            }

            btn.innerHTML = originalText;
            btn.disabled = false;
        });

        async function shareReferralLink() {
            const input = document.getElementById('referralLinkInput');
            const link = input.value;
            const shareData = {
                title: 'Thiranex Internship',
                text: 'Hey! ðŸš€ Check out Thiranex for amazing online internships with verified certificates. I\'m learning a lot here!\n\nRegister using my link to get started:',
                url: link
            };

            if (navigator.share) {
                try {
                    await navigator.share(shareData);
                } catch (err) {
                    console.error('Error sharing:', err);
                }
            } else {
                // Fallback to clipboard
                input.select();
                input.setSelectionRange(0, 99999);
                navigator.clipboard.writeText(`Hey! ðŸš€ Check out Thiranex for amazing online internships with verified certificates. I'm learning a lot here!\n\nRegister using my link to get started: ${link}`).then(() => {
                    alert('Referral message copied to clipboard! You can now paste it in WhatsApp or other apps.');
                }).catch(err => {
                    console.error('Failed to copy: ', err);
                });
            }
        }


        // PWA Installation - Thiranex Student Portal
        let deferredPrompt;
        const installBtn = document.createElement('div');
        installBtn.id = 'pwaInstallBtn';
        installBtn.style.cssText = 'position:fixed; bottom:80px; left:50%; transform:translateX(-50%); background:#2563EB; color:white; padding:12px 24px; border-radius:50px; font-weight:700; box-shadow:0 10px 25px rgba(37,99,235,0.4); z-index:9999; cursor:pointer; display:none; align-items:center; gap:10px; animation: slideUpPWA 0.5s ease;';
        installBtn.innerHTML = '<i class="ph-bold ph-download-simple"></i> Install Thiranex App';
        document.body.appendChild(installBtn);

        const pStyle = document.createElement('style');
        pStyle.textContent = '@keyframes slideUpPWA { from { transform:translateX(-50%) translateY(100px); opacity:0; } to { transform:translateX(-50%) translateY(0); opacity:1; } }';
        document.head.appendChild(pStyle);

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            // Check if student is approved and modal not shown this session
            const user = DB.getCurrentUser();
            if (user && user.status === 'active' && !sessionStorage.getItem('pwaModalShown')) {
                document.getElementById('pwaModal').style.display = 'flex';
                sessionStorage.setItem('pwaModalShown', 'true');
            } else if (user && user.status === 'active') {
                installBtn.style.display = 'flex';
            }
        });

        const triggerPwaInstall = async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') { 
                    installBtn.style.display = 'none'; 
                    document.getElementById('pwaModal').style.display = 'none';
                }
                deferredPrompt = null;
            }
        };

        installBtn.addEventListener('click', triggerPwaInstall);
        document.getElementById('modalInstallBtn').addEventListener('click', triggerPwaInstall);

        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./sw.js').catch(() => {});
            });
        }


        (async function initApp() {
            try {
                // Step 1: Initial Render from Cache (Near Instant)
                if (DB.loadFromCache()) {
                    const cachedUser = DB.getCurrentUser();
                    if (cachedUser) {
                        if (document.getElementById('userName')) document.getElementById('userName').innerText = cachedUser.name;
                        if (document.getElementById('userDomain')) document.getElementById('userDomain').innerText = cachedUser.domain;
                        if (typeof renderTasks === 'function') renderTasks();
                        if (typeof renderPaymentStatus === 'function') renderPaymentStatus();
                        if (typeof renderHelp === 'function') renderHelp();
                        
                        // Hide overlay early if cache is good
                        const overlay = document.getElementById('loadingOverlay');
                        if (overlay) {
                            overlay.style.opacity = '0';
                            setTimeout(() => { overlay.style.visibility = 'hidden'; }, 500);
                        }
                    }
                }

                // Step 2: Fetch Fresh Data from Cloud
                await DB.initialize();
                
                // Step 3: Final Render with Cloud Data
                const freshUser = DB.getCurrentUser();
                if (freshUser && student) {
                    Object.assign(student, freshUser);
                    if (document.getElementById('userName')) document.getElementById('userName').innerText = student.name;
                    if (document.getElementById('userDomain')) document.getElementById('userDomain').innerText = student.domain;
                }

                if (typeof renderTasks === 'function') renderTasks();
                if (typeof renderPaymentStatus === 'function') renderPaymentStatus();
                if (typeof renderHelp === 'function') renderHelp();
                if (typeof checkPaymentRequirement === 'function') checkPaymentRequirement();
                if (typeof checkPromotion === 'function') checkPromotion();

                const freshForHash = DB.getCurrentUser();
                const allTasksInit = freshForHash ? DB.getInternTasks(freshForHash.id, freshForHash.domain) : [];
                const coreTasksInit = allTasksInit.filter(t => !t.isCertificateTask);
                const isFinished = coreTasksInit.length > 0 && coreTasksInit.every(t => t.status === 'approved');

                const hash = window.location.hash.replace('#', '');
                if (hash && ['tasks', 'payment', 'refer', 'help'].includes(hash)) {
                    if (hash === 'payment' && !isFinished) {
                        switchTab('tasks');
                    } else {
                        switchTab(hash);
                    }
                }

                if (isFinished && student && (student.offerApproved || student.offerLetterUrl)) {
                    if (student.paymentStatus !== 'verified' && student.paymentStatus !== 'pending') {
                        setTimeout(() => {
                            const modal = document.getElementById('paymentReminderModal');
                            if (modal) modal.style.display = 'flex';
                        }, 1000);
                    }
                }
            } catch (err) {
                console.error("Initialization error:", err);
            } finally {
                // Ensure overlay is hidden after a brief delay to feel smooth
                setTimeout(() => {
                    const overlay = document.getElementById('loadingOverlay');
                    if (overlay) {
                        overlay.style.opacity = '0';
                        setTimeout(() => { overlay.style.visibility = 'hidden'; }, 500);
                    }
                }, 1500);
            }
        })();

        function checkPaymentRequirement() {}

        function closePaymentReminder() {
            const modal = document.getElementById('paymentReminderModal');
            if (modal) modal.style.display = 'none';
        }

        async function requestWithdrawal() {
            const btn = document.getElementById('btnWithdraw');
            const originalText = btn.innerText;
            btn.innerText = 'Sending...';
            btn.disabled = true;

            const currentUser = DB.getCurrentUser();
            const success = await DB.updateInternProfile(currentUser.id, { withdrawalStatus: 'requested', withdrawalDate: new Date().toISOString() });

            if (success) {
                alert('Withdrawal request sent successfully!');
                renderMyReferrals();
            } else {
                alert('Failed to send request.');
                btn.innerText = originalText;
                btn.disabled = false;
            }
        }

        function goToPayment() {
            closePaymentReminder();
            openPaymentModal();
        }

        function openPaymentModal() {
            const modal = document.getElementById('paymentModal');
            if (modal) modal.style.display = 'flex';
            renderPaymentStatus();
        }

        function closePaymentModal() {
            const modal = document.getElementById('paymentModal');
            if (modal) modal.style.display = 'none';
            switchTab('tasks');
        }

        async function manualSync() {


            const syncBtn = document.getElementById('syncBtn');

            const icon = syncBtn.querySelector('i');

            

            syncBtn.disabled = true;

            icon.classList.add('ph-spin');



            try {

                await DB.initialize();

                

                // Refresh Task List

                if (typeof renderTasks === 'function') renderTasks();



                // Refresh Hero Section Buttons (offer & certificate)

                if (typeof renderPaymentStatus === 'function') renderPaymentStatus();

                

                // Refresh Profile Info

                const refreshed = DB.getCurrentUser();

                if (refreshed) {

                    if (document.getElementById('userName')) document.getElementById('userName').innerText = refreshed.name;

                    if (document.getElementById('userDomain')) document.getElementById('userDomain').innerText = refreshed.domain;

                }

                

                // Visual feedback

                syncBtn.style.color = '#10B981'; // Green

                setTimeout(() => { syncBtn.style.color = '#2563EB'; }, 2000);

            } catch (err) {

                console.error("Sync failed:", err);

            } finally {

                syncBtn.disabled = false;

                icon.classList.remove('ph-spin');

            }

        }



    </script>
