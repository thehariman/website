import sys

with open(r'c:\Users\harih\OneDrive\Desktop\secure_Internship_management_portal-main\student.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Reconstruct the broken area
start_line = -1
for i, line in enumerate(lines):
    if 'if (id) {' in line and i < len(lines)-10:
        if 'return `https://drive.google.com/uc?export=view&id=${id}`;' not in lines[i+1]:
             start_line = i
             break

if start_line != -1:
    print(f"Found broken area at line {start_line+1}")
    new_content = [
        '            if (id) {\n',
        '                return `https://drive.google.com/uc?export=view&id=${id}`;\n',
        '            }\n',
        '            return url;\n',
        '        }\n',
        '\n',
        '        function closePromoModal() {\n',
        "            document.getElementById('promoModal').style.display = 'none';\n",
        '        }\n',
        '\n',
        '        function checkPromotion() {\n',
        '            const settings = DB.getSettings();\n',
        '            console.log("Checking Promotion:", settings);\n',
        '\n',
        '            // Allow string ' + "'true' or boolean true\n",
        "            const isActive = String(settings.promoActive).toLowerCase() === 'true';\n",
        '\n',
        '            if (isActive && settings.promoImage) {\n',
        "                if (!document.getElementById('promoModal')) return;\n",
        '\n',
        '                document.getElementById(' + "'promoImage').src = getDriveDirectLink(settings.promoImage);\n",
        '\n',
        "                const promoLinkBtn = document.getElementById('promoLink');\n",
        "                const linkUrl = settings.promoLink ? settings.promoLink.trim() : '';\n",
        '\n',
        "                if (linkUrl && linkUrl !== '#' && linkUrl !== '') {\n",
        '                    promoLinkBtn.href = linkUrl;\n',
        "                    promoLinkBtn.style.display = 'flex'; // Show button\n",
        '\n',
        "                    const btnText = settings.promoBtnText || 'Learn More';\n",
        "                    document.getElementById('promoBtn').innerText = btnText;\n",
        '                } else {\n',
        "                    promoLinkBtn.style.display = 'none'; // Hide button if no link\n",
        '                }\n',
        '\n',
        "                document.getElementById('promoModal').style.display = 'flex';\n",
        '            }\n',
        '        }\n',
        '\n',
        '        (async function initApp() {\n',
        '\n',
        '            await DB.initialize();\n',
        '\n',
        '            // Re-fetch user in case updates happened since login\n',
        '            const freshUser = DB.getCurrentUser();\n',
        '            if (freshUser) {\n',
        '                // Update local student object reference\n',
        '                Object.assign(student, freshUser);\n',
        "                document.getElementById('userName').innerText = student.name;\n",
        "                document.getElementById('userDomain').innerText = student.domain;\n",
        '            }\n',
        '\n',
        '            renderTasks();\n',
        '            renderPaymentStatus();\n',
        '            checkPaymentRequirement();\n',
        '            // Check for promotions last so it overlays others if needed\n',
        '            checkPromotion();\n',
        '\n',
        '            // Handle Deep Linking (e.g. #refer)\n',
        "            const hash = window.location.hash.replace('#', '');\n",
        "            if (hash && ['tasks', 'payment', 'refer', 'help'].includes(hash)) {\n",
        '                switchTab(hash);\n',
        '            }\n',
        '\n',
        '            // --- Payment Reminder Flow ---\n',
        "            // If student is approved for offer but hasn't paid, show the gift popup\n",
        '            if (freshUser) {\n',
        '              const allTasks = DB.getInternTasks(freshUser.id, freshUser.domain);\n',
        '              const coreTasksActive = allTasks.filter(t => !t.isCertificateTask);\n',
        "              const isFinished = coreTasksActive.length > 0 && coreTasksActive.every(t => t.status === 'approved');\n",
        '\n',
        '              if (isFinished && (freshUser.offerApproved || freshUser.offerLetterUrl)) {\n',
        "                  if (freshUser.paymentStatus !== 'verified' && freshUser.paymentStatus !== 'pending') {\n",
        '                      // Slight delay for better UX\n',
        '                      setTimeout(() => {\n',
        "                          document.getElementById('paymentReminderModal').style.display = 'flex';\n",
        '                      }, 1000);\n',
        '                  }\n',
        '              }\n',
        '            }\n',
        '\n',
        '        })();\n',
        '\n',
        '        function checkPaymentRequirement() {\n',
        '            // Notifications disabled based on requirements\n',
        '        }\n',
        '\n',
        '        function closePaymentReminder() {\n',
        "            document.getElementById('paymentReminderModal').style.display = 'none';\n",
        '        }\n',
        '\n',
        '        async function requestWithdrawal() {\n',
        "            const btn = document.getElementById('btnWithdraw');\n",
        '            const originalText = btn.innerText;\n',
        "            btn.innerText = 'Sending...';\n",
        '            btn.disabled = True;\n',
        '\n',
        '            const currentUser = DB.getCurrentUser();\n',
        '            // Call DB to update status\n',
        '            // We use updateInternProfile for this status flag\n',
        "            const success = await DB.updateInternProfile(currentUser.id, { withdrawalStatus: 'requested', withdrawalDate: new Date().toISOString() });\n",
        '\n',
        '            if (success) {\n',
        "                alert('Withdrawal request sent successfully! You will be notified once processed.');\n",
        '                renderMyReferrals(); // Re-render to update UI state\n',
        '            } else {\n',
        "                alert('Failed to send request. Please try again.');\n",
        '                btn.innerText = originalText;\n',
        '                btn.disabled = False;\n',
        '            }\n',
        '        }\n',
        '\n',
        '        function goToPayment() {\n',
        '            closePaymentReminder();\n',
        '            openPaymentModal();\n',
        '        }\n',
        '\n',
        '        function openPaymentModal() {\n',
        "            document.getElementById('paymentModal').style.display = 'flex';\n",
        '            renderPaymentStatus();\n',
        '        }\n'
    ]
    
    # Find where to stop replacing (search for the next stable function like closePaymentModal)
    end_line = -1
    for i in range(start_line, len(lines)):
        if 'function closePaymentModal()' in lines[i]:
            end_line = i
            break
            
    if end_line != -1:
        lines[start_line:end_line] = new_content
        with open(r'c:\Users\harih\OneDrive\Desktop\secure_Internship_management_portal-main\student.html', 'w', encoding='utf-8') as f:
            f.writelines(lines)
        print("Successfully fixed student.html")
    else:
        print("Could not find end of broken area")
else:
    print("Could not find start of broken area")
