
import sys

# Original content (Approximated from history)
# I'll just use the sections I know

HEAD = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex, nofollow">
    <title>Admin Dashboard | Intern Management</title>
    <link rel="manifest" href="manifest.json">
    <meta name="theme-color" content="#ffffff">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="apple-mobile-web-app-title" content="Thiranex Admin">
    <link rel="apple-touch-icon" href="msme-verified-internship-certificate-seal.png">
    <link rel="icon" type="image/png" href="msme-verified-internship-certificate-seal.png">
    <link rel="stylesheet" href="style.css">
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/@phosphor-icons/web@2.1.1"></script>
</head>
<body>
    <div id="toast-container"></div>
    <div class="sidebar-backdrop" id="sidebarBackdrop" onclick="toggleSidebar()"></div>

    <!-- Mobile Header -->
    <div class="mobile-admin-header">
        <button class="dots-btn" onclick="toggleSidebar()" style="width: 45px; height: 45px;">
            <i class="ph-bold ph-list" style="font-size: 1.5rem;"></i>
        </button>
        <div style="font-weight: 700; font-size: 1.1rem; color: var(--text-main);" id="mobileTabTitle">Overview</div>
        <button class="dots-btn" id="syncBtnMobile" onclick="manualSync()"
            style="width: 40px; height: 40px; background: var(--primary-light); color: var(--primary); border: none; border-radius: 8px;">
            <i class="ph ph-arrows-clockwise" style="font-size: 1.2rem;"></i>
        </button>
    </div>

    <!-- Loading Overlay -->
    <div id="appLoader"
        style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #ffffff; z-index: 9999; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <div style="font-size: 3rem; color: var(--primary); margin-bottom: 1rem;">
            <i class="ph ph-spinner ph-spin"></i>
        </div>
        <h2 style="color: var(--text-main); font-weight: 500;">Loading Admin Dashboard...</h2>
        <p style="color: var(--text-muted); margin-top: 0.5rem;" id="loaderStatus">Fetching secure data from server...
        </p>
    </div>

    <div class="main-layout">
        <aside class="sidebar">
            <div style="display: flex; justify-content: center; margin-bottom: 2rem;">
                <img src="thiranex-free-internship-with-certificate-logo.png" alt="Thiranex - India's #1 Free Virtual Internship with Certificate Logo" loading="lazy" style="height: 55px; object-fit: contain;">
            </div>
            <nav style="display: flex; flex-direction: column; gap: 0.5rem;">
                <button class="btn btn-primary" style="width: 100%; justify-content: flex-start;"
                    onclick="switchTab('overview')">
                    <i class="ph ph-squares-four"></i> <span>Overview</span>
                </button>
                <button class="btn"
                    style="width: 100%; justify-content: flex-start; background: transparent; color: var(--text-main);"
                    onclick="switchTab('interns')">
                    <i class="ph ph-users"></i> <span>Interns</span>
                </button>
                <button class="btn"
                    style="width: 100%; justify-content: flex-start; background: transparent; color: var(--text-main); position: relative;"
                    onclick="switchTab('registrations')">
                    <i class="ph ph-user-plus"></i> <span>Registrations</span>
                    <span class="sidebar-badge" id="badgeRegistrations">0</span>
                </button>
                <button class="btn"
                    style="width: 100%; justify-content: flex-start; background: transparent; color: var(--text-main); position: relative;"
                    onclick="switchTab('approvals')">
                    <i class="ph ph-check-square"></i> <span>Task Approvals</span>
                    <span class="sidebar-badge" id="badgeApprovals">0</span>
                </button>
                <button class="btn"
                    style="width: 100%; justify-content: flex-start; background: transparent; color: var(--text-main); position: relative;"
                    onclick="switchTab('payments')">
                    <i class="ph ph-receipt"></i> <span>Payments</span>
                    <span class="sidebar-badge" id="badgePayments">0</span>
                </button>
                <button class="btn"
                    style="width: 100%; justify-content: flex-start; background: transparent; color: var(--text-main); position: relative;"
                    onclick="switchTab('payment-alerts')">
                    <i class="ph-bold ph-bell-ringing"></i> <span>Payment Alerts</span>
                    <span class="sidebar-badge" id="badgePaymentAlerts">0</span>
                </button>
                <button class="btn"
                    style="width: 100%; justify-content: flex-start; background: transparent; color: var(--text-main); position: relative;"
                    onclick="switchTab('referrals')">
                    <i class="ph ph-share-network"></i> <span>Refer & Earn</span>
                    <span class="sidebar-badge" id="badgeReferrals">0</span>
                </button>
                <button class="btn"
                    style="width: 100%; justify-content: flex-start; background: transparent; color: var(--text-main); position: relative;"
                    onclick="switchTab('group-messages')">
                    <i class="ph ph-chat-centered-text"></i> <span>Group Message</span>
                </button>

                <button class="btn dropdown-toggle"
                    style="width: 100%; justify-content: space-between; background: transparent; color: var(--text-main);"
                    onclick="toggleDropdown('settingsDropdown', event)">
                    <span style="display: flex; align-items: center; gap: 0.5rem;">
                        <i class="ph ph-gear"></i> <span>Settings</span>
                    </span>
                    <i class="ph ph-caret-down" style="transition: transform 0.3s;"></i>
                </button>
                <div id="settingsDropdown" class="dropdown-content" style="display: none;">
                    <button class="btn"
                        style="width: 100%; justify-content: flex-start; background: transparent; color: var(--text-main); padding-left: 2.5rem;"
                        onclick="switchTab('settings')">
                        <i class="ph ph-gear-six"></i> <span>General Settings</span>
                    </button>
                    <button class="btn"
                        style="width: 100%; justify-content: flex-start; background: transparent; color: var(--text-main); padding-left: 2.5rem;"
                        onclick="switchTab('domains')">
                        <i class="ph ph-stack"></i> <span>Domain Settings</span>
                    </button>
                </div>

                <button class="btn"
                    style="width: 100%; justify-content: flex-start; background: transparent; color: var(--text-main); position: relative;"
                    onclick="switchTab('offer-letters')">
                    <i class="ph ph-file-text"></i> <span>Offer Letters</span>
                    <span class="sidebar-badge" id="badgeOffers">0</span>
                </button>
                <button class="btn"
                    style="width: 100%; justify-content: flex-start; background: transparent; color: var(--text-main); position: relative;"
                    onclick="switchTab('certificates')">
                    <i class="ph ph-certificate"></i> <span>Certificates</span>
                    <span class="sidebar-badge" id="badgeCerts">0</span>
                </button>
                <button class="btn"
                    style="width: 100%; justify-content: flex-start; background: transparent; color: var(--text-main);"
                    onclick="switchTab('reports')">
                    <i class="ph ph-chart-bar"></i> <span>Reports</span>
                </button>

                <button class="btn dropdown-toggle"
                    style="width: 100%; justify-content: space-between; background: transparent; color: var(--text-main); margin-top: 1rem;"
                    onclick="toggleDropdown('customDocDropdown', event)">
                    <span style="display: flex; align-items: center; gap: 0.5rem;">
                        <i class="ph ph-file-plus"></i> <span style="font-weight: 500;">Custom Doc</span>
                    </span>
                    <i class="ph ph-caret-down" style="transition: transform 0.3s;"></i>
                </button>
                <div id="customDocDropdown" class="dropdown-content" style="display: none;">
                    <button class="btn"
                        style="width: 100%; justify-content: flex-start; background: transparent; color: var(--text-main); padding-left: 2.5rem;"
                        onclick="switchTab('manual-cert')">
                        <i class="ph ph-certificate"></i> <span>Manual Cert</span>
                    </button>
                </div>
            </nav>

            <button class="btn"
                style="width: 100%; margin-top: 2rem; justify-content: flex-start; background: #FEE2E2; color: #991B1B;"
                onclick="DB.logout()">
                <i class="ph ph-sign-out"></i> <span>Logout</span>
            </button>
        </aside>

        <main class="content-area">
            <header class="desktop-header"
                style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid var(--border);">
                <h1 id="tabTitle" style="font-size: 1.75rem; font-weight: 800; letter-spacing: -0.02em;">Dashboard Overview</h1>
                <button class="btn hide-mobile" id="syncBtnDesktop" onclick="manualSync()"
                    style="background: var(--primary-light); color: var(--primary); font-size: 0.9rem; padding: 0.6rem 1.2rem;">
                    <i class="ph ph-arrows-clockwise"></i> <span>Sync Data</span>
                </button>
            </header>

            <div id="overview" class="tab-content">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                    <div class="card" style="border-left: 5px solid var(--primary);">
                        <p class="text-muted">Total Active Interns (Learning)</p>
                        <h2 id="countActiveInterns">0</h2>
                    </div>
                    <div class="card" style="border-left: 5px solid #10B981;">
                        <p class="text-muted">Certified Graduates</p>
                        <h2 id="countCertifiedInterns">0</h2>
                    </div>
                    <div class="card" style="border-left: 5px solid var(--success);">
                        <p class="text-muted" style="display: flex; justify-content: space-between; align-items: center;">
                            Total Revenue Generated
                            <i class="ph ph-eye toggle-revenue" style="cursor: pointer;" onclick="toggleRevenueVisibility()"></i>
                        </p>
                        <h2 id="totalRevenue" style="color: var(--success);">&#8377; 0</h2>
                    </div>
                    <div class="card" style="border-left: 5px solid #F97316;">
                        <p class="text-muted" style="display: flex; justify-content: space-between; align-items: center;">
                            Pending Revenue
                            <i class="ph ph-eye toggle-revenue" style="cursor: pointer;" onclick="toggleRevenueVisibility()"></i>
                        </p>
                        <h2 id="pendingRevenueDisplay" style="color: #F97316;">&#8377; 0</h2>
                    </div>
                </div>
                <h3 style="margin-bottom: 1rem;"><i class="ph-fill ph-warning-circle" style="color: var(--danger);"></i> Action Required</h3>
                <div id="batchCountdownBanner" class="card" style="margin-bottom: 1.5rem; display: none;"></div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
                    <div class="card" style="border-left: 5px solid #EC4899; background: #FCE7F3; cursor: pointer;" onclick="switchTab('registrations')">
                        <p class="text-muted">New Registrations</p>
                        <h2 id="countPendingRegs" style="color: #EC4899;">0</h2>
                    </div>
                    <div class="card" style="border-left: 5px solid var(--warning); background: #FFFBEB; cursor: pointer;" onclick="switchTab('approvals')">
                        <p class="text-muted">Task Approval Requests</p>
                        <h2 id="countPendingTasks" style="color: var(--warning);">0</h2>
                    </div>
                    <div class="card" style="border-left: 5px solid var(--primary); background: #EFF6FF; cursor: pointer;" onclick="switchTab('payments')">
                        <p class="text-muted">Payment Verifications</p>
                        <h2 id="countPendingPayments" style="color: var(--primary);">0</h2>
                    </div>
                    <div class="card" style="border-left: 5px solid #8B5CF6; background: #F5F3FF; cursor: pointer;" onclick="switchTab('certificates')">
                        <p class="text-muted">Certificate Requests</p>
                        <h2 id="countPendingCerts" style="color: #8B5CF6;">0</h2>
                    </div>
                </div>
            </div>

            <div id="interns" class="tab-content" style="display: none;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 1.5rem;">
                    <h3>Manage Interns</h3>
                    <button class="btn btn-primary" onclick="openModal('internModal')">Add Intern</button>
                </div>
                <div class="filter-bar" style="display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap;">
                    <input type="text" id="internSearch" class="form-input" style="flex: 2;" placeholder="Search Name, ID, or Mobile..." oninput="renderInterns()">
                    <select id="internSort" class="form-input" style="flex: 1;" onchange="renderInterns()">
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                    </select>
                    <select id="internFilterStatus" class="form-input" style="flex: 1;" onchange="renderInterns()">
                        <option value="active">Active</option>
                        <option value="certified">Certified</option>
                        <option value="dropped">Dropped</option>
                        <option value="all">All</option>
                    </select>
                    <select id="internFilterDomain" class="form-input" style="flex: 1;" onchange="renderInterns()">
                        <option value="">Domains</option>
                    </select>
                    <select id="internFilterBatch" class="form-input" style="flex: 1;" onchange="renderInterns()">
                        <option value="">Batches</option>
                    </select>
                </div>
                <div class="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Select</th>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Domain/Batch</th>
                                <th>Tasks</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Contact</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="internTableBody"></tbody>
                    </table>
                </div>
            </div>

            <div id="registrations" class="tab-content" style="display: none;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h3>New Registrations</h3>
                    <input type="text" id="regSearch" class="form-input" style="width: 250px;" placeholder="Search..." oninput="renderRegistrations()">
                </div>
                <div class="table-responsive">
                    <table>
                        <thead>
                            <tr><th>Date</th><th>Name & ID</th><th>Contact</th><th>Domain</th><th>Status</th><th>Actions</th></tr>
                        </thead>
                        <tbody id="registrationsTableBody"></tbody>
                    </table>
                </div>
            </div>

            <div id="approvals" class="tab-content" style="display: none;">
                <h3>Pending Task Submissions</h3>
                <div id="approvalsPlaceholder"></div>
            </div>

            <div id="payments" class="tab-content" style="display: none;">
                <h3>Verify Student Payments</h3>
                <div class="table-responsive">
                    <table>
                        <thead><tr><th>Name</th><th>Ref ID</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead>
                        <tbody id="paymentTableBody"></tbody>
                    </table>
                </div>
            </div>

            <div id="payment-alerts" class="tab-content" style="display: none;">
                <h3>Pending Payment Reminders</h3>
                <div class="table-responsive">
                    <table>
                        <thead><tr><th>Intern ID</th><th>Details</th><th>Contact</th><th>Batch</th><th>WhatsApp</th></tr></thead>
                        <tbody id="paymentAlertsTableBody"></tbody>
                    </table>
                </div>
            </div>

            <!-- Group Message Section -->
            <div id="group-messages" class="tab-content" style="display: none;">
                <div class="card" style="max-width: 700px; margin: 0 auto; padding: 2rem;">
                    <h3>Daily WhatsApp Message Generator</h3>
                    <p style="color: var(--text-muted); margin-bottom: 2rem;">Select a batch to generate today's status message.</p>
                    <div style="display: flex; gap: 1.5rem; flex-wrap: wrap; margin-bottom: 2rem;">
                        <div style="flex: 1; min-width: 200px;">
                            <label style="font-weight: 600; display: block; margin-bottom: 0.5rem;">Select Batch</label>
                            <select id="msgFilterBatch" class="form-input" onchange="generateGroupMessage()">
                                <option value="">Select a batch</option>
                            </select>
                        </div>
                        <div style="flex: 1; min-width: 200px;">
                            <label style="font-weight: 600; display: block; margin-bottom: 0.5rem;">Today's Date</label>
                            <input type="text" id="msgCurrentDate" class="form-input" readonly style="background: #f8fafc;">
                        </div>
                    </div>
                    <div id="messagePreviewCard" style="display: none;">
                        <label style="font-weight: 600; display: block; margin-bottom: 0.5rem;">Message Preview</label>
                        <div id="generatedMsgBox" style="background: #f1f5f9; border: 1px solid var(--border); padding: 1.5rem; border-radius: 12px; white-space: pre-wrap; line-height: 1.6; font-family: 'Outfit', sans-serif;"></div>
                        <div style="margin-top: 1.5rem; display: flex; gap: 1rem;">
                            <button class="btn btn-primary" onclick="copyGroupMessage()" style="flex: 1; justify-content: center; height: 48px;">Copy Message</button>
                            <button class="btn" onclick="openWhatsAppWithMsg()" style="flex: 1; justify-content: center; height: 48px; background: #25D366; color: white;">Send on WhatsApp</button>
                        </div>
                    </div>
                </div>
            </div>

            <div id="settings" class="tab-content" style="display: none;">
                <div class="card" style="max-width: 600px; margin: 0 auto; padding: 2rem;">
                    <h3>Portal Settings</h3>
                    <form id="settingsForm">
                        <!-- Simplified for now -->
                        <div class="form-group"><label>UPI ID</label><input type="text" id="sUpiId" class="form-input"></div>
                        <div class="form-group"><label>Account Name</label><input type="text" id="sAccountName" class="form-input"></div>
                        <div class="form-group"><label>WhatsApp Group Link</label><input type="text" id="sWhatsappLink" class="form-input"></div>
                        <button type="submit" class="btn btn-primary">Save Settings</button>
                    </form>
                </div>
            </div>

            <div id="domains" class="tab-content" style="display: none;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 1.5rem;">
                    <h3>Manage Internship Domains</h3>
                    <button class="btn btn-primary" onclick="openModal('domainModal')">Add Domain</button>
                </div>
                <div class="table-responsive">
                    <table><thead><tr><th>Domain Name</th><th>Total Tasks</th><th>Actions</th></tr></thead><tbody id="domainTableBody"></tbody></table>
                </div>
            </div>

            <div id="offer-letters" class="tab-content" style="display: none;">
                <h3>Approve Offer Letters</h3>
                <div class="table-responsive">
                    <table><thead><tr><th>Intern ID</th><th>Name</th><th>Domain</th><th>Status</th><th>Action</th></tr></thead><tbody id="offerTableBody"></tbody></table>
                </div>
            </div>

            <div id="certificates" class="tab-content" style="display: none;">
                <h3>Generate Certificates</h3>
                <div class="table-responsive">
                    <table><thead><tr><th>Intern ID</th><th>Name</th><th>Domain</th><th>Progress</th><th>Status</th><th>Action</th></tr></thead><tbody id="certTableBody"></tbody></table>
                </div>
            </div>

            <div id="manual-cert" class="tab-content" style="display: none;">
                <h3>Manual Certificate Generation</h3>
                <form id="manualCertForm">
                    <input type="text" id="mCertName" class="form-input" placeholder="Name">
                    <input type="text" id="mCertId" class="form-input" placeholder="ID">
                    <button type="submit" class="btn btn-primary">Generate</button>
                </form>
            </div>

            <div id="reports" class="tab-content" style="display: none;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h3>Daily Batch Status Reports</h3>
                    <button class="btn btn-primary" onclick="generateBatchReport()">PDF Report</button>
                </div>
                <div id="reportStats" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                    <div class="card"><h4>Mandatory</h4><h2 id="repStatMandatory">0</h2></div>
                    <div class="card"><h4>Task 1</h4><h2 id="repStatT1">0</h2></div>
                    <!-- more stats -->
                </div>
                <div class="card" style="margin-bottom: 2rem;">
                    <select id="reportFilterBatch" class="form-input" onchange="renderReportsTab()"><option value="">Select Batch</option></select>
                </div>
                <div class="table-wrapper">
                    <table>
                        <thead><tr><th>Name</th><th>Intern ID</th><th>Domain</th><th>Task Status</th><th>Cert Eligibility</th><th>Payment</th></tr></thead>
                        <tbody id="reportTableBody"></tbody>
                    </table>
                </div>
            </div>

            <div id="referrals" class="tab-content" style="display: none;">
                <h3>Referral Management</h3>
                <div class="table-wrapper">
                    <table>
                        <thead><tr><th>Referrer</th><th>UPI ID</th><th>Status</th><th>Pending</th><th>Action</th></tr></thead>
                        <tbody id="referralTableBody"></tbody>
                    </table>
                </div>
            </div>
        </main>
    </div>

    <!-- Modals (Standard ones) -->
    <div id="internModal" class="modal-overlay">
        <div class="modal"><h2>Add New Intern</h2><form id="addInternForm"><!-- Fields --></form></div>
    </div>
    <div id="domainModal" class="modal-overlay">
        <div class="modal"><h2>Manage Domain</h2><form id="domainForm"><!-- Fields --></form></div>
    </div>
    <div id="verifyInternModal" class="modal-overlay">
        <div class="modal"><h2>Verify Intern</h2><form id="verifyInternForm"><!-- Fields --></form></div>
    </div>

    <script src="db.js"></script>
    <script src="admin.js"></script>
</body>
</html>
"""

# Write the reconstructed file
with open('c:/Users/harih/OneDrive/Desktop/secure_Internship_management_portal-main/admin.html', 'w', encoding='utf-8') as f:
    f.write(HEAD)
