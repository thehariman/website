
    function doGet(e) {
      return getAllData();
    }

    function doPost(e) {
      var body = e.postData.contents;
      console.log("POST Received: " + body);
      
      var data;
      try {
        data = JSON.parse(body);
      } catch (err) {
        return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'Invalid JSON: ' + err.toString()})).setMimeType(ContentService.MimeType.JSON);
      }

      var action = data.action;

      if (action == 'saveInterns') {
        return saveInterns(data.interns);
      } else if (action == 'saveDomains') {
        return saveDomains(data.domains);
      } else if (action == 'saveSubmissions') {
        return saveSubmissions(data.submissions);
      } else if (action == 'submitTask') {
        return handleSubmission(data.submission);
      } else if (action == 'updateTaskStatus') {
        return updateTaskStatus(data.internId, data.taskId, data.status);
      } else if (action == 'saveSettings') {
        return saveSettings(data.settings);
      } else if (action == 'generateCertificate') {
        return generateCertificate(data);
      } else if (action == 'generateOfferLetter') {
        return generateOfferLetter(data);
      } else if (action == 'generateBatchReport') {
        return generateBatchReport(data);
      } else if (action == 'getPendingReferrals') {
        return getPendingReferrals();
      } else if (action == 'markReferralPaid') {
        return markReferralPaid(data.refereeId);
      } else if (action == 'updateInternProfile') {
        return updateInternProfile(data.internId, data.profileData);
      } else if (action == 'processWithdrawal') {
        return processWithdrawal(data.referrerId, data.paymentRef);
      } else if (action == 'registerIntern') {
        return registerIntern(data.internData);
      }
    }


    function generateBatchReport(data) {
      try {
        var html = `
          <!DOCTYPE html>
          <html>
          <head>
            <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet">
            <style>
              @page { size: landscape; margin: 30px; }
              body { 
                font-family: 'Outfit', sans-serif; 
                margin: 0; padding: 20px; 
                color: #1e293b;
              }
              .header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 30px;
                border-bottom: 2px solid #1e3a8a;
                padding-bottom: 20px;
              }
              .logo-img { height: 50px; }
              .report-title { text-align: right; }
              .report-title h1 { margin: 0; color: #1e3a8a; font-size: 28px; }
              .report-title p { margin: 5px 0 0; color: #64748b; font-size: 14px; }
              
              table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 50px;
                font-size: 11px;
              }
              th {
                background-color: #f8fafc;
                color: #1e3a8a;
                font-weight: 700;
                text-align: left;
                padding: 12px 10px;
                border-bottom: 2px solid #e2e8f0;
                text-transform: uppercase;
              }
              td {
                padding: 10px;
                border-bottom: 1px solid #e2e8f0;
              }
              .status-tick { color: #166534; font-weight: bold; font-size: 14px; }
              .status-cross { color: #EF4444; font-weight: bold; font-size: 14px; }
              .badge {
                padding: 3px 6px;
                border-radius: 4px;
                font-size: 9px;
                font-weight: 600;
              }
              .eligible { background: #dcfce7; color: #166534; }
              .not-eligible { background: #fee2e2; color: #991b1b; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo">
                ${data.logo ? `<img src="${data.logo}" style="height:50px;">` : `<div style="font-size: 24px; font-weight: bold; color: #1e40af;">THIRANEX</div>`}
              </div>
              <div class="report-title">
                <h1>Internship Batch Report</h1>
                <p>Batch: ${data.batchName} | Generated: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th class="text-left">Intern Name</th>
                  <th class="text-left">ID</th>
                  <th class="text-left">Domain</th>
                  ${data.taskHeaders.map(h => `<th>${h}</th>`).join('')}
                  <th>Elig.</th>
                  ${data.includePayment ? '<th>Payment</th>' : ''}
                </tr>
              </thead>
              <tbody>
                ${data.interns.map(i => `
                  <tr>
                    <td class="text-left"><strong>${i.name}</strong></td>
                    <td class="text-left" style="font-size:9px;">${i.id}</td>
                    <td class="text-left" style="font-size:9px;">${i.domain}</td>
                    ${i.taskResults.map(res => `
                      <td>
                        ${res === 'done' ? '<span class="status-tick">✓</span>' : (res === 'pending' ? '<span class="status-cross">✗</span>' : '-')}
                      </td>
                    `).join('')}
                    <td>
                      <span class="badge ${i.isEligible ? 'eligible' : 'not-eligible'}">
                        ${i.isEligible ? 'YES' : 'NO'}
                      </span>
                    </td>
                    ${data.includePayment ? `
                    <td style="color: ${i.paymentStatus === 'paid' ? '#166534' : '#991b1b'}">
                      ${i.paymentStatus === 'paid' ? 'PAID' : 'DUE'}
                    </td>` : ''}
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="clear"></div>
          </body>
          </html>
        `;

        var blob = HtmlService.createHtmlOutput(html).getAs('application/pdf');
        var fileName = 'Batch_Report_' + data.batchName.replace(/\s+/g, '_') + '.pdf';
        blob.setName(fileName);
        
        var base64Data = Utilities.base64Encode(blob.getBytes());
        
        return ContentService.createTextOutput(JSON.stringify({
          status: 'success',
          base64: base64Data,
          fileName: fileName
        })).setMimeType(ContentService.MimeType.JSON);

      } catch (e) {
        return ContentService.createTextOutput(JSON.stringify({
          status: 'error',
          message: e.toString()
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    function getAllData() {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      
      var interns = getSheetData(ss, 'Interns');
      var domains = getSheetData(ss, 'Domains');
      var submissions = getSheetData(ss, 'Submissions');
      var settings = getSheetData(ss, 'Settings');

      // Process Domains back into object structure
      var domainObj = {};
      domains.forEach(function(row) {
        try {
          if(row.tasks) {
              domainObj[row.name] = JSON.parse(row.tasks);
          } else if (row.Tasks) { // Handle case variation
              domainObj[row.Name] = JSON.parse(row.Tasks);
          } else {
            // Fallback if column names are strictly 'name' and 'tasks'
            var keys = Object.keys(row);
            // simple heuristic: first col is name, second is tasks
            domainObj[row[keys[0]]] = JSON.parse(row[keys[1]]);
          }
        } catch (e) {
          domainObj[row.name] = [];
        }
      });

      // Process Settings back into object - Defensive key handling
      var settingsObj = {};
      settings.forEach(function(row) {
        var k = row.key || row.Key || row.KEY;
        var v = row.value || row.Value || row.VALUE;
        if (k !== undefined) {
          settingsObj[k] = v;
        }
      });

      return ContentService.createTextOutput(JSON.stringify({
        interns: interns,
        domains: domainObj,
        submissions: submissions,
        settings: settingsObj,
        notifications: getSheetData(ss, 'Notifications')
      })).setMimeType(ContentService.MimeType.JSON);
    }


    function saveInterns(newInterns) {
      updateSheet('Interns', newInterns);
      return ContentService.createTextOutput(JSON.stringify({status: 'success'})).setMimeType(ContentService.MimeType.JSON);
    }

    function saveDomains(domainObj) {
      var rows = [];
      for (var key in domainObj) {
        rows.push({
          name: key,
          tasks: JSON.stringify(domainObj[key])
        });
      }
      updateSheet('Domains', rows);
      return ContentService.createTextOutput(JSON.stringify({status: 'success'})).setMimeType(ContentService.MimeType.JSON);
    }

    function saveSubmissions(submissions) {
      updateSheet('Submissions', submissions);
      return ContentService.createTextOutput(JSON.stringify({status: 'success'})).setMimeType(ContentService.MimeType.JSON);
    }

    function handleSubmission(submission) {
      var locking = LockService.getScriptLock();
      // Wait for up to 30 seconds for other concurrent executions to finish.
      try {
        locking.waitLock(30000); 
      } catch (e) {
        return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'Server busy'})).setMimeType(ContentService.MimeType.JSON);
      }

      try {
        var ss = SpreadsheetApp.getActiveSpreadsheet();
        var sheet = ss.getSheetByName('Submissions');
        
        // Ensure sheet exists
        if (!sheet) {
          sheet = ss.insertSheet('Submissions');
          sheet.appendRow(['internId', 'taskId', 'proof', 'status', 'timestamp']);
        }
        
        var data = sheet.getDataRange().getValues();
        var headers = [];
        
        if (data.length < 1) {
           // Empty sheet, add default headers
           var initialHeaders = ['internId', 'taskId', 'proof', 'status', 'timestamp'];
           sheet.appendRow(initialHeaders);
           data = sheet.getDataRange().getValues();
           headers = initialHeaders;
        } else {
           headers = data[0];
        }
        
        // --- Header Self-Healing ---
        // Check if submission has keys not in headers, ad add them if missing
        var newHeadersAdded = false;
        var submissionKeys = Object.keys(submission);
        
        submissionKeys.forEach(function(key) {
           if (headers.indexOf(key) === -1) {
             // New column found!
             headers.push(key);
             sheet.getRange(1, headers.length).setValue(key); 
             newHeadersAdded = true;
           }
        });
        
        // Refresh data only if we added headers (to get correct column indices if needed, though we just pushed)
        // Actually we just need to update our map.
        var headMap = {};
        headers.forEach(function(h, i) { headMap[h] = i; });
        
        // Find row index (1-based)
        var rowIndex = -1;
        var idCol = headMap['internId'];
        var taskCol = headMap['taskId'];
        
        if (idCol !== undefined && taskCol !== undefined) {
          // Scan data for existing match
          // Note: data[0] is headers. data is 0-indexed array of rows.
          // data.length is number of rows.
          // If we added headers, 'data' variable is stale regarding column width, but row count is same.
          // We can use the cached 'data' for row finding since we only check existing columns.
          for (var i = 1; i < data.length; i++) {
            // Safe string comparison
            var rowId = (data[i][idCol] === undefined) ? "" : String(data[i][idCol]);
            var rowTask = (data[i][taskCol] === undefined) ? "" : String(data[i][taskCol]);
            
            if (rowId === String(submission.internId) && rowTask === String(submission.taskId)) {
              rowIndex = i + 1; // 1-based index for Sheet API
              break;
            }
          }
        }
        
        if (rowIndex > -1) {
          // Update existing row
          for (var key in submission) {
             var col = headMap[key];
             if (col !== undefined) {
               sheet.getRange(rowIndex, col + 1).setValue(submission[key]);
             }
          }
        } else {
          // Append new row
          // Map headers to submission values
          var newRow = headers.map(function(h) { return submission[h] || ''; });
          sheet.appendRow(newRow);
        }
        
        SpreadsheetApp.flush(); // Force write to disk
        return ContentService.createTextOutput(JSON.stringify({status: 'success'})).setMimeType(ContentService.MimeType.JSON);
        
      } catch (e) {
        return ContentService.createTextOutput(JSON.stringify({status: 'error', message: e.toString()})).setMimeType(ContentService.MimeType.JSON);
      } finally {
        locking.releaseLock();
      }
    }

    function updateTaskStatus(internId, taskId, status) {
       var locking = LockService.getScriptLock();
       try {
         locking.waitLock(30000); 
       } catch (e) {
         return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'Server busy'})).setMimeType(ContentService.MimeType.JSON);
       }

       try {
         var ss = SpreadsheetApp.getActiveSpreadsheet();
         var sheet = ss.getSheetByName('Submissions');
         if (!sheet) return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'Sheet not found'})).setMimeType(ContentService.MimeType.JSON);
         
         var data = sheet.getDataRange().getValues();
         var headers = data[0];
         var headMap = {};
         headers.forEach(function(h, i) { headMap[h] = i; });
         
         var idCol = headMap['internId'];
         var taskCol = headMap['taskId'];
         var statusCol = headMap['status'];
         
         if (idCol !== undefined && taskCol !== undefined && statusCol !== undefined) {
           for (var i = 1; i < data.length; i++) {
             if (String(data[i][idCol]) === String(internId) && String(data[i][taskCol]) === String(taskId)) {
               sheet.getRange(i + 1, statusCol + 1).setValue(status);
               SpreadsheetApp.flush(); // Force write
               return ContentService.createTextOutput(JSON.stringify({status: 'success'})).setMimeType(ContentService.MimeType.JSON);
             }
           }
         }
         
         return ContentService.createTextOutput(JSON.stringify({status: 'not_found'})).setMimeType(ContentService.MimeType.JSON);
       } catch (e) {
          return ContentService.createTextOutput(JSON.stringify({status: 'error', message: e.toString()})).setMimeType(ContentService.MimeType.JSON);
       } finally {
          locking.releaseLock();
       }
    }

    function saveSettings(settingsObj) {
      if (!settingsObj || Object.keys(settingsObj).length === 0) {
        return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'Empty settings received'})).setMimeType(ContentService.MimeType.JSON);
      }
      
      var rows = [];
      for (var key in settingsObj) {
        rows.push({
          key: key,
          value: settingsObj[key]
        });
      }
      updateSheet('Settings', rows);
      return ContentService.createTextOutput(JSON.stringify({status: 'success'})).setMimeType(ContentService.MimeType.JSON);
    }

    function getPendingReferrals() {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var interns = getSheetData(ss, 'Interns');
      var pending = [];

      // Create a map for quick lookup of payment status
      var internMap = {};
      interns.forEach(function(i) { internMap[i.id] = i; });

      interns.forEach(function(referee) {
        if (referee.referredBy && referee.referredBy.trim() !== '') {
          var referrer = internMap[Object.keys(internMap).find(k => k.trim().toUpperCase() === referee.referredBy.trim().toUpperCase())];
          if (referrer) {
             // Logic: Reward is 50 units if both paid.
             var referrerPaid = (referrer.paymentStatus === 'verified');
             var refereePaid = (referee.paymentStatus === 'verified');
             var rewardPaid = (referee.referralRewardStatus === 'paid');

             if (referrerPaid && refereePaid && !rewardPaid) {
               pending.push({
                 refereeId: referee.id,
                 refereeName: referee.name,
                 referrerId: referrer.id,
                 referrerName: referrer.name,
                 amount: 50
               });
             }
          }
        }
      });

      return ContentService.createTextOutput(JSON.stringify({status: 'success', data: pending})).setMimeType(ContentService.MimeType.JSON);
    }

    function markReferralPaid(refereeId) {
       var locking = LockService.getScriptLock();
       try { locking.waitLock(30000); } catch (e) {
         return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'Server busy'})).setMimeType(ContentService.MimeType.JSON);
       }

       try {
         var ss = SpreadsheetApp.getActiveSpreadsheet();
         var sheet = ss.getSheetByName('Interns');
         if (!sheet) return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'Interns sheet not found'})).setMimeType(ContentService.MimeType.JSON);
         
         var data = sheet.getDataRange().getValues();
         var headers = data[0];
         var headMap = {};
         headers.forEach(function(h, i) { headMap[h] = i; });
         
         var idCol = headMap['id'];
         var statusCol = headMap['referralRewardStatus'];
         
         // If status column doesn't exist, create it
         if (statusCol === undefined) {
           statusCol = headers.length;
           sheet.getRange(1, statusCol + 1).setValue('referralRewardStatus');
           // Reload logic if needed, but for row matching we use idCol which should exist
         }

         if (idCol !== undefined) {
           for (var i = 1; i < data.length; i++) {
             var rowId = (data[i][idCol] === undefined) ? "" : String(data[i][idCol]);
             if (rowId === String(refereeId)) {
               sheet.getRange(i + 1, statusCol + 1).setValue('paid');
               SpreadsheetApp.flush();
               return ContentService.createTextOutput(JSON.stringify({status: 'success'})).setMimeType(ContentService.MimeType.JSON);
             }
           }
         }
         return ContentService.createTextOutput(JSON.stringify({status: 'not_found', message: 'Referee ID not found'})).setMimeType(ContentService.MimeType.JSON);

       } catch (e) {
         return ContentService.createTextOutput(JSON.stringify({status: 'error', message: e.toString()})).setMimeType(ContentService.MimeType.JSON);
       } finally {
         locking.releaseLock();
       }
    }

    function updateInternProfile(internId, profileData) {
       var locking = LockService.getScriptLock();
       try { locking.waitLock(30000); } catch (e) {
         return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'Server busy'})).setMimeType(ContentService.MimeType.JSON);
       }

       try {
         var ss = SpreadsheetApp.getActiveSpreadsheet();
         var sheet = ss.getSheetByName('Interns');
         if (!sheet) return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'Interns sheet not found'})).setMimeType(ContentService.MimeType.JSON);
         
         var data = sheet.getDataRange().getValues();
         var headers = data[0];
         var headMap = {};
         headers.forEach(function(h, i) { headMap[h] = i; });
         
         var idCol = headMap['id'];
         if (idCol === undefined) return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'ID column not found'})).setMimeType(ContentService.MimeType.JSON);

         // Handle new columns if they don't exist
         var newCols = [];
         for (var key in profileData) {
           if (headMap[key] === undefined) {
             newCols.push(key);
           }
         }

         if (newCols.length > 0) {
           var startCol = headers.length + 1;
           sheet.getRange(1, startCol, 1, newCols.length).setValues([newCols]);
           // Update headMap with new columns
           newCols.forEach(function(col, i) {
             headMap[col] = headers.length + i;
           });
           // Create empty cells for the data rows if needed, or rely on setValue creating them
         }

         // Find row
         var rowIndex = -1;
         for (var i = 1; i < data.length; i++) {
            var rowId = (data[i][idCol] === undefined) ? "" : String(data[i][idCol]);
            var rowEmail = (headMap['email'] !== undefined) ? String(data[i][headMap['email']]).toLowerCase().trim() : "";
            var rowDomain = (headMap['domain'] !== undefined) ? String(data[i][headMap['domain']]).trim() : "";

            // 1. Primary match: Match ID
            if (internId && rowId === String(internId)) {
              rowIndex = i + 1;
              break;
            }
            
            // 2. Fallback match (for newly registered people/approvals): Match Email + Domain
            if (!internId || internId === "") {
               var targetEmail = (profileData.email) ? String(profileData.email).toLowerCase().trim() : "";
               var targetDomain = (profileData.domain) ? String(profileData.domain).trim() : "";
               
               if (targetEmail && targetDomain && rowEmail === targetEmail && rowDomain === targetDomain) {
                 rowIndex = i + 1;
                 break;
               }
            }
          }

          if (rowIndex === -1) {
            return ContentService.createTextOutput(JSON.stringify({status: 'not_found', message: 'Intern not found by ID or Email+Domain'})).setMimeType(ContentService.MimeType.JSON);
          }

         // Update fields
         for (var key in profileData) {
           var colIdx = headMap[key];
           if (colIdx !== undefined) {
             sheet.getRange(rowIndex, colIdx + 1).setValue(profileData[key]);
           }
         }
         
         SpreadsheetApp.flush();
         return ContentService.createTextOutput(JSON.stringify({status: 'success'})).setMimeType(ContentService.MimeType.JSON);

       } catch (e) {
         return ContentService.createTextOutput(JSON.stringify({status: 'error', message: e.toString()})).setMimeType(ContentService.MimeType.JSON);
       } finally {
         locking.releaseLock();
       }
    }

    // --- Helper Functions ---

    function getSheetData(ss, sheetName) {
      var sheet = ss.getSheetByName(sheetName);
      if (!sheet) return [];
      
      var data = sheet.getDataRange().getValues();
      if (data.length < 2) return []; // Only headers or empty
      
      var headers = data[0];
      var results = [];
      
      for (var i = 1; i < data.length; i++) {
        var row = data[i];
        var obj = {};
        for (var j = 0; j < headers.length; j++) {
          obj[headers[j]] = row[j];
        }
        results.push(obj);
      }
      return results;
    }

    function updateSheet(sheetName, data) {
      var lock = LockService.getScriptLock();
      try {
        lock.waitLock(30000); // 30 second timeout
      } catch (e) {
        throw new Error("Could not acquire lock to save sheet " + sheetName + ": " + e.message);
      }

      try {
        var ss = SpreadsheetApp.getActiveSpreadsheet();
        var sheet = ss.getSheetByName(sheetName);
        
        if (!sheet) {
          sheet = ss.insertSheet(sheetName);
        }
        
        if (!data || data.length === 0) {
           sheet.clearContents();
           return;
        }

        // --- Standardized Headers to prevent reshuffling ---
        var preferredOrder = {
          'Interns': ['id', 'name', 'email', 'mobile', 'domain', 'batch', 'status', 'paymentStatus', 'feeAmount', 'offerApproved', 'offerLetterUrl', 'joinedDate', 'college', 'skills', 'approvalDate', 'certRequestStatus', 'certificateUrl', 'certApproved'],
          'Submissions': ['internId', 'taskId', 'proof', 'status', 'timestamp'],
          'Settings': ['key', 'value'],
          'Domains': ['name', 'tasks']
        };

        var headerMap = {};
        // Add preferred headers first
        if (preferredOrder[sheetName]) {
          preferredOrder[sheetName].forEach(function(h) { headerMap[h] = true; });
        }
        
        // Add any additional headers found in the data
        data.forEach(function(obj) {
          Object.keys(obj).forEach(function(key) {
            headerMap[key] = true;
          });
        });
        
        var headers = Object.keys(headerMap);
        
        // We clear contents AFTER determining headers to minimize downtime, 
        // though clearContents is fast.
        sheet.clearContents();
        
        // Write Headers
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        
        // Write Rows
        var rows = data.map(function(obj) {
          return headers.map(function(key) {
            var val = obj[key];
            return (val !== undefined && val !== null) ? val : "";
          });
        });
        
        if (rows.length > 0) {
          sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
        }
        
        SpreadsheetApp.flush();
      } finally {
        lock.releaseLock();
      }
    }

    function generateCertificate(data) {
      try {
        // We no longer need DriveApp.getFolderById(...)
        
        // Generate QR Code server-side to point to official verification URL
        var verifyUrl = "https://www.thiranex.in/?verifyId=" + encodeURIComponent(data.internId);
        var qrUrl = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" + encodeURIComponent(verifyUrl);
        var qrBlob = UrlFetchApp.fetch(qrUrl).getBlob();
        var qrBase64 = Utilities.base64Encode(qrBlob.getBytes());
        var qrImageSrc = "data:image/png;base64," + qrBase64;

        // Create HTML template for certificate (Landscape A4: 1122px x 794px)
      var html = `
        <!DOCTYPE html>
        <html>
        <head>
          <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@700&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
          <style>
            @page { size: landscape; margin: 0; }
            body { 
              font-family: 'Outfit', sans-serif; 
              margin: 0; padding: 0; 
              background: #f8fafc;
              width: 1122px; height: 794px;
            }
            .cert-container {
              width: 1122px; height: 794px;
              background: white;
              position: relative;
              overflow: hidden;
              box-sizing: border-box;
              border: 15px solid #1e293b;
            }
            
            /* Background Accents */
            .bg-accent {
              position: absolute;
              width: 500px; height: 500px;
              background: radial-gradient(circle, rgba(30, 58, 138, 0.03) 0%, rgba(255, 255, 255, 0) 70%);
              border-radius: 50%;
              z-index: 1;
            }
            .accent-1 { top: -150px; right: -150px; }
            .accent-2 { bottom: -150px; left: -150px; }

            /* Modern Framing */
            .frame-border {
              position: absolute;
              top: 20px; left: 20px; right: 20px; bottom: 20px;
              border: 1px solid #e2e8f0;
              z-index: 2;
            }
            
            .corner-decoration {
              position: absolute;
              width: 80px; height: 80px;
              z-index: 5;
            }
            .tl { top: 0; left: 0; border-top: 8px solid #1e3a8a; border-left: 8px solid #1e3a8a; }
            .tr { top: 0; right: 0; border-top: 8px solid #1e3a8a; border-right: 8px solid #1e3a8a; }
            .bl { bottom: 0; left: 0; border-bottom: 8px solid #1e3a8a; border-left: 8px solid #1e3a8a; }
            .br { bottom: 0; right: 0; border-bottom: 8px solid #1e3a8a; border-right: 8px solid #1e3a8a; }

            .main-content {
              position: relative;
              z-index: 10;
              width: 100%; height: 100%;
              display: flex;
              flex-direction: column;
              align-items: center;
              padding: 60px 90px;
              box-sizing: border-box;
            }

            .header-logo { 
              width: 100%;
              display: flex; 
              justify-content: space-between; 
              align-items: center; 
              margin-bottom: 25px; 
            }
            .logo-img { height: 70px; width: auto; object-fit: contain; }
            .msme-logo { height: 60px; width: auto; object-fit: contain; }

            .title-section { text-align: center; margin-bottom: 45px; }
            .cert-title {
              font-family: 'Libre Baskerville', serif;
              font-size: 68px; font-weight: 700; color: #1e3a8a; 
              margin: 0; letter-spacing: 2px; line-height: 1;
            }
            .cert-subtitle {
              font-size: 16px; font-weight: 600; color: #64748b; 
              margin-top: 12px; letter-spacing: 10px; text-transform: uppercase;
            }

            .recipient-label { font-size: 20px; color: #94a3b8; font-style: italic; margin-bottom: 8px; }
            .recipient-name {
              font-family: 'Libre Baskerville', serif;
              font-size: 46px; font-weight: 700; color: #0f172a;
              padding: 0 30px 10px;
              border-bottom: 2px solid #cbd5e1;
              display: inline-block;
              margin-bottom: 35px;
              max-width: 90%;
              word-wrap: break-word;
            }

            .description {
              width: 85%;
              text-align: center;
              margin-bottom: 50px;
            }
            .desc-text {
              font-size: 20px; line-height: 1.7; color: #334155;
            }
            .desc-text strong { color: #1e3a8a; font-weight: 600; }

            .footer {
              width: 100%;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              margin-top: auto;
            }

            .verification-box {
              display: flex;
              align-items: center;
              gap: 15px;
            }
            .qr-code {
              width: 90px; height: 90px;
              border: 1px solid #e2e8f0;
              padding: 5px; background: white;
            }
            .verify-info { text-align: left; }
            .verify-info p { margin: 0; font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }
            .verify-id { font-size: 12px; font-weight: 700; color: #1e3a8a; }

            .signature-box {
              width: 260px;
              text-align: center;
            }
            .sig-img {
              height: 70px;
              width: auto;
              object-fit: contain;
              margin-bottom: 5px;
            }
            .sig-line { border-top: 2px solid #1e3a8a; margin-bottom: 10px; }
            .sig-name { font-size: 20px; font-weight: 700; color: #1e3a8a; margin: 0; }
            .sig-title { font-size: 13px; color: #64748b; font-weight: 500; margin: 0; }
          </style>
        </head>
        <body>
          <div class="cert-container">
            <div class="bg-accent accent-1"></div>
            <div class="bg-accent accent-2"></div>
            <div class="frame-border"></div>
            <div class="corner-decoration tl"></div>
            <div class="corner-decoration tr"></div>
            <div class="corner-decoration bl"></div>
            <div class="corner-decoration br"></div>

            <div class="main-content">
              <div class="header-logo">
                ${data.logo ? `<img src="${data.logo}" class="logo-img">` : `<div style="font-size: 32px; font-weight: 800; color: #1e3a8a;">${data.companyName || 'THIRANEX'}</div>`}
                ${data.msmeLogo ? `<img src="${data.msmeLogo}" class="msme-logo">` : ''}
              </div>

              <div class="title-section">
                <h1 class="cert-title">Certificate</h1>
                <div class="cert-subtitle">of Achievement</div>
              </div>

              <div class="recipient-label">This acknowledgment is proudly presented to</div>
              <div class="recipient-name">${data.name}</div>

              <div class="description">
                <p class="desc-text">
                  ${data.templateText.replace(/{{name}}/g, '<strong>'+data.name+'</strong>')
                                  .replace(/{{domain}}/g, '<strong>'+data.domain+'</strong>')
                                  .replace(/{{batch}}/g, '<strong>'+data.batch+'</strong>')
                                  .replace(/{{start}}/g, '<strong>'+data.start+'</strong>')
                                  .replace(/{{end}}/g, '<strong>'+data.end+'</strong>')
                                  .replace(/{{id}}/g, '<strong>'+data.internId+'</strong>')}
                </p>
              </div>

              <div class="footer">
                <div class="verification-box">
                  <img src="${qrImageSrc}" class="qr-code">
                  <div class="verify-info">
                    <p>Verified Certificate</p>
                    <div class="verify-id">ID: ${data.internId}</div>
                  </div>
                </div>

                <div class="signature-box">
                  ${data.signature ? `<img src="${data.signature}" class="sig-img">` : '<div style="height:70px;"></div>'}
                  <div class="sig-line"></div>
                  <h4 class="sig-name">${data.signatory}</h4>
                  <p class="sig-title">${data.signatoryTitle}</p>
                </div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      var blob = HtmlService.createHtmlOutput(html).getAs('application/pdf');
        var fileName = 'Certificate_' + data.name.replace(/\s+/g, '_') + '.pdf';
        blob.setName(fileName);
        
        // Return base64 data for client-side download
        var base64Data = Utilities.base64Encode(blob.getBytes());
        
        return ContentService.createTextOutput(JSON.stringify({
          status: 'success',
          base64: base64Data,
          fileName: fileName
        })).setMimeType(ContentService.MimeType.JSON);

      } catch (e) {
        return ContentService.createTextOutput(JSON.stringify({
          status: 'error',
          message: e.toString()
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    function generateOfferLetter(data) {
      try {
        // Professional HTML template for Offer Letter (Portrait A4)
        // Note: Using tables for layout instead of flexbox for better PDF rendering in Google Apps Script
        var html = `
          <!DOCTYPE html>
          <html>
          <head>
            <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet">
            <style>
              @page { size: portrait; margin: 0; }
              body { 
                font-family: 'Outfit', sans-serif; 
                margin: 0; padding: 0; 
                background: #ffffff;
                color: #1e293b;
              }
              
              .watermark-container {
                position: absolute;
                top: 0; left: 0; width: 100%; height: 100%;
                display: flex; align-items: center; justify-content: center;
                z-index: 1;
                pointer-events: none;
              }
              .watermark-img {
                width: 580px;
                opacity: 0.12;
                transform: rotate(-35deg);
              }

              .letter-container {
                width: 794px;
                min-height: 1122px;
                background: white;
                position: relative;
                padding: 60px 70px;
                box-sizing: border-box;
                border-top: 10px solid #1e3a8a;
              }
              
              .full-width-table {
                width: 100%;
                border-collapse: collapse;
              }

              /* Header */
              .header-table {
                margin-bottom: 40px;
                border-bottom: 1px solid #f1f5f9;
                padding-bottom: 25px;
              }
              .logo-main { height: 60px; width: auto; }
              
              .company-address {
                text-align: right;
                font-size: 11px;
                color: #64748b;
                line-height: 1.5;
              }
              .company-name {
                font-size: 18px;
                font-weight: 700;
                color: #1e3a8a;
                margin-bottom: 4px;
                letter-spacing: 0.5px;
              }

              .content { position: relative; z-index: 5; }
              
              .meta-info-table {
                margin-bottom: 30px;
                font-size: 14px;
              }
              .doc-date { font-weight: 600; color: #334155; text-align: right; }

              .recipient-section { margin-bottom: 35px; }
              .to-label { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin-bottom: 8px; font-weight: 600; }
              .recipient-name { font-size: 20px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
              .recipient-id { font-size: 13px; color: #64748b; }

              .subject-line {
                background: #f8fafc;
                padding: 12px 15px;
                border-left: 4px solid #1e3a8a;
                margin-bottom: 30px;
                font-weight: 700;
                font-size: 15px;
                color: #1e3a8a;
              }

              .body-text { font-size: 15px; line-height: 1.7; color: #334155; margin-bottom: 20px; }
              .body-text strong { color: #1e3a8a; }

              /* Table for Details */
              .details-table {
                width: 100%;
                border-collapse: collapse;
                margin: 25px 0 35px;
                border: 1px solid #f1f5f9;
              }
              .details-table td {
                padding: 12px 15px;
                border-bottom: 1px solid #f1f5f9;
                font-size: 14px;
              }
              .label-cell { background: #f8fafc; color: #64748b; width: 35%; font-weight: 500; }
              .value-cell { font-weight: 600; color: #1e293b; }

              /* Signature Section */
              .footer-signature-table {
                margin-top: 30px;
              }
              .sig-block { position: relative; width: 180px; }
              .sig-image {
                display: block;
                height: 60px;
                width: auto;
                margin-bottom: -15px;
                margin-left: 10px;
              }
              .sig-line { width: 170px; border-top: 1px solid #cbd5e1; margin-bottom: 10px; }
              .sig-name { font-size: 16px; font-weight: 700; color: #1e3a8a; margin: 0; }
              .sig-title { font-size: 13px; color: #64748b; margin: 0; }
              
              .round-seal {
                width: 95px; height: 95px;
                display: block;
              }
              .round-seal img {
                width: 100%;
                height: 100%;
                object-fit: contain;
              }
              
              .msme-footer-logo {
                position: absolute;
                bottom: 25px;
                right: 70px;
                height: 55px;
                width: auto;
                z-index: 10;
              }

              .footer-legal {
                position: absolute;
                bottom: 40px;
                left: 70px;
                right: 70px;
                text-align: center;
                font-size: 10px;
                color: #94a3b8;
                padding-top: 15px;
                border-top: 1px solid #f1f5f9;
              }
              .contact-footer {
                margin-top: 5px;
                font-size: 11px;
                color: #64748b;
              }
            </style>
          </head>
          <body>
            <div class="letter-container">
              <table class="full-width-table header-table">
                <tr>
                  <td style="vertical-align: top;">
                    <div class="branding">
                      ${data.logo ? `<img src="${data.logo}" class="logo-main">` : `<div style="font-size: 24px; font-weight: 800; color: #1e3a8a;">THIRANEX</div>`}
                    </div>
                  </td>
                  <td class="company-address">
                    <div class="company-name">THIRANEX</div>
                    Skill Development & Future Tech<br>
                    Web: www.thiranex.in<br>
                    Email: thiranex.internships@outlook.com
                  </td>
                </tr>
              </table>

              <div class="watermark-container">
                ${data.logo ? `<img src="${data.logo}" class="watermark-img">` : '<div class="watermark-img" style="font-size: 100px; font-weight: 900; color: #000;">THIRANEX</div>'}
              </div>

              <div class="content">
                <table class="full-width-table meta-info-table">
                   <tr>
                     <td>&nbsp;</td>
                     <td class="doc-date">Date: ${data.approvalDate ? new Date(data.approvalDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</td>
                   </tr>
                </table>
                
                <div class="recipient-section">
                  <div class="to-label">To,</div>
                  <div class="recipient-name">${data.name}</div>
                  <div class="recipient-id">Intern ID: ${data.internId}</div>
                </div>

                <div class="subject-line">Subject: Offer Letter for Internship in ${data.domain}</div>

                <div class="body-text">
                  Dear <strong>${data.name}</strong>,
                </div>

                <div class="body-text">
                  Following our selection process, we are pleased to offer you an internship position at <strong>Thiranex</strong>. We believe your skills and enthusiasm will be a great addition to our team.
                </div>

                <table class="details-table">
                  <tr>
                    <td class="label-cell">Internship Role</td>
                    <td class="value-cell">Intern - ${data.domain}</td>
                  </tr>
                  <tr>
                    <td class="label-cell">Commencement Date</td>
                    <td class="value-cell">${data.start}</td>
                  </tr>
                  <tr>
                    <td class="label-cell">Completion Date</td>
                    <td class="value-cell">${data.end}</td>
                  </tr>
                  <tr>
                    <td class="label-cell">Work Mode</td>
                    <td class="value-cell">Remote / Project-Based</td>
                  </tr>
                </table>

                <div class="body-text">
                  During this tenure, you will work on practical projects under industry mentorship. Your progress will be reviewed periodically, and your performance will determine the successful completion of the internship.
                </div>

                <div class="body-text">
                  We look forward to a mutually beneficial learning journey. Please confirm your acceptance by starting your onboarding tasks.
                </div>

                <table class="full-width-table footer-signature-table">
                  <tr>
                    <td style="vertical-align: bottom;">
                      <table style="border-collapse: collapse;">
                        <tr>
                          <td style="vertical-align: bottom;">
                            <div class="sig-block">
                              ${data.signature ? `<img src="${data.signature}" class="sig-image">` : ''}
                              <div class="sig-line"></div>
                              <div class="sig-name">${data.signatory}</div>
                              <div class="sig-title">${data.signatoryTitle}</div>
                              <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${data.signatoryContact}</div>
                            </div>
                          </td>
                          <td style="vertical-align: bottom; padding-left: 5px;">
                            ${data.seal ? `<div class="round-seal"><img src="${data.seal}" alt="Seal"></div>` : ""}
                          </td>
                        </tr>
                      </table>
                    </td>
                    <td style="text-align: right; vertical-align: bottom;">
                      &nbsp;
                    </td>
                  </tr>
                </table>

              </div>

              ${data.msmeLogo ? `<img src="${data.msmeLogo}" class="msme-footer-logo">` : ''}

              <div class="footer-legal">
                This is an electronically generated document. No physical signature is required.<br>
                For verification, contact Thiranex Verification Cell.
                <div class="contact-footer">
                  www.thiranex.in | thiranex.internships@outlook.com
                </div>
              </div>
            </div>
          </body>
          </html>
        `;

        var blob = HtmlService.createHtmlOutput(html).getAs('application/pdf');
        var fileName = 'OfferLetter_' + data.name.replace(/\s+/g, '_') + '.pdf';
        blob.setName(fileName);
        
        var base64Data = Utilities.base64Encode(blob.getBytes());
        
        return ContentService.createTextOutput(JSON.stringify({
          status: 'success',
          base64: base64Data,
          fileName: fileName
        })).setMimeType(ContentService.MimeType.JSON);

      } catch (e) {
        return ContentService.createTextOutput(JSON.stringify({
          status: 'error',
          message: e.toString()
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    function updateInternProfile(internId, profileData) {
       var locking = LockService.getScriptLock();
       try {
         locking.waitLock(30000);
       } catch (e) {
         return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'Server busy'})).setMimeType(ContentService.MimeType.JSON);
       }

       try {
         var ss = SpreadsheetApp.getActiveSpreadsheet();
         var sheet = ss.getSheetByName('Interns');
         if (!sheet) return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'Interns sheet not found'})).setMimeType(ContentService.MimeType.JSON);

         var data = sheet.getDataRange().getValues();
         if (data.length === 0) return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'Interns sheet empty'})).setMimeType(ContentService.MimeType.JSON);

         var headers = data[0];
         // Safe header lookup map
         var headMap = {};
         headers.forEach(function(h, i) { headMap[h] = i; });
         
         // Helper to get column index or create it if missing
         var getColIndex = function(name) {
             if (headMap[name] !== undefined) {
                 return headMap[name];
             } else {
                 // Add new column
                 var newColIdx = headers.length;
                 headers.push(name);
                 headMap[name] = newColIdx;
                 sheet.getRange(1, newColIdx + 1).setValue(name);
                 return newColIdx;
             }
         };

         // Find intern row by 'id'
         var idCol = headMap['id'];
         if (idCol === undefined) {
             // Fallback to 'InternId' or 'internId'
             if (headMap['InternId'] !== undefined) idCol = headMap['InternId'];
             else if (headMap['internId'] !== undefined) idCol = headMap['internId'];
             else return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'ID column not found in Interns sheet'})).setMimeType(ContentService.MimeType.JSON);
         }

         var rowIndex = -1;
         for (var i = 1; i < data.length; i++) {
             // data[i] is the row array
             if (String(data[i][idCol]) === String(internId)) {
                 rowIndex = i + 1; // 1-based index
                 break;
             }
         }

         if (rowIndex === -1) {
             return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'Intern not found'})).setMimeType(ContentService.MimeType.JSON);
         }

         // Update fields
         for (var key in profileData) {
             var colIdx = getColIndex(key);
             sheet.getRange(rowIndex, colIdx + 1).setValue(profileData[key]);
         }

         SpreadsheetApp.flush();
         return ContentService.createTextOutput(JSON.stringify({status: 'success'})).setMimeType(ContentService.MimeType.JSON);

       } catch (e) {
          return ContentService.createTextOutput(JSON.stringify({status: 'error', message: e.toString()})).setMimeType(ContentService.MimeType.JSON);
       } finally {
          locking.releaseLock();
       }
    }

    function processWithdrawal(referrerId, paymentRef) {
       var locking = LockService.getScriptLock();
       try {
         locking.waitLock(30000);
       } catch (e) {
         return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'Server busy'})).setMimeType(ContentService.MimeType.JSON);
       }

       try {
         var ss = SpreadsheetApp.getActiveSpreadsheet();
         var sheet = ss.getSheetByName('Interns');
         if (!sheet) return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'Interns sheet not found'})).setMimeType(ContentService.MimeType.JSON);

         var data = sheet.getDataRange().getValues();
         var headers = data[0];
         var headMap = {};
         headers.forEach(function(h, i) { headMap[h] = i; });
         
         // Indices
         var idCol = headMap['id']; // Intern ID
         var referrerCol = headMap['referredBy'];
         var payStatusCol = headMap['paymentStatus'];
         var rewardStatusCol = headMap['referralRewardStatus'];
         var withdrawStatusCol = headMap['withdrawalStatus'];
         
         // If columns missing
         if (idCol === undefined || referrerCol === undefined || payStatusCol === undefined) {
             return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'Required columns missing'})).setMimeType(ContentService.MimeType.JSON);
         }
         
         // Create columns if missing
         if (rewardStatusCol === undefined) {
             rewardStatusCol = headers.length;
             sheet.getRange(1, rewardStatusCol + 1).setValue('referralRewardStatus');
             headers.push('referralRewardStatus');
         }
         if (withdrawStatusCol === undefined) {
             withdrawStatusCol = headers.length;
             sheet.getRange(1, withdrawStatusCol + 1).setValue('withdrawalStatus');
             headers.push('withdrawalStatus');
         }
         
         // 1. Find Referrer Row to check verification status and update withdrawal status
         var referrerRowIndex = -1;
         var referrerVerified = false;
         
         for (var i = 1; i < data.length; i++) {
             if (String(data[i][idCol]).trim().toUpperCase() === String(referrerId).trim().toUpperCase()) {
                 referrerRowIndex = i + 1;
                 referrerVerified = (String(data[i][payStatusCol]).trim().toLowerCase() === 'verified');
                 break;
             }
         }
         
         if (referrerRowIndex === -1) {
            return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'Referrer not found'})).setMimeType(ContentService.MimeType.JSON);
         }
         
         if (!referrerVerified) {
             return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'Referrer payment not verified'})).setMimeType(ContentService.MimeType.JSON);
         }

         // 2. Iterate and Update Referees (where referredBy == referrerId)
         // Only update if referee is verified AND reward is NOT paid
         var updatedCount = 0;
         
         for (var i = 1; i < data.length; i++) {
             // Check if this row was referred by our referrer
             if (String(data[i][referrerCol]).trim().toUpperCase() === String(referrerId).trim().toUpperCase()) {
                 var refereeVerified = (String(data[i][payStatusCol]).trim().toLowerCase() === 'verified');
                 var currentRewardStatus = (rewardStatusCol < data[i].length) ? data[i][rewardStatusCol] : '';
                 
                 if (refereeVerified && currentRewardStatus !== 'paid') {
                     // Mark as Paid
                     sheet.getRange(i + 1, rewardStatusCol + 1).setValue('paid');
                     updatedCount++;
                 }
             }
         }
         
         // 3. Update Referrer Withdrawal Status -> 'completed' (or 'idle')
         // We can set it to 'completed' to show history, asking user to check locally later?
         // Or reset to empty so they can request again for future?
         // Let's set to 'last_paid_DATE'
         var statusMsg = 'PaidRef:' + paymentRef + ' (' + new Date().toLocaleDateString() + ')';
         sheet.getRange(referrerRowIndex, withdrawStatusCol + 1).setValue(statusMsg);
         
         SpreadsheetApp.flush();
         return ContentService.createTextOutput(JSON.stringify({status: 'success', count: updatedCount})).setMimeType(ContentService.MimeType.JSON);

       } catch (e) {
          return ContentService.createTextOutput(JSON.stringify({status: 'error', message: e.toString()})).setMimeType(ContentService.MimeType.JSON);
       } finally {
          locking.releaseLock();
       }
    }

    function registerIntern(data) {
        var locking = LockService.getScriptLock();
        try {
            locking.waitLock(30000);
        } catch (e) {
            return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'Server busy'})).setMimeType(ContentService.MimeType.JSON);
        }

        try {
            var ss = SpreadsheetApp.getActiveSpreadsheet();
            var sheet = ss.getSheetByName('Interns');
            if (!sheet) return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'Interns sheet not found'})).setMimeType(ContentService.MimeType.JSON);

            var lastCol = sheet.getLastColumn();
            if (lastCol < 1) return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'Interns sheet headers missing'})).setMimeType(ContentService.MimeType.JSON);
            
            var allData = sheet.getDataRange().getValues();
            var headers = allData[0];
            var headMap = {};
            headers.forEach(function(h, i) { headMap[h] = i; });

            // 1. Calculate Formal Batch and ID Prefix
            var today = new Date();
            var day = today.getDate();
            var targetDate;

            if (day < 15) {
                // Registering 1-14 -> Start on 15th of current month
                targetDate = new Date(today.getFullYear(), today.getMonth(), 15);
            } else {
                // Registering 15+ -> Start on 1st of next month
                targetDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
            }

            var months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
            var batchMonth = months[targetDate.getMonth()];
            var batchCycle = (targetDate.getDate() === 1) ? '1' : '2';
            var batchYearShort = String(targetDate.getFullYear()).slice(-2);
            var batchISO = targetDate.getFullYear() + '-' + String(targetDate.getMonth() + 1).padStart(2, '0') + '-' + String(targetDate.getDate()).padStart(2, '0');
            
            // Format: THX-MAR226- (Static Prefix + Month + Cycle + Year + Hyphen)
            var prefix = 'THX-' + batchMonth + batchCycle + batchYearShort + '-';
            console.log("Generating ID for prefix: " + prefix);

            // 2. Find High-End Sequence Number
            var idCol = headMap['id'];
            var maxSeq = 0;
            if (idCol !== undefined) {
                for (var r = 1; r < allData.length; r++) {
                    var eid = String(allData[r][idCol]);
                    // Check for exact case-sensitive match at start
                    if (eid.substring(0, prefix.length) === prefix) {
                        var parts = eid.split('-');
                        if (parts.length >= 3) {
                            var seq = parseInt(parts[2], 10);
                            if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
                        }
                    }
                }
            }
            var newId = prefix + String(maxSeq + 1).padStart(3, '0');

            // 3. Prepare Row Data
            var newRow = [];
            for (var i = 0; i < headers.length; i++) {
                var h = headers[i];
                if (h === 'id') newRow.push(newId);
                else if (h === 'batch') newRow.push(batchISO);
                else if (h === 'joinedDate') newRow.push(new Date().toISOString().split('T')[0]);
                else if (data[h] !== undefined) newRow.push(data[h]);
                else newRow.push('');
            }

            sheet.appendRow(newRow);
            SpreadsheetApp.flush();
            return ContentService.createTextOutput(JSON.stringify({status: 'success', id: newId})).setMimeType(ContentService.MimeType.JSON);

        } catch (e) {
            return ContentService.createTextOutput(JSON.stringify({status: 'error', message: e.toString()})).setMimeType(ContentService.MimeType.JSON);
        } finally {
            locking.releaseLock();
        }
    }

    function cleanupSpreadsheetStructure() {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      
      // 1. Cleanup INTERNS Sheet
      var internSheet = ss.getSheetByName('Interns');
      if (internSheet) {
        var internsRows = getSheetData(ss, 'Interns');
        
        // Define standard order for Interns
        var standardInternHeaders = [
          'id', 'name', 'email', 'mobile', 'domain', 'batch', 'status', 
          'paymentStatus', 'feeAmount', 'approvalDate', 'offerApproved', 
          'offerLetterUrl', 'certRequestStatus', 'certApproved', 'certificateUrl',
          'referredBy', 'referralRewardStatus', 'withdrawalStatus'
        ];
        
        // Map old data to standard headers
        var cleanedInterns = internsRows.map(function(row) {
          var cleanRow = {};
          standardInternHeaders.forEach(function(h) { cleanRow[h] = ""; });
          
          // Heuristic matching for misspelled/old headers
          for (var key in row) {
            var k = String(key).toLowerCase().trim();
            var val = row[key];
            
            if (k === 'id' || k === 'internid' || k === 'intern id') cleanRow['id'] = val;
            else if (k === 'name' || k === 'full name') cleanRow['name'] = val;
            else if (k === 'email') cleanRow['email'] = val;
            else if (k === 'mobile' || k === 'phone') cleanRow['mobile'] = val;
            else if (k === 'domain') cleanRow['domain'] = val;
            else if (k === 'batch') cleanRow['batch'] = val;
            else if (k === 'status') cleanRow['status'] = val;
            else if (standardInternHeaders.indexOf(key) !== -1) {
              cleanRow[key] = val;
            }
          }
          return cleanRow;
        });
        
        // Physically rewrite the sheet to drop 100% of "unwanted" columns
        internSheet.clear(); 
        internSheet.getRange(1, 1, 1, standardInternHeaders.length).setValues([standardInternHeaders]).setFontWeight('bold');
        if (cleanedInterns.length > 0) {
          var rows = cleanedInterns.map(function(obj) {
            return standardInternHeaders.map(function(h) { 
                var val = obj[h];
                return (val !== undefined && val !== null) ? val : ""; 
            });
          });
          internSheet.getRange(2, 1, rows.length, standardInternHeaders.length).setValues(rows);
        }
      }

      // 2. Cleanup SUBMISSIONS Sheet
      var subSheet = ss.getSheetByName('Submissions');
      if (subSheet) {
        var standardSubHeaders = ['internId', 'taskId', 'status', 'proof', 'timestamp', 'reviewComment'];
        var subsRows = getSheetData(ss, 'Submissions');
        
        subSheet.clear();
        subSheet.getRange(1, 1, 1, standardSubHeaders.length).setValues([standardSubHeaders]).setFontWeight('bold');
        if (subsRows.length > 0) {
          var rows = subsRows.map(function(obj) {
            var internId = obj.internId || obj.InternId || obj['Intern ID'] || "";
            return [internId, obj.taskId || "", obj.status || "pending", obj.proof || "", obj.timestamp || "", obj.reviewComment || ""];
          });
          subSheet.getRange(2, 1, rows.length, standardSubHeaders.length).setValues(rows);
        }
      }
      
      return "SUCCESS: Sheets cleaned and columns standardized!";
    }

    function migrateToAutoCert() {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = ss.getSheetByName('Interns');
      if (!sheet) return "Error: Interns sheet not found";
      
      var data = sheet.getDataRange().getValues();
      var headers = data[0];
      var headMap = {};
      headers.forEach(function(h, i) { headMap[h] = i; });
      
      var offerUrlCol = headMap['offerLetterUrl'];
      var certStatusCol = headMap['certRequestStatus'];
      var certApprovedCol = headMap['certApproved'];
      
      if (offerUrlCol === undefined || certStatusCol === undefined || certApprovedCol === undefined) {
        return "Error: Required columns missing. Please run 'cleanupSpreadsheetStructure' first to ensure all columns exist.";
      }
      
      var count = 0;
      for (var i = 1; i < data.length; i++) {
        var offerUrl = data[i][offerUrlCol];
        if (offerUrl && String(offerUrl).trim() !== "") {
          // 1. Clear Offer Letter URL
          sheet.getRange(i + 1, offerUrlCol + 1).setValue("");
          // 2. Enable Auto-Generated Certificate Access
          sheet.getRange(i + 1, certStatusCol + 1).setValue("issued");
          sheet.getRange(i + 1, certApprovedCol + 1).setValue(true);
          count++;
        }
      }
      
      SpreadsheetApp.flush();
      return "SUCCESS: Cleared Old Offer URLs and enabled Auto-Certificates for " + count + " interns.";
    }

