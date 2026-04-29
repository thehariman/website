import sys

def add_payment_alerts_logic():
    file_path = 'admin.js'
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Step 1: Add call to refreshDashboard
        target1 = """    try { renderPayments(); } catch (e) { console.error(e); }"""
        
        replacement1 = """    try { renderPayments(); } catch (e) { console.error(e); }
    try { renderPaymentAlerts(); } catch (e) { console.error(e); }"""

        content = content.replace(target1, replacement1)
        
        # Step 2: Add function body before renderPayments
        target2 = """function renderPayments() {"""
        
        replacement2 = """function renderPaymentAlerts() {
    let interns = DB.get('interns') || [];
    const body = document.getElementById('paymentAlertsTableBody');
    if (!body) return;
    
    // Filter logic: 
    // 1. paymentStatus is not verified and not pending
    // 2. coreComplete is true
    let pendingAlerts = interns.filter(i => {
        if (i.paymentStatus === 'verified' || i.paymentStatus === 'pending') return false;
        const tasks = DB.getInternTasks(i.id, i.domain) || [];
        const coreTasks = tasks.filter(t => !t.isCertificateTask);
        if (coreTasks.length === 0) return false;
        const approvedCoreCount = coreTasks.filter(t => t.status === 'approved').length;
        return approvedCoreCount === coreTasks.length;
    });

    // Update Badge
    const badge = document.getElementById('badgePaymentAlerts');
    if (badge) {
        badge.innerText = pendingAlerts.length;
        badge.style.display = pendingAlerts.length > 0 ? 'flex' : 'none';
        
        const badge2 = document.getElementById('badgePaymentAlertsSidebar'); // if exists
        if(badge2) badge2.innerText = pendingAlerts.length;
    }

    if (pendingAlerts.length === 0) {
        body.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-muted)"><i class="ph ph-check-circle" style="font-size: 1.5rem; color: #10B981; vertical-align: middle; margin-right: 0.5rem;"></i>No pending payment alerts!</td></tr>';
        return;
    }

    body.innerHTML = pendingAlerts.map(i => {
        // WhatsApp Message
        const waMsg = `Hello *${i.name}*, congratulations on completing your core tasks for the *${i.domain}* internship at Thiranex! You are just one step away from your verified certificate. Please complete your certification validation payment from your dashboard to unlock it immediately. Log in now at: https://www.thiranex.in/student-login.html`;
        
        return `
            <tr style="border-bottom: 1px solid var(--border);">
                <td style="padding: 1rem;"><strong>${i.id}</strong></td>
                <td style="padding: 1rem;">
                    <div style="font-weight: 600; color: var(--text-main);">${i.name}</div>
                </td>
                <td style="padding: 1rem;">
                    <span class="badge badge-primary">${i.domain}</span>
                </td>
                <td style="padding: 1rem;">${i.mobile}</td>
                <td style="padding: 1rem;">
                    <button class="btn" style="background: #25D366; color: white; padding: 0.5rem 1rem; border-radius: 8px; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 0.5rem; box-shadow: 0 4px 6px -1px rgba(37, 211, 102, 0.3); font-weight: 600;" onclick="openWhatsApp('${i.mobile}', '${waMsg.replace(/'/g, "\\'")}')">
                        <i class="ph-fill ph-whatsapp-logo" style="font-size: 1.1rem;"></i> Remind on WhatsApp
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function renderPayments() {"""
        
        content = content.replace(target2, replacement2)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
            
        print('Modifications to admin.js successful!')
    except Exception as e:
        print(f'Error: {e}')

add_payment_alerts_logic()
