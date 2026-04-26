const fs = require('fs');
const path = r'c:\Users\harih\OneDrive\Desktop\secure_Internship_management_portal-main\student.html';
let content = fs.readFileSync(path, 'utf8');
let lines = content.split('\n');

let startLine = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('if (id) {') && i < lines.length - 10) {
        if (!lines[i + 1].includes('return `https://drive.google.com/uc?export=view&id=${id}`;')) {
            startLine = i;
            break;
        }
    }
}

if (startLine !== -1) {
    console.log(`Found broken area at line ${startLine + 1}`);
    const newContent = [
        '            if (id) {',
        '                return `https://drive.google.com/uc?export=view&id=${id}`;',
        '            }',
        '            return url;',
        '        }',
        '',
        '        function closePromoModal() {',
        "            document.getElementById('promoModal').style.display = 'none';",
        '        }',
        '',
        '        function checkPromotion() {',
        '            const settings = DB.getSettings();',
        '            console.log("Checking Promotion:", settings);',
        '',
        '            // Allow string \'true\' or boolean true',
        "            const isActive = String(settings.promoActive).toLowerCase() === 'true';",
        '',
        '            if (isActive && settings.promoImage) {',
        "                if (!document.getElementById('promoModal')) return;",
        '',
        '                document.getElementById(\'promoImage\').src = getDriveDirectLink(settings.promoImage);',
        '',
        "                const promoLinkBtn = document.getElementById('promoLink');",
        "                const linkUrl = settings.promoLink ? settings.promoLink.trim() : '';",
        '',
        "                if (linkUrl && linkUrl !== '#' && linkUrl !== '') {",
        '                    promoLinkBtn.href = linkUrl;',
        "                    promoLinkBtn.style.display = 'flex'; // Show button",
        '',
        "                    const btnText = settings.promoBtnText || 'Learn More';",
        "                    document.getElementById('promoBtn').innerText = btnText;",
        '                } else {',
        "                    promoLinkBtn.style.display = 'none'; // Hide button if no link",
        '                }',
        '',
        "                document.getElementById('promoModal').style.display = 'flex';",
        '            }',
        '        }',
        '',
        '        (async function initApp() {',
        '',
        '            await DB.initialize();',
        '',
        '            // Re-fetch user in case updates happened since login',
        '            const freshUser = DB.getCurrentUser();',
        '            if (freshUser) {',
        '                // Update local student object reference',
        '                Object.assign(student, freshUser);',
        "                document.getElementById('userName').innerText = student.name;",
        "                document.getElementById('userDomain').innerText = student.domain;",
        '            }',
        '',
        '            renderTasks();',
        '            renderPaymentStatus();',
        '            checkPaymentRequirement();',
        '            // Check for promotions last so it overlays others if needed',
        '            checkPromotion();',
        '',
        '            // Handle Deep Linking (e.g. #refer)',
        "            const hash = window.location.hash.replace('#', '');",
        "            if (hash && ['tasks', 'payment', 'refer', 'help'].includes(hash)) {",
        '                switchTab(hash);',
        '            }',
        '',
        '            // --- Payment Reminder Flow ---',
        "            // If student is approved for offer but hasn't paid, show the gift popup",
        '            if (freshUser) {',
        '              const allTasks = DB.getInternTasks(freshUser.id, freshUser.domain);',
        '              const coreTasksActive = allTasks.filter(t => !t.isCertificateTask);',
        "              const isFinished = coreTasksActive.length > 0 && coreTasksActive.every(t => t.status === 'approved');",
        '',
        '              if (isFinished && (freshUser.offerApproved || freshUser.offerLetterUrl)) {',
        "                  if (freshUser.paymentStatus !== 'verified' && freshUser.paymentStatus !== 'pending') {",
        '                      // Slight delay for better UX',
        '                      setTimeout(() => {',
        "                          document.getElementById('paymentReminderModal').style.display = 'flex';",
        '                      }, 1000);',
        '                  }',
        '              }',
        '            }',
        '',
        '        })();',
        '',
        '        function checkPaymentRequirement() {',
        '            // Notifications disabled based on requirements',
        '        }',
        '',
        '        function closePaymentReminder() {',
        "            document.getElementById('paymentReminderModal').style.display = 'none';",
        '        }',
        '',
        '        async function requestWithdrawal() {',
        "            const btn = document.getElementById('btnWithdraw');",
        '            const originalText = btn.innerText;',
        "            btn.innerText = 'Sending...';",
        '            btn.disabled = true;',
        '',
        '            const currentUser = DB.getCurrentUser();',
        '            // Call DB to update status',
        '            // We use updateInternProfile for this status flag',
        "            const success = await DB.updateInternProfile(currentUser.id, { withdrawalStatus: 'requested', withdrawalDate: new Date().toISOString() });",
        '',
        '            if (success) {',
        "                alert('Withdrawal request sent successfully! You will be notified once processed.');",
        '                renderMyReferrals(); // Re-render to update UI state',
        '            } else {',
        "                alert('Failed to send request. Please try again.');",
        '                btn.innerText = originalText;',
        '                btn.disabled = false;',
        '            }',
        '        }',
        '',
        '        function goToPayment() {',
        '            closePaymentReminder();',
        '            openPaymentModal();',
        '        }',
        '',
        '        function openPaymentModal() {',
        "            document.getElementById('paymentModal').style.display = 'flex';",
        '            renderPaymentStatus();',
        '        }'
    ];

    let endLine = -1;
    for (let i = startLine; i < lines.length; i++) {
        if (lines[i].includes('function closePaymentModal()')) {
            endLine = i;
            break;
        }
    }

    if (endLine !== -1) {
        lines.splice(startLine, endLine - startLine, ...newContent);
        fs.writeFileSync(path, lines.join('\n'), 'utf8');
        console.log('Successfully fixed student.html');
    } else {
        console.log('Could not find end of broken area');
    }
} else {
    console.log('Could not find start of broken area');
}
